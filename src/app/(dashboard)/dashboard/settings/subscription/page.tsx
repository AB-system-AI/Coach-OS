import { getCurrentTenant } from "@/lib/auth/session";
import { getPlanSummary, PLAN_DEFINITIONS } from "@/features/subscriptions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { bytesToReadable } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";

export default async function SubscriptionPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const summary = await getPlanSummary(tenant.id);
  const plans = Object.values(PLAN_DEFINITIONS).filter((p) => p.plan !== "FREE");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Subscription & Plans</h1>
        <p className="text-muted-foreground mt-1">
          Current plan:{" "}
          <Badge>{PLAN_DEFINITIONS[summary.plan].name}</Badge>
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Clients", used: summary.usage.clients, limit: summary.limits.clients },
          { label: "Programs", used: summary.usage.programs, limit: summary.limits.programs },
          { label: "Videos", used: summary.usage.videos, limit: summary.limits.videos },
          {
            label: "Storage",
            used: bytesToReadable(summary.usage.storageBytes),
            limit: bytesToReadable(BigInt(summary.limits.storageBytes)),
            isBytes: true,
          },
        ].map((item) => (
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
                  : `${item.used} / ${item.limit === -1 ? "∞" : item.limit}`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

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
                `${plan.limits.clients === -1 ? "Unlimited" : plan.limits.clients} clients`,
                `${plan.limits.programs === -1 ? "Unlimited" : plan.limits.programs} programs`,
                bytesToReadable(BigInt(plan.limits.storageBytes)) + " storage",
                plan.limits.customDomain ? "Custom domain" : null,
                plan.limits.recoveryBooking ? "Recovery booking" : null,
                plan.limits.ai ? "AI features" : null,
                plan.limits.whiteLabel ? "White label" : null,
                plan.limits.apiAccess ? "API access" : null,
                plan.limits.webhooks ? "Webhooks" : null,
              ]
                .filter(Boolean)
                .map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-primary" />
                    {feature}
                  </div>
                ))}
              <Button
                className="w-full mt-4"
                variant={summary.plan === plan.plan ? "secondary" : "default"}
                disabled={summary.plan === plan.plan}
              >
                {summary.plan === plan.plan ? "Current Plan" : "Upgrade"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
