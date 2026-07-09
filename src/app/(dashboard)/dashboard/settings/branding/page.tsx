import { getCurrentTenant } from "@/lib/auth/session";
import { getWhiteLabelConfig } from "@/features/white-label";
import { PLAN_DEFINITIONS } from "@/features/subscriptions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { Palette } from "lucide-react";

export default async function BrandingSettingsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const config = await getWhiteLabelConfig(tenant.id);
  const plan = PLAN_DEFINITIONS[tenant.plan];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Palette className="h-8 w-8" />
          White Label Branding
        </h1>
        <p className="text-muted-foreground mt-1">
          Your brand is fully isolated from other tenants on the platform.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { label: "Logo", value: config?.theme?.logoUrl ? "Configured" : "Not set" },
          { label: "Favicon", value: config?.theme?.faviconUrl ? "Configured" : "Not set" },
          { label: "Primary Color", value: config?.theme?.primaryColor ?? "#6366f1" },
          { label: "Font", value: config?.theme?.fontFamily ?? "Inter" },
          { label: "SEO Title", value: config?.settings?.seoTitle ?? "Not set" },
          { label: "Email Branding", value: config?.settings?.emailFromName ?? "Not set" },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-sm truncate">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">White Label Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            {[
              "Own Logo & Favicon",
              "Custom Colors & Fonts",
              "Custom Domain",
              "Email Branding",
              "SEO Configuration",
              "Social Links",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <Badge
                  variant={
                    plan.limits.whiteLabel ? "success" : "secondary"
                  }
                  className="text-xs"
                >
                  {plan.limits.whiteLabel ? "✓" : "—"}
                </Badge>
                {feature}
              </div>
            ))}
          </div>
          {!plan.limits.whiteLabel && (
            <p className="text-sm text-muted-foreground mt-4">
              Upgrade to Professional or above to unlock full white-label branding.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
