import { getCurrentTenant } from "@/lib/auth/session";
import { PLAN_DEFINITIONS } from "@/features/subscriptions/types/plan-limits";
import { getPlanSummary } from "@/features/subscriptions/services/usage-tracker";
import { getTenantSubscription } from "@/features/subscriptions/services/billing-service";
import {
  BILLING_NOT_CONFIGURED_MESSAGE,
  isStripeConfigured,
} from "@/lib/payments/availability";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { bytesToReadable } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Check, AlertCircle } from "lucide-react";
import {
  UpgradeButton,
  ManageBillingButton,
  CancelSubscriptionButton,
} from "./_components/plan-buttons";

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const params = await searchParams;

  const [summary, sub] = await Promise.all([
    getPlanSummary(tenant.id),
    getTenantSubscription(tenant.id),
  ]);

  const plans = Object.values(PLAN_DEFINITIONS).filter((p) => p.plan !== "FREE");
  const hasSubscription = Boolean(sub?.stripeSubscriptionId);
  const hasActiveSubscription =
    hasSubscription && sub?.status === "ACTIVE";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Subscription & Plans</h1>
          <p className="text-muted-foreground mt-1">
            Current plan:{" "}
            <Badge>{PLAN_DEFINITIONS[summary.plan].name}</Badge>
            {sub?.cancelAtPeriodEnd && (
              <Badge variant="destructive" className="ml-2">
                Cancels {sub.currentPeriodEnd
                  ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                  : "at period end"}
              </Badge>
            )}
          </p>
          {sub?.currentPeriodEnd && hasActiveSubscription && (
            <p className="text-sm text-muted-foreground mt-1">
              Next billing date:{" "}
              {new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <ManageBillingButton hasSubscription={hasSubscription} />
          <CancelSubscriptionButton
            hasActiveSubscription={Boolean(hasActiveSubscription)}
            cancelAtPeriodEnd={sub?.cancelAtPeriodEnd ?? false}
          />
        </div>
      </div>

      {!isStripeConfigured() && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="text-sm">{BILLING_NOT_CONFIGURED_MESSAGE}</p>
        </div>
      )}

      {params.checkout === "success" && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          <Check className="h-4 w-4 shrink-0" />
          <p className="text-sm font-medium">
            Subscription activated! Your plan will update shortly.
          </p>
        </div>
      )}

      {params.checkout === "cancel" && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="text-sm">Checkout was cancelled. You have not been charged.</p>
        </div>
      )}

      {/* Usage summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Clients",
            used: summary.usage.clients,
            limit: summary.limits.clients as number,
          },
          {
            label: "Programs",
            used: summary.usage.programs,
            limit: summary.limits.programs as number,
          },
          {
            label: "Videos",
            used: summary.usage.videos,
            limit: summary.limits.videos as number,
          },
          {
            label: "Storage",
            used: bytesToReadable(summary.usage.storageBytes),
            limit: bytesToReadable(BigInt(summary.limits.storageBytes as number)),
            isBytes: true,
          },
        ].map((item) => {
          const pct = item.isBytes
            ? summary.usagePercentages.storage
            : item.label === "Clients"
            ? summary.usagePercentages.clients
            : item.label === "Programs"
            ? summary.usagePercentages.programs
            : summary.usagePercentages.videos;

          return (
            <Card key={item.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">
                  {item.isBytes
                    ? `${item.used} / ${item.limit}`
                    : `${item.used} / ${(item.limit as number) === -1 ? "∞" : item.limit}`}
                </p>
                {!item.isBytes && (item.limit as number) !== -1 && (
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.plan}
            className={
              summary.plan === plan.plan
                ? "border-primary ring-1 ring-primary"
                : ""
            }
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <p className="text-3xl font-bold">
                ${plan.monthlyPrice}
                <span className="text-sm font-normal text-muted-foreground">
                  /mo
                </span>
              </p>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                `${(plan.limits.clients as number) === -1 ? "Unlimited" : plan.limits.clients} clients`,
                `${(plan.limits.programs as number) === -1 ? "Unlimited" : plan.limits.programs} programs`,
                bytesToReadable(BigInt(plan.limits.storageBytes as number)) +
                  " storage",
                plan.limits.customDomain ? "Custom domain" : null,
                plan.limits.recoveryBooking ? "Recovery booking" : null,
                plan.limits.ai ? "AI features" : null,
                plan.limits.whiteLabel ? "White label" : null,
                plan.limits.apiAccess ? "API access" : null,
                plan.limits.webhooks ? "Webhooks" : null,
              ]
                .filter(Boolean)
                .map((feature) => (
                  <div key={feature as string} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    {feature}
                  </div>
                ))}

              <UpgradeButton
                plan={plan.plan}
                currentPlan={summary.plan}
                hasSubscription={hasSubscription}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
