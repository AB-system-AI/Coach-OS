import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email";
import { toJsonValue } from "@/lib/prisma-json";
import type { AutomationTrigger, AutomationAction } from "@prisma/client";

export async function getAutomationRules(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.automationRule.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAutomationRule(
  tenantId: string,
  data: {
    name: string;
    trigger: AutomationTrigger;
    action: AutomationAction;
    template?: string;
    config?: Record<string, unknown>;
  }
) {
  await requireTenantAccess(tenantId);
  return db.automationRule.create({
    data: {
      tenantId,
      name: data.name,
      trigger: data.trigger,
      action: data.action,
      template: data.template,
      config: toJsonValue(data.config ?? {}),
      isActive: true,
    },
  });
}

export async function toggleAutomationRule(tenantId: string, ruleId: string, isActive: boolean) {
  await requireTenantAccess(tenantId);
  return db.automationRule.update({
    where: { id: ruleId, tenantId },
    data: { isActive },
  });
}

export async function deleteAutomationRule(tenantId: string, ruleId: string) {
  await requireTenantAccess(tenantId);
  return db.automationRule.delete({ where: { id: ruleId, tenantId } });
}

export async function triggerAutomation(
  tenantId: string,
  trigger: AutomationTrigger,
  context: Record<string, unknown>
) {
  const rules = await db.automationRule.findMany({
    where: { tenantId, trigger, isActive: true },
  });

  const results: { ruleId: string; action: string; success: boolean; error?: string }[] = [];

  for (const rule of rules) {
    try {
      const config = (rule.config as Record<string, unknown>) ?? {};
      await executeAutomationAction(rule.action, context, rule.template ?? null, config);
      results.push({ ruleId: rule.id, action: rule.action, success: true });
    } catch (err) {
      results.push({
        ruleId: rule.id,
        action: rule.action,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}

async function executeAutomationAction(
  action: AutomationAction,
  context: Record<string, unknown>,
  template: string | null,
  config: Record<string, unknown>
) {
  switch (action) {
    case "SEND_EMAIL": {
      const toEmail = (context.email ?? context.userEmail) as string | undefined;
      if (!toEmail) throw new Error("No email in context");

      const subject = (config.subject as string) ?? (template ? `Notification: ${template}` : "CoachOS Notification");
      const html = buildEmailHtml(template, context, config);

      await sendEmail({ to: toEmail, subject, html });
      break;
    }

    case "SEND_NOTIFICATION": {
      const userId = context.userId as string | undefined;
      const tid = context.tenantId as string | undefined;
      if (!userId || !tid) throw new Error("No userId/tenantId in context");

      await db.notification.create({
        data: {
          tenantId: tid,
          userId,
          type: "SYSTEM",
          channel: "IN_APP",
          title: (config.title as string) ?? "Notification",
          message: (config.message as string) ?? (template ?? "You have a new notification."),
        },
      });
      break;
    }

    case "SEND_WHATSAPP": {
      const phone = context.phone as string | undefined;
      if (!phone) {
        console.log("[automation] WhatsApp action skipped: no phone in context");
        break;
      }
      const { sendWhatsApp } = await import("@/lib/whatsapp");
      await sendWhatsApp({
        to: phone,
        body: (config.message as string) ?? template ?? "You have a message from your coach.",
      });
      break;
    }

    case "CREATE_TASK": {
      const tid = context.tenantId as string | undefined;
      const leadId = context.leadId as string | undefined;
      if (!tid || !leadId) break;

      const lead = await db.crmLead.findUnique({ where: { id: leadId, tenantId: tid } });
      if (lead) {
        await db.crmTask.create({
          data: {
            leadId,
            title: (config.title as string) ?? template ?? "Follow up",
            dueDate: config.daysOffset
              ? new Date(Date.now() + Number(config.daysOffset) * 86400000)
              : undefined,
          },
        });
      }
      break;
    }

    case "AWARD_POINTS": {
      const userId = context.userId as string | undefined;
      const tid = context.tenantId as string | undefined;
      if (!userId || !tid) break;

      const program = await db.loyaltyProgram.findUnique({ where: { tenantId: tid } });
      if (program) {
        await db.loyaltyPointEntry.create({
          data: {
            programId: program.id,
            userId,
            points: Number(config.points ?? 10),
            reason: (config.reason as string) ?? template ?? "Automation reward",
          },
        });
      }
      break;
    }

    default:
      console.log(`[automation] Unhandled action: ${action}`);
  }
}

function buildEmailHtml(
  template: string | null,
  context: Record<string, unknown>,
  config: Record<string, unknown>
): string {
  const body = (config.body as string) ?? template ?? "You have a notification.";
  const name = (context.name as string) ?? (context.userName as string) ?? "there";

  const interpolated = body.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    return String(context[key] ?? `{{${key}}}`);
  });

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <p>Hi ${name},</p>
      <p>${interpolated}</p>
      <p style="color: #888; font-size: 12px; margin-top: 32px;">Sent by CoachOS</p>
    </div>
  `;
}
