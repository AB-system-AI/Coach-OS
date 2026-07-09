"use server";

import { revalidatePath } from "next/cache";
import { requireTenantAccess } from "@/lib/auth/session";
import {
  createExercise,
  updateExercise,
  deleteExercise,
} from "@/features/exercises/services/exercise-service";

export async function createExerciseAction(
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
  const exercise = await createExercise(tenantId, data);
  revalidatePath("/dashboard/videos");
  return { id: exercise.id };
}

export async function updateExerciseAction(
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
  await updateExercise(tenantId, exerciseId, data);
  revalidatePath("/dashboard/videos");
}

export async function deleteExerciseAction(tenantId: string, exerciseId: string) {
  await requireTenantAccess(tenantId);
  await deleteExercise(tenantId, exerciseId);
  revalidatePath("/dashboard/videos");
}
