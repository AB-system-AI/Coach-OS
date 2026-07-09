import { db } from "@/lib/db";
import type { TenantModuleKey, SubscriptionPlan } from "@prisma/client";
import {
  MODULE_REGISTRY,
  ALL_MODULE_KEYS,
  isPlanSufficient,
  getRecommendedModules,
} from "@/features/modules/types/registry";

export async function getTenantModules(tenantId: string) {
  const configs = await db.tenantModuleConfig.findMany({
    where: { tenantId },
  });

  const configMap = new Map(configs.map((c) => [c.module, c]));

  return ALL_MODULE_KEYS.map((key) => {
    const def = MODULE_REGISTRY[key];
    const config = configMap.get(key);
    return {
      ...def,
      isEnabled: config?.isEnabled ?? def.defaultEnabled,
      settings: config?.settings ?? {},
    };
  });
}

export async function getEnabledModules(
  tenantId: string
): Promise<TenantModuleKey[]> {
  const modules = await getTenantModules(tenantId);
  return modules.filter((m) => m.isEnabled).map((m) => m.key);
}

export async function isModuleEnabled(
  tenantId: string,
  module: TenantModuleKey
): Promise<boolean> {
  const config = await db.tenantModuleConfig.findUnique({
    where: { tenantId_module: { tenantId, module } },
  });
  if (config) return config.isEnabled;
  return MODULE_REGISTRY[module].defaultEnabled;
}

export async function initializeTenantModules(
  tenantId: string,
  businessType?: Parameters<typeof getRecommendedModules>[0],
  selectedModules?: TenantModuleKey[]
) {
  const recommended = businessType
    ? getRecommendedModules(businessType)
    : [];
  const toEnable = new Set(selectedModules ?? recommended);

  const data = ALL_MODULE_KEYS.map((module) => ({
    tenantId,
    module,
    isEnabled: toEnable.has(module) || MODULE_REGISTRY[module].defaultEnabled,
  }));

  await db.tenantModuleConfig.createMany({ data, skipDuplicates: true });
}

export async function updateTenantModules(
  tenantId: string,
  modules: { key: TenantModuleKey; enabled: boolean }[],
  plan: SubscriptionPlan
) {
  for (const { key, enabled } of modules) {
    const def = MODULE_REGISTRY[key];
    if (enabled && !isPlanSufficient(plan, def.minPlan)) {
      throw new Error(
        `Module "${def.name}" requires ${def.minPlan} plan or higher`
      );
    }

    await db.tenantModuleConfig.upsert({
      where: { tenantId_module: { tenantId, module: key } },
      update: { isEnabled: enabled },
      create: { tenantId, module: key, isEnabled: enabled },
    });
  }
}

export async function seedDefaultAutomations(tenantId: string) {
  const defaults = [
    {
      name: "Welcome Email",
      trigger: "CLIENT_CREATED" as const,
      action: "SEND_EMAIL" as const,
      template: "welcome",
    },
    {
      name: "Booking Confirmation",
      trigger: "BOOKING_CREATED" as const,
      action: "SEND_EMAIL" as const,
      template: "booking_confirmation",
    },
    {
      name: "Appointment Reminder",
      trigger: "APPOINTMENT_REMINDER" as const,
      action: "SEND_NOTIFICATION" as const,
      template: "appointment_reminder",
    },
    {
      name: "Recovery Reminder",
      trigger: "RECOVERY_REMINDER" as const,
      action: "SEND_NOTIFICATION" as const,
      template: "recovery_reminder",
    },
    {
      name: "Birthday Message",
      trigger: "BIRTHDAY" as const,
      action: "SEND_EMAIL" as const,
      template: "birthday",
    },
  ];

  await db.automationRule.createMany({
    data: defaults.map((d) => ({ tenantId, ...d, isActive: true })),
    skipDuplicates: true,
  });
}

export async function seedDefaultCrmPipeline(tenantId: string) {
  const existing = await db.crmPipeline.findFirst({ where: { tenantId } });
  if (existing) return existing;

  return db.crmPipeline.create({
    data: {
      tenantId,
      name: "Sales Pipeline",
      isDefault: true,
      stages: {
        create: [
          { name: "New Lead", order: 0, color: "#6366f1" },
          { name: "Contacted", order: 1, color: "#8b5cf6" },
          { name: "Qualified", order: 2, color: "#06b6d4" },
          { name: "Proposal", order: 3, color: "#f59e0b" },
          { name: "Won", order: 4, color: "#10b981" },
        ],
      },
    },
  });
}

export async function seedLoyaltyProgram(tenantId: string) {
  const existing = await db.loyaltyProgram.findUnique({ where: { tenantId } });
  if (existing) return existing;

  return db.loyaltyProgram.create({
    data: {
      tenantId,
      levels: {
        create: [
          { name: "Bronze", minPoints: 0, discountPercent: 0, order: 0 },
          { name: "Silver", minPoints: 500, discountPercent: 5, order: 1 },
          { name: "Gold", minPoints: 2000, discountPercent: 10, order: 2 },
          { name: "Platinum", minPoints: 5000, discountPercent: 15, order: 3 },
        ],
      },
    },
  });
}

export async function seedEnterpriseDemoData(tenantId: string) {
  await db.financialWallet.upsert({
    where: { tenantId },
    update: {},
    create: { tenantId, balance: 0, currency: "USD" },
  });

  const channels = ["EMAIL", "SMS", "WHATSAPP", "PUSH", "IN_APP"];
  await db.tenantNotificationChannelConfig.createMany({
    data: channels.map((channel) => ({
      tenantId,
      channel,
      isEnabled: channel === "EMAIL" || channel === "IN_APP",
    })),
    skipDuplicates: true,
  });

  const providers = [
    "STRIPE",
    "WHATSAPP",
    "GOOGLE_CALENDAR",
    "ZOOM",
    "META_PIXEL",
    "GOOGLE_ANALYTICS",
  ] as const;
  await db.tenantIntegration.createMany({
    data: providers.map((provider) => ({
      tenantId,
      provider,
      isEnabled: false,
    })),
    skipDuplicates: true,
  });

  await db.systemHealthSnapshot.create({
    data: {
      cpuPercent: 24,
      memoryPercent: 58,
      storagePercent: 42,
      activeTenants: 1,
    },
  }).catch(() => undefined);
}
