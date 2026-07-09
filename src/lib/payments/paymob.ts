import crypto from "crypto";

interface PaymobConfig {
  apiKey: string;
  integrationId: string;
  iframeId: string;
  hmacSecret?: string;
}

function getPaymobConfig(): PaymobConfig {
  const apiKey = process.env.PAYMOB_API_KEY;
  const integrationId = process.env.PAYMOB_INTEGRATION_ID;
  const iframeId = process.env.PAYMOB_IFRAME_ID;

  if (!apiKey || !integrationId || !iframeId) {
    throw new Error(
      "Paymob is not configured. Set PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID, and PAYMOB_IFRAME_ID in your environment variables."
    );
  }

  return {
    apiKey,
    integrationId,
    iframeId,
    hmacSecret: process.env.PAYMOB_HMAC_SECRET,
  };
}

/** Step 1: Exchange API key for short-lived auth token */
export async function authenticate(): Promise<string> {
  const { apiKey } = getPaymobConfig();
  const res = await fetch("https://accept.paymob.com/api/auth/tokens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey }),
  });
  if (!res.ok) {
    throw new Error(`Paymob authentication failed: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as { token: string };
  return data.token;
}

/** Step 2: Register an order with Paymob */
export async function createOrder(
  token: string,
  input: {
    amountCents: number;
    currency: string;
    merchantOrderId: string;
  }
): Promise<{ id: number }> {
  const res = await fetch("https://accept.paymob.com/api/ecommerce/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: token,
      delivery_needed: false,
      amount_cents: input.amountCents,
      currency: input.currency,
      merchant_order_id: input.merchantOrderId,
      items: [],
    }),
  });
  if (!res.ok) {
    throw new Error(`Paymob order creation failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<{ id: number }>;
}

/** Step 3: Get a payment key for the iframe */
export async function getPaymentKey(
  token: string,
  input: {
    orderId: number;
    amountCents: number;
    currency: string;
    billingData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  }
): Promise<string> {
  const { integrationId } = getPaymobConfig();
  const res = await fetch(
    "https://accept.paymob.com/api/acceptance/payment_keys",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: token,
        amount_cents: input.amountCents,
        expiration: 3600,
        order_id: input.orderId,
        billing_data: {
          apartment: "N/A",
          email: input.billingData.email,
          floor: "N/A",
          first_name: input.billingData.firstName,
          street: "N/A",
          building: "N/A",
          phone_number: input.billingData.phone,
          shipping_method: "N/A",
          postal_code: "N/A",
          city: "N/A",
          country: "N/A",
          last_name: input.billingData.lastName,
          state: "N/A",
        },
        currency: input.currency,
        integration_id: Number(integrationId),
        lock_order_when_paid: false,
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`Paymob payment key failed: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as { token: string };
  return data.token;
}

export function buildIframeUrl(paymentKey: string): string {
  const { iframeId } = getPaymobConfig();
  return `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;
}

/**
 * Verify Paymob HMAC signature from a transaction callback.
 * Paymob sends either query params (GET) or body params (POST) including `hmac`.
 * Fields are concatenated in a specific order and hashed with HMAC-SHA512.
 */
export function verifyPaymobHmac(
  params: Record<string, string>,
  hmacSecret: string
): boolean {
  const receivedHmac = params.hmac;
  if (!receivedHmac) return false;

  const fields = [
    "amount_cents",
    "created_at",
    "currency",
    "error_occured",
    "has_parent_transaction",
    "id",
    "integration_id",
    "is_3d_secure",
    "is_auth",
    "is_capture",
    "is_refunded",
    "is_standalone_payment",
    "is_voided",
    "order",
    "owner",
    "pending",
    "source_data.pan",
    "source_data.sub_type",
    "source_data.type",
    "success",
  ];

  const concatenated = fields.map((f) => params[f] ?? "").join("");
  const computed = crypto
    .createHmac("sha512", hmacSecret)
    .update(concatenated)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(computed, "hex"),
    Buffer.from(receivedHmac, "hex")
  );
}

export interface PaymobPaymentResult {
  paymentUrl: string;
  paymobOrderId: number;
  reference: string;
}

/**
 * Full 3-step Paymob payment flow: authenticate → create order → get payment key → build iframe URL.
 */
export async function createPaymobPayment(input: {
  amount: number;
  currency: string;
  orderId: string;
  billingData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}): Promise<PaymobPaymentResult> {
  const amountCents = Math.round(input.amount * 100);

  const token = await authenticate();
  const order = await createOrder(token, {
    amountCents,
    currency: input.currency,
    merchantOrderId: input.orderId,
  });

  const paymentKey = await getPaymentKey(token, {
    orderId: order.id,
    amountCents,
    currency: input.currency,
    billingData: input.billingData ?? {
      firstName: "Customer",
      lastName: "Name",
      email: "customer@example.com",
      phone: "+0000000000",
    },
  });

  return {
    paymentUrl: buildIframeUrl(paymentKey),
    paymobOrderId: order.id,
    reference: input.orderId,
  };
}
