export const ROUTES = {
  HOME: '/',
  FEATURES: '/features',
  HOW_IT_WORKS: '/how-it-works',
  SECURITY: '/security',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  LOGIN: '/login',
  SIGNUP: '/signup',
  AUTH_CALLBACK: '/auth/callback',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ONBOARDING: '/onboarding',
  APP_ROOT: '/app',
  DASHBOARD: '/app/dashboard',
  NEW_SCAN: '/app/new-scan',
  SCANS: '/app/scans',
  SCAN_DETAIL: (id: string) => `/app/scans/${id}`,
  REPORTS: '/app/reports',
  PROJECTS: '/app/projects',
  SETTINGS: '/app/settings',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];

