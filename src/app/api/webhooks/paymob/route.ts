import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyPaymobHmac } from "@/lib/payments/paymob";
import { readRuntimeEnv } from "@/lib/env/runtime";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const hmacSecret = readRuntimeEnv("PAYMOB_HMAC_SECRET");
  if (!hmacSecret) {
    console.error("[Paymob Webhook] PAYMOB_HMAC_SECRET is not configured.");
    return Response.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;

  // Build params map from both query string and body for HMAC verification
  const params: Record<string, string> = {};
  url.searchParams.forEach((v, k) => { params[k] = v; });

  // Paymob sends flat transaction fields for HMAC — flatten nested obj.* fields too
  const obj = (body.obj ?? body) as Record<string, unknown>;
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "object" && v !== null) {
      for (const [sk, sv] of Object.entries(v as Record<string, unknown>)) {
        params[`${k}.${sk}`] = String(sv);
      }
    } else {
      params[k] = String(v ?? "");
    }
  }
  // hmac may come in query string
  if (!params.hmac && url.searchParams.get("hmac")) {
    params.hmac = url.searchParams.get("hmac")!;
  }

  if (!verifyPaymobHmac(params, hmacSecret)) {
    console.error("[Paymob Webhook] HMAC verification failed.");
    return Response.json({ error: "Invalid HMAC signature" }, { status: 401 });
  }

  const isSuccess = params.success === "true";
  const orderId = params.order ?? obj?.order?.toString();
  const transactionId = params.id;
  const isRefunded = params.is_refunded === "true";
  const isVoided = params.is_voided === "true";

  if (orderId) {
    let status: "COMPLETED" | "FAILED" | "REFUNDED" = "FAILED";
    if (isRefunded || isVoided) {
      status = "REFUNDED";
    } else if (isSuccess) {
      status = "COMPLETED";
    }

    await db.payment.updateMany({
      where: { providerPaymentId: orderId },
      data: {
        status,
        ...(transactionId ? { metadata: { paymobTransactionId: transactionId } } : {}),
      },
    });
  }

  return Response.json({ received: true });
}
