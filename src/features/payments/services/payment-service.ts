import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";
import { createProviderPayment } from "@/lib/payments";
import { refundPaymentIntent } from "@/lib/payments/stripe";
import { writeAuditLog } from "@/lib/audit";
import { logClientActivity } from "@/lib/activity";
import { sendInvoiceEmail as sendInvoiceEmailNotification } from "@/lib/email";
import type { InvoiceStatus } from "@prisma/client";

// ─── Payments ────────────────────────────────────────────────────────────────

export async function getPayments(
  tenantId: string,
  options: { page?: number; pageSize?: number } = {}
) {
  await requireTenantAccess(tenantId);
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, options.pageSize ?? 50);

  const [items, total] = await Promise.all([
    db.payment.findMany({
      where: { tenantId },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.payment.count({ where: { tenantId } }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createPayment(
  tenantId: string,
  data: {
    userId: string;
    amount: number;
    currency?: string;
    description?: string;
    provider?: "stripe" | "paymob";
  },
  authorId?: string
) {
  await requireTenantAccess(tenantId);

  const currency = data.currency ?? "USD";
  const provider = data.provider ?? "stripe";

  const intent = await createProviderPayment({
    amount: data.amount,
    currency,
    provider,
    metadata: { tenantId, userId: data.userId },
    orderId: `order_${tenantId}_${Date.now()}`,
  });

  const payment = await db.payment.create({
    data: {
      tenantId,
      userId: data.userId,
      amount: data.amount,
      currency,
      status: "PENDING",
      provider: provider === "paymob" ? "PAYMOB" : "STRIPE",
      providerPaymentId: intent.reference,
      description: data.description,
    },
  });

  await writeAuditLog({
    tenantId,
    userId: authorId,
    action: "CREATE",
    entity: "Payment",
    entityId: payment.id,
  });

  const client = await db.clientProfile.findFirst({
    where: { tenantId, userId: data.userId },
  });
  if (client) {
    await logClientActivity({
      tenantId,
      clientId: client.id,
      type: "PAYMENT",
      title: "Payment initiated",
      metadata: { paymentId: payment.id, amount: data.amount },
    });
  }

  return { payment, intent };
}

export async function refundPayment(
  tenantId: string,
  paymentId: string,
  amount?: number,
  authorId?: string
) {
  await requireTenantAccess(tenantId);

  const payment = await db.payment.findFirst({
    where: { id: paymentId, tenantId },
  });

  if (!payment) throw new Error("Payment not found");
  if (payment.status !== "COMPLETED") {
    throw new Error("Only completed payments can be refunded");
  }
  if (payment.provider !== "STRIPE") {
    throw new Error("Refunds via API are only supported for Stripe payments");
  }
  if (!payment.providerPaymentId) {
    throw new Error("No Stripe payment intent ID on record");
  }

  const refundAmount = amount ?? Number(payment.amount);

  await refundPaymentIntent(payment.providerPaymentId, refundAmount);

  const isPartial =
    amount != null && amount < Number(payment.amount);

  const updated = await db.payment.update({
    where: { id: paymentId },
    data: {
      status: isPartial ? "PARTIALLY_REFUNDED" : "REFUNDED",
      refundedAmount: refundAmount,
    },
  });

  await writeAuditLog({
    tenantId,
    userId: authorId,
    action: "UPDATE",
    entity: "Payment",
    entityId: paymentId,
    reason: `Refund issued: ${refundAmount} ${payment.currency}`,
  });

  return updated;
}

export async function getPaymentStats(tenantId: string) {
  await requireTenantAccess(tenantId);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [revenue, pending, invoices, coupons] = await Promise.all([
    db.payment.aggregate({
      where: { tenantId, status: "COMPLETED", createdAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    db.payment.count({ where: { tenantId, status: "PENDING" } }),
    db.invoice.count({ where: { tenantId } }),
    db.coupon.count({ where: { tenantId, isActive: true } }),
  ]);

  return {
    revenue: Number(revenue._sum.amount ?? 0),
    pending,
    invoices,
    coupons,
  };
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export async function getInvoices(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.invoice.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function createInvoice(
  tenantId: string,
  data: {
    amount: number;
    currency?: string;
    dueDate?: Date;
    items?: Array<{ description: string; quantity: number; unitPrice: number }>;
    notes?: string;
    paymentId?: string;
  },
  authorId?: string
) {
  await requireTenantAccess(tenantId);

  const count = await db.invoice.count({ where: { tenantId } });
  const invoiceNumber = `INV-${String(count + 1).padStart(5, "0")}`;

  const invoice = await db.invoice.create({
    data: {
      tenantId,
      invoiceNumber,
      amount: data.amount,
      currency: data.currency ?? "USD",
      status: "DRAFT",
      dueDate: data.dueDate,
      items: data.items ?? [],
      notes: data.notes,
      paymentId: data.paymentId,
    },
  });

  await writeAuditLog({
    tenantId,
    userId: authorId,
    action: "CREATE",
    entity: "Invoice",
    entityId: invoice.id,
  });

  return invoice;
}

export async function markInvoicePaid(
  tenantId: string,
  invoiceId: string,
  authorId?: string
) {
  await requireTenantAccess(tenantId);

  const invoice = await db.invoice.findFirst({ where: { id: invoiceId, tenantId } });
  if (!invoice) throw new Error("Invoice not found");

  const updated = await db.invoice.update({
    where: { id: invoiceId },
    data: { status: "PAID", paidAt: new Date() },
  });

  await writeAuditLog({
    tenantId,
    userId: authorId,
    action: "UPDATE",
    entity: "Invoice",
    entityId: invoiceId,
    reason: "Marked as paid",
  });

  return updated;
}

export async function updateInvoiceStatus(
  tenantId: string,
  invoiceId: string,
  status: InvoiceStatus,
  authorId?: string
) {
  await requireTenantAccess(tenantId);

  const invoice = await db.invoice.findFirst({ where: { id: invoiceId, tenantId } });
  if (!invoice) throw new Error("Invoice not found");

  const updated = await db.invoice.update({
    where: { id: invoiceId },
    data: {
      status,
      ...(status === "PAID" ? { paidAt: new Date() } : {}),
    },
  });

  await writeAuditLog({
    tenantId,
    userId: authorId,
    action: "UPDATE",
    entity: "Invoice",
    entityId: invoiceId,
    reason: `Status changed to ${status}`,
  });

  return updated;
}

export async function sendInvoiceEmail(
  tenantId: string,
  invoiceId: string,
  recipientEmail: string,
  authorId?: string
) {
  await requireTenantAccess(tenantId);

  const invoice = await db.invoice.findFirst({ where: { id: invoiceId, tenantId } });
  if (!invoice) throw new Error("Invoice not found");

  await sendInvoiceEmailNotification({
    to: recipientEmail,
    invoiceNumber: invoice.invoiceNumber,
    amount: Number(invoice.amount),
    currency: invoice.currency,
    dueDate: invoice.dueDate,
  });

  if (invoice.status === "DRAFT") {
    await db.invoice.update({
      where: { id: invoiceId },
      data: { status: "SENT" },
    });
  }

  await writeAuditLog({
    tenantId,
    userId: authorId,
    action: "UPDATE",
    entity: "Invoice",
    entityId: invoiceId,
    reason: `Invoice emailed to ${recipientEmail}`,
  });
}

// ─── Coupons ─────────────────────────────────────────────────────────────────

export async function getCoupons(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.coupon.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCoupon(
  tenantId: string,
  data: {
    code: string;
    description?: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    minAmount?: number;
    maxUses?: number;
    validFrom?: Date;
    validUntil?: Date;
  },
  authorId?: string
) {
  await requireTenantAccess(tenantId);

  const existing = await db.coupon.findUnique({
    where: { tenantId_code: { tenantId, code: data.code.toUpperCase() } },
  });
  if (existing) throw new Error(`Coupon code "${data.code}" already exists`);

  const coupon = await db.coupon.create({
    data: {
      tenantId,
      code: data.code.toUpperCase(),
      description: data.description,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minAmount: data.minAmount,
      maxUses: data.maxUses,
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      isActive: true,
    },
  });

  await writeAuditLog({
    tenantId,
    userId: authorId,
    action: "CREATE",
    entity: "Coupon",
    entityId: coupon.id,
  });

  return coupon;
}

export async function updateCoupon(
  tenantId: string,
  couponId: string,
  data: {
    description?: string;
    discountValue?: number;
    maxUses?: number;
    validUntil?: Date | null;
    isActive?: boolean;
  },
  authorId?: string
) {
  await requireTenantAccess(tenantId);

  const coupon = await db.coupon.findFirst({ where: { id: couponId, tenantId } });
  if (!coupon) throw new Error("Coupon not found");

  const updated = await db.coupon.update({
    where: { id: couponId },
    data,
  });

  await writeAuditLog({
    tenantId,
    userId: authorId,
    action: "UPDATE",
    entity: "Coupon",
    entityId: couponId,
  });

  return updated;
}

export type CouponValidation =
  | { valid: true; discountType: string; discountValue: number; couponId: string }
  | { valid: false; reason: string };

export async function validateCoupon(
  tenantId: string,
  code: string,
  orderAmount: number
): Promise<CouponValidation> {
  const coupon = await db.coupon.findUnique({
    where: { tenantId_code: { tenantId, code: code.toUpperCase() } },
  });

  if (!coupon) return { valid: false, reason: "Coupon not found" };
  if (!coupon.isActive) return { valid: false, reason: "Coupon is inactive" };

  const now = new Date();
  if (coupon.validFrom && coupon.validFrom > now) {
    return { valid: false, reason: "Coupon is not yet valid" };
  }
  if (coupon.validUntil && coupon.validUntil < now) {
    return { valid: false, reason: "Coupon has expired" };
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, reason: "Coupon has reached its usage limit" };
  }
  if (coupon.minAmount != null && orderAmount < Number(coupon.minAmount)) {
    return {
      valid: false,
      reason: `Minimum order amount is ${coupon.minAmount} ${coupon.discountType}`,
    };
  }

  return {
    valid: true,
    discountType: coupon.discountType,
    discountValue: Number(coupon.discountValue),
    couponId: coupon.id,
  };
}

export async function applyCoupon(
  tenantId: string,
  code: string,
  orderAmount: number
): Promise<{
  discountedAmount: number;
  discountApplied: number;
  couponId: string;
}> {
  const validation = await validateCoupon(tenantId, code, orderAmount);
  if (!validation.valid) throw new Error(validation.reason);

  const { discountType, discountValue, couponId } = validation;

  const discountApplied =
    discountType === "percentage"
      ? Math.round((orderAmount * discountValue) / 100 * 100) / 100
      : Math.min(discountValue, orderAmount);

  const discountedAmount = Math.max(0, orderAmount - discountApplied);

  // Increment usage count atomically
  await db.coupon.update({
    where: { id: couponId },
    data: { usedCount: { increment: 1 } },
  });

  return { discountedAmount, discountApplied, couponId };
}
