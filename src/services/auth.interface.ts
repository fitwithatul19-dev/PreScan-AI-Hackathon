import { User, Organization, MembershipRole } from '../types';

export interface SignInCredentials {
  email: string;
  password?: string;
}

export interface SignUpData {
  email: string;
  fullName: string;
  password?: string;
  organizationName?: string;
}

/**
 * AuthService Contract Boundary
 * Provides architectural interface for Phase 02/03 authentication implementation.
 */
export interface IAuthService {
  getCurrentUser(): Promise<User | null>;
  getCurrentOrganization(): Promise<Organization | null>;
  getUserRole(organizationId: string): Promise<MembershipRole | null>;
  signIn(credentials: SignInCredentials): Promise<User>;
  signUp(data: SignUpData): Promise<User>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  updateProfile(updates: Partial<Pick<User, 'fullName' | 'avatarUrl'>>): Promise<User>;
  switchOrganization(organizationId: string): Promise<void>;
}
