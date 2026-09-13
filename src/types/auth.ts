import { User, Organization, Membership } from './models';
import { MembershipRole } from './enums';

export type AuthStatus =
  | 'LOADING'
  | 'UNAUTHENTICATED'
  | 'AUTHENTICATED_UNVERIFIED'
  | 'AUTHENTICATED_ONBOARDING'
  | 'AUTHENTICATED_READY'
  | 'SUSPENDED';

export interface OnboardingState {
  userId: string;
  step: number; // 1 to 4
  status: 'IN_PROGRESS' | 'COMPLETED';
  creatorType?: string;
  contentTypes?: string[];
  publishFrequency?: string;
  workspaceName?: string;
  completedAt?: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  membership: Membership | null;
  onboarding: OnboardingState | null;
  authStatus: AuthStatus;
  isLoading: boolean;
  login: (credentials: { email: string; password?: string }) => Promise<{ unverified?: boolean; email?: string }>;
  signup: (payload: { fullName: string; email: string; password?: string; termsAccepted: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (payload: string | { code?: string; token?: string; email?: string }) => Promise<void>;
  resendVerification: (email?: string) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (payload: { token: string; newPassword: string }) => Promise<void>;
  updateOnboardingStep: (data: Partial<OnboardingState>) => Promise<void>;
  completeOnboarding: (payload: { workspaceName: string; creatorType?: string; contentTypes?: string[]; publishFrequency?: string }) => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (payload: { displayName: string }) => Promise<void>;
}
