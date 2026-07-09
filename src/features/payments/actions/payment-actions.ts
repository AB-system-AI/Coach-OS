"use server";

import { revalidatePath } from "next/cache";
import { getCurrentTenant, requireTenantAccess, getSession } from "@/lib/auth/session";
import {
  createPayment,
  createInvoice,
  markInvoicePaid,
  updateInvoiceStatus,
  sendInvoiceEmail,
  createCoupon,
  updateCoupon,
  refundPayment,
  validateCoupon,
  applyCoupon,
} from "@/features/payments/services/payment-service";

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function createPaymentAction(formData: FormData) {
  const tenant = await getCurrentTenant();
  if (!tenant) throw new Error("Not authenticated");

  const userId = formData.get("userId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const currency = (formData.get("currency") as string) || "USD";
  const description = (formData.get("description") as string) || undefined;
  const provider = ((formData.get("provider") as string) || "stripe") as
    | "stripe"
    | "paymob";

  if (!userId || isNaN(amount) || amount <= 0) {
    throw new Error("Invalid payment data");
  }

  const result = await createPayment(tenant.id, {
    userId,
    amount,
    currency,
    description,
    provider,
  });

  revalidatePath("/dashboard/payments");
  return result;
}

export async function refundPaymentAction(formData: FormData) {
  const tenant = await getCurrentTenant();
  if (!tenant) throw new Error("Not authenticated");

  const session = await getSession();

  const paymentId = formData.get("paymentId") as string;
  const amountStr = formData.get("amount") as string;
  const amount = amountStr ? parseFloat(amountStr) : undefined;

  if (!paymentId) throw new Error("Payment ID is required");

  const result = await refundPayment(
    tenant.id,
    paymentId,
    amount,
    session?.user.id
  );

  revalidatePath("/dashboard/payments");
  return result;
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export async function createInvoiceAction(formData: FormData) {
  const tenant = await getCurrentTenant();
  if (!tenant) throw new Error("Not authenticated");

  const { session } = await requireTenantAccess(tenant.id);

  const amount = parseFloat(formData.get("amount") as string);
  const currency = (formData.get("currency") as string) || "USD";
  const dueDateStr = formData.get("dueDate") as string;
  const notes = (formData.get("notes") as string) || undefined;

  if (isNaN(amount) || amount <= 0) throw new Error("Invalid amount");

  const invoice = await createInvoice(
    tenant.id,
    {
      amount,
      currency,
      dueDate: dueDateStr ? new Date(dueDateStr) : undefined,
      notes,
    },
    session.user.id
  );

  revalidatePath("/dashboard/payments");
  return invoice;
}

export async function markInvoicePaidAction(invoiceId: string) {
  const tenant = await getCurrentTenant();
  if (!tenant) throw new Error("Not authenticated");

  const { session } = await requireTenantAccess(tenant.id);

  const result = await markInvoicePaid(tenant.id, invoiceId, session.user.id);
  revalidatePath("/dashboard/payments");
  return result;
}

export async function sendInvoiceEmailAction(invoiceId: string, recipientEmail: string) {
  const tenant = await getCurrentTenant();
  if (!tenant) throw new Error("Not authenticated");

  const { session } = await requireTenantAccess(tenant.id);

  await sendInvoiceEmail(tenant.id, invoiceId, recipientEmail, session.user.id);
  revalidatePath("/dashboard/payments");
}

export async function updateInvoiceStatusAction(
  invoiceId: string,
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED"
) {
  const tenant = await getCurrentTenant();
  if (!tenant) throw new Error("Not authenticated");

  const { session } = await requireTenantAccess(tenant.id);

  const result = await updateInvoiceStatus(
    tenant.id,
    invoiceId,
    status,
    session.user.id
  );
  revalidatePath("/dashboard/payments");
  return result;
}

// ─── Coupons ──────────────────────────────────────────────────────────────────

export async function createCouponAction(formData: FormData) {
  const tenant = await getCurrentTenant();
  if (!tenant) throw new Error("Not authenticated");

  const { session } = await requireTenantAccess(tenant.id);

  const code = formData.get("code") as string;
  const description = (formData.get("description") as string) || undefined;
  const discountType = formData.get("discountType") as "percentage" | "fixed";
  const discountValue = parseFloat(formData.get("discountValue") as string);
  const maxUsesStr = formData.get("maxUses") as string;
  const validUntilStr = formData.get("validUntil") as string;
  const minAmountStr = formData.get("minAmount") as string;

  if (!code) throw new Error("Coupon code is required");
  if (!discountType || !["percentage", "fixed"].includes(discountType)) {
    throw new Error("Invalid discount type");
  }
  if (isNaN(discountValue) || discountValue <= 0) {
    throw new Error("Invalid discount value");
  }

  const coupon = await createCoupon(
    tenant.id,
    {
      code,
      description,
      discountType,
      discountValue,
      maxUses: maxUsesStr ? parseInt(maxUsesStr) : undefined,
      validUntil: validUntilStr ? new Date(validUntilStr) : undefined,
      minAmount: minAmountStr ? parseFloat(minAmountStr) : undefined,
    },
    session.user.id
  );

  revalidatePath("/dashboard/coupons");
  return coupon;
}

export async function updateCouponAction(
  couponId: string,
  data: {
    isActive?: boolean;
    discountValue?: number;
    maxUses?: number;
    validUntil?: Date | null;
  }
) {
  const tenant = await getCurrentTenant();
  if (!tenant) throw new Error("Not authenticated");

  const { session } = await requireTenantAccess(tenant.id);

  const result = await updateCoupon(tenant.id, couponId, data, session.user.id);
  revalidatePath("/dashboard/coupons");
  return result;
}

export async function validateCouponAction(code: string, orderAmount: number) {
  const tenant = await getCurrentTenant();
  if (!tenant) throw new Error("Not authenticated");

  return validateCoupon(tenant.id, code, orderAmount);
}

export async function applyCouponAction(code: string, orderAmount: number) {
  const tenant = await getCurrentTenant();
  if (!tenant) throw new Error("Not authenticated");

  return applyCoupon(tenant.id, code, orderAmount);
}
