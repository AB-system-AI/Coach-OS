import { db } from "@/lib/db";

export async function getLoyaltyStats(tenantId: string) {
  const program = await db.loyaltyProgram.findUnique({
    where: { tenantId },
    include: {
      _count: { select: { pointEntries: true, levels: true, badges: true } },
    },
  });
  return program;
}

export async function awardPoints(
  programId: string,
  userId: string,
  points: number,
  reason?: string
) {
  return db.loyaltyPointEntry.create({
    data: { programId, userId, points, reason },
  });
}
