"use server";

import { revalidatePath } from "next/cache";
import { requireTenantAccess } from "@/lib/auth/session";
import {
  createRecoveryService,
  updateRecoveryService,
  deleteRecoveryService,
  createRecoveryPackage,
  updateRecoveryPackage,
  deleteRecoveryPackage,
} from "@/features/recovery/services/recovery-service";

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);
}

export async function createRecoveryServiceAction(
  tenantId: string,
  data: {
    name: string;
    description?: string;
    duration: number;
    price: number;
    capacity?: number;
  }
) {
  await requireTenantAccess(tenantId);
  const service = await createRecoveryService(tenantId, {
    ...data,
    slug: toSlug(data.name),
  });
  revalidatePath("/dashboard/recovery");
  return { id: service.id };
}

export async function updateRecoveryServiceAction(
  tenantId: string,
  serviceId: string,
  data: Partial<{
    name: string;
    description: string;
    duration: number;
    price: number;
    capacity: number;
    isActive: boolean;
  }>
) {
  await requireTenantAccess(tenantId);
  await updateRecoveryService(tenantId, serviceId, data);
  revalidatePath("/dashboard/recovery");
}

export async function deleteRecoveryServiceAction(tenantId: string, serviceId: string) {
  await requireTenantAccess(tenantId);
  await deleteRecoveryService(tenantId, serviceId);
  revalidatePath("/dashboard/recovery");
}

export async function createRecoveryPackageAction(
  tenantId: string,
  data: { name: string; description?: string; sessions: number; price: number; validityDays?: number }
) {
  await requireTenantAccess(tenantId);
  const pkg = await createRecoveryPackage(tenantId, data);
  revalidatePath("/dashboard/recovery");
  return { id: pkg.id };
}

export async function updateRecoveryPackageAction(
  tenantId: string,
  packageId: string,
  data: Partial<{ name: string; sessions: number; price: number; isActive: boolean }>
) {
  await requireTenantAccess(tenantId);
  await updateRecoveryPackage(tenantId, packageId, data);
  revalidatePath("/dashboard/recovery");
}

export async function deleteRecoveryPackageAction(tenantId: string, packageId: string) {
  await requireTenantAccess(tenantId);
  await deleteRecoveryPackage(tenantId, packageId);
  revalidatePath("/dashboard/recovery");
}
