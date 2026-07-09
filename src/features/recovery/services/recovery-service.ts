import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";

export async function getRecoveryServices(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.recoveryService.findMany({
    where: { tenantId },
    include: { _count: { select: { bookings: true } } },
    orderBy: { order: "asc" },
  });
}

export async function createRecoveryService(
  tenantId: string,
  data: {
    name: string;
    slug: string;
    description?: string;
    duration: number;
    price: number;
    capacity?: number;
  }
) {
  await requireTenantAccess(tenantId);
  return db.recoveryService.create({
    data: {
      tenantId,
      ...data,
      capacity: data.capacity ?? 1,
      isActive: true,
    },
  });
}

export async function getRecoveryStats(tenantId: string) {
  await requireTenantAccess(tenantId);
  const [services, packages] = await Promise.all([
    db.recoveryService.count({ where: { tenantId, isActive: true } }),
    db.recoveryPackage.count({ where: { tenantId, isActive: true } }),
  ]);
  return { services, packages };
}
