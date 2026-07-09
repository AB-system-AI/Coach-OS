import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const orderId = body?.obj?.order?.id ?? body?.order_id;

  if (orderId) {
    await db.payment.updateMany({
      where: { providerPaymentId: String(orderId) },
      data: { status: "COMPLETED" },
    });
  }

  return Response.json({ received: true });
}
