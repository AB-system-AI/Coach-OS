import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";

export async function getChallenges(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.challenge.findMany({
    where: { tenantId },
    include: { _count: { select: { participants: true } } },
    orderBy: { startDate: "desc" },
  });
}

export async function getChallengeLeaderboard(challengeId: string) {
  return db.challengeParticipant.findMany({
    where: { challengeId },
    orderBy: { points: "desc" },
    take: 20,
  });
}

export async function getChallengeStats(tenantId: string) {
  const [active, participants] = await Promise.all([
    db.challenge.count({ where: { tenantId, isActive: true } }),
    db.challengeParticipant.count({ where: { challenge: { tenantId } } }),
  ]);
  return { active, participants };
}
