export type PaymentIntentResult = {
  provider: "stripe" | "paymob";
  clientSecret?: string;
  paymentUrl?: string;
  reference: string;
};

export async function createStripePaymentIntent(input: {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}): Promise<PaymentIntentResult> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return {
      provider: "stripe",
      reference: `stripe_demo_${Date.now()}`,
      clientSecret: "demo_secret_configure_STRIPE_SECRET_KEY",
    };
  }

  const res = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      amount: String(Math.round(input.amount * 100)),
      currency: input.currency.toLowerCase(),
      "metadata[source]": "coachos",
      ...Object.fromEntries(
        Object.entries(input.metadata ?? {}).map(([k, v]) => [`metadata[${k}]`, v])
      ),
    }),
  });

  if (!res.ok) {
    throw new Error("Stripe payment intent failed");
  }

  const data = (await res.json()) as { id: string; client_secret: string };
  return {
    provider: "stripe",
    reference: data.id,
    clientSecret: data.client_secret,
  };
}

export async function createPaymobPayment(input: {
  amount: number;
  currency: string;
  orderId: string;
}): Promise<PaymentIntentResult> {
  const apiKey = process.env.PAYMOB_API_KEY;
  if (!apiKey) {
    return {
      provider: "paymob",
      reference: `paymob_demo_${input.orderId}`,
      paymentUrl: "https://accept.paymob.com/demo_configure_PAYMOB_API_KEY",
    };
  }

  return {
    provider: "paymob",
    reference: input.orderId,
    paymentUrl: `https://accept.paymob.com/api/acceptance/payments/pay?order=${input.orderId}`,
  };
}

export function isApplePayReady(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
