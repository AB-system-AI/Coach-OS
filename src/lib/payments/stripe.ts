import Stripe from "stripe";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured. Set it in your environment variables."
    );
  }
  return new Stripe(key);
}

export { getStripe };

export async function createPaymentIntent(input: {
  amount: number;
  currency: string;
  customerId?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe();
  return stripe.paymentIntents.create({
    amount: Math.round(input.amount * 100),
    currency: input.currency.toLowerCase(),
    customer: input.customerId,
    automatic_payment_methods: { enabled: true },
    metadata: { source: "coachos", ...input.metadata },
  });
}

export async function createCheckoutSession(input: {
  customerId?: string;
  priceId: string;
  tenantId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.create({
    customer: input.customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: input.priceId, quantity: 1 }],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    metadata: { tenantId: input.tenantId },
    subscription_data: { metadata: { tenantId: input.tenantId } },
    allow_promotion_codes: true,
  });
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripe();
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function refundPaymentIntent(
  paymentIntentId: string,
  amount?: number
): Promise<Stripe.Refund> {
  const stripe = getStripe();
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amount != null ? { amount: Math.round(amount * 100) } : {}),
  });
}

export function constructWebhookEvent(
  rawBody: string,
  signature: string
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is not configured. Set it in your environment variables."
    );
  }
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}

export async function createOrGetStripeCustomer(
  tenantId: string,
  email: string,
  name: string
): Promise<Stripe.Customer> {
  const stripe = getStripe();
  const existing = await stripe.customers.search({
    query: `metadata['tenantId']:'${tenantId}'`,
    limit: 1,
  });
  if (existing.data.length > 0) {
    return existing.data[0] as Stripe.Customer;
  }
  return stripe.customers.create({ email, name, metadata: { tenantId } });
}

export async function retrieveSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price"],
  });
}

export async function updateSubscriptionPrice(
  subscriptionId: string,
  subscriptionItemId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  return stripe.subscriptions.update(subscriptionId, {
    items: [{ id: subscriptionItemId, price: newPriceId }],
    proration_behavior: "create_prorations",
  });
}

export async function cancelStripeSubscription(
  subscriptionId: string,
  atPeriodEnd = true
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  if (atPeriodEnd) {
    return stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
  return stripe.subscriptions.cancel(subscriptionId);
}

export function isApplePayReady(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
