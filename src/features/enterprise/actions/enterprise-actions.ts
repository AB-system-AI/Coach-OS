"use server";

import { revalidatePath } from "next/cache";
import { requireTenantAccess } from "@/lib/auth/session";
import type {
  StaffRole,
  AttendanceMethod,
  PosPaymentMethod,
  AffiliateStatus,
  MembershipCardType,
  IntegrationProvider,
  CalendarSyncProvider,
  BackupType,
} from "@prisma/client";
import * as svc from "@/features/enterprise/services/enterprise-crud-service";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

function rp(slug: string) {
  revalidatePath(`/dashboard/enterprise/${slug}`);
}

// =================== STAFF ===================

export async function createStaffAction(
  tenantId: string,
  data: { name: string; email: string; phone?: string; role: StaffRole }
): Promise<ActionResult> {
  try {
    const staff = await svc.createStaff(tenantId, data);
    rp("staff");
    return { success: true, data: staff };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function updateStaffRoleAction(
  tenantId: string,
  staffId: string,
  role: StaffRole
): Promise<ActionResult> {
  try {
    const staff = await svc.updateStaffRole(tenantId, staffId, role);
    rp("staff");
    return { success: true, data: staff };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function toggleStaffActiveAction(
  tenantId: string,
  staffId: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    const staff = isActive
      ? await svc.reactivateStaff(tenantId, staffId)
      : await svc.deactivateStaff(tenantId, staffId);
    rp("staff");
    return { success: true, data: staff };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// =================== ATTENDANCE ===================

export async function checkInAction(
  tenantId: string,
  data: {
    clientId?: string;
    method: AttendanceMethod;
    location?: string;
    notes?: string;
    checkedById?: string;
  }
): Promise<ActionResult> {
  try {
    const record = await svc.checkIn(tenantId, data);
    rp("attendance");
    return { success: true, data: record };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function checkOutAction(
  tenantId: string,
  recordId: string
): Promise<ActionResult> {
  try {
    const record = await svc.checkOut(tenantId, recordId);
    rp("attendance");
    return { success: true, data: record };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// =================== POS ===================

export async function createPosTransactionAction(
  tenantId: string,
  data: {
    paymentMethod: PosPaymentMethod;
    cashierName?: string;
    items: { productName: string; quantity: number; unitPrice: number }[];
  }
): Promise<ActionResult> {
  try {
    const txn = await svc.createPosTransaction(tenantId, data);
    rp("pos");
    return { success: true, data: txn };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// =================== INVENTORY ===================

export async function createInventoryItemAction(
  tenantId: string,
  data: {
    name: string;
    sku?: string;
    category?: string;
    quantity: number;
    minStock: number;
    unitPrice?: number;
  }
): Promise<ActionResult> {
  try {
    const item = await svc.createInventoryItem(tenantId, data);
    rp("inventory");
    return { success: true, data: item };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function updateInventoryItemAction(
  tenantId: string,
  itemId: string,
  data: { quantity?: number; minStock?: number; unitPrice?: number; name?: string }
): Promise<ActionResult> {
  try {
    const item = await svc.updateInventoryItem(tenantId, itemId, data);
    rp("inventory");
    return { success: true, data: item };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteInventoryItemAction(
  tenantId: string,
  itemId: string
): Promise<ActionResult> {
  try {
    await svc.deleteInventoryItem(tenantId, itemId);
    rp("inventory");
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// =================== PAYROLL ===================

export async function createPayrollRecordAction(
  tenantId: string,
  data: {
    staffName: string;
    periodStart: Date;
    periodEnd: Date;
    baseSalary: number;
    commission: number;
    deductions: number;
    currency?: string;
  }
): Promise<ActionResult> {
  try {
    const record = await svc.createPayrollRecord(tenantId, data);
    rp("payroll");
    return { success: true, data: record };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function markPayrollPaidAction(
  tenantId: string,
  recordId: string
): Promise<ActionResult> {
  try {
    const record = await svc.markPayrollPaid(tenantId, recordId);
    rp("payroll");
    return { success: true, data: record };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// =================== AFFILIATE ===================

export async function createAffiliateAction(
  tenantId: string,
  data: {
    affiliateCode: string;
    referrerName?: string;
    referrerEmail?: string;
    commissionRate: number;
  }
): Promise<ActionResult> {
  try {
    const aff = await svc.createAffiliate(tenantId, data);
    rp("affiliate");
    return { success: true, data: aff };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function updateAffiliateStatusAction(
  tenantId: string,
  id: string,
  status: AffiliateStatus
): Promise<ActionResult> {
  try {
    const aff = await svc.updateAffiliateStatus(tenantId, id, status);
    rp("affiliate");
    return { success: true, data: aff };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteAffiliateAction(
  tenantId: string,
  id: string
): Promise<ActionResult> {
  try {
    await svc.deleteAffiliate(tenantId, id);
    rp("affiliate");
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// =================== MEMBERSHIP CARDS ===================

export async function issueMembershipCardAction(
  tenantId: string,
  data: {
    cardNumber: string;
    cardType: MembershipCardType;
    clientId?: string;
    expiresAt?: Date;
  }
): Promise<ActionResult> {
  try {
    const card = await svc.issueMembershipCard(tenantId, data);
    rp("membership-cards");
    return { success: true, data: card };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function revokeMembershipCardAction(
  tenantId: string,
  cardId: string
): Promise<ActionResult> {
  try {
    const card = await svc.revokeMembershipCard(tenantId, cardId);
    rp("membership-cards");
    return { success: true, data: card };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// =================== FINANCE ===================

export async function createExpenseAction(
  tenantId: string,
  data: {
    category: string;
    amount: number;
    currency?: string;
    description?: string;
    expenseDate?: Date;
  }
): Promise<ActionResult> {
  try {
    const expense = await svc.createExpense(tenantId, data);
    rp("finance");
    return { success: true, data: expense };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteExpenseAction(
  tenantId: string,
  id: string
): Promise<ActionResult> {
  try {
    await svc.deleteExpense(tenantId, id);
    rp("finance");
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// =================== BACKUP ===================

export async function createBackupAction(
  tenantId: string,
  type: BackupType = "FULL"
): Promise<ActionResult> {
  try {
    const backup = await svc.createBackup(tenantId, type);
    rp("backup");
    return { success: true, data: backup };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// =================== NOTIFICATIONS ===================

export async function upsertNotificationChannelAction(
  tenantId: string,
  channel: string,
  isEnabled: boolean,
  config: Record<string, unknown> = {}
): Promise<ActionResult> {
  try {
    const ch = await svc.upsertNotificationChannel(tenantId, channel, isEnabled, config);
    rp("notifications");
    return { success: true, data: ch };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// =================== HELP CENTER ===================

export async function createKnowledgeArticleAction(
  tenantId: string,
  data: { title: string; content: string; category?: string; isPublished?: boolean }
): Promise<ActionResult> {
  try {
    const article = await svc.createKnowledgeArticle(tenantId, data);
    rp("help");
    return { success: true, data: article };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function updateKnowledgeArticleAction(
  tenantId: string,
  id: string,
  data: { title?: string; content?: string; category?: string; isPublished?: boolean }
): Promise<ActionResult> {
  try {
    const article = await svc.updateKnowledgeArticle(tenantId, id, data);
    rp("help");
    return { success: true, data: article };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteKnowledgeArticleAction(
  tenantId: string,
  id: string
): Promise<ActionResult> {
  try {
    await svc.deleteKnowledgeArticle(tenantId, id);
    rp("help");
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// =================== INTEGRATIONS ===================

export async function upsertIntegrationAction(
  tenantId: string,
  provider: IntegrationProvider,
  isEnabled: boolean,
  config: Record<string, unknown> = {}
): Promise<ActionResult> {
  try {
    const integration = await svc.upsertIntegration(tenantId, provider, isEnabled, config);
    rp("integrations");
    return { success: true, data: integration };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// =================== FORMS ===================

export async function createFormAction(
  tenantId: string,
  data: { name: string; description?: string; isPublished?: boolean }
): Promise<ActionResult> {
  try {
    const form = await svc.createForm(tenantId, data);
    rp("forms");
    return { success: true, data: form };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteFormAction(
  tenantId: string,
  formId: string
): Promise<ActionResult> {
  try {
    await svc.deleteForm(tenantId, formId);
    rp("forms");
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// =================== MULTI-BRAND ===================

export async function createBrandAction(
  tenantId: string,
  data: { name: string; slug?: string; logoUrl?: string; primaryColor?: string }
): Promise<ActionResult> {
  try {
    const brand = await svc.createBrand(tenantId, data);
    rp("multi-brand");
    return { success: true, data: brand };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function updateBrandAction(
  tenantId: string,
  brandId: string,
  data: { name?: string; logoUrl?: string; primaryColor?: string }
): Promise<ActionResult> {
  try {
    const brand = await svc.updateBrand(tenantId, brandId, data);
    rp("multi-brand");
    return { success: true, data: brand };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteBrandAction(
  tenantId: string,
  brandId: string
): Promise<ActionResult> {
  try {
    await svc.deleteBrand(tenantId, brandId);
    rp("multi-brand");
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// =================== FRANCHISE ===================

export async function createFranchiseLocationAction(
  tenantId: string,
  data: {
    name: string;
    address?: string;
    city?: string;
    country?: string;
    phone?: string;
    managerName?: string;
  }
): Promise<ActionResult> {
  try {
    const loc = await svc.createFranchiseLocation(tenantId, data);
    rp("franchise");
    return { success: true, data: loc };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function updateFranchiseLocationAction(
  tenantId: string,
  locationId: string,
  data: { name?: string; isActive?: boolean; managerName?: string }
): Promise<ActionResult> {
  try {
    const loc = await svc.updateFranchiseLocation(tenantId, locationId, data);
    rp("franchise");
    return { success: true, data: loc };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteFranchiseLocationAction(
  tenantId: string,
  locationId: string
): Promise<ActionResult> {
  try {
    await svc.deleteFranchiseLocation(tenantId, locationId);
    rp("franchise");
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// =================== GAMIFICATION ===================

export async function createBadgeAction(
  tenantId: string,
  data: { name: string; description?: string; iconUrl?: string; xpRequired: number }
): Promise<ActionResult> {
  try {
    const badge = await svc.createBadge(tenantId, data);
    rp("gamification");
    return { success: true, data: badge };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteBadgeAction(
  tenantId: string,
  badgeId: string
): Promise<ActionResult> {
  try {
    await svc.deleteBadge(tenantId, badgeId);
    rp("gamification");
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function createAchievementAction(
  tenantId: string,
  data: { name: string; description?: string; xpReward: number }
): Promise<ActionResult> {
  try {
    const ach = await svc.createAchievement(tenantId, data);
    rp("gamification");
    return { success: true, data: ach };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteAchievementAction(
  tenantId: string,
  achievementId: string
): Promise<ActionResult> {
  try {
    await svc.deleteAchievement(tenantId, achievementId);
    rp("gamification");
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// =================== EMAIL BUILDER ===================

export async function createEmailTemplateAction(
  tenantId: string,
  data: { name: string; subject: string; htmlContent: string }
): Promise<ActionResult> {
  try {
    const tmpl = await svc.createEmailTemplate(tenantId, data);
    rp("email-builder");
    return { success: true, data: tmpl };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function updateEmailTemplateAction(
  tenantId: string,
  id: string,
  data: { name?: string; subject?: string; htmlContent?: string; isDefault?: boolean }
): Promise<ActionResult> {
  try {
    const tmpl = await svc.updateEmailTemplate(tenantId, id, data);
    rp("email-builder");
    return { success: true, data: tmpl };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteEmailTemplateAction(
  tenantId: string,
  id: string
): Promise<ActionResult> {
  try {
    await svc.deleteEmailTemplate(tenantId, id);
    rp("email-builder");
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// =================== INVOICE DESIGNER ===================

export async function createInvoiceTemplateAction(
  tenantId: string,
  data: { name: string; logoUrl?: string; showQr?: boolean; taxRate?: number }
): Promise<ActionResult> {
  try {
    const tmpl = await svc.createInvoiceTemplate(tenantId, data);
    rp("invoice-designer");
    return { success: true, data: tmpl };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function updateInvoiceTemplateAction(
  tenantId: string,
  id: string,
  data: { name?: string; logoUrl?: string; showQr?: boolean; taxRate?: number; isDefault?: boolean }
): Promise<ActionResult> {
  try {
    const tmpl = await svc.updateInvoiceTemplate(tenantId, id, data);
    rp("invoice-designer");
    return { success: true, data: tmpl };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteInvoiceTemplateAction(
  tenantId: string,
  id: string
): Promise<ActionResult> {
  try {
    await svc.deleteInvoiceTemplate(tenantId, id);
    rp("invoice-designer");
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// =================== THEME BUILDER ===================

export async function createThemeTemplateAction(
  tenantId: string,
  data: { name: string }
): Promise<ActionResult> {
  try {
    const tmpl = await svc.createThemeTemplate(tenantId, data);
    rp("theme-builder");
    return { success: true, data: tmpl };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function applyThemeAction(
  tenantId: string,
  themeId: string
): Promise<ActionResult> {
  try {
    const tmpl = await svc.applyTheme(tenantId, themeId);
    rp("theme-builder");
    return { success: true, data: tmpl };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteThemeTemplateAction(
  tenantId: string,
  id: string
): Promise<ActionResult> {
  try {
    await svc.deleteThemeTemplate(tenantId, id);
    rp("theme-builder");
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// =================== LANDING BUILDER ===================

export async function createLandingPageAction(
  tenantId: string,
  data: { title: string; seoTitle?: string; seoDescription?: string }
): Promise<ActionResult> {
  try {
    const page = await svc.createLandingPage(tenantId, data);
    rp("landing-builder");
    return { success: true, data: page };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function updateLandingPageAction(
  tenantId: string,
  id: string,
  data: { title?: string; status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" }
): Promise<ActionResult> {
  try {
    const page = await svc.updateLandingPage(tenantId, id, data);
    rp("landing-builder");
    return { success: true, data: page };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteLandingPageAction(
  tenantId: string,
  id: string
): Promise<ActionResult> {
  try {
    await svc.deleteLandingPage(tenantId, id);
    rp("landing-builder");
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// =================== VOICE NOTES ===================

export async function createVoiceNoteAction(
  tenantId: string,
  userId: string,
  data: { title?: string; audioUrl?: string; durationSec?: number }
): Promise<ActionResult> {
  try {
    const note = await svc.createVoiceNote(tenantId, userId, data);
    rp("voice-notes");
    return { success: true, data: note };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteVoiceNoteAction(
  tenantId: string,
  id: string
): Promise<ActionResult> {
  try {
    await svc.deleteVoiceNote(tenantId, id);
    rp("voice-notes");
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// =================== SMART CALENDAR ===================

export async function upsertCalendarSyncAction(
  tenantId: string,
  provider: CalendarSyncProvider
): Promise<ActionResult> {
  try {
    const conn = await svc.upsertCalendarSyncConnection(tenantId, provider);
    rp("smart-calendar");
    return { success: true, data: conn };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function disconnectCalendarSyncAction(
  tenantId: string,
  id: string
): Promise<ActionResult> {
  try {
    const conn = await svc.disconnectCalendarSync(tenantId, id);
    rp("smart-calendar");
    return { success: true, data: conn };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function createCalendarEventAction(
  tenantId: string,
  data: {
    title: string;
    description?: string;
    startAt: Date;
    endAt: Date;
    location?: string;
    color?: string;
    allDay?: boolean;
  }
): Promise<ActionResult> {
  try {
    const event = await svc.createCalendarEvent(tenantId, data);
    rp("smart-calendar");
    return { success: true, data: event };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteCalendarEventAction(
  tenantId: string,
  id: string
): Promise<ActionResult> {
  try {
    await svc.deleteCalendarEvent(tenantId, id);
    rp("smart-calendar");
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// =================== AUTOMATION BUILDER ===================

export async function createWorkflowAction(
  tenantId: string,
  data: { name: string; description?: string; trigger: string }
): Promise<ActionResult> {
  try {
    const wf = await svc.createWorkflow(tenantId, data);
    rp("automation-builder");
    return { success: true, data: wf };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function toggleWorkflowAction(
  tenantId: string,
  workflowId: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    const wf = await svc.toggleWorkflow(tenantId, workflowId, isActive);
    rp("automation-builder");
    return { success: true, data: wf };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteWorkflowAction(
  tenantId: string,
  workflowId: string
): Promise<ActionResult> {
  try {
    await svc.deleteWorkflow(tenantId, workflowId);
    rp("automation-builder");
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// Needed by server components to fetch data server-side
export async function getEnterpriseDataForModule(
  tenantId: string,
  slug: string
) {
  await requireTenantAccess(tenantId);
  switch (slug) {
    case "staff":
      return svc.listStaff(tenantId);
    case "attendance":
      return svc.listAttendance(tenantId);
    case "pos":
      return svc.listPosTransactions(tenantId);
    case "inventory":
      return svc.listInventory(tenantId);
    case "payroll":
      return svc.listPayroll(tenantId);
    case "affiliate":
      return svc.listAffiliates(tenantId);
    case "membership-cards":
      return svc.listMembershipCards(tenantId);
    case "backup":
      return svc.listBackups(tenantId);
    case "notifications":
      return svc.listNotificationChannels(tenantId);
    case "help":
      return svc.listKnowledgeArticles(tenantId);
    case "integrations":
      return svc.listIntegrations(tenantId);
    case "forms":
      return svc.listForms(tenantId);
    case "multi-brand":
      return svc.listBrands(tenantId);
    case "franchise":
      return svc.listFranchiseLocations(tenantId);
    case "audit":
      return svc.listAuditLogs(tenantId);
    case "email-builder":
      return svc.listEmailTemplates(tenantId);
    case "invoice-designer":
      return svc.listInvoiceTemplates(tenantId);
    case "theme-builder":
      return svc.listThemeTemplates(tenantId);
    case "landing-builder":
      return svc.listLandingPages(tenantId);
    case "voice-notes":
      return svc.listVoiceNotes(tenantId);
    case "smart-calendar":
      return Promise.all([
        svc.listCalendarSyncConnections(tenantId),
        svc.listCalendarEvents(tenantId),
      ]);
    case "automation-builder":
      return svc.listWorkflows(tenantId);
    case "gamification":
      return Promise.all([
        svc.listBadges(tenantId),
        svc.listAchievements(tenantId),
      ]);
    case "finance":
      return Promise.all([
        svc.getWallet(tenantId),
        svc.listWalletTransactions(tenantId),
        svc.listExpenses(tenantId),
      ]);
    case "security":
      return svc.getSecurityInfo(tenantId);
    default:
      return null;
  }
}
