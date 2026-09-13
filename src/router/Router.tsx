import React, { useState, useEffect } from 'react';
import { ROUTES } from './routes';
import { useAuth } from '../context/AuthContext';

import { AppShell } from '../components/layout/AppShell';
import { DashboardPage } from '../pages/DashboardPage';
import { NewScanPage } from '../pages/NewScanPage';
import { ScansPage } from '../pages/ScansPage';
import { ScanDetailPage } from '../pages/ScanDetailPage';
import { ReportsPage } from '../pages/ReportsPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { SettingsPage } from '../pages/SettingsPage';

// Public Marketing Pages
import { PublicLandingPage } from '../pages/PublicLandingPage';
import { PublicFeaturesPage } from '../pages/PublicFeaturesPage';
import { PublicHowItWorksPage } from '../pages/PublicHowItWorksPage';
import { PublicSecurityPage } from '../pages/PublicSecurityPage';
import { PublicAboutPage } from '../pages/PublicAboutPage';
import { PublicContactPage } from '../pages/PublicContactPage';
import { PublicPrivacyPage } from '../pages/PublicPrivacyPage';
import { PublicTermsPage } from '../pages/PublicTermsPage';

// Authentication & Onboarding Pages
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { VerifyEmailPage } from '../pages/VerifyEmailPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { AccountSuspendedPage } from '../pages/AccountSuspendedPage';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

/**
 * ProtectedRoute: Enforces active Supabase session via supabase.auth.getSession().
 * If no session exists, it redirects the user to /login.
 */
function ProtectedRoute({
  children,
  onNavigate,
  currentRoute,
}: {
  children: React.ReactNode;
  onNavigate: (route: string) => void;
  currentRoute: string;
}) {
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let isMounted = true;
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (!isMounted) return;
        if (error || !session) {
          setHasSession(false);
          onNavigate(ROUTES.LOGIN);
        } else {
          setHasSession(true);
        }
        setChecking(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setHasSession(false);
        onNavigate(ROUTES.LOGIN);
        setChecking(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentRoute, onNavigate]);

  if (checking) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col justify-center items-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
            <Loader2 className="w-4 h-4 animate-spin text-neutral-600" />
            <span>Verifying session...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!hasSession) {
    return <LoginPage onNavigate={onNavigate} returnTo={currentRoute} />;
  }

  return <>{children}</>;
}

export const Router: React.FC = () => {
  const { authStatus, isLoading } = useAuth();

  const getInitialRoute = (): string => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const search = window.location.search || '';
      const hash = window.location.hash || '';

      // Check if this is an OAuth callback return from Supabase
      if (pathname.includes('/auth/callback') || hash.includes('access_token=') || search.includes('code=')) {
        return ROUTES.AUTH_CALLBACK;
      }

      if (pathname && pathname !== '/') {
        return `${pathname}${search}${hash}`;
      }
      if (hash && !hash.includes('access_token=')) {
        return hash.replace('#', '');
      }
    }
    return ROUTES.HOME;
  };

  const [currentRoute, setCurrentRoute] = useState<string>(getInitialRoute);

  const navigate = (route: string) => {
    setCurrentRoute(route);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', route);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname + window.location.search + window.location.hash;
        setCurrentRoute(path || ROUTES.HOME);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Clean up OAuth hash tokens from browser URL once parsed by Supabase
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  // Extract base route path without query params or hash fragment for matching
  const routePath = currentRoute.split('?')[0].split('#')[0];

  // Protect private pages with supabase.auth.getSession() — if no session, redirect to /login
  useEffect(() => {
    const isPrivate = routePath.startsWith('/app') || routePath === ROUTES.ONBOARDING;
    if (isPrivate) {
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error || !session) {
          navigate(ROUTES.LOGIN);
        }
      });
    }
  }, [routePath]);

  // Auto-route authenticated users when they land on root or auth routes
  useEffect(() => {
    if (isLoading) return;

    if (authStatus === 'AUTHENTICATED_READY') {
      if (
        routePath === ROUTES.HOME ||
        routePath === ROUTES.LOGIN ||
        routePath === ROUTES.SIGNUP ||
        routePath === ROUTES.ONBOARDING ||
        routePath === ROUTES.AUTH_CALLBACK ||
        routePath === ROUTES.VERIFY_EMAIL
      ) {
        navigate(ROUTES.DASHBOARD);
      }
    } else if (authStatus === 'AUTHENTICATED_ONBOARDING') {
      if (
        routePath === ROUTES.LOGIN ||
        routePath === ROUTES.SIGNUP ||
        routePath === ROUTES.AUTH_CALLBACK ||
        routePath.startsWith('/app')
      ) {
        navigate(ROUTES.ONBOARDING);
      }
    } else if (authStatus === 'UNAUTHENTICATED') {
      if (routePath.startsWith('/app') || routePath === ROUTES.ONBOARDING) {
        navigate(ROUTES.LOGIN);
      } else if (routePath === ROUTES.AUTH_CALLBACK) {
        navigate(ROUTES.LOGIN);
      }
    }
  }, [authStatus, isLoading, routePath]);

  // Global Loading Splash during initial auth verification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col justify-center items-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
            <Loader2 className="w-4 h-4 animate-spin text-neutral-600" />
            <span>Initializing PreScan session...</span>
          </div>
        </div>
      </div>
    );
  }

  // Account Suspended Gate
  if (authStatus === 'SUSPENDED') {
    return <AccountSuspendedPage onNavigate={navigate} />;
  }

  // OAuth Callback Route Fallback view while syncing
  if (routePath === ROUTES.AUTH_CALLBACK) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col justify-center items-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
            <Loader2 className="w-4 h-4 animate-spin text-neutral-600" />
            <span>Completing authentication & loading workspace...</span>
          </div>
        </div>
      </div>
    );
  }

  // 1. Standalone Public Marketing Pages
  if (routePath === ROUTES.HOME || routePath === '') {
    if (authStatus === 'AUTHENTICATED_READY') {
      return (
        <AppShell currentRoute={ROUTES.DASHBOARD} onNavigate={navigate}>
          <DashboardPage onNavigate={navigate} />
        </AppShell>
      );
    }
    return <PublicLandingPage onNavigate={navigate} />;
  }
  if (routePath === ROUTES.FEATURES) {
    return <PublicFeaturesPage onNavigate={navigate} />;
  }
  if (routePath === ROUTES.HOW_IT_WORKS) {
    return <PublicHowItWorksPage onNavigate={navigate} />;
  }
  if (routePath === ROUTES.SECURITY) {
    return <PublicSecurityPage onNavigate={navigate} />;
  }
  if (routePath === ROUTES.ABOUT) {
    return <PublicAboutPage onNavigate={navigate} />;
  }
  if (routePath === ROUTES.CONTACT) {
    return <PublicContactPage onNavigate={navigate} />;
  }
  if (routePath === ROUTES.PRIVACY) {
    return <PublicPrivacyPage onNavigate={navigate} />;
  }
  if (routePath === ROUTES.TERMS) {
    return <PublicTermsPage onNavigate={navigate} />;
  }

  // 2. Authentication Flow Pages
  if (routePath === ROUTES.LOGIN) {
    if (authStatus === 'AUTHENTICATED_READY') {
      return (
        <AppShell currentRoute={ROUTES.DASHBOARD} onNavigate={navigate}>
          <DashboardPage onNavigate={navigate} />
        </AppShell>
      );
    }
    if (authStatus === 'AUTHENTICATED_ONBOARDING') {
      return <OnboardingPage onNavigate={navigate} />;
    }
    const urlParams = new URLSearchParams(currentRoute.includes('?') ? currentRoute.split('?')[1] : '');
    const prefilledEmail = urlParams.get('email') || undefined;
    const msg = urlParams.get('msg') || (urlParams.get('registered') === 'true' ? 'Your account has been created. Please check your email and verify your address before logging in.' : undefined);
    return <LoginPage onNavigate={navigate} initialEmail={prefilledEmail} verificationMessage={msg} />;
  }

  if (routePath === ROUTES.SIGNUP) {
    if (authStatus === 'AUTHENTICATED_READY') {
      return (
        <AppShell currentRoute={ROUTES.DASHBOARD} onNavigate={navigate}>
          <DashboardPage onNavigate={navigate} />
        </AppShell>
      );
    }
    if (authStatus === 'AUTHENTICATED_ONBOARDING') {
      return <OnboardingPage onNavigate={navigate} />;
    }
    return <SignupPage onNavigate={navigate} />;
  }

  if (routePath === ROUTES.VERIFY_EMAIL) {
    if (authStatus === 'AUTHENTICATED_READY') {
      return (
        <AppShell currentRoute={ROUTES.DASHBOARD} onNavigate={navigate}>
          <DashboardPage onNavigate={navigate} />
        </AppShell>
      );
    }
    if (authStatus === 'AUTHENTICATED_ONBOARDING') {
      return <OnboardingPage onNavigate={navigate} />;
    }
    return <LoginPage onNavigate={navigate} />;
  }

  if (routePath === ROUTES.FORGOT_PASSWORD) {
    return <ForgotPasswordPage onNavigate={navigate} />;
  }

  if (routePath === ROUTES.RESET_PASSWORD) {
    return <ResetPasswordPage onNavigate={navigate} />;
  }

  if (routePath === ROUTES.ONBOARDING) {
    if (authStatus === 'AUTHENTICATED_READY') {
      return (
        <AppShell currentRoute={ROUTES.DASHBOARD} onNavigate={navigate}>
          <DashboardPage onNavigate={navigate} />
        </AppShell>
      );
    }
    return (
      <ProtectedRoute onNavigate={navigate} currentRoute={currentRoute}>
        <OnboardingPage onNavigate={navigate} />
      </ProtectedRoute>
    );
  }

  // 3. Protected Application Shell Routes (/app/*)
  if (routePath.startsWith('/app')) {
    // Authenticated Ready Shell Rendering
    const renderAppContent = () => {
      // Dynamic scan detail route check: /app/scans/:id
      if (routePath.startsWith('/app/scans/') && routePath !== ROUTES.SCANS) {
        const scanId = routePath.replace('/app/scans/', '');
        return <ScanDetailPage scanId={scanId} onNavigate={navigate} />;
      }

      switch (routePath) {
        case ROUTES.APP_ROOT:
        case ROUTES.DASHBOARD:
          return <DashboardPage onNavigate={navigate} />;
        case ROUTES.NEW_SCAN:
          return <NewScanPage onNavigate={navigate} />;
        case ROUTES.SCANS:
          return <ScansPage onNavigate={navigate} />;
        case ROUTES.REPORTS:
          return <ReportsPage onNavigate={navigate} />;
        case ROUTES.PROJECTS:
          return <ProjectsPage onNavigate={navigate} />;
        case ROUTES.SETTINGS:
          return <SettingsPage onNavigate={navigate} />;
        default:
          return <DashboardPage onNavigate={navigate} />;
      }
    };

    return (
      <ProtectedRoute onNavigate={navigate} currentRoute={currentRoute}>
        {authStatus === 'AUTHENTICATED_ONBOARDING' || authStatus === 'AUTHENTICATED_UNVERIFIED' ? (
          <OnboardingPage onNavigate={navigate} />
        ) : (
          <AppShell currentRoute={currentRoute} onNavigate={navigate}>
            {renderAppContent()}
          </AppShell>
        )}
      </ProtectedRoute>
    );
  }

  // Fallback to Home
  return <PublicLandingPage onNavigate={navigate} />;
};
