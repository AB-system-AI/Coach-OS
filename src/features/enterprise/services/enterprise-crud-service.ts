import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";
import { toJsonValue } from "@/lib/prisma-json";
import type {
  StaffRole,
  AttendanceMethod,
  PosPaymentMethod,
  AffiliateStatus,
  MembershipCardType,
  IntegrationProvider,
  CalendarSyncProvider,
  BackupType,
  BackupStatus,
} from "@prisma/client";

// =================== STAFF ===================

export async function listStaff(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.tenantStaff.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createStaff(
  tenantId: string,
  data: { name: string; email: string; phone?: string; role: StaffRole }
) {
  await requireTenantAccess(tenantId);
  return db.tenantStaff.create({
    data: { tenantId, ...data, permissions: {} },
  });
}

export async function updateStaffRole(
  tenantId: string,
  staffId: string,
  role: StaffRole
) {
  await requireTenantAccess(tenantId);
  return db.tenantStaff.update({ where: { id: staffId, tenantId }, data: { role } });
}

export async function deactivateStaff(tenantId: string, staffId: string) {
  await requireTenantAccess(tenantId);
  return db.tenantStaff.update({
    where: { id: staffId, tenantId },
    data: { isActive: false },
  });
}

export async function reactivateStaff(tenantId: string, staffId: string) {
  await requireTenantAccess(tenantId);
  return db.tenantStaff.update({
    where: { id: staffId, tenantId },
    data: { isActive: true },
  });
}

// =================== ATTENDANCE ===================

export async function listAttendance(tenantId: string, limit = 100) {
  await requireTenantAccess(tenantId);
  return db.attendanceRecord.findMany({
    where: { tenantId },
    orderBy: { checkedInAt: "desc" },
    take: limit,
    include: {
      client: {
        include: { user: { select: { name: true } } },
      },
    },
  });
}

export async function checkIn(
  tenantId: string,
  data: {
    clientId?: string;
    method: AttendanceMethod;
    location?: string;
    notes?: string;
    checkedById?: string;
  }
) {
  await requireTenantAccess(tenantId);
  return db.attendanceRecord.create({
    data: { tenantId, ...data },
  });
}

export async function checkOut(tenantId: string, recordId: string) {
  await requireTenantAccess(tenantId);
  return db.attendanceRecord.update({
    where: { id: recordId, tenantId },
    data: { checkedOutAt: new Date() },
  });
}

// =================== POS ===================

export async function listPosTransactions(tenantId: string, limit = 50) {
  await requireTenantAccess(tenantId);
  return db.posTransaction.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { items: true },
  });
}

export async function createPosTransaction(
  tenantId: string,
  data: {
    paymentMethod: PosPaymentMethod;
    cashierName?: string;
    items: { productName: string; quantity: number; unitPrice: number }[];
  }
) {
  await requireTenantAccess(tenantId);
  const total = data.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  return db.posTransaction.create({
    data: {
      tenantId,
      total,
      paymentMethod: data.paymentMethod,
      cashierName: data.cashierName,
      items: {
        create: data.items.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
      },
    },
    include: { items: true },
  });
}

// =================== INVENTORY ===================

export async function listInventory(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.inventoryItem.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
  });
}

export async function createInventoryItem(
  tenantId: string,
  data: {
    name: string;
    sku?: string;
    category?: string;
    quantity: number;
    minStock: number;
    unitPrice?: number;
  }
) {
  await requireTenantAccess(tenantId);
  return db.inventoryItem.create({ data: { tenantId, ...data } });
}

export async function updateInventoryItem(
  tenantId: string,
  itemId: string,
  data: { quantity?: number; minStock?: number; unitPrice?: number; name?: string }
) {
  await requireTenantAccess(tenantId);
  return db.inventoryItem.update({ where: { id: itemId, tenantId }, data });
}

export async function deleteInventoryItem(tenantId: string, itemId: string) {
  await requireTenantAccess(tenantId);
  return db.inventoryItem.delete({ where: { id: itemId, tenantId } });
}

// =================== PAYROLL ===================

export async function listPayroll(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.payrollRecord.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPayrollRecord(
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
) {
  await requireTenantAccess(tenantId);
  const netPay = data.baseSalary + data.commission - data.deductions;
  return db.payrollRecord.create({
    data: {
      tenantId,
      staffName: data.staffName,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      baseSalary: data.baseSalary,
      commission: data.commission,
      deductions: data.deductions,
      netPay,
      currency: data.currency ?? "USD",
      status: "pending",
    },
  });
}

export async function markPayrollPaid(tenantId: string, recordId: string) {
  await requireTenantAccess(tenantId);
  return db.payrollRecord.update({
    where: { id: recordId, tenantId },
    data: { status: "paid", paidAt: new Date() },
  });
}

// =================== AFFILIATE ===================

export async function listAffiliates(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.affiliateReferral.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAffiliate(
  tenantId: string,
  data: {
    affiliateCode: string;
    referrerName?: string;
    referrerEmail?: string;
    commissionRate: number;
  }
) {
  await requireTenantAccess(tenantId);
  return db.affiliateReferral.create({
    data: { tenantId, ...data, status: "PENDING" as AffiliateStatus },
  });
}

export async function updateAffiliateStatus(
  tenantId: string,
  id: string,
  status: AffiliateStatus
) {
  await requireTenantAccess(tenantId);
  return db.affiliateReferral.update({ where: { id, tenantId }, data: { status } });
}

export async function deleteAffiliate(tenantId: string, id: string) {
  await requireTenantAccess(tenantId);
  return db.affiliateReferral.delete({ where: { id, tenantId } });
}

// =================== MEMBERSHIP CARDS ===================

export async function listMembershipCards(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.membershipCard.findMany({
    where: { tenantId },
    orderBy: { issuedAt: "desc" },
    include: {
      client: {
        include: { user: { select: { name: true } } },
      },
    },
  });
}

export async function issueMembershipCard(
  tenantId: string,
  data: {
    cardNumber: string;
    cardType: MembershipCardType;
    clientId?: string;
    expiresAt?: Date;
  }
) {
  await requireTenantAccess(tenantId);
  return db.membershipCard.create({
    data: {
      tenantId,
      cardNumber: data.cardNumber,
      cardType: data.cardType,
      clientId: data.clientId,
      expiresAt: data.expiresAt,
      qrPayload: data.cardType === "QR" ? data.cardNumber : undefined,
      barcodePayload: data.cardType === "BARCODE" ? data.cardNumber : undefined,
      nfcPayload: data.cardType === "NFC" ? data.cardNumber : undefined,
    },
  });
}

export async function revokeMembershipCard(tenantId: string, cardId: string) {
  await requireTenantAccess(tenantId);
  return db.membershipCard.update({
    where: { id: cardId, tenantId },
    data: { isActive: false },
  });
}

// =================== FINANCE ===================

export async function getWallet(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.financialWallet.findUnique({ where: { tenantId } });
}

export async function listWalletTransactions(tenantId: string, limit = 50) {
  await requireTenantAccess(tenantId);
  const wallet = await db.financialWallet.findUnique({
    where: { tenantId },
    select: { id: true },
  });
  if (!wallet) return [];
  return db.walletTransaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function listExpenses(tenantId: string, limit = 50) {
  await requireTenantAccess(tenantId);
  return db.expense.findMany({
    where: { tenantId },
    orderBy: { expenseDate: "desc" },
    take: limit,
  });
}

export async function createExpense(
  tenantId: string,
  data: {
    category: string;
    amount: number;
    currency?: string;
    description?: string;
    expenseDate?: Date;
  }
) {
  await requireTenantAccess(tenantId);
  return db.expense.create({
    data: {
      tenantId,
      category: data.category,
      amount: data.amount,
      currency: data.currency ?? "USD",
      description: data.description,
      expenseDate: data.expenseDate ?? new Date(),
    },
  });
}

export async function deleteExpense(tenantId: string, id: string) {
  await requireTenantAccess(tenantId);
  return db.expense.delete({ where: { id, tenantId } });
}

// =================== SECURITY (read) ===================

export async function getSecurityInfo(tenantId: string) {
  await requireTenantAccess(tenantId);
  const members = await db.tenantMember.findMany({
    where: { tenantId, isActive: true },
    select: { userId: true },
    take: 30,
  });
  const userIds = members.map((m) => m.userId);
  const [devices, loginHistory] = await Promise.all([
    db.userDevice.findMany({
      where: { userId: { in: userIds } },
      orderBy: { lastSeenAt: "desc" },
      take: 50,
    }),
    db.loginHistory.findMany({
      where: { userId: { in: userIds } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);
  return { devices, loginHistory };
}

// =================== BACKUP ===================

export async function listBackups(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.backupRecord.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createBackup(tenantId: string, type: BackupType = "FULL") {
  await requireTenantAccess(tenantId);
  return db.backupRecord.create({
    data: { tenantId, type, status: "PENDING" as BackupStatus },
  });
}

// =================== NOTIFICATIONS ===================

export async function listNotificationChannels(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.tenantNotificationChannelConfig.findMany({
    where: { tenantId },
    orderBy: { channel: "asc" },
  });
}

export async function upsertNotificationChannel(
  tenantId: string,
  channel: string,
  isEnabled: boolean,
  config: Record<string, unknown> = {}
) {
  await requireTenantAccess(tenantId);
  return db.tenantNotificationChannelConfig.upsert({
    where: { tenantId_channel: { tenantId, channel } },
    update: { isEnabled, config: toJsonValue(config) },
    create: { tenantId, channel, isEnabled, config: toJsonValue(config) },
  });
}

// =================== HELP CENTER ===================

export async function listKnowledgeArticles(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.knowledgeArticle.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createKnowledgeArticle(
  tenantId: string,
  data: { title: string; content: string; category?: string; isPublished?: boolean }
) {
  await requireTenantAccess(tenantId);
  const slug =
    data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60) +
    "-" +
    Date.now();
  return db.knowledgeArticle.create({
    data: {
      tenantId,
      title: data.title,
      slug,
      content: data.content,
      category: data.category,
      isPublished: data.isPublished ?? false,
    },
  });
}

export async function updateKnowledgeArticle(
  tenantId: string,
  id: string,
  data: { title?: string; content?: string; category?: string; isPublished?: boolean }
) {
  await requireTenantAccess(tenantId);
  return db.knowledgeArticle.update({ where: { id, tenantId }, data });
}

export async function deleteKnowledgeArticle(tenantId: string, id: string) {
  await requireTenantAccess(tenantId);
  return db.knowledgeArticle.delete({ where: { id, tenantId } });
}

// =================== INTEGRATIONS ===================

const ALL_PROVIDERS: IntegrationProvider[] = [
  "STRIPE",
  "PAYMOB",
  "WHATSAPP",
  "ZOOM",
  "GOOGLE_MEET",
  "GOOGLE_CALENDAR",
  "OUTLOOK",
  "GOOGLE_DRIVE",
  "DROPBOX",
  "ONEDRIVE",
  "META_PIXEL",
  "GOOGLE_ANALYTICS",
  "TIKTOK_PIXEL",
];

export async function listIntegrations(tenantId: string) {
  await requireTenantAccess(tenantId);
  const existing = await db.tenantIntegration.findMany({ where: { tenantId } });
  const existingMap = new Map(existing.map((i) => [i.provider, i]));
  return ALL_PROVIDERS.map((provider) => {
    const existing = existingMap.get(provider);
    if (existing) return existing;
    return {
      id: null,
      tenantId,
      provider,
      isEnabled: false,
      config: {},
      credentials: {},
      lastSyncAt: null,
      createdAt: null,
      updatedAt: null,
    };
  });
}

export async function upsertIntegration(
  tenantId: string,
  provider: IntegrationProvider,
  isEnabled: boolean,
  config: Record<string, unknown> = {}
) {
  await requireTenantAccess(tenantId);
  return db.tenantIntegration.upsert({
    where: { tenantId_provider: { tenantId, provider } },
    update: { isEnabled, config: toJsonValue(config) },
    create: { tenantId, provider, isEnabled, config: toJsonValue(config) },
  });
}

// =================== FORMS BUILDER ===================

export async function listForms(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.dynamicForm.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });
}

export async function createForm(
  tenantId: string,
  data: { name: string; description?: string; isPublished?: boolean }
) {
  await requireTenantAccess(tenantId);
  const slug =
    data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60) +
    "-" +
    Date.now();
  return db.dynamicForm.create({
    data: {
      tenantId,
      name: data.name,
      slug,
      description: data.description,
      fields: [],
      isPublished: data.isPublished ?? false,
    },
  });
}

export async function deleteForm(tenantId: string, formId: string) {
  await requireTenantAccess(tenantId);
  return db.dynamicForm.delete({ where: { id: formId, tenantId } });
}

export async function listFormSubmissions(tenantId: string, formId: string) {
  await requireTenantAccess(tenantId);
  const form = await db.dynamicForm.findFirst({ where: { id: formId, tenantId } });
  if (!form) throw new Error("Form not found");
  return db.dynamicFormSubmission.findMany({
    where: { formId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

// =================== MULTI-BRAND ===================

export async function listBrands(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.brand.findMany({ where: { tenantId }, orderBy: { name: "asc" } });
}

export async function createBrand(
  tenantId: string,
  data: { name: string; slug?: string; logoUrl?: string; primaryColor?: string }
) {
  await requireTenantAccess(tenantId);
  const slug =
    data.slug ||
    data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) +
      "-" +
      Date.now();
  return db.brand.create({ data: { tenantId, ...data, slug } });
}

export async function updateBrand(
  tenantId: string,
  brandId: string,
  data: { name?: string; logoUrl?: string; primaryColor?: string }
) {
  await requireTenantAccess(tenantId);
  return db.brand.update({ where: { id: brandId, tenantId }, data });
}

export async function deleteBrand(tenantId: string, brandId: string) {
  await requireTenantAccess(tenantId);
  return db.brand.delete({ where: { id: brandId, tenantId } });
}

// =================== FRANCHISE ===================

export async function listFranchiseLocations(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.franchiseLocation.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
  });
}

export async function createFranchiseLocation(
  tenantId: string,
  data: {
    name: string;
    address?: string;
    city?: string;
    country?: string;
    phone?: string;
    managerName?: string;
  }
) {
  await requireTenantAccess(tenantId);
  return db.franchiseLocation.create({ data: { tenantId, ...data } });
}

export async function updateFranchiseLocation(
  tenantId: string,
  locationId: string,
  data: {
    name?: string;
    address?: string;
    city?: string;
    country?: string;
    phone?: string;
    managerName?: string;
    isActive?: boolean;
  }
) {
  await requireTenantAccess(tenantId);
  return db.franchiseLocation.update({ where: { id: locationId, tenantId }, data });
}

export async function deleteFranchiseLocation(tenantId: string, locationId: string) {
  await requireTenantAccess(tenantId);
  return db.franchiseLocation.delete({ where: { id: locationId, tenantId } });
}

// =================== GAMIFICATION ===================

export async function listBadges(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.gamificationBadge.findMany({
    where: { tenantId },
    orderBy: { xpRequired: "asc" },
    include: { _count: { select: { userBadges: true } } },
  });
}

export async function createBadge(
  tenantId: string,
  data: { name: string; description?: string; iconUrl?: string; xpRequired: number }
) {
  await requireTenantAccess(tenantId);
  return db.gamificationBadge.create({ data: { tenantId, ...data } });
}

export async function deleteBadge(tenantId: string, badgeId: string) {
  await requireTenantAccess(tenantId);
  return db.gamificationBadge.delete({ where: { id: badgeId, tenantId } });
}

export async function listAchievements(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.gamificationAchievement.findMany({
    where: { tenantId },
    orderBy: { xpReward: "desc" },
    include: { _count: { select: { userAchievements: true } } },
  });
}

export async function createAchievement(
  tenantId: string,
  data: { name: string; description?: string; xpReward: number }
) {
  await requireTenantAccess(tenantId);
  return db.gamificationAchievement.create({
    data: { tenantId, ...data, criteria: {} },
  });
}

export async function deleteAchievement(tenantId: string, achievementId: string) {
  await requireTenantAccess(tenantId);
  return db.gamificationAchievement.delete({ where: { id: achievementId, tenantId } });
}

// =================== AUDIT LOGS ===================

export async function listAuditLogs(tenantId: string, limit = 100) {
  await requireTenantAccess(tenantId);
  return db.auditLog.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { name: true, email: true } } },
  });
}

// =================== EMAIL BUILDER ===================

export async function listEmailTemplates(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.emailTemplate.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createEmailTemplate(
  tenantId: string,
  data: { name: string; subject: string; htmlContent: string }
) {
  await requireTenantAccess(tenantId);
  return db.emailTemplate.create({ data: { tenantId, ...data, jsonDesign: {} } });
}

export async function updateEmailTemplate(
  tenantId: string,
  id: string,
  data: { name?: string; subject?: string; htmlContent?: string; isDefault?: boolean }
) {
  await requireTenantAccess(tenantId);
  return db.emailTemplate.update({ where: { id, tenantId }, data });
}

export async function deleteEmailTemplate(tenantId: string, id: string) {
  await requireTenantAccess(tenantId);
  return db.emailTemplate.delete({ where: { id, tenantId } });
}

// =================== INVOICE DESIGNER ===================

export async function listInvoiceTemplates(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.invoiceTemplate.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createInvoiceTemplate(
  tenantId: string,
  data: { name: string; logoUrl?: string; showQr?: boolean; taxRate?: number }
) {
  await requireTenantAccess(tenantId);
  return db.invoiceTemplate.create({
    data: { tenantId, name: data.name, logoUrl: data.logoUrl, showQr: data.showQr ?? true, taxRate: data.taxRate, jsonDesign: {} },
  });
}

export async function updateInvoiceTemplate(
  tenantId: string,
  id: string,
  data: { name?: string; logoUrl?: string; showQr?: boolean; taxRate?: number; isDefault?: boolean }
) {
  await requireTenantAccess(tenantId);
  return db.invoiceTemplate.update({ where: { id, tenantId }, data });
}

export async function deleteInvoiceTemplate(tenantId: string, id: string) {
  await requireTenantAccess(tenantId);
  return db.invoiceTemplate.delete({ where: { id, tenantId } });
}

// =================== THEME BUILDER ===================

export async function listThemeTemplates(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.themeTemplate.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createThemeTemplate(
  tenantId: string,
  data: { name: string }
) {
  await requireTenantAccess(tenantId);
  return db.themeTemplate.create({
    data: { tenantId, name: data.name, jsonDesign: {} },
  });
}

export async function applyTheme(tenantId: string, themeId: string) {
  await requireTenantAccess(tenantId);
  await db.themeTemplate.updateMany({ where: { tenantId }, data: { isActive: false } });
  return db.themeTemplate.update({
    where: { id: themeId, tenantId },
    data: { isActive: true },
  });
}

export async function deleteThemeTemplate(tenantId: string, id: string) {
  await requireTenantAccess(tenantId);
  return db.themeTemplate.delete({ where: { id, tenantId } });
}

// =================== LANDING BUILDER ===================

export async function listLandingPages(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.landingPage.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createLandingPage(
  tenantId: string,
  data: { title: string; seoTitle?: string; seoDescription?: string }
) {
  await requireTenantAccess(tenantId);
  const slug =
    data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60) +
    "-" +
    Date.now();
  return db.landingPage.create({
    data: {
      tenantId,
      title: data.title,
      slug,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      content: {},
      status: "DRAFT",
    },
  });
}

export async function updateLandingPage(
  tenantId: string,
  id: string,
  data: { title?: string; status?: "DRAFT" | "PUBLISHED" | "ARCHIVED"; seoTitle?: string; seoDescription?: string }
) {
  await requireTenantAccess(tenantId);
  return db.landingPage.update({ where: { id, tenantId }, data });
}

export async function deleteLandingPage(tenantId: string, id: string) {
  await requireTenantAccess(tenantId);
  return db.landingPage.delete({ where: { id, tenantId } });
}

// =================== VOICE NOTES ===================

export async function listVoiceNotes(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.voiceNote.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });
}

export async function createVoiceNote(
  tenantId: string,
  userId: string,
  data: { title?: string; audioUrl?: string; durationSec?: number }
) {
  await requireTenantAccess(tenantId);
  return db.voiceNote.create({
    data: {
      tenantId,
      userId,
      title: data.title,
      audioUrl: data.audioUrl,
      durationSec: data.durationSec,
      status: data.audioUrl ? "COMPLETED" : "RECORDING",
    },
  });
}

export async function deleteVoiceNote(tenantId: string, id: string) {
  await requireTenantAccess(tenantId);
  return db.voiceNote.delete({ where: { id, tenantId } });
}

// =================== SMART CALENDAR ===================

export async function listCalendarSyncConnections(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.calendarSyncConnection.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function upsertCalendarSyncConnection(
  tenantId: string,
  provider: CalendarSyncProvider
) {
  await requireTenantAccess(tenantId);
  return db.calendarSyncConnection.upsert({
    where: { tenantId_provider: { tenantId, provider } },
    update: { isActive: true },
    create: { tenantId, provider, isActive: true },
  });
}

export async function disconnectCalendarSync(tenantId: string, id: string) {
  await requireTenantAccess(tenantId);
  return db.calendarSyncConnection.update({
    where: { id, tenantId },
    data: { isActive: false },
  });
}

export async function listCalendarEvents(tenantId: string, limit = 50) {
  await requireTenantAccess(tenantId);
  return db.calendarEvent.findMany({
    where: { tenantId },
    orderBy: { startAt: "desc" },
    take: limit,
  });
}

export async function createCalendarEvent(
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
) {
  await requireTenantAccess(tenantId);
  return db.calendarEvent.create({ data: { tenantId, ...data } });
}

export async function deleteCalendarEvent(tenantId: string, id: string) {
  await requireTenantAccess(tenantId);
  return db.calendarEvent.delete({ where: { id, tenantId } });
}

// =================== AUTOMATION BUILDER ===================

export async function listWorkflows(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.automationWorkflow.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { steps: true } } },
  });
}

export async function createWorkflow(
  tenantId: string,
  data: { name: string; description?: string; trigger: string }
) {
  await requireTenantAccess(tenantId);
  return db.automationWorkflow.create({
    data: { tenantId, ...data, isActive: false },
  });
}

export async function toggleWorkflow(
  tenantId: string,
  workflowId: string,
  isActive: boolean
) {
  await requireTenantAccess(tenantId);
  return db.automationWorkflow.update({
    where: { id: workflowId, tenantId },
    data: { isActive },
  });
}

export async function deleteWorkflow(tenantId: string, workflowId: string) {
  await requireTenantAccess(tenantId);
  return db.automationWorkflow.delete({ where: { id: workflowId, tenantId } });
}
