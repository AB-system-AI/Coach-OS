import type Stripe from "stripe";

/** Stripe v18 moved billing period fields to subscription items. */
export function getSubscriptionPeriod(subscription: Stripe.Subscription): {
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
} {
  const item = subscription.items.data[0];
  const start = item?.current_period_start ?? subscription.billing_cycle_anchor;
  const end = item?.current_period_end ?? subscription.billing_cycle_anchor;
  return {
    currentPeriodStart: new Date(start * 1000),
    currentPeriodEnd: new Date(end * 1000),
  };
}

export function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const details = invoice.parent?.subscription_details;
  if (!details?.subscription) return null;
  return typeof details.subscription === "string"
    ? details.subscription
    : details.subscription.id;
}
