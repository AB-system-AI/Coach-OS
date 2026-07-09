import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";
import {
  createCheckoutSession,
  createCustomerPortalSession,
  createOrGetStripeCustomer,
  retrieveSubscription,
  updateSubscriptionPrice,
  cancelStripeSubscription,
} from "@/lib/payments/stripe";
import { getSubscriptionPeriod } from "@/lib/payments/stripe-helpers";
import { writeAuditLog } from "@/lib/audit";
import type { SubscriptionPlan } from "@prisma/client";

// Plan → Stripe Price ID mapping from environment
const PLAN_PRICE_IDS: Partial<Record<SubscriptionPlan, string | undefined>> = {
  STARTER: process.env.STRIPE_PRICE_STARTER,
  PROFESSIONAL: process.env.STRIPE_PRICE_PROFESSIONAL,
  BUSINESS: process.env.STRIPE_PRICE_BUSINESS,
  ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE,
};

function getPriceId(plan: SubscriptionPlan): string {
  const priceId = PLAN_PRICE_IDS[plan];
  if (!priceId) {
    throw new Error(
      `Stripe price ID for plan "${plan}" is not configured. ` +
        `Set STRIPE_PRICE_${plan} in your environment variables.`
    );
  }
  return priceId;
}

function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

// ─── Checkout ────────────────────────────────────────────────────────────────

export async function createSubscriptionCheckout(
  tenantId: string,
  plan: SubscriptionPlan
): Promise<{ url: string }> {
  await requireTenantAccess(tenantId);

  const priceId = getPriceId(plan);

  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    include: {
      members: {
        where: { role: "COACH", isActive: true },
        include: { user: { select: { email: true, name: true } } },
        take: 1,
      },
    },
  });

  if (!tenant) throw new Error("Tenant not found");

  const coachEmail = tenant.members?.[0]?.user?.email ?? "";
  const coachName = tenant.members?.[0]?.user?.name ?? tenant.name;

  const existingSub = await db.tenantSubscription.findUnique({
    where: { tenantId },
    select: { stripeCustomerId: true },
  });

  let customerId = existingSub?.stripeCustomerId ?? undefined;

  if (!customerId) {
    const customer = await createOrGetStripeCustomer(tenantId, coachEmail, coachName);
    customerId = customer.id;
    await db.tenantSubscription.upsert({
      where: { tenantId },
      create: { tenantId, stripeCustomerId: customerId },
      update: { stripeCustomerId: customerId },
    });
  }

  const base = getBaseUrl();
  const session = await createCheckoutSession({
    customerId,
    priceId,
    tenantId,
    successUrl: `${base}/dashboard/settings/subscription?checkout=success`,
    cancelUrl: `${base}/dashboard/settings/subscription?checkout=cancel`,
  });

  if (!session.url) {
    throw new Error("Stripe checkout session URL is missing");
  }

  await writeAuditLog({
    tenantId,
    action: "CREATE",
    entity: "SubscriptionCheckout",
    reason: `Plan: ${plan}`,
  });

  return { url: session.url };
}

// ─── Customer Portal ──────────────────────────────────────────────────────────

export async function createBillingPortalSession(
  tenantId: string
): Promise<{ url: string }> {
  await requireTenantAccess(tenantId);

  const sub = await db.tenantSubscription.findUnique({
    where: { tenantId },
    select: { stripeCustomerId: true },
  });

  if (!sub?.stripeCustomerId) {
    throw new Error(
      "No Stripe customer found for this account. Please subscribe to a plan first."
    );
  }

  const base = getBaseUrl();
  const portal = await createCustomerPortalSession(
    sub.stripeCustomerId,
    `${base}/dashboard/settings/subscription`
  );

  return { url: portal.url };
}

// ─── Plan Changes ─────────────────────────────────────────────────────────────

export async function changePlan(
  tenantId: string,
  newPlan: SubscriptionPlan,
  authorId?: string
): Promise<void> {
  await requireTenantAccess(tenantId);

  const sub = await db.tenantSubscription.findUnique({ where: { tenantId } });

  if (!sub?.stripeSubscriptionId) {
    throw new Error(
      "No active subscription found. Use createSubscriptionCheckout to subscribe."
    );
  }

  const newPriceId = getPriceId(newPlan);
  const stripeSub = await retrieveSubscription(sub.stripeSubscriptionId);
  const itemId = stripeSub.items.data[0]?.id;

  if (!itemId) throw new Error("No subscription item found");

  await updateSubscriptionPrice(sub.stripeSubscriptionId, itemId, newPriceId);

  await db.$transaction([
    db.tenantSubscription.update({
      where: { tenantId },
      data: { plan: newPlan },
    }),
    db.tenant.update({
      where: { id: tenantId },
      data: { plan: newPlan },
    }),
  ]);

  await writeAuditLog({
    tenantId,
    userId: authorId,
    action: "UPDATE",
    entity: "TenantSubscription",
    reason: `Plan changed to ${newPlan}`,
  });
}

// ─── Cancellation ─────────────────────────────────────────────────────────────

export async function cancelSubscription(
  tenantId: string,
  immediately = false,
  authorId?: string
): Promise<void> {
  await requireTenantAccess(tenantId);

  const sub = await db.tenantSubscription.findUnique({ where: { tenantId } });

  if (!sub?.stripeSubscriptionId) {
    throw new Error("No active Stripe subscription found");
  }

  await cancelStripeSubscription(sub.stripeSubscriptionId, !immediately);

  await db.tenantSubscription.update({
    where: { tenantId },
    data: { cancelAtPeriodEnd: !immediately },
  });

  if (immediately) {
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

  await writeAuditLog({
    tenantId,
    userId: authorId,
    action: "UPDATE",
    entity: "TenantSubscription",
    reason: immediately ? "Subscription cancelled immediately" : "Subscription set to cancel at period end",
  });
}

// ─── Sync from Stripe ─────────────────────────────────────────────────────────

const STRIPE_PLAN_MAP: Partial<Record<string, SubscriptionPlan>> = Object.fromEntries(
  (
    [
      [process.env.STRIPE_PRICE_STARTER, "STARTER"],
      [process.env.STRIPE_PRICE_PROFESSIONAL, "PROFESSIONAL"],
      [process.env.STRIPE_PRICE_BUSINESS, "BUSINESS"],
      [process.env.STRIPE_PRICE_ENTERPRISE, "ENTERPRISE"],
    ] as [string | undefined, SubscriptionPlan][]
  ).filter(([k]) => k)
) as Record<string, SubscriptionPlan>;

export async function syncSubscriptionFromStripe(
  stripeSubscriptionId: string
): Promise<void> {
  const stripeSub = await retrieveSubscription(stripeSubscriptionId);

  const tenantId =
    (stripeSub.metadata?.tenantId as string | undefined) ??
    (await db.tenantSubscription
      .findFirst({
        where: { stripeSubscriptionId },
        select: { tenantId: true },
      })
      .then((r) => r?.tenantId));

  if (!tenantId) {
    throw new Error(`Cannot determine tenantId for subscription ${stripeSubscriptionId}`);
  }

  const priceId = stripeSub.items.data[0]?.price?.id;
  const mappedPlan = priceId ? STRIPE_PLAN_MAP[priceId] : undefined;
  const plan: SubscriptionPlan = mappedPlan ?? "FREE";
  const { currentPeriodStart, currentPeriodEnd } = getSubscriptionPeriod(stripeSub);

  const status = (() => {
    switch (stripeSub.status) {
      case "active": return "ACTIVE" as const;
      case "trialing": return "TRIALING" as const;
      case "past_due": return "PAST_DUE" as const;
      default: return "CANCELLED" as const;
    }
  })();

  await db.$transaction([
    db.tenantSubscription.upsert({
      where: { tenantId },
      create: {
        tenantId,
        stripeSubscriptionId,
        stripeCustomerId:
          typeof stripeSub.customer === "string"
            ? stripeSub.customer
            : stripeSub.customer.id,
        plan,
        status,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
      },
      update: {
        plan,
        status,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
      },
    }),
    db.tenant.update({
      where: { id: tenantId },
      data: { plan },
    }),
  ]);
}

// ─── Read subscription ────────────────────────────────────────────────────────

export async function getTenantSubscription(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.tenantSubscription.findUnique({ where: { tenantId } });
}
