"use server";

import { revalidatePath } from "next/cache";
import { requireTenantAccess } from "@/lib/auth/session";
import {
  createProgram,
  updateProgram,
  deleteProgram,
  updateProgramStatus,
  copyProgram,
  addWorkoutPlan,
  addWorkoutExerciseSecure,
  updateWorkoutExercise,
  deleteWorkoutExercise,
  deleteWorkoutPlan,
  assignProgramToClient,
} from "@/features/programs/services/program-service";
import type { ProgramStatus } from "@prisma/client";

export async function createProgramAction(
  tenantId: string,
  data: {
    name: string;
    description?: string;
    durationWeeks?: number;
    price?: number;
    isTemplate?: boolean;
  }
) {
  const { session } = await requireTenantAccess(tenantId);
  const program = await createProgram(tenantId, data, session.user.id);
  revalidatePath("/dashboard/programs");
  return { id: program.id };
}

export async function updateProgramAction(
  tenantId: string,
  programId: string,
  data: Partial<{
    name: string;
    description: string;
    durationWeeks: number;
    price: number;
    isTemplate: boolean;
    status: ProgramStatus;
  }>
) {
  const { session } = await requireTenantAccess(tenantId);
  await updateProgram(tenantId, programId, data, session.user.id);
  revalidatePath(`/dashboard/programs/${programId}`);
  revalidatePath("/dashboard/programs");
}

export async function deleteProgramAction(tenantId: string, programId: string) {
  const { session } = await requireTenantAccess(tenantId);
  await deleteProgram(tenantId, programId, session.user.id);
  revalidatePath("/dashboard/programs");
}

export async function updateProgramStatusAction(
  tenantId: string,
  programId: string,
  status: ProgramStatus
) {
  await requireTenantAccess(tenantId);
  await updateProgramStatus(tenantId, programId, status);
  revalidatePath(`/dashboard/programs/${programId}`);
  revalidatePath("/dashboard/programs");
}

export async function copyProgramAction(tenantId: string, programId: string) {
  const { session } = await requireTenantAccess(tenantId);
  const copy = await copyProgram(tenantId, programId, session.user.id);
  revalidatePath("/dashboard/programs");
  return { id: copy.id };
}

export async function addWorkoutPlanAction(
  tenantId: string,
  programId: string,
  data: { name: string; weekNumber?: number; dayNumber?: number }
) {
  await requireTenantAccess(tenantId);
  const plan = await addWorkoutPlan(tenantId, programId, data);
  revalidatePath(`/dashboard/programs/${programId}`);
  return { id: plan.id };
}

export async function deleteWorkoutPlanAction(tenantId: string, planId: string, programId: string) {
  await requireTenantAccess(tenantId);
  await deleteWorkoutPlan(tenantId, planId);
  revalidatePath(`/dashboard/programs/${programId}`);
}

export async function addExerciseAction(
  tenantId: string,
  workoutPlanId: string,
  programId: string,
  data: {
    name: string;
    muscleGroup?: string;
    sets?: number;
    reps?: string;
    weight?: string;
    restSeconds?: number;
    notes?: string;
    videoUrl?: string;
    order?: number;
  }
) {
  await requireTenantAccess(tenantId);
  await addWorkoutExerciseSecure(tenantId, workoutPlanId, data);
  revalidatePath(`/dashboard/programs/${programId}`);
}

export async function updateExerciseAction(
  tenantId: string,
  exerciseId: string,
  programId: string,
  data: Partial<{ name: string; sets: number; reps: string; restSeconds: number; notes: string }>
) {
  await requireTenantAccess(tenantId);
  await updateWorkoutExercise(tenantId, exerciseId, data);
  revalidatePath(`/dashboard/programs/${programId}`);
}

export async function deleteExerciseAction(
  tenantId: string,
  exerciseId: string,
  programId: string
) {
  await requireTenantAccess(tenantId);
  await deleteWorkoutExercise(tenantId, exerciseId);
  revalidatePath(`/dashboard/programs/${programId}`);
}

export async function assignProgramAction(
  tenantId: string,
  programId: string,
  userId: string
) {
  await requireTenantAccess(tenantId);
  await assignProgramToClient(tenantId, programId, userId);
  revalidatePath(`/dashboard/programs/${programId}`);
}
