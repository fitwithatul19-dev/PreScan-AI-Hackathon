import React from 'react';
import { Check, Sparkles, CreditCard, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { FOUNDATION_PLANS } from '../config/constants';
import { formatCentsToCurrency } from '../utils/formatters';

interface BillingPageProps {
  onNavigate: (route: string) => void;
}

export const BillingPage: React.FC<BillingPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Subscription & Billing"
        description="Review workspace capacity, plan tiers, and future billing management boundaries."
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Workspace', onClick: () => onNavigate('/app/dashboard') },
              { label: 'Billing' },
            ]}
          />
        }
      />

      {/* Current Workspace Plan Status (Neutral starter state) */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-neutral-900">Current Plan: Starter Free</h3>
            <Badge variant="neutral">Active (Phase 01)</Badge>
          </div>
          <p className="text-xs text-neutral-500">
            Includes 3 monthly scans with standard turnaround time for foundation testing.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" size="sm" disabled>
            Manage Billing
          </Button>
        </div>
      </div>

      {/* Available Plan Tiers Comparison */}
      <div>
        <div className="mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-800">
            Available Plans
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Scalable tier allocations designed for solo creators, teams, and high-volume studios.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {FOUNDATION_PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`flex flex-col justify-between relative ${
                plan.isPopular ? 'border-neutral-900 ring-1 ring-neutral-900 shadow-md' : 'border-neutral-200'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-white shadow-sm">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    Recommended
                  </span>
                </div>
              )}

              <div>
                <CardHeader className="mb-4">
                  <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                  <CardDescription className="min-h-[32px]">{plan.description}</CardDescription>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-bold tracking-tight text-neutral-900">
                      {formatCentsToCurrency(plan.monthlyPriceCents)}
                    </span>
                    <span className="text-xs text-neutral-500">/ month</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="border-t border-neutral-100 pt-3">
                    <p className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                      Included Capabilities:
                    </p>
                    <ul className="space-y-2">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-neutral-700">
                          <Check className="w-3.5 h-3.5 text-neutral-800 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-4">
                <Button
                  variant={plan.isPopular ? 'primary' : 'outline'}
                  size="md"
                  className="w-full"
                  disabled
                >
                  {plan.monthlyPriceCents === 0 ? 'Current Plan' : 'Upgrade Plan'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
