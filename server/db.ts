import fs from 'fs';
import path from 'path';

export interface DbUser {
  id: string;
  email: string;
  displayName: string;
  fullName: string;
  avatarUrl?: string;
  emailVerified: boolean;
  passwordHash: string;
  passwordSalt: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  defaultOrganizationId?: string;
  termsAcceptedAt: string;
  privacyAcceptedAt: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface DbSession {
  token: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface DbOrganization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  ownerId?: string;
  createdById: string;
  status?: 'ACTIVE' | 'DEACTIVATED';
  createdAt: string;
  updatedAt: string;
}

export interface DbMembership {
  id: string;
  organizationId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'EDITOR' | 'VIEWER';
  status?: 'ACTIVE' | 'SUSPENDED';
  invitedBy?: string;
  joinedAt: string;
  createdAt?: string;
  updatedAt: string;
}

export interface DbInvitation {
  id: string;
  organizationId: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  tokenHash: string;
  invitedById: string;
  status: 'PENDING' | 'ACCEPTED' | 'CANCELLED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string;
}

export interface DbOnboarding {
  userId: string;
  step: number; // 1, 2, 3, 4
  status: 'IN_PROGRESS' | 'COMPLETED';
  creatorType?: string;
  contentTypes?: string[];
  publishFrequency?: string;
  workspaceName?: string;
  completedAt?: string;
  updatedAt: string;
}

export interface DbVerificationToken {
  token: string;
  userId: string;
  email: string;
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
}

export interface DbOtpChallenge {
  id: string;
  userId: string;
  email: string;
  otpHash: string; // SHA-256 hash of (rawOtp + salt)
  salt: string;
  expiresAt: string; // Expiration ISO (10 mins)
  attemptCount: number; // Increment on each wrong guess
  maxAttempts: number; // Maximum 5 allowed attempts
  usedAt?: string;
  createdAt: string;
  lastResentAt: string;
}

export interface DbPasswordResetToken {
  token: string;
  userId: string;
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
}

export interface DbAuditLog {
  id: string;
  organizationId?: string;
  actorUserId: string;
  action: string;
  targetResourceType?: string;
  targetResourceId?: string;
  metadataJson?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface DbMailMessage {
  id: string;
  to: string;
  subject: string;
  type: 'VERIFY_EMAIL' | 'RESET_PASSWORD';
  token: string;
  actionUrl: string;
  sentAt: string;
}

export interface DbScan {
  id: string;
  organizationId: string;
  videoId?: string;
  projectId?: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  madeForKids?: boolean;
  language?: string;
  status: 'DRAFT' | 'QUEUED' | 'VALIDATING' | 'INGESTING' | 'READY_FOR_ANALYSIS' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  config: {
    checkCommunityGuidelines: boolean;
    checkAdvertiserSuitability: boolean;
    checkCopyrightSignals: boolean;
    checkMetadataIntegrity: boolean;
    targetCategory?: string;
    targetLanguage?: string;
    sensitivityLevel: 'STANDARD' | 'STRICT';
  };
  sourceType: 'file' | 'youtube_url' | 'youtube_connection';
  source?: {
    type: 'file' | 'youtube_url' | 'youtube_connection';
    fileName?: string;
    fileSizeBytes?: number;
    mimeType?: string;
    url?: string;
    videoId?: string;
  };
  mediaInfo?: {
    fileName?: string;
    fileSizeBytes?: number;
    mimeType?: string;
    durationSeconds?: number;
    thumbnailUrl?: string;
    youtubeVideoId?: string;
    youtubeUrl?: string;
    channelTitle?: string;
    resolution?: string;
    storagePath?: string;
    format?: string;
    checksum?: string;
  };
  ingestionJobId?: string;
  progressPercent: number;
  currentStepMessage?: string;
  errorMessage?: string;
  overallRisk: 'LOW' | 'REVIEW_REQUIRED' | 'IMPORTANT' | 'INSUFFICIENT_DATA';
  initiatedById: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbIngestionJob {
  id: string;
  scanId: string;
  organizationId: string;
  status: 'QUEUED' | 'VALIDATING' | 'INGESTING' | 'READY_FOR_ANALYSIS' | 'FAILED' | 'CANCELLED';
  sourceType: 'file' | 'youtube_url' | 'youtube_connection';
  sourceDetails: {
    fileName?: string;
    fileSizeBytes?: number;
    mimeType?: string;
    youtubeUrl?: string;
    youtubeVideoId?: string;
    storagePath?: string;
  };
  progressPercent: number;
  currentStep: string;
  logs: Array<{
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
    message: string;
  }>;
  errorDetails?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbVideo {
  id: string;
  organizationId: string;
  projectId?: string;
  title: string;
  description?: string;
  tags: string[];
  thumbnailUrl?: string;
  durationSeconds?: number;
  fileName?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  storageKey?: string;
  youtubeVideoId?: string;
  sourceType?: 'file' | 'youtube_url' | 'youtube_connection';
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbAnalysisJob {
  id: string;
  scanId: string;
  organizationId: string;
  status: 'QUEUED' | 'MEDIA_PREPARING' | 'MEDIA_READY' | 'TRANSCRIBING' | 'ANALYZING' | 'VALIDATING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progressPercent: number;
  currentStep: string;
  attempts: number;
  model: string;
  promptVersion: string;
  startedAt?: string;
  completedAt?: string;
  errorCode?: string;
  errorMessage?: string;
  logs: Array<{
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
    message: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface DbTranscriptSegment {
  startSeconds: number;
  endSeconds: number;
  text: string;
}

export interface DbTranscript {
  id: string;
  scanId: string;
  organizationId: string;
  language: string;
  durationSeconds: number;
  segments: DbTranscriptSegment[];
  fullText: string;
  createdAt: string;
}

export interface PreScanFinding {
  id: string;
  category: 'COMMUNITY_GUIDELINES' | 'ADVERTISER_SUITABILITY' | 'COPYRIGHT_RIGHTS' | 'METADATA';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string | null;
  title: string;
  evidence: string;
  why_it_matters: string;
  suggested_action: string;
  policy_category: string;
}

export interface PreScanV1ReportData {
  analysis_metadata: {
    prescan_version: '1.0';
    analysis_type: 'audio_and_metadata';
    analyzed_at: string;
    audio_duration_seconds: number;
    primary_language_detected: string;
  };
  video_context: {
    inferred_genre: 'comedy' | 'education' | 'gaming' | 'news' | 'commentary' | 'entertainment' | 'music' | 'vlog' | 'other';
    genre_confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    context_notes: string;
  };
  overall_risk: {
    level: 'GREEN' | 'YELLOW' | 'RED';
    summary: string;
  };
  category_status: {
    community_guidelines: 'GREEN' | 'YELLOW' | 'RED';
    advertiser_suitability: 'GREEN' | 'YELLOW' | 'RED';
    copyright_rights: 'GREEN' | 'YELLOW' | 'RED' | 'GRAY';
    metadata_consistency: 'CONSISTENT' | 'ISSUES_FOUND' | 'INSUFFICIENT_DATA';
  };
  findings: PreScanFinding[];
  positive_observations: string[];
  limitations: string[];
  creator_action_plan: {
    review_items: string[];
    no_action_needed: boolean;
  };
  disclaimer: string;
}

export interface DbPreScanReport {
  id: string;
  scanId: string;
  analysisJobId: string;
  organizationId: string;
  createdByUserId: string;
  report: PreScanV1ReportData;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  users: DbUser[];
  sessions: DbSession[];
  organizations: DbOrganization[];
  memberships: DbMembership[];
  invitations: DbInvitation[];
  onboarding: DbOnboarding[];
  verificationTokens: DbVerificationToken[];
  otpChallenges: DbOtpChallenge[];
  passwordResetTokens: DbPasswordResetToken[];
  auditLogs: DbAuditLog[];
  mailLog: DbMailMessage[];
  scans: DbScan[];
  ingestionJobs: DbIngestionJob[];
  videos: DbVideo[];
  analysisJobs: DbAnalysisJob[];
  transcripts: DbTranscript[];
  preScanReports: DbPreScanReport[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'prescan_db.json');

const INITIAL_DB: DatabaseSchema = {
  users: [],
  sessions: [],
  organizations: [],
  memberships: [],
  invitations: [],
  onboarding: [],
  verificationTokens: [],
  otpChallenges: [],
  passwordResetTokens: [],
  auditLogs: [],
  mailLog: [],
  scans: [],
  ingestionJobs: [],
  videos: [],
  analysisJobs: [],
  transcripts: [],
  preScanReports: [],
};

class Database {
  private data: DatabaseSchema;
  private isLoaded = false;

  constructor() {
    this.data = { ...INITIAL_DB };
    this.load();
  }

  private load() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = { ...INITIAL_DB, ...JSON.parse(raw) };
      } else {
        this.save();
      }
      this.ensureUserWorkspacesAndMigrateScans();
      this.isLoaded = true;
    } catch (err) {
      console.error('Error loading database:', err);
      this.data = { ...INITIAL_DB };
    }
  }

  private ensureUserWorkspacesAndMigrateScans() {
    if (!this.data.invitations) this.data.invitations = [];
    if (!this.data.organizations) this.data.organizations = [];
    if (!this.data.memberships) this.data.memberships = [];
    if (!this.data.users) this.data.users = [];
    if (!this.data.scans) this.data.scans = [];
    if (!this.data.preScanReports) this.data.preScanReports = [];
    if (!this.data.auditLogs) this.data.auditLogs = [];

    let modified = false;

    // 1. Ensure every user has a default workspace & OWNER membership
    for (const user of this.data.users) {
      let memberships = this.data.memberships.filter((m) => m.userId === user.id);
      if (memberships.length === 0) {
        const now = new Date().toISOString();
        const orgId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const name = `${user.fullName || user.displayName || 'Creator'}'s Workspace`;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'workspace';

        const org: DbOrganization = {
          id: orgId,
          name,
          slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
          ownerId: user.id,
          createdById: user.id,
          status: 'ACTIVE',
          createdAt: now,
          updatedAt: now,
        };
        this.data.organizations.push(org);

        const mem: DbMembership = {
          id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          organizationId: orgId,
          userId: user.id,
          role: 'OWNER',
          status: 'ACTIVE',
          joinedAt: now,
          createdAt: now,
          updatedAt: now,
        };
        this.data.memberships.push(mem);
        user.defaultOrganizationId = orgId;
        modified = true;
      } else {
        if (!user.defaultOrganizationId || !this.findOrganizationById(user.defaultOrganizationId)) {
          user.defaultOrganizationId = memberships[0].organizationId;
          modified = true;
        }
      }
    }

    // 2. Ensure every organization has ownerId set
    for (const org of this.data.organizations) {
      if (!org.ownerId) {
        const ownerMem = this.data.memberships.find((m) => m.organizationId === org.id && m.role === 'OWNER');
        if (ownerMem) {
          org.ownerId = ownerMem.userId;
        } else if (org.createdById) {
          org.ownerId = org.createdById;
        }
        modified = true;
      }
    }

    // 3. Ensure scans are assigned to valid workspace
    for (const scan of this.data.scans) {
      if (!scan.organizationId || !this.findOrganizationById(scan.organizationId)) {
        const initiator = scan.initiatedById ? this.findUserById(scan.initiatedById) : undefined;
        if (initiator?.defaultOrganizationId) {
          scan.organizationId = initiator.defaultOrganizationId;
        } else if (this.data.organizations.length > 0) {
          scan.organizationId = this.data.organizations[0].id;
        }
        modified = true;
      }
    }

    // 4. Ensure reports match scan workspace
    for (const report of this.data.preScanReports) {
      const scan = this.data.scans.find((s) => s.id === report.scanId);
      if (scan && report.organizationId !== scan.organizationId) {
        report.organizationId = scan.organizationId;
        modified = true;
      }
    }

    if (modified) {
      this.save();
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  // --- Users ---
  findUserById(id: string): DbUser | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  findUserByEmail(email: string): DbUser | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: DbUser): DbUser {
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUser(id: string, updates: Partial<DbUser>): DbUser | null {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.users[idx];
  }

  // --- Sessions ---
  createSession(session: DbSession): DbSession {
    // Remove older expired sessions
    const now = new Date().toISOString();
    this.data.sessions = this.data.sessions.filter((s) => s.expiresAt > now);
    this.data.sessions.push(session);
    this.save();
    return session;
  }

  findSession(token: string): DbSession | undefined {
    const session = this.data.sessions.find((s) => s.token === token);
    if (!session) return undefined;
    if (new Date(session.expiresAt) <= new Date()) {
      this.deleteSession(token);
      return undefined;
    }
    return session;
  }

  deleteSession(token: string) {
    this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
    this.save();
  }

  deleteUserSessions(userId: string) {
    this.data.sessions = this.data.sessions.filter((s) => s.userId !== userId);
    this.save();
  }

  // --- Organizations & Memberships ---
  createOrganization(org: DbOrganization): DbOrganization {
    this.data.organizations.push(org);
    this.save();
    return org;
  }

  findOrganizationById(id: string): DbOrganization | undefined {
    return this.data.organizations.find((o) => o.id === id);
  }

  findOrganizationsByUserId(userId: string): DbOrganization[] {
    const memberOrgIds = this.data.memberships
      .filter((m) => m.userId === userId)
      .map((m) => m.organizationId);
    return this.data.organizations.filter((o) => memberOrgIds.includes(o.id));
  }

  createMembership(membership: DbMembership): DbMembership {
    // Prevent duplicate memberships
    const existing = this.data.memberships.find(
      (m) => m.organizationId === membership.organizationId && m.userId === membership.userId
    );
    if (existing) return existing;
    this.data.memberships.push(membership);
    this.save();
    return membership;
  }

  findMembership(organizationId: string, userId: string): DbMembership | undefined {
    return this.data.memberships.find(
      (m) => m.organizationId === organizationId && m.userId === userId
    );
  }

  findMembershipsByUserId(userId: string): DbMembership[] {
    return this.data.memberships.filter((m) => m.userId === userId);
  }

  findMembershipsByOrg(organizationId: string): DbMembership[] {
    if (!this.data.memberships) this.data.memberships = [];
    return this.data.memberships.filter((m) => m.organizationId === organizationId);
  }

  updateOrganization(id: string, updates: Partial<DbOrganization>): DbOrganization | null {
    if (!this.data.organizations) this.data.organizations = [];
    const idx = this.data.organizations.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    this.data.organizations[idx] = {
      ...this.data.organizations[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.organizations[idx];
  }

  deleteOrganization(id: string): boolean {
    if (!this.data.organizations) this.data.organizations = [];
    const initialLen = this.data.organizations.length;
    this.data.organizations = this.data.organizations.filter((o) => o.id !== id);
    this.data.memberships = this.data.memberships.filter((m) => m.organizationId !== id);
    if (this.data.invitations) {
      this.data.invitations = this.data.invitations.filter((i) => i.organizationId !== id);
    }
    const changed = this.data.organizations.length !== initialLen;
    if (changed) this.save();
    return changed;
  }

  updateMembership(id: string, updates: Partial<DbMembership>): DbMembership | null {
    if (!this.data.memberships) this.data.memberships = [];
    const idx = this.data.memberships.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    this.data.memberships[idx] = {
      ...this.data.memberships[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.memberships[idx];
  }

  deleteMembership(organizationId: string, userId: string): boolean {
    if (!this.data.memberships) this.data.memberships = [];
    const initialLen = this.data.memberships.length;
    this.data.memberships = this.data.memberships.filter(
      (m) => !(m.organizationId === organizationId && m.userId === userId)
    );
    const changed = this.data.memberships.length !== initialLen;
    if (changed) this.save();
    return changed;
  }

  // --- Invitations ---
  createInvitation(invitation: DbInvitation): DbInvitation {
    if (!this.data.invitations) this.data.invitations = [];
    this.data.invitations.unshift(invitation);
    this.save();
    return invitation;
  }

  findInvitationById(id: string): DbInvitation | undefined {
    if (!this.data.invitations) this.data.invitations = [];
    return this.data.invitations.find((i) => i.id === id);
  }

  findInvitationByTokenHash(tokenHash: string): DbInvitation | undefined {
    if (!this.data.invitations) this.data.invitations = [];
    return this.data.invitations.find((i) => i.tokenHash === tokenHash);
  }

  findActiveInvitationByEmail(organizationId: string, email: string): DbInvitation | undefined {
    if (!this.data.invitations) this.data.invitations = [];
    const now = new Date().toISOString();
    return this.data.invitations.find(
      (i) =>
        i.organizationId === organizationId &&
        i.email.toLowerCase() === email.toLowerCase() &&
        i.status === 'PENDING' &&
        i.expiresAt > now
    );
  }

  findInvitationsByOrg(organizationId: string): DbInvitation[] {
    if (!this.data.invitations) this.data.invitations = [];
    return this.data.invitations.filter((i) => i.organizationId === organizationId);
  }

  updateInvitation(id: string, updates: Partial<DbInvitation>): DbInvitation | null {
    if (!this.data.invitations) this.data.invitations = [];
    const idx = this.data.invitations.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    this.data.invitations[idx] = {
      ...this.data.invitations[idx],
      ...updates,
    };
    this.save();
    return this.data.invitations[idx];
  }

  deleteInvitation(id: string): boolean {
    if (!this.data.invitations) this.data.invitations = [];
    const initialLen = this.data.invitations.length;
    this.data.invitations = this.data.invitations.filter((i) => i.id !== id);
    const changed = this.data.invitations.length !== initialLen;
    if (changed) this.save();
    return changed;
  }

  // --- Onboarding ---
  getOnboarding(userId: string): DbOnboarding {
    let ob = this.data.onboarding.find((o) => o.userId === userId);
    if (!ob) {
      ob = {
        userId,
        step: 1,
        status: 'IN_PROGRESS',
        updatedAt: new Date().toISOString(),
      };
      this.data.onboarding.push(ob);
      this.save();
    }
    return ob;
  }

  updateOnboarding(userId: string, updates: Partial<DbOnboarding>): DbOnboarding {
    const idx = this.data.onboarding.findIndex((o) => o.userId === userId);
    const now = new Date().toISOString();
    if (idx === -1) {
      const newOb: DbOnboarding = {
        userId,
        step: updates.step || 1,
        status: updates.status || 'IN_PROGRESS',
        ...updates,
        updatedAt: now,
      };
      this.data.onboarding.push(newOb);
      this.save();
      return newOb;
    }
    this.data.onboarding[idx] = {
      ...this.data.onboarding[idx],
      ...updates,
      updatedAt: now,
    };
    this.save();
    return this.data.onboarding[idx];
  }

  // --- Email Verification Tokens ---
  createVerificationToken(token: DbVerificationToken): DbVerificationToken {
    // Invalidate previous unspent tokens for this user
    this.data.verificationTokens.forEach((t) => {
      if (t.userId === token.userId && !t.usedAt) {
        t.usedAt = new Date().toISOString();
      }
    });
    this.data.verificationTokens.push(token);
    this.save();
    return token;
  }

  findVerificationToken(token: string): DbVerificationToken | undefined {
    return this.data.verificationTokens.find((t) => t.token === token);
  }

  markVerificationTokenUsed(token: string) {
    const t = this.data.verificationTokens.find((item) => item.token === token);
    if (t) {
      t.usedAt = new Date().toISOString();
      this.save();
    }
  }

  // --- OTP Verification Challenges ---
  createOtpChallenge(challenge: DbOtpChallenge): DbOtpChallenge {
    if (!this.data.otpChallenges) this.data.otpChallenges = [];
    const now = new Date().toISOString();
    // Invalidate previous unspent OTP challenges for this user / email
    this.data.otpChallenges.forEach((c) => {
      if ((c.userId === challenge.userId || c.email.toLowerCase() === challenge.email.toLowerCase()) && !c.usedAt) {
        c.usedAt = now;
      }
    });
    this.data.otpChallenges.push(challenge);
    this.save();
    return challenge;
  }

  findActiveOtpChallenge(userIdOrEmail: string): DbOtpChallenge | undefined {
    if (!this.data.otpChallenges) this.data.otpChallenges = [];
    const lower = userIdOrEmail.toLowerCase();
    const now = new Date();
    // Look for unspent challenge not yet expired, reverse to get latest
    return [...this.data.otpChallenges]
      .reverse()
      .find(
        (c) =>
          (c.userId === userIdOrEmail || c.email.toLowerCase() === lower) &&
          !c.usedAt &&
          new Date(c.expiresAt) > now
      );
  }

  findOtpChallengeById(id: string): DbOtpChallenge | undefined {
    if (!this.data.otpChallenges) this.data.otpChallenges = [];
    return this.data.otpChallenges.find((c) => c.id === id);
  }

  updateOtpChallenge(id: string, updates: Partial<DbOtpChallenge>): DbOtpChallenge | null {
    if (!this.data.otpChallenges) this.data.otpChallenges = [];
    const idx = this.data.otpChallenges.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.otpChallenges[idx] = {
      ...this.data.otpChallenges[idx],
      ...updates,
    };
    this.save();
    return this.data.otpChallenges[idx];
  }

  markOtpChallengeUsed(id: string) {
    if (!this.data.otpChallenges) this.data.otpChallenges = [];
    const c = this.data.otpChallenges.find((item) => item.id === id);
    if (c) {
      c.usedAt = new Date().toISOString();
      this.save();
    }
  }

  // --- Password Reset Tokens ---
  createPasswordResetToken(token: DbPasswordResetToken): DbPasswordResetToken {
    // Invalidate previous unspent tokens for this user
    this.data.passwordResetTokens.forEach((t) => {
      if (t.userId === token.userId && !t.usedAt) {
        t.usedAt = new Date().toISOString();
      }
    });
    this.data.passwordResetTokens.push(token);
    this.save();
    return token;
  }

  findPasswordResetToken(token: string): DbPasswordResetToken | undefined {
    return this.data.passwordResetTokens.find((t) => t.token === token);
  }

  markPasswordResetTokenUsed(token: string) {
    const t = this.data.passwordResetTokens.find((item) => item.token === token);
    if (t) {
      t.usedAt = new Date().toISOString();
      this.save();
    }
  }

  // --- Scans ---
  createScan(scan: DbScan): DbScan {
    if (!this.data.scans) this.data.scans = [];
    this.data.scans.unshift(scan);
    this.save();
    return scan;
  }

  findScanById(id: string): DbScan | undefined {
    if (!this.data.scans) this.data.scans = [];
    return this.data.scans.find((s) => s.id === id);
  }

  findScansByOrg(
    organizationId: string,
    options?: { status?: string; search?: string; limit?: number; offset?: number }
  ): { scans: DbScan[]; total: number } {
    if (!this.data.scans) this.data.scans = [];
    let list = this.data.scans.filter((s) => s.organizationId === organizationId);

    if (options?.status && options.status !== 'ALL') {
      list = list.filter((s) => s.status === options.status);
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q)) ||
          (s.mediaInfo?.fileName && s.mediaInfo.fileName.toLowerCase().includes(q)) ||
          (s.mediaInfo?.youtubeVideoId && s.mediaInfo.youtubeVideoId.toLowerCase().includes(q))
      );
    }

    const total = list.length;
    const offset = options?.offset || 0;
    const limit = options?.limit || 50;
    const paginated = list.slice(offset, offset + limit);

    return { scans: paginated, total };
  }

  updateScan(id: string, updates: Partial<DbScan>): DbScan | null {
    if (!this.data.scans) this.data.scans = [];
    const idx = this.data.scans.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.data.scans[idx] = {
      ...this.data.scans[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.scans[idx];
  }

  deleteScan(id: string, organizationId: string): boolean {
    if (!this.data.scans) this.data.scans = [];
    const initialLen = this.data.scans.length;
    this.data.scans = this.data.scans.filter(
      (s) => !(s.id === id && s.organizationId === organizationId)
    );
    // Also remove associated ingestion jobs
    if (this.data.ingestionJobs) {
      this.data.ingestionJobs = this.data.ingestionJobs.filter(
        (j) => !(j.scanId === id && j.organizationId === organizationId)
      );
    }
    const changed = this.data.scans.length !== initialLen;
    if (changed) this.save();
    return changed;
  }

  // --- Ingestion Jobs ---
  createIngestionJob(job: DbIngestionJob): DbIngestionJob {
    if (!this.data.ingestionJobs) this.data.ingestionJobs = [];
    this.data.ingestionJobs.unshift(job);
    this.save();
    return job;
  }

  findIngestionJobById(id: string): DbIngestionJob | undefined {
    if (!this.data.ingestionJobs) this.data.ingestionJobs = [];
    return this.data.ingestionJobs.find((j) => j.id === id);
  }

  findIngestionJobByScanId(scanId: string): DbIngestionJob | undefined {
    if (!this.data.ingestionJobs) this.data.ingestionJobs = [];
    return this.data.ingestionJobs.find((j) => j.scanId === scanId);
  }

  updateIngestionJob(id: string, updates: Partial<DbIngestionJob>): DbIngestionJob | null {
    if (!this.data.ingestionJobs) this.data.ingestionJobs = [];
    const idx = this.data.ingestionJobs.findIndex((j) => j.id === id);
    if (idx === -1) return null;
    this.data.ingestionJobs[idx] = {
      ...this.data.ingestionJobs[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.ingestionJobs[idx];
  }

  addIngestionLog(
    jobId: string,
    log: { timestamp: string; level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'; message: string }
  ) {
    if (!this.data.ingestionJobs) this.data.ingestionJobs = [];
    const job = this.data.ingestionJobs.find((j) => j.id === jobId);
    if (job) {
      job.logs.push(log);
      job.updatedAt = new Date().toISOString();
      this.save();
    }
  }

  // --- Videos ---
  createVideo(video: DbVideo): DbVideo {
    if (!this.data.videos) this.data.videos = [];
    this.data.videos.unshift(video);
    this.save();
    return video;
  }

  findVideoById(id: string): DbVideo | undefined {
    if (!this.data.videos) this.data.videos = [];
    return this.data.videos.find((v) => v.id === id);
  }

  // --- Analysis Jobs ---
  createAnalysisJob(job: DbAnalysisJob): DbAnalysisJob {
    if (!this.data.analysisJobs) this.data.analysisJobs = [];
    this.data.analysisJobs.unshift(job);
    this.save();
    return job;
  }

  findAnalysisJobById(id: string): DbAnalysisJob | undefined {
    if (!this.data.analysisJobs) this.data.analysisJobs = [];
    return this.data.analysisJobs.find((j) => j.id === id);
  }

  findLatestAnalysisJobByScanId(scanId: string): DbAnalysisJob | undefined {
    if (!this.data.analysisJobs) this.data.analysisJobs = [];
    return this.data.analysisJobs.find((j) => j.scanId === scanId);
  }

  updateAnalysisJob(id: string, updates: Partial<DbAnalysisJob>): DbAnalysisJob | null {
    if (!this.data.analysisJobs) this.data.analysisJobs = [];
    const idx = this.data.analysisJobs.findIndex((j) => j.id === id);
    if (idx === -1) return null;
    this.data.analysisJobs[idx] = {
      ...this.data.analysisJobs[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.analysisJobs[idx];
  }

  addAnalysisJobLog(
    jobId: string,
    log: { timestamp: string; level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'; message: string }
  ) {
    if (!this.data.analysisJobs) this.data.analysisJobs = [];
    const job = this.data.analysisJobs.find((j) => j.id === jobId);
    if (job) {
      job.logs.push(log);
      job.updatedAt = new Date().toISOString();
      this.save();
    }
  }

  // --- Transcripts ---
  saveTranscript(transcript: DbTranscript): DbTranscript {
    if (!this.data.transcripts) this.data.transcripts = [];
    const existingIdx = this.data.transcripts.findIndex((t) => t.scanId === transcript.scanId);
    if (existingIdx !== -1) {
      this.data.transcripts[existingIdx] = transcript;
    } else {
      this.data.transcripts.unshift(transcript);
    }
    this.save();
    return transcript;
  }

  findTranscriptByScanId(scanId: string): DbTranscript | undefined {
    if (!this.data.transcripts) this.data.transcripts = [];
    return this.data.transcripts.find((t) => t.scanId === scanId);
  }

  // --- PreScan Reports ---
  savePreScanReport(report: DbPreScanReport): DbPreScanReport {
    if (!this.data.preScanReports) this.data.preScanReports = [];
    const existingIdx = this.data.preScanReports.findIndex((r) => r.scanId === report.scanId);
    if (existingIdx !== -1) {
      this.data.preScanReports[existingIdx] = report;
    } else {
      this.data.preScanReports.unshift(report);
    }
    this.save();
    return report;
  }

  findPreScanReportByScanId(scanId: string): DbPreScanReport | undefined {
    if (!this.data.preScanReports) this.data.preScanReports = [];
    return this.data.preScanReports.find((r) => r.scanId === scanId);
  }

  findPreScanReportById(id: string): DbPreScanReport | undefined {
    if (!this.data.preScanReports) this.data.preScanReports = [];
    return this.data.preScanReports.find((r) => r.id === id);
  }

  // --- Audit Logs ---
  createAuditLog(log: DbAuditLog): DbAuditLog {
    if (!this.data.auditLogs) this.data.auditLogs = [];
    this.data.auditLogs.unshift(log);
    this.save();
    return log;
  }

  findAuditLogsByOrg(organizationId: string, limit = 50): DbAuditLog[] {
    if (!this.data.auditLogs) this.data.auditLogs = [];
    return this.data.auditLogs
      .filter((a) => a.organizationId === organizationId)
      .slice(0, limit);
  }

  // --- Development Mail Logger ---
  logMail(mail: DbMailMessage) {
    this.data.mailLog.unshift(mail);
    // Keep last 50 emails
    if (this.data.mailLog.length > 50) {
      this.data.mailLog = this.data.mailLog.slice(0, 50);
    }
    this.save();
  }

  getLatestMailFor(email: string, type?: 'VERIFY_EMAIL' | 'RESET_PASSWORD'): DbMailMessage | undefined {
    return this.data.mailLog.find(
      (m) => m.to.toLowerCase() === email.toLowerCase() && (!type || m.type === type)
    );
  }
}

export const db = new Database();
