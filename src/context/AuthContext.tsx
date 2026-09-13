import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Organization, Membership } from '../types';
import { AuthStatus, OnboardingState, AuthContextType } from '../types/auth';
import { apiFetch, getAuthHeaders, getStoredToken, setStoredToken } from '../lib/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingState | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('LOADING');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
        setOrganization(data.organization || null);
        setMembership(data.membership || null);
        setOnboarding(data.onboarding || null);
        setAuthStatus(data.authStatus || 'AUTHENTICATED_READY');
      } else {
        setUser(null);
        setOrganization(null);
        setMembership(null);
        setOnboarding(null);
        setAuthStatus('UNAUTHENTICATED');
        setStoredToken(null);
      }
    } catch {
      setUser(null);
      setOrganization(null);
      setMembership(null);
      setOnboarding(null);
      setAuthStatus('UNAUTHENTICATED');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (credentials: { email: string; password?: string }): Promise<{ unverified?: boolean; email?: string }> => {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    const data = await res.json();

    if (!res.ok) {
      if (data.code === 'UNVERIFIED_EMAIL' || data.unverified) {
        if (data.sessionToken) {
          setStoredToken(data.sessionToken);
        }
        if (data.user) {
          setUser(data.user);
        }
        setAuthStatus('AUTHENTICATED_UNVERIFIED');
        return { unverified: true, email: data.email || credentials.email };
      }
      throw new Error(data.error || 'Failed to sign in.');
    }

    if (data.sessionToken) {
      setStoredToken(data.sessionToken);
    }
    setUser(data.user);
    setOrganization(data.organization || null);
    setMembership(data.membership || null);
    setOnboarding(data.onboarding || null);
    setAuthStatus(data.authStatus || 'AUTHENTICATED_READY');
    return { unverified: false };
  };

  const signup = async (payload: { fullName: string; email: string; password?: string; termsAccepted: boolean }) => {
    const res = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create account.');
    }

    if (data.sessionToken) {
      setStoredToken(data.sessionToken);
    }
    setUser(data.user);
    setAuthStatus(data.authStatus || 'AUTHENTICATED_UNVERIFIED');
    setOnboarding({
      userId: data.user.id,
      step: 1,
      status: 'IN_PROGRESS',
      updatedAt: new Date().toISOString(),
    });
  };

  const logout = async () => {
    try {
      await apiFetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch {
      // Ignore network failure on logout
    } finally {
      setStoredToken(null);
      setUser(null);
      setOrganization(null);
      setMembership(null);
      setOnboarding(null);
      setAuthStatus('UNAUTHENTICATED');
    }
  };

  const verifyEmail = async (payload: string | { code?: string; token?: string; email?: string }) => {
    const body = typeof payload === 'string'
      ? payload.length === 6 && /^\d+$/.test(payload)
        ? { code: payload, email: user?.email }
        : { token: payload }
      : payload;

    const res = await apiFetch('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.error || 'Failed to verify email.');
      err.code = data.code;
      err.attemptsRemaining = data.attemptsRemaining;
      throw err;
    }
    if (data.sessionToken) {
      setStoredToken(data.sessionToken);
    }
    if (data.user) {
      setUser(data.user);
      setAuthStatus(data.authStatus || 'AUTHENTICATED_ONBOARDING');
      setOnboarding(data.onboarding || null);
      if (data.organization) setOrganization(data.organization);
      if (data.membership) setMembership(data.membership);
    }
  };

  const resendVerification = async (targetEmail?: string) => {
    const res = await apiFetch('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email: targetEmail || user?.email }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.error || 'Failed to resend verification email.');
      err.code = data.code;
      err.remainingSeconds = data.remainingSeconds;
      throw err;
    }
    return { success: true, message: data.message };
  };

  const forgotPassword = async (email: string) => {
    const res = await apiFetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit password reset request.');
    }
    return { success: true, message: data.message };
  };

  const resetPassword = async (payload: { token: string; newPassword: string }) => {
    const res = await apiFetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to reset password.');
    }
    setStoredToken(null);
  };

  const updateOnboardingStep = async (data: Partial<OnboardingState>) => {
    const res = await apiFetch('/api/onboarding/step', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.error || 'Failed to save onboarding progress.');
    }
    setOnboarding(resData.onboarding);
  };

  const completeOnboarding = async (payload: {
    workspaceName: string;
    creatorType?: string;
    contentTypes?: string[];
    publishFrequency?: string;
  }) => {
    const res = await apiFetch('/api/onboarding/complete', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to complete onboarding setup.');
    }
    setUser(data.user);
    setOrganization(data.organization);
    setMembership(data.membership || null);
    setOnboarding(data.onboarding);
    setAuthStatus(data.authStatus || 'AUTHENTICATED_READY');
  };

  const updateProfile = async (payload: { displayName: string }) => {
    const res = await apiFetch('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update profile.');
    }
    setUser(data.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        membership,
        onboarding,
        authStatus,
        isLoading,
        login,
        signup,
        logout,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        updateOnboardingStep,
        completeOnboarding,
        refreshSession,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
