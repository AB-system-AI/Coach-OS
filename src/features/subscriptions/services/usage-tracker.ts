import { db } from "@/lib/db";
import type { SubscriptionPlan } from "@prisma/client";
import {
  getPlanLimits,
  hasFeature,
  isWithinLimit,
  type PlanLimitKey,
} from "@/features/subscriptions/types/plan-limits";

export type TenantUsage = {
  clients: number;
  programs: number;
  videos: number;
  storageBytes: bigint;
  assistantCoaches: number;
};

export async function getTenantPlan(tenantId: string): Promise<SubscriptionPlan> {
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    select: { plan: true },
  });
  return tenant?.plan ?? "FREE";
}

export async function getTenantUsage(tenantId: string): Promise<TenantUsage> {
  const [clients, programs, videos, assistants, tenant] = await Promise.all([
    db.clientProfile.count({ where: { tenantId, isActive: true } }),
    db.program.count({ where: { tenantId } }),
    db.exerciseVideo.count({ where: { tenantId } }),
    db.tenantMember.count({
      where: { tenantId, role: "ASSISTANT_COACH", isActive: true },
    }),
    db.tenant.findUnique({
      where: { id: tenantId },
      select: { storageUsedBytes: true },
    }),
  ]);

  return {
    clients,
    programs,
    videos,
    storageBytes: tenant?.storageUsedBytes ?? BigInt(0),
    assistantCoaches: assistants,
  };
}

export async function checkLimit(
  tenantId: string,
  resource: "clients" | "programs" | "videos" | "assistantCoaches"
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const [plan, usage] = await Promise.all([
    getTenantPlan(tenantId),
    getTenantUsage(tenantId),
  ]);

  const limits = getPlanLimits(plan);
  const current = usage[resource];
  const limit = limits[resource] as number;

  return {
    allowed: isWithinLimit(current, limit),
    current,
    limit,
  };
}

export async function assertFeature(
  tenantId: string,
  feature: PlanLimitKey
): Promise<void> {
  const plan = await getTenantPlan(tenantId);
  if (!hasFeature(plan, feature)) {
    throw new Error(
      `Feature "${feature}" is not available on your current plan. Please upgrade.`
    );
  }
}

export async function assertLimit(
  tenantId: string,
  resource: "clients" | "programs" | "videos" | "assistantCoaches"
): Promise<void> {
  const result = await checkLimit(tenantId, resource);
  if (!result.allowed) {
    throw new Error(
      `You have reached your ${resource} limit (${result.current}/${result.limit === -1 ? "∞" : result.limit}). Please upgrade your plan.`
    );
  }
}

export async function getPlanSummary(tenantId: string) {
  const [plan, usage] = await Promise.all([
    getTenantPlan(tenantId),
    getTenantUsage(tenantId),
  ]);

  const limits = getPlanLimits(plan);

  return {
    plan,
    usage,
    limits,
    usagePercentages: {
      clients:
        (limits.clients as number) === -1
          ? 0
          : Math.round((usage.clients / (limits.clients as number)) * 100),
      programs:
        (limits.programs as number) === -1
          ? 0
          : Math.round((usage.programs / (limits.programs as number)) * 100),
      videos:
        (limits.videos as number) === -1
          ? 0
          : Math.round((usage.videos / (limits.videos as number)) * 100),
      storage:
        (limits.storageBytes as number) === -1
          ? 0
          : Math.round(
              (Number(usage.storageBytes) / (limits.storageBytes as number)) * 100
            ),
    },
  };
}
