import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { constructWebhookEvent } from "@/lib/payments/stripe";
import {
  getInvoiceSubscriptionId,
  getSubscriptionPeriod,
} from "@/lib/payments/stripe-helpers";
import type Stripe from "stripe";
import type { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

export const runtime = "nodejs";

const STRIPE_PLAN_MAP: Record<string, SubscriptionPlan> = Object.fromEntries(
  (
    [
      [process.env.STRIPE_PRICE_STARTER, "STARTER"],
      [process.env.STRIPE_PRICE_PROFESSIONAL, "PROFESSIONAL"],
      [process.env.STRIPE_PRICE_BUSINESS, "BUSINESS"],
      [process.env.STRIPE_PRICE_ENTERPRISE, "ENTERPRISE"],
    ] as [string | undefined, SubscriptionPlan][]
  ).filter(([k]) => k)
) as Record<string, SubscriptionPlan>;

function stripeStatusToDb(status: string): SubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
    case "cancelled":
    case "unpaid":
    case "incomplete_expired":
      return "CANCELLED";
    default:
      return "ACTIVE";
  }
}

async function findTenantIdByStripeSubscription(
  stripeSubscriptionId: string
): Promise<string | null> {
  const sub = await db.tenantSubscription.findFirst({
    where: { stripeSubscriptionId },
    select: { tenantId: true },
  });
  return sub?.tenantId ?? null;
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const tenantId =
    (subscription.metadata?.tenantId as string | undefined) ??
    (await findTenantIdByStripeSubscription(subscription.id));

  if (!tenantId) return;

  const priceId = (subscription.items.data[0]?.price as Stripe.Price)?.id;
  const plan: SubscriptionPlan = STRIPE_PLAN_MAP[priceId] ?? "FREE";
  const status = stripeStatusToDb(subscription.status);
  const { currentPeriodStart, currentPeriodEnd } =
    getSubscriptionPeriod(subscription);

  await db.$transaction([
    db.tenantSubscription.upsert({
      where: { tenantId },
      create: {
        tenantId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId:
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id,
        plan,
        status,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
      update: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId:
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id,
        plan,
        status,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    }),
    db.tenant.update({
      where: { id: tenantId },
      data: { plan },
    }),
  ]);
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook signature verification failed";
    console.error("[Stripe Webhook] Signature error:", msg);
    return Response.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await db.payment.updateMany({
          where: { providerPaymentId: pi.id },
          data: { status: "COMPLETED" },
        });
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await db.payment.updateMany({
          where: { providerPaymentId: pi.id },
          data: { status: "FAILED" },
        });
        break;
      }

      case "payment_intent.canceled": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await db.payment.updateMany({
          where: { providerPaymentId: pi.id },
          data: { status: "FAILED" },
        });
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const { retrieveSubscription } = await import("@/lib/payments/stripe");
          const subscription = await retrieveSubscription(
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id
          );
          await syncSubscription(subscription);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.resumed": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const tenantId =
          (subscription.metadata?.tenantId as string | undefined) ??
          (await findTenantIdByStripeSubscription(subscription.id));

        if (tenantId) {
          await db.$transaction([
            db.tenantSubscription.update({
              where: { tenantId },
              data: { status: "CANCELLED", cancelAtPeriodEnd: false },
            }),
            db.tenant.update({
              where: { id: tenantId },
              data: { plan: "FREE" },
            }),
          ]);
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = getInvoiceSubscriptionId(invoice);

        if (subscriptionId) {
          const sub = await db.tenantSubscription.findFirst({
            where: { stripeSubscriptionId: subscriptionId },
            select: { tenantId: true },
          });
          if (sub) {
            await db.tenantSubscription.update({
              where: { tenantId: sub.tenantId },
              data: { status: "ACTIVE" },
            });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = getInvoiceSubscriptionId(invoice);

        if (subscriptionId) {
          const sub = await db.tenantSubscription.findFirst({
            where: { stripeSubscriptionId: subscriptionId },
            select: { tenantId: true },
          });
          if (sub) {
            await db.tenantSubscription.update({
              where: { tenantId: sub.tenantId },
              data: { status: "PAST_DUE" },
            });
          }
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Handler error";
    console.error(`[Stripe Webhook] Handler error for ${event.type}:`, msg);
    return Response.json({ error: msg }, { status: 500 });
  }

  return Response.json({ received: true });
}
