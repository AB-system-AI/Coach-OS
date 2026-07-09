import { getCurrentTenant } from "@/lib/auth/session";
import { getMarketingStats } from "@/features/marketing";
import { ModuleOverview } from "@/components/layout/module-overview";
import { redirect } from "next/navigation";

export default async function MarketingPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");
  const stats = await getMarketingStats(tenant.id);

  return (
    <ModuleOverview
      title="Marketing"
      description="SEO, meta tags, analytics pixels, campaigns, newsletter, and landing pages."
      stats={[
        { label: "Campaigns", value: stats.campaigns },
        { label: "Subscribers", value: stats.subscribers },
        { label: "Landing Pages", value: stats.landingPages },
      ]}
      actions={[
        { label: "SEO Settings", href: "/dashboard/settings/branding" },
        { label: "New Campaign", href: "/dashboard/marketing/campaigns/new" },
      ]}
    />
  );
}
