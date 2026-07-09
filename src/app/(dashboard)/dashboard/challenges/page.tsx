import { getCurrentTenant } from "@/lib/auth/session";
import { getChallengeStats } from "@/features/challenges";
import { ModuleOverview } from "@/components/layout/module-overview";
import { redirect } from "next/navigation";

export default async function ChallengesPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");
  const stats = await getChallengeStats(tenant.id);

  return (
    <ModuleOverview
      title="Client Challenges"
      description="30-day challenges, leaderboards, daily check-ins, points, and medals."
      stats={[
        { label: "Active Challenges", value: stats.active },
        { label: "Participants", value: stats.participants },
      ]}
      actions={[{ label: "Create Challenge", href: "/dashboard/challenges/new" }]}
    />
  );
}
