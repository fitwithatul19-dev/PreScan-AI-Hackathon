import { Subscription, Plan, Usage, PlanTier } from '../types';

export interface ScanEligibility {
  allowed: boolean;
  remainingScans: number;
  reason?: string;
}

/**
 * BillingService Contract Boundary
 */
export interface IBillingService {
  getCurrentSubscription(organizationId: string): Promise<Subscription | null>;
  getAvailablePlans(): Promise<Plan[]>;
  getPlan(planId: string): Promise<Plan | null>;
  getUsage(organizationId: string): Promise<Usage | null>;
  canRunScan(organizationId: string): Promise<ScanEligibility>;
  createCheckoutSessionUrl(organizationId: string, planTier: PlanTier): Promise<string>;
  createBillingPortalUrl(organizationId: string): Promise<string>;
}
