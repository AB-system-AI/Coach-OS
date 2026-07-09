import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";
import type { AutomationTrigger } from "@prisma/client";

export async function getAutomationRules(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.automationRule.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function triggerAutomation(
  tenantId: string,
  trigger: AutomationTrigger,
  context: Record<string, unknown>
) {
  const rules = await db.automationRule.findMany({
    where: { tenantId, trigger, isActive: true },
  });

  // Dispatch to email/notification services in production
  return rules.map((rule) => ({
    ruleId: rule.id,
    action: rule.action,
    template: rule.template,
    context,
  }));
}
