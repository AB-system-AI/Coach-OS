"use server";

import { revalidatePath } from "next/cache";
import { requireTenantAccess } from "@/lib/auth/session";
import {
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  addMealSecure,
  deleteMeal,
  createRecipe,
  deleteRecipe,
} from "@/features/meals/services/meal-service";

export async function createMealPlanAction(
  tenantId: string,
  data: { name: string; description?: string; programId?: string; isTemplate?: boolean }
) {
  await requireTenantAccess(tenantId);
  const plan = await createMealPlan(tenantId, data);
  revalidatePath("/dashboard/meals");
  return { id: plan.id };
}

export async function updateMealPlanAction(
  tenantId: string,
  planId: string,
  data: Partial<{ name: string; description: string; isTemplate: boolean }>
) {
  await requireTenantAccess(tenantId);
  await updateMealPlan(tenantId, planId, data);
  revalidatePath(`/dashboard/meals/${planId}`);
  revalidatePath("/dashboard/meals");
}

export async function deleteMealPlanAction(tenantId: string, planId: string) {
  await requireTenantAccess(tenantId);
  await deleteMealPlan(tenantId, planId);
  revalidatePath("/dashboard/meals");
}

export async function addMealAction(
  tenantId: string,
  mealPlanId: string,
  data: {
    name: string;
    mealType: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }
) {
  await requireTenantAccess(tenantId);
  await addMealSecure(tenantId, mealPlanId, data);
  revalidatePath(`/dashboard/meals/${mealPlanId}`);
}

export async function deleteMealAction(tenantId: string, mealId: string, planId: string) {
  await requireTenantAccess(tenantId);
  await deleteMeal(tenantId, mealId);
  revalidatePath(`/dashboard/meals/${planId}`);
}

export async function createRecipeAction(
  tenantId: string,
  data: {
    name: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    instructions?: string;
  }
) {
  await requireTenantAccess(tenantId);
  const recipe = await createRecipe(tenantId, data);
  revalidatePath("/dashboard/meals");
  return { id: recipe.id };
}

export async function deleteRecipeAction(tenantId: string, recipeId: string) {
  await requireTenantAccess(tenantId);
  await deleteRecipe(tenantId, recipeId);
  revalidatePath("/dashboard/meals");
}
