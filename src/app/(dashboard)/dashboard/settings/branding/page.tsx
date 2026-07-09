import { getCurrentTenant } from "@/lib/auth/session";
import { getWhiteLabelConfig } from "@/features/white-label";
import { PLAN_DEFINITIONS } from "@/features/subscriptions/types/plan-limits";
import { redirect } from "next/navigation";
import { BrandingClient } from "./_components/branding-client";

export default async function BrandingSettingsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const config = await getWhiteLabelConfig(tenant.id);
  const plan = PLAN_DEFINITIONS[tenant.plan];

  return (
    <BrandingClient
      tenantId={tenant.id}
      config={config}
      hasWhiteLabel={!!plan.limits.whiteLabel}
    />
  );
}
