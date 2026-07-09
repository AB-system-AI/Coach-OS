import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";

export async function getExercises(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.exerciseVideo.findMany({
    where: { tenantId },
    orderBy: { title: "asc" },
  });
}

export async function createExercise(
  tenantId: string,
  data: {
    title: string;
    description?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    muscleGroup?: string;
    level?: string;
    commonMistakes?: string;
    tips?: string;
    equipment?: string;
    duration?: number;
  }
) {
  await requireTenantAccess(tenantId);
  return db.exerciseVideo.create({ data: { tenantId, ...data } });
}

export async function updateExercise(
  tenantId: string,
  exerciseId: string,
  data: Partial<{
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    muscleGroup: string;
    level: string;
    commonMistakes: string;
    tips: string;
    equipment: string;
    duration: number;
  }>
) {
  await requireTenantAccess(tenantId);
  return db.exerciseVideo.update({ where: { id: exerciseId, tenantId }, data });
}

export async function deleteExercise(tenantId: string, exerciseId: string) {
  await requireTenantAccess(tenantId);
  await db.exerciseVideo.delete({ where: { id: exerciseId, tenantId } });
}

export async function getExerciseStats(tenantId: string) {
  await requireTenantAccess(tenantId);
  const total = await db.exerciseVideo.count({ where: { tenantId } });
  return { total };
}
