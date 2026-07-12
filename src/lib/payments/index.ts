export type PaymentIntentResult = {
  provider: "stripe" | "paymob";
  clientSecret?: string;
  paymentUrl?: string;
  reference: string;
};

export {
  getStripe,
  createPaymentIntent,
  createCheckoutSession,
  createCustomerPortalSession,
  refundPaymentIntent,
  constructWebhookEvent,
  createOrGetStripeCustomer,
  retrieveSubscription,
  updateSubscriptionPrice,
  cancelStripeSubscription,
  isApplePayReady,
} from "./stripe";

export {
  assertPaymentProviderConfigured,
  assertStripeBillingConfigured,
  BILLING_NOT_CONFIGURED_MESSAGE,
  isPaymobConfigured,
  isPaymentProviderConfigured,
  isStripeConfigured,
} from "./availability";

export {
  authenticate as authenticatePaymob,
  createOrder as createPaymobOrder,
  getPaymentKey as getPaymobPaymentKey,
  buildIframeUrl,
  verifyPaymobHmac,
  createPaymobPayment,
} from "./paymob";

export type { PaymobPaymentResult } from "./paymob";

/**
 * Provider-agnostic helper: creates a payment intent (Stripe) or a full Paymob
 * redirect flow and returns a unified PaymentIntentResult.
 */
export async function createProviderPayment(input: {
  amount: number;
  currency: string;
  provider: "stripe" | "paymob";
  metadata?: Record<string, string>;
  orderId?: string;
}): Promise<PaymentIntentResult> {
  if (input.provider === "paymob") {
    const { createPaymobPayment } = await import("./paymob");
    const result = await createPaymobPayment({
      amount: input.amount,
      currency: input.currency,
      orderId: input.orderId ?? `order_${Date.now()}`,
    });
    return {
      provider: "paymob",
      paymentUrl: result.paymentUrl,
      reference: result.reference,
    };
  }

  const { createPaymentIntent } = await import("./stripe");
  const intent = await createPaymentIntent({
    amount: input.amount,
    currency: input.currency,
    metadata: input.metadata,
  });
  return {
    provider: "stripe",
    clientSecret: intent.client_secret ?? undefined,
    reference: intent.id,
  };
}
