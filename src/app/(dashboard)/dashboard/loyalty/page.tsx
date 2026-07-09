import { getCurrentTenant } from "@/lib/auth/session";
import { getLoyaltyStats } from "@/features/loyalty";
import { ModuleOverview } from "@/components/layout/module-overview";
import { redirect } from "next/navigation";

export default async function LoyaltyPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");
  const program = await getLoyaltyStats(tenant.id);

  return (
    <ModuleOverview
      title="Loyalty & Rewards"
      description="Points, achievements, badges, referrals, and membership levels."
      stats={[
        { label: "Membership Levels", value: program?._count.levels ?? 0 },
        { label: "Badges", value: program?._count.badges ?? 0 },
        { label: "Point Transactions", value: program?._count.pointEntries ?? 0 },
      ]}
      actions={[{ label: "Configure Program", href: "/dashboard/loyalty/settings" }]}
    />
  );
}
