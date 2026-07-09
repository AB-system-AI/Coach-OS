import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const event = body?.type;

  if (event?.startsWith("payment_intent.")) {
    const paymentIntent = body.data?.object;
    if (paymentIntent?.id) {
      await db.payment.updateMany({
        where: { providerPaymentId: paymentIntent.id },
        data: {
          status: event === "payment_intent.succeeded" ? "COMPLETED" : "FAILED",
        },
      });
    }
  }

  return Response.json({ received: true });
}
