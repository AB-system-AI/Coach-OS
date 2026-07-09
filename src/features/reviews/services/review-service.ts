import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";

export async function getReviews(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.review.findMany({
    where: { tenantId },
    include: { user: { select: { name: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createReview(
  tenantId: string,
  userId: string,
  data: { rating: number; comment?: string }
) {
  return db.review.create({
    data: {
      tenantId,
      userId,
      rating: data.rating,
      comment: data.comment,
      isPublic: true,
    },
  });
}

export async function getReviewStats(tenantId: string) {
  await requireTenantAccess(tenantId);
  const agg = await db.review.aggregate({
    where: { tenantId, isPublic: true },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return {
    average: agg._avg.rating ?? 0,
    count: agg._count.rating,
  };
}
