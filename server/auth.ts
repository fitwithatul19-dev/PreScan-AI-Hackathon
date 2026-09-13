import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db, DbUser, DbSession, DbOrganization, DbMembership } from './db';

// Extend Express Request type with authenticated user & workspace context
declare global {
  namespace Express {
    interface Request {
      user?: DbUser;
      session?: DbSession;
      workspace?: DbOrganization;
      membership?: DbMembership;
    }
  }
}

/**
 * Hash password securely using scrypt (64-byte key derivation)
 */
export function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return {
    hash: derivedKey.toString('hex'),
    salt,
  };
}

/**
 * Timing-safe password verification to prevent side-channel timing attacks
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const storedKeyBuffer = Buffer.from(storedHash, 'hex');
    if (derivedKey.length !== storedKeyBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(derivedKey, storedKeyBuffer);
  } catch {
    return false;
  }
}

/**
 * Generate cryptographically secure random token (e.g. for sessions, verification, password resets)
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate standard unique ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
}

/**
 * Simple in-memory sliding window rate limiter for auth endpoints
 */
interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();

export function rateLimit(options: { windowMs: number; max: number; message: string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    const bucket = rateLimitStore.get(key);
    if (!bucket || now > bucket.resetAt) {
      rateLimitStore.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    if (bucket.count >= options.max) {
      const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        error: options.message,
        retryAfter: retryAfterSec,
      });
    }

    bucket.count += 1;
    return next();
  };
}

/**
 * Require valid authenticated session
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Check cookie first, then fallback to Authorization header
  let token = req.cookies?.['prescan_session'];
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7);
  }

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required. Please log in to continue.',
      code: 'UNAUTHENTICATED',
    });
  }

  const session = db.findSession(token);
  if (!session) {
    // Clear invalid cookie
    res.clearCookie('prescan_session');
    return res.status(401).json({
      error: 'Your session has expired. Please log in again.',
      code: 'SESSION_EXPIRED',
    });
  }

  const user = db.findUserById(session.userId);
  if (!user || user.status === 'DELETED') {
    db.deleteSession(token);
    res.clearCookie('prescan_session');
    return res.status(401).json({
      error: 'Account not found.',
      code: 'USER_NOT_FOUND',
    });
  }

  if (user.status === 'SUSPENDED') {
    return res.status(403).json({
      error: 'Your account has been suspended. Please contact support.',
      code: 'ACCOUNT_SUSPENDED',
    });
  }

  req.user = user;
  req.session = session;
  next();
}

/**
 * Require verified email address
 */
export function requireVerified(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.', code: 'UNAUTHENTICATED' });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      error: 'Email verification required.',
      code: 'UNVERIFIED_EMAIL',
    });
  }

  next();
}

/**
 * Format public safe user profile (strip password hash & salt)
 */
export function sanitizeUser(user: DbUser) {
  const { passwordHash, passwordSalt, ...safeUser } = user;
  return safeUser;
}

/**
 * Extract active workspace context ID from request headers, params, query, body or user default
 */
export function getWorkspaceContext(req: Request): string | undefined {
  const headerWsId = (req.headers['x-workspace-id'] || req.headers['x-organization-id']) as string | undefined;
  if (headerWsId && headerWsId.trim()) return headerWsId.trim();

  const paramWsId = req.params.workspaceId || req.params.orgId || req.params.organizationId;
  if (paramWsId && paramWsId.trim()) return paramWsId.trim();

  const queryWsId = (req.query.workspaceId || req.query.orgId || req.query.organizationId) as string | undefined;
  if (queryWsId && queryWsId.trim()) return queryWsId.trim();

  const bodyWsId = req.body?.workspaceId || req.body?.orgId || req.body?.organizationId;
  if (bodyWsId && typeof bodyWsId === 'string' && bodyWsId.trim()) return bodyWsId.trim();

  return req.user?.defaultOrganizationId;
}

/**
 * Middleware ensuring current user is an active member of the target workspace
 */
export function requireWorkspaceMember(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.', code: 'UNAUTHENTICATED' });
  }

  const workspaceId = getWorkspaceContext(req);
  if (!workspaceId) {
    return res.status(400).json({ error: 'Workspace ID context is required.', code: 'MISSING_WORKSPACE_ID' });
  }

  const workspace = db.findOrganizationById(workspaceId);
  if (!workspace || workspace.status === 'DEACTIVATED') {
    return res.status(404).json({ error: 'Workspace not found.', code: 'WORKSPACE_NOT_FOUND' });
  }

  const membership = db.findMembership(workspaceId, req.user.id);
  if (!membership || membership.status === 'SUSPENDED') {
    return res.status(403).json({
      error: 'You are not an active member of this workspace.',
      code: 'FORBIDDEN_WORKSPACE_ACCESS',
    });
  }

  req.workspace = workspace;
  req.membership = membership;
  next();
}

/**
 * Middleware checking role-based permissions in the target workspace
 */
export function requireWorkspaceRole(allowedRoles: ('OWNER' | 'ADMIN' | 'MEMBER' | 'EDITOR' | 'VIEWER')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.membership) {
      return res.status(403).json({ error: 'Workspace membership verification required.', code: 'NO_WORKSPACE_CONTEXT' });
    }

    const userRole = req.membership.role;
    let hasPermission = false;

    if (allowedRoles.includes(userRole)) {
      hasPermission = true;
    } else if (allowedRoles.includes('MEMBER') && (userRole === 'OWNER' || userRole === 'ADMIN')) {
      hasPermission = true;
    } else if (allowedRoles.includes('ADMIN') && userRole === 'OWNER') {
      hasPermission = true;
    }

    if (!hasPermission) {
      return res.status(403).json({
        error: `Action requires ${allowedRoles.join(' or ')} role in this workspace. Your role is ${userRole}.`,
        code: 'INSUFFICIENT_PERMISSIONS',
      });
    }

    next();
  };
}
