import type { ReactNode } from "react";
import { getCurrentTenant, requireAuth } from "@/lib/auth/session";
import { getEnterprisePage, getEnterpriseModuleStats } from "@/features/enterprise";
import { isModuleEnabled } from "@/features/modules";
import { ModuleOverview } from "@/components/layout/module-overview";
import { redirect, notFound } from "next/navigation";
import * as svc from "@/features/enterprise/services/enterprise-crud-service";
import { db } from "@/lib/db";

import { StaffModule } from "@/features/enterprise/components/staff-module";
import { AttendanceModule } from "@/features/enterprise/components/attendance-module";
import { PosModule } from "@/features/enterprise/components/pos-module";
import { InventoryModule } from "@/features/enterprise/components/inventory-module";
import { PayrollModule } from "@/features/enterprise/components/payroll-module";
import { AffiliateModule } from "@/features/enterprise/components/affiliate-module";
import { MembershipCardsModule } from "@/features/enterprise/components/membership-cards-module";
import { FinanceModule } from "@/features/enterprise/components/finance-module";
import { SecurityModule } from "@/features/enterprise/components/security-module";
import { BackupModule } from "@/features/enterprise/components/backup-module";
import { NotificationsModule } from "@/features/enterprise/components/notifications-module";
import { HelpModule } from "@/features/enterprise/components/help-module";
import { IntegrationsModule } from "@/features/enterprise/components/integrations-module";
import { FormsModule } from "@/features/enterprise/components/forms-module";
import { MultiBrandModule } from "@/features/enterprise/components/multi-brand-module";
import { FranchiseModule } from "@/features/enterprise/components/franchise-module";
import { GamificationModule } from "@/features/enterprise/components/gamification-module";
import { AuditModule } from "@/features/enterprise/components/audit-module";
import { EmailBuilderModule } from "@/features/enterprise/components/email-builder-module";
import { InvoiceDesignerModule } from "@/features/enterprise/components/invoice-designer-module";
import { ThemeBuilderModule } from "@/features/enterprise/components/theme-builder-module";
import { LandingBuilderModule } from "@/features/enterprise/components/landing-builder-module";
import { VoiceNotesModule } from "@/features/enterprise/components/voice-notes-module";
import { SmartCalendarModule } from "@/features/enterprise/components/smart-calendar-module";
import { AutomationBuilderModule } from "@/features/enterprise/components/automation-builder-module";
import { MobileApiModule } from "@/features/enterprise/components/mobile-api-module";
import { ClientAppModule } from "@/features/enterprise/components/client-app-module";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EnterpriseModulePage({ params }: Props) {
  const { slug } = await params;
  const page = getEnterprisePage(slug);
  if (!page) notFound();

  const [tenant, authSession] = await Promise.all([
    getCurrentTenant(),
    requireAuth(),
  ]);
  if (!tenant) redirect("/register");

  const enabled = await isModuleEnabled(tenant.id, page.module);
  if (!enabled) redirect("/dashboard");

  if (slug === "media-pro") redirect("/dashboard/media");

  const stats = await getEnterpriseModuleStats(tenant.id, page.module);
  const moduleContent = await renderModuleContent(
    slug,
    tenant.id,
    authSession.user.id
  );

  return (
    <div className="space-y-8">
      <ModuleOverview
        title={page.title}
        description={page.description}
        stats={stats}
      />
      {moduleContent}
    </div>
  );
}

async function renderModuleContent(
  slug: string,
  tenantId: string,
  userId: string
): Promise<ReactNode> {
  switch (slug) {
    case "staff":
      return (
        <StaffModule
          tenantId={tenantId}
          initialStaff={await svc.listStaff(tenantId)}
        />
      );

    case "attendance":
      return (
        <AttendanceModule
          tenantId={tenantId}
          initialRecords={await svc.listAttendance(tenantId)}
        />
      );

    case "pos": {
      const rawTx = await svc.listPosTransactions(tenantId);
      const transactions = rawTx.map((t) => ({
        ...t,
        total: Number(t.total),
        items: t.items.map((i) => ({
          ...i,
          unitPrice: Number(i.unitPrice),
          total: Number(i.total),
        })),
      }));
      return (
        <PosModule tenantId={tenantId} initialTransactions={transactions} />
      );
    }

    case "inventory": {
      const rawItems = await svc.listInventory(tenantId);
      const items = rawItems.map((i) => ({
        ...i,
        unitPrice: i.unitPrice != null ? Number(i.unitPrice) : null,
      }));
      return <InventoryModule tenantId={tenantId} initialItems={items} />;
    }

    case "payroll": {
      const rawRecords = await svc.listPayroll(tenantId);
      const records = rawRecords.map((r) => ({
        ...r,
        baseSalary: Number(r.baseSalary),
        commission: Number(r.commission),
        deductions: Number(r.deductions),
        netPay: Number(r.netPay),
      }));
      return <PayrollModule tenantId={tenantId} initialRecords={records} />;
    }

    case "affiliate": {
      const rawAffiliates = await svc.listAffiliates(tenantId);
      const affiliates = rawAffiliates.map((a) => ({
        ...a,
        commissionRate: Number(a.commissionRate),
        totalEarnings: Number(a.totalEarnings),
      }));
      return (
        <AffiliateModule tenantId={tenantId} initialAffiliates={affiliates} />
      );
    }

    case "membership-cards":
      return (
        <MembershipCardsModule
          tenantId={tenantId}
          initialCards={await svc.listMembershipCards(tenantId)}
        />
      );

    case "finance": {
      const [rawWallet, rawTransactions, rawExpenses] = await Promise.all([
        svc.getWallet(tenantId),
        svc.listWalletTransactions(tenantId),
        svc.listExpenses(tenantId),
      ]);
      const wallet = rawWallet
        ? {
            ...rawWallet,
            balance: Number(rawWallet.balance),
            pendingBalance: Number(rawWallet.pendingBalance),
          }
        : null;
      const transactions = rawTransactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
      }));
      const expenses = rawExpenses.map((e) => ({
        ...e,
        amount: Number(e.amount),
      }));
      return (
        <FinanceModule
          tenantId={tenantId}
          wallet={wallet}
          transactions={transactions}
          expenses={expenses}
        />
      );
    }

    case "security": {
      const { devices, loginHistory } = await svc.getSecurityInfo(tenantId);
      return (
        <SecurityModule devices={devices} loginHistory={loginHistory} />
      );
    }

    case "backup":
      return (
        <BackupModule
          tenantId={tenantId}
          initialBackups={await svc.listBackups(tenantId)}
        />
      );

    case "notifications":
      return (
        <NotificationsModule
          tenantId={tenantId}
          initialChannels={await svc.listNotificationChannels(tenantId)}
        />
      );

    case "help":
      return (
        <HelpModule
          tenantId={tenantId}
          initialArticles={await svc.listKnowledgeArticles(tenantId)}
        />
      );

    case "integrations":
      return (
        <IntegrationsModule
          tenantId={tenantId}
          initialIntegrations={await svc.listIntegrations(tenantId)}
        />
      );

    case "forms":
      return (
        <FormsModule
          tenantId={tenantId}
          initialForms={await svc.listForms(tenantId)}
        />
      );

    case "multi-brand":
      return (
        <MultiBrandModule
          tenantId={tenantId}
          initialBrands={await svc.listBrands(tenantId)}
        />
      );

    case "franchise":
      return (
        <FranchiseModule
          tenantId={tenantId}
          initialLocations={await svc.listFranchiseLocations(tenantId)}
        />
      );

    case "gamification": {
      const [badges, achievements] = await Promise.all([
        svc.listBadges(tenantId),
        svc.listAchievements(tenantId),
      ]);
      return (
        <GamificationModule
          tenantId={tenantId}
          initialBadges={badges}
          initialAchievements={achievements}
        />
      );
    }

    case "audit":
      return <AuditModule logs={await svc.listAuditLogs(tenantId)} />;

    case "email-builder":
      return (
        <EmailBuilderModule
          tenantId={tenantId}
          initialTemplates={await svc.listEmailTemplates(tenantId)}
        />
      );

    case "invoice-designer": {
      const rawTemplates = await svc.listInvoiceTemplates(tenantId);
      const templates = rawTemplates.map((t) => ({
        ...t,
        taxRate: t.taxRate != null ? Number(t.taxRate) : null,
      }));
      return (
        <InvoiceDesignerModule tenantId={tenantId} initialTemplates={templates} />
      );
    }

    case "theme-builder":
      return (
        <ThemeBuilderModule
          tenantId={tenantId}
          initialThemes={await svc.listThemeTemplates(tenantId)}
        />
      );

    case "landing-builder":
      return (
        <LandingBuilderModule
          tenantId={tenantId}
          initialPages={await svc.listLandingPages(tenantId)}
        />
      );

    case "voice-notes":
      return (
        <VoiceNotesModule
          tenantId={tenantId}
          userId={userId}
          initialNotes={await svc.listVoiceNotes(tenantId)}
        />
      );

    case "smart-calendar": {
      const [connections, events] = await Promise.all([
        svc.listCalendarSyncConnections(tenantId),
        svc.listCalendarEvents(tenantId),
      ]);
      return (
        <SmartCalendarModule
          tenantId={tenantId}
          initialConnections={connections}
          initialEvents={events}
        />
      );
    }

    case "automation-builder":
      return (
        <AutomationBuilderModule
          tenantId={tenantId}
          initialWorkflows={await svc.listWorkflows(tenantId)}
        />
      );

    case "mobile-api": {
      const [apiKeysCount, pushCount, deepLinksCount, pendingSyncCount] =
        await Promise.all([
          db.apiKey.count({ where: { tenantId } }),
          db.pushSubscription.count({ where: { tenantId } }),
          db.deepLink.count({ where: { tenantId } }),
          db.offlineSyncQueue.count({
            where: { tenantId, status: "PENDING" },
          }),
        ]);
      return (
        <MobileApiModule
          apiKeysCount={apiKeysCount}
          pushSubscribersCount={pushCount}
          deepLinksCount={deepLinksCount}
          pendingSyncCount={pendingSyncCount}
        />
      );
    }

    case "client-app": {
      const [clientsCount, bookingsCount, enrollmentsCount] = await Promise.all(
        [
          db.clientProfile.count({ where: { tenantId, isActive: true } }),
          db.booking.count({ where: { tenantId } }),
          db.programEnrollment.count({ where: { program: { tenantId } } }),
        ]
      );
      return (
        <ClientAppModule
          clientsCount={clientsCount}
          bookingsCount={bookingsCount}
          enrollmentsCount={enrollmentsCount}
        />
      );
    }

    default:
      return null;
  }
}
