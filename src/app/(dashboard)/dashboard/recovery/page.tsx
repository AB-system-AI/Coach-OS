import { getCurrentTenant } from "@/lib/auth/session";
import { getRecoveryServices, getRecoveryStats } from "@/features/recovery";
import { getRecoveryPackages } from "@/features/recovery/services/recovery-service";
import { redirect } from "next/navigation";
import { RecoveryClient } from "./_components/recovery-client";

export default async function RecoveryPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [services, packages, stats] = await Promise.all([
    getRecoveryServices(tenant.id),
    getRecoveryPackages(tenant.id),
    getRecoveryStats(tenant.id),
  ]);

  const serializedServices = services.map((s) => ({ ...s, price: Number(s.price) }));
  const serializedPackages = packages.map((p) => ({ ...p, price: Number(p.price) }));

  return (
    <RecoveryClient
      services={serializedServices}
      packages={serializedPackages}
      stats={stats}
      tenantId={tenant.id}
    />
  );
}
