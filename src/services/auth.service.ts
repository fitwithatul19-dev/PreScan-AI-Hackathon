import { IAuthService, SignInCredentials, SignUpData } from './auth.interface';
import { User, Organization, MembershipRole } from '../types';
import { apiFetch } from '../lib/api';

export class AuthService implements IAuthService {
  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await apiFetch('/api/auth/me');
      if (!res.ok) return null;
      const data = await res.json();
      return data.user || null;
    } catch {
      return null;
    }
  }

  async getCurrentOrganization(): Promise<Organization | null> {
    try {
      const res = await apiFetch('/api/auth/me');
      if (!res.ok) return null;
      const data = await res.json();
      return data.organization || null;
    } catch {
      return null;
    }
  }

  async getUserRole(organizationId: string): Promise<MembershipRole | null> {
    try {
      const res = await apiFetch(`/api/workspaces/${organizationId}`);
      if (!res.ok) return null;
      const data = await res.json();
      return (data.workspace?.role as MembershipRole) || null;
    } catch {
      return null;
    }
  }

  async signIn(credentials: SignInCredentials): Promise<User> {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to sign in.');
    }
    return data.user;
  }

  async signUp(data: SignUpData): Promise<User> {
    const res = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        termsAccepted: true,
      }),
    });
    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.error || 'Failed to sign up.');
    }
    return resData.user;
  }

  async signOut(): Promise<void> {
    await apiFetch('/api/auth/logout', {
      method: 'POST',
    });
  }

  async resetPassword(email: string): Promise<void> {
    const res = await apiFetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to request password reset.');
    }
  }

  async updateProfile(updates: Partial<Pick<User, 'fullName' | 'avatarUrl'>>): Promise<User> {
    const res = await apiFetch('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update profile.');
    }
    return data.user;
  }

  async switchOrganization(organizationId: string): Promise<void> {
    // Switch org logic if multiple orgs
  }
}

export const authService = new AuthService();
