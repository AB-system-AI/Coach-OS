import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";
import { logClientActivity } from "@/lib/activity";
import { writeAuditLog } from "@/lib/audit";
import type { ProgramStatus } from "@prisma/client";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function getPrograms(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.program.findMany({
    where: { tenantId },
    include: {
      _count: { select: { workoutPlans: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProgramById(tenantId: string, programId: string) {
  await requireTenantAccess(tenantId);
  return db.program.findFirst({
    where: { id: programId, tenantId },
    include: {
      workoutPlans: {
        orderBy: [{ weekNumber: "asc" }, { dayNumber: "asc" }, { order: "asc" }],
        include: { exercises: { orderBy: { order: "asc" } } },
      },
      mealPlans: { include: { meals: { include: { recipes: { include: { recipe: true } } } } } },
      enrollments: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });
}

export async function createProgram(
  tenantId: string,
  data: {
    name: string;
    description?: string;
    durationWeeks?: number;
    price?: number;
    isTemplate?: boolean;
  },
  userId?: string
) {
  await requireTenantAccess(tenantId);
  const program = await db.program.create({
    data: {
      tenantId,
      name: data.name,
      slug: `${slugify(data.name)}-${Date.now().toString(36)}`,
      description: data.description,
      durationWeeks: data.durationWeeks,
      price: data.price ?? 0,
      isTemplate: data.isTemplate ?? false,
      status: "DRAFT",
    },
  });
  await writeAuditLog({
    tenantId,
    userId,
    action: "CREATE",
    entity: "Program",
    entityId: program.id,
  });
  return program;
}

export async function copyProgram(tenantId: string, programId: string, userId?: string) {
  await requireTenantAccess(tenantId);
  const source = await getProgramById(tenantId, programId);
  if (!source) throw new Error("Program not found");

  const copy = await db.program.create({
    data: {
      tenantId,
      name: `${source.name} (Copy)`,
      slug: `${source.slug}-copy-${Date.now().toString(36)}`,
      description: source.description,
      durationWeeks: source.durationWeeks,
      price: source.price,
      status: "DRAFT",
      isTemplate: false,
    },
  });

  for (const plan of source.workoutPlans) {
    const newPlan = await db.workoutPlan.create({
      data: {
        tenantId,
        programId: copy.id,
        name: plan.name,
        description: plan.description,
        weekNumber: plan.weekNumber,
        dayNumber: plan.dayNumber,
        order: plan.order,
      },
    });
    if (plan.exercises.length > 0) {
      await db.workoutExercise.createMany({
        data: plan.exercises.map((ex) => ({
          workoutPlanId: newPlan.id,
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          restSeconds: ex.restSeconds,
          notes: ex.notes,
          videoUrl: ex.videoUrl,
          imageUrl: ex.imageUrl,
          order: ex.order,
        })),
      });
    }
  }

  await writeAuditLog({
    tenantId,
    userId,
    action: "CREATE",
    entity: "Program",
    entityId: copy.id,
    reason: `Copied from ${programId}`,
  });

  return copy;
}

export async function addWorkoutPlan(
  tenantId: string,
  programId: string,
  data: { name: string; weekNumber?: number; dayNumber?: number }
) {
  await requireTenantAccess(tenantId);
  return db.workoutPlan.create({
    data: { tenantId, programId, ...data },
  });
}

export async function addWorkoutExercise(
  workoutPlanId: string,
  data: {
    name: string;
    muscleGroup?: string;
    sets?: number;
    reps?: string;
    restSeconds?: number;
    notes?: string;
    videoUrl?: string;
    imageUrl?: string;
    order?: number;
  }
) {
  return db.workoutExercise.create({
    data: { workoutPlanId, ...data },
  });
}

export async function assignProgramToClient(
  tenantId: string,
  programId: string,
  userId: string
) {
  await requireTenantAccess(tenantId);
  const client = await db.clientProfile.findFirst({
    where: { tenantId, userId },
  });
  if (!client) throw new Error("Client not found");

  const enrollment = await db.programEnrollment.upsert({
    where: { programId_userId: { programId, userId } },
    update: { isActive: true },
    create: { programId, userId, isActive: true },
  });

  await logClientActivity({
    tenantId,
    clientId: client.id,
    type: "PROGRAM_ASSIGNED",
    title: "Program assigned",
    metadata: { programId },
  });

  return enrollment;
}

export async function getProgramTemplates(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.program.findMany({
    where: { tenantId, isTemplate: true },
    orderBy: { name: "asc" },
  });
}

export async function getProgramStats(tenantId: string) {
  await requireTenantAccess(tenantId);
  const [programs, active, templates] = await Promise.all([
    db.program.count({ where: { tenantId } }),
    db.program.count({ where: { tenantId, status: "ACTIVE" } }),
    db.program.count({ where: { tenantId, isTemplate: true } }),
  ]);
  return { programs, active, templates };
}

export async function updateProgramStatus(
  tenantId: string,
  programId: string,
  status: ProgramStatus
) {
  await requireTenantAccess(tenantId);
  return db.program.update({
    where: { id: programId, tenantId },
    data: { status },
  });
}

export async function updateProgram(
  tenantId: string,
  programId: string,
  data: Partial<{
    name: string;
    description: string;
    durationWeeks: number;
    price: number;
    isTemplate: boolean;
    status: ProgramStatus;
  }>,
  userId?: string
) {
  await requireTenantAccess(tenantId);
  const updated = await db.program.update({
    where: { id: programId, tenantId },
    data: {
      ...data,
      ...(data.name ? { slug: `${slugify(data.name)}-${Date.now().toString(36)}` } : {}),
    },
  });
  await writeAuditLog({ tenantId, userId, action: "UPDATE", entity: "Program", entityId: programId });
  return updated;
}

export async function deleteProgram(tenantId: string, programId: string, userId?: string) {
  await requireTenantAccess(tenantId);
  await db.program.delete({ where: { id: programId, tenantId } });
  await writeAuditLog({ tenantId, userId, action: "DELETE", entity: "Program", entityId: programId });
}

export async function deleteWorkoutPlan(tenantId: string, planId: string) {
  await requireTenantAccess(tenantId);
  const plan = await db.workoutPlan.findFirst({ where: { id: planId, tenantId } });
  if (!plan) throw new Error("Workout plan not found");
  await db.workoutPlan.delete({ where: { id: planId } });
}

export async function updateWorkoutExercise(
  tenantId: string,
  exerciseId: string,
  data: Partial<{
    name: string;
    muscleGroup: string;
    sets: number;
    reps: string;
    weight: string;
    restSeconds: number;
    notes: string;
    videoUrl: string;
    imageUrl: string;
    order: number;
  }>
) {
  await requireTenantAccess(tenantId);
  const ex = await db.workoutExercise.findFirst({
    where: { id: exerciseId },
    include: { workoutPlan: { select: { tenantId: true } } },
  });
  if (!ex || ex.workoutPlan.tenantId !== tenantId) throw new Error("Exercise not found");
  return db.workoutExercise.update({ where: { id: exerciseId }, data });
}

export async function deleteWorkoutExercise(tenantId: string, exerciseId: string) {
  await requireTenantAccess(tenantId);
  const ex = await db.workoutExercise.findFirst({
    where: { id: exerciseId },
    include: { workoutPlan: { select: { tenantId: true } } },
  });
  if (!ex || ex.workoutPlan.tenantId !== tenantId) throw new Error("Exercise not found");
  await db.workoutExercise.delete({ where: { id: exerciseId } });
}

export async function addWorkoutExerciseSecure(
  tenantId: string,
  workoutPlanId: string,
  data: {
    name: string;
    muscleGroup?: string;
    sets?: number;
    reps?: string;
    weight?: string;
    restSeconds?: number;
    notes?: string;
    videoUrl?: string;
    imageUrl?: string;
    order?: number;
  }
) {
  await requireTenantAccess(tenantId);
  const plan = await db.workoutPlan.findFirst({ where: { id: workoutPlanId, tenantId } });
  if (!plan) throw new Error("Workout plan not found");
  return db.workoutExercise.create({ data: { workoutPlanId, ...data } });
}
