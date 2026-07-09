import { apiResponse } from "@/lib/api/auth";
import { db } from "@/lib/db";

type Props = {
  params: Promise<{ code: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  const { code } = await params;

  const link = await db.deepLink.findUnique({ where: { code } });
  if (!link) {
    return Response.json({ success: false, error: "Not found" }, { status: 404 });
  }

  if (link.expiresAt && link.expiresAt < new Date()) {
    return Response.json({ success: false, error: "Expired" }, { status: 410 });
  }

  await db.deepLink.update({
    where: { id: link.id },
    data: { clickCount: { increment: 1 } },
  });

  return apiResponse({
    type: link.type,
    targetId: link.targetId,
    tenantId: link.tenantId,
    metadata: link.metadata,
  });
}
