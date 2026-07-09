import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_DEFINITIONS } from "@/features/subscriptions/types/plan-limits";
import { Check } from "lucide-react";

const DISPLAY_PLANS = ["FREE", "STARTER", "PROFESSIONAL", "BUSINESS", "ENTERPRISE"] as const;

function formatLimit(value: number): string {
  if (value === -1) return "Unlimited";
  return String(value);
}

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Simple, Transparent Pricing</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Start free, upgrade as you grow. All plans include a 14-day trial on paid tiers.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {DISPLAY_PLANS.map((planKey) => {
          const plan = PLAN_DEFINITIONS[planKey];
          const highlighted = planKey === "PROFESSIONAL";

          return (
            <Card
              key={planKey}
              className={highlighted ? "border-primary shadow-lg ring-1 ring-primary" : ""}
            >
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="pt-2">
                  <span className="text-3xl font-bold">
                    {plan.monthlyPrice === 0 ? "Free" : `$${plan.monthlyPrice}`}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className="text-muted-foreground text-sm">/month</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <PricingRow label="Clients" value={formatLimit(plan.limits.clients as number)} />
                <PricingRow label="Programs" value={formatLimit(plan.limits.programs as number)} />
                <PricingRow label="Recovery booking" value={plan.limits.recoveryBooking ? "Yes" : "No"} />
                <PricingRow label="Marketplace" value={plan.limits.marketplace ? "Yes" : "No"} />
                <PricingRow label="AI assistant" value={plan.limits.ai ? "Yes" : "No"} />
                <PricingRow label="Custom domain" value={plan.limits.customDomain ? "Yes" : "No"} />
                <Button className="w-full mt-4" variant={highlighted ? "default" : "outline"} asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function PricingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Check className="h-4 w-4 text-primary shrink-0" />
      <span>
        <span className="text-muted-foreground">{label}:</span> {value}
      </span>
    </div>
  );
}
