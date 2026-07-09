import { getCurrentTenant } from "@/lib/auth/session";
import { getPendingCheckIns, getProgressStats } from "@/features/progress";
import { redirect } from "next/navigation";
import { ProgressClient } from "./_components/progress-client";

export default async function ProgressPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [checkIns, stats] = await Promise.all([
    getPendingCheckIns(tenant.id),
    getProgressStats(tenant.id),
  ]);

  return (
    <ProgressClient
      checkIns={checkIns}
      stats={stats}
      tenantId={tenant.id}
    />
  );
}
