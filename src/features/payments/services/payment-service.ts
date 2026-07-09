import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";
import { createStripePaymentIntent, createPaymobPayment } from "@/lib/payments";
import { writeAuditLog } from "@/lib/audit";
import { logClientActivity } from "@/lib/activity";

export async function getPayments(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.payment.findMany({
    where: { tenantId },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getInvoices(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.invoice.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getCoupons(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.coupon.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
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
  const currency = data.currency ?? "USD";
  const provider = data.provider ?? "stripe";

  const intent =
    provider === "paymob"
      ? await createPaymobPayment({
          amount: data.amount,
          currency,
          orderId: `order_${Date.now()}`,
        })
      : await createStripePaymentIntent({
          amount: data.amount,
          currency,
          metadata: { tenantId, userId: data.userId },
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

export async function getPaymentStats(tenantId: string) {
  await requireTenantAccess(tenantId);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [revenue, pending, invoices] = await Promise.all([
    db.payment.aggregate({
      where: { tenantId, status: "COMPLETED", createdAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    db.payment.count({ where: { tenantId, status: "PENDING" } }),
    db.invoice.count({ where: { tenantId } }),
  ]);

  return {
    revenue: Number(revenue._sum.amount ?? 0),
    pending,
    invoices,
  };
}
