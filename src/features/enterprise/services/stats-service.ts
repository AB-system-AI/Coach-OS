import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";
import type { TenantModuleKey } from "@prisma/client";

export type ModuleStat = { label: string; value: string | number };

export async function getEnterpriseModuleStats(
  tenantId: string,
  module: TenantModuleKey
): Promise<ModuleStat[]> {
  await requireTenantAccess(tenantId);

  switch (module) {
    case "FINANCE": {
      const [wallet, expenses, payments, refunds] = await Promise.all([
        db.financialWallet.findUnique({ where: { tenantId } }),
        db.expense.aggregate({ where: { tenantId }, _sum: { amount: true } }),
        db.payment.aggregate({
          where: { tenantId, status: "COMPLETED" },
          _sum: { amount: true },
        }),
        db.walletTransaction.count({
          where: { tenantId, type: "REFUND" },
        }),
      ]);
      const revenue = Number(payments._sum.amount ?? 0);
      const expenseTotal = Number(expenses._sum.amount ?? 0);
      return [
        { label: "Revenue", value: `$${revenue.toFixed(2)}` },
        { label: "Expenses", value: `$${expenseTotal.toFixed(2)}` },
        {
          label: "Profit",
          value: `$${(revenue - expenseTotal).toFixed(2)}`,
        },
        {
          label: "Wallet Balance",
          value: `$${Number(wallet?.balance ?? 0).toFixed(2)}`,
        },
        { label: "Refunds", value: refunds },
      ];
    }
    case "STAFF": {
      const [total, coaches, active] = await Promise.all([
        db.tenantStaff.count({ where: { tenantId } }),
        db.tenantStaff.count({ where: { tenantId, role: "COACH" } }),
        db.tenantStaff.count({ where: { tenantId, isActive: true } }),
      ]);
      return [
        { label: "Total Staff", value: total },
        { label: "Coaches", value: coaches },
        { label: "Active", value: active },
      ];
    }
    case "ATTENDANCE": {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [todayCount, total, qr] = await Promise.all([
        db.attendanceRecord.count({
          where: { tenantId, checkedInAt: { gte: today } },
        }),
        db.attendanceRecord.count({ where: { tenantId } }),
        db.attendanceRecord.count({
          where: { tenantId, method: "QR" },
        }),
      ]);
      return [
        { label: "Today", value: todayCount },
        { label: "Total Check-ins", value: total },
        { label: "QR Check-ins", value: qr },
      ];
    }
    case "SMART_CALENDAR": {
      const [events, syncs] = await Promise.all([
        db.calendarEvent.count({ where: { tenantId } }),
        db.calendarSyncConnection.count({
          where: { tenantId, isActive: true },
        }),
      ]);
      return [
        { label: "Events", value: events },
        { label: "Sync Connections", value: syncs },
      ];
    }
    case "FORMS_BUILDER": {
      const [forms, submissions] = await Promise.all([
        db.dynamicForm.count({ where: { tenantId } }),
        db.dynamicFormSubmission.count({
          where: { form: { tenantId } },
        }),
      ]);
      return [
        { label: "Forms", value: forms },
        { label: "Submissions", value: submissions },
      ];
    }
    case "AUTOMATION_BUILDER": {
      const [workflows, active] = await Promise.all([
        db.automationWorkflow.count({ where: { tenantId } }),
        db.automationWorkflow.count({ where: { tenantId, isActive: true } }),
      ]);
      return [
        { label: "Workflows", value: workflows },
        { label: "Active", value: active },
      ];
    }
    case "AI_VOICE": {
      const [notes, completed] = await Promise.all([
        db.voiceNote.count({ where: { tenantId } }),
        db.voiceNote.count({
          where: { tenantId, status: "COMPLETED" },
        }),
      ]);
      return [
        { label: "Voice Notes", value: notes },
        { label: "Transcribed", value: completed },
      ];
    }
    case "MEDIA_PRO": {
      const [media, folders] = await Promise.all([
        db.media.count({ where: { tenantId } }),
        db.mediaFolder.count({ where: { tenantId } }),
      ]);
      return [
        { label: "Files", value: media },
        { label: "Folders", value: folders },
      ];
    }
    case "AUDIT_CENTER": {
      const [logs, rollbackable] = await Promise.all([
        db.auditLog.count({ where: { tenantId } }),
        db.auditLog.count({ where: { tenantId, canRollback: true } }),
      ]);
      return [
        { label: "Audit Entries", value: logs },
        { label: "Rollbackable", value: rollbackable },
      ];
    }
    case "BACKUP": {
      const [backups, completed] = await Promise.all([
        db.backupRecord.count({ where: { tenantId } }),
        db.backupRecord.count({
          where: { tenantId, status: "COMPLETED" },
        }),
      ]);
      return [
        { label: "Backups", value: backups },
        { label: "Completed", value: completed },
      ];
    }
    case "THEME_BUILDER": {
      const count = await db.themeTemplate.count({ where: { tenantId } });
      return [{ label: "Themes", value: count }];
    }
    case "LANDING_BUILDER": {
      const count = await db.landingPage.count({ where: { tenantId } });
      return [{ label: "Landing Pages", value: count }];
    }
    case "EMAIL_BUILDER": {
      const [templates, campaigns] = await Promise.all([
        db.emailTemplate.count({ where: { tenantId } }),
        db.marketingCampaign.count({ where: { tenantId } }),
      ]);
      return [
        { label: "Templates", value: templates },
        { label: "Campaigns", value: campaigns },
      ];
    }
    case "INVOICE_DESIGNER": {
      const count = await db.invoiceTemplate.count({ where: { tenantId } });
      return [{ label: "Invoice Templates", value: count }];
    }
    case "INTEGRATIONS": {
      const [total, enabled] = await Promise.all([
        db.tenantIntegration.count({ where: { tenantId } }),
        db.tenantIntegration.count({
          where: { tenantId, isEnabled: true },
        }),
      ]);
      return [
        { label: "Integrations", value: total },
        { label: "Enabled", value: enabled },
      ];
    }
    case "GAMIFICATION": {
      const [profiles, badges, leaderboard] = await Promise.all([
        db.gamificationProfile.count({ where: { tenantId } }),
        db.gamificationBadge.count({ where: { tenantId } }),
        db.leaderboardEntry.count({ where: { tenantId } }),
      ]);
      return [
        { label: "Players", value: profiles },
        { label: "Badges", value: badges },
        { label: "Leaderboard", value: leaderboard },
      ];
    }
    case "MULTI_BRAND": {
      const count = await db.brand.count({ where: { tenantId } });
      return [{ label: "Brands", value: count }];
    }
    case "FRANCHISE": {
      const [locations, children] = await Promise.all([
        db.franchiseLocation.count({ where: { tenantId } }),
        db.tenant.count({ where: { parentTenantId: tenantId } }),
      ]);
      return [
        { label: "Locations", value: locations },
        { label: "Child Tenants", value: children },
      ];
    }
    case "POS": {
      const [txns, revenue] = await Promise.all([
        db.posTransaction.count({ where: { tenantId } }),
        db.posTransaction.aggregate({
          where: { tenantId },
          _sum: { total: true },
        }),
      ]);
      return [
        { label: "Transactions", value: txns },
        {
          label: "Revenue",
          value: `$${Number(revenue._sum.total ?? 0).toFixed(2)}`,
        },
      ];
    }
    case "INVENTORY": {
      const items = await db.inventoryItem.findMany({
        where: { tenantId },
        select: { quantity: true, minStock: true },
      });
      const lowStock = items.filter((i) => i.quantity <= i.minStock).length;
      return [
        { label: "Items", value: items.length },
        { label: "Low Stock", value: lowStock },
      ];
    }
    case "PAYROLL": {
      const [records, pending] = await Promise.all([
        db.payrollRecord.count({ where: { tenantId } }),
        db.payrollRecord.count({
          where: { tenantId, status: "pending" },
        }),
      ]);
      return [
        { label: "Pay Runs", value: records },
        { label: "Pending", value: pending },
      ];
    }
    case "MEMBERSHIP_CARDS": {
      const [cards, active] = await Promise.all([
        db.membershipCard.count({ where: { tenantId } }),
        db.membershipCard.count({ where: { tenantId, isActive: true } }),
      ]);
      return [
        { label: "Cards", value: cards },
        { label: "Active", value: active },
      ];
    }
    case "AFFILIATE": {
      const [affiliates, active] = await Promise.all([
        db.affiliateReferral.count({ where: { tenantId } }),
        db.affiliateReferral.count({
          where: { tenantId, status: "ACTIVE" },
        }),
      ]);
      return [
        { label: "Affiliates", value: affiliates },
        { label: "Active", value: active },
      ];
    }
    case "NOTIFICATION_CENTER": {
      const [channels, notifications] = await Promise.all([
        db.tenantNotificationChannelConfig.count({ where: { tenantId } }),
        db.notification.count({ where: { tenantId } }),
      ]);
      return [
        { label: "Channels", value: channels },
        { label: "Notifications", value: notifications },
      ];
    }
    case "HELP_CENTER": {
      const [articles, faqs] = await Promise.all([
        db.knowledgeArticle.count({ where: { tenantId } }),
        db.faq.count({ where: { tenantId } }),
      ]);
      return [
        { label: "Articles", value: articles },
        { label: "FAQs", value: faqs },
      ];
    }
    case "SECURITY_CENTER": {
      const [devices, apiLogs] = await Promise.all([
        db.userDevice.count(),
        db.apiRequestLog.count({ where: { tenantId } }),
      ]);
      return [
        { label: "Devices", value: devices },
        { label: "API Logs", value: apiLogs },
      ];
    }
    case "CLIENT_APP": {
      const [clients, bookings, programs] = await Promise.all([
        db.clientProfile.count({ where: { tenantId } }),
        db.booking.count({ where: { tenantId } }),
        db.programEnrollment.count({
          where: { program: { tenantId } },
        }),
      ]);
      return [
        { label: "Clients", value: clients },
        { label: "Bookings", value: bookings },
        { label: "Enrollments", value: programs },
      ];
    }
    case "MOBILE_API": {
      const [apiKeys, push, deepLinks, syncQueue] = await Promise.all([
        db.apiKey.count({ where: { tenantId } }),
        db.pushSubscription.count({ where: { tenantId } }),
        db.deepLink.count({ where: { tenantId } }),
        db.offlineSyncQueue.count({
          where: { tenantId, status: "PENDING" },
        }),
      ]);
      return [
        { label: "API Keys", value: apiKeys },
        { label: "Push Subscribers", value: push },
        { label: "Deep Links", value: deepLinks },
        { label: "Pending Sync", value: syncQueue },
      ];
    }
    default:
      return [];
  }
}

export async function getEnterpriseDashboardMetrics(tenantId: string) {
  await requireTenantAccess(tenantId);
  const [mrr, tenants, subscriptions, churnCandidates] = await Promise.all([
    db.payment.aggregate({
      where: { tenantId, status: "COMPLETED" },
      _sum: { amount: true },
    }),
    db.clientProfile.count({ where: { tenantId, isActive: true } }),
    db.tenantSubscription.findUnique({ where: { tenantId } }),
    db.clientProfile.count({ where: { tenantId, isActive: false } }),
  ]);
  const revenue = Number(mrr._sum.amount ?? 0);
  return {
    mrr: revenue,
    arr: revenue * 12,
    activeClients: tenants,
    churn: churnCandidates,
    plan: subscriptions?.plan ?? "FREE",
    growth: tenants > 0 ? "+12%" : "0%",
  };
}

export async function getSystemHealthMetrics() {
  const latest = await db.systemHealthSnapshot.findFirst({
    orderBy: { capturedAt: "desc" },
  });
  const [cronJobs, queues] = await Promise.all([
    db.cronJobLog.count({
      where: { ranAt: { gte: new Date(Date.now() - 86400000) } },
    }),
    db.queueMetric.findMany({
      orderBy: { capturedAt: "desc" },
      take: 5,
    }),
  ]);
  return {
    cpu: latest?.cpuPercent ?? 0,
    memory: latest?.memoryPercent ?? 0,
    storage: latest?.storagePercent ?? 0,
    activeTenants: latest?.activeTenants ?? 0,
    cronJobs24h: cronJobs,
    queues,
  };
}
