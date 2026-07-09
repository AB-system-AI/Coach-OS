import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";

export async function getMealPlans(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.mealPlan.findMany({
    where: { tenantId },
    include: {
      meals: { include: { recipes: { include: { recipe: true } } } },
      program: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecipes(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.recipe.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
  });
}

export async function createMealPlan(
  tenantId: string,
  data: { name: string; description?: string; programId?: string; isTemplate?: boolean }
) {
  await requireTenantAccess(tenantId);
  return db.mealPlan.create({ data: { tenantId, ...data } });
}

export async function addMeal(
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
  return db.meal.create({ data: { mealPlanId, ...data } });
}

export async function createRecipe(
  tenantId: string,
  data: {
    name: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    instructions?: string;
    ingredients?: object[];
  }
) {
  await requireTenantAccess(tenantId);
  return db.recipe.create({
    data: {
      tenantId,
      name: data.name,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      instructions: data.instructions,
      ingredients: data.ingredients ?? [],
    },
  });
}

export function calculateMealMacros(meals: { calories?: number | null; protein?: number | null; carbs?: number | null; fat?: number | null }[]) {
  return meals.reduce(
    (acc, m) => ({
      calories: (acc.calories ?? 0) + (m.calories ?? 0),
      protein: (acc.protein ?? 0) + (m.protein ?? 0),
      carbs: (acc.carbs ?? 0) + (m.carbs ?? 0),
      fat: (acc.fat ?? 0) + (m.fat ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export async function getMealPlanById(tenantId: string, planId: string) {
  await requireTenantAccess(tenantId);
  return db.mealPlan.findFirst({
    where: { id: planId, tenantId },
    include: {
      meals: { orderBy: { mealType: "asc" } },
      program: { select: { name: true } },
    },
  });
}

export async function updateMealPlan(
  tenantId: string,
  planId: string,
  data: Partial<{ name: string; description: string; isTemplate: boolean }>
) {
  await requireTenantAccess(tenantId);
  return db.mealPlan.update({ where: { id: planId, tenantId }, data });
}

export async function deleteMealPlan(tenantId: string, planId: string) {
  await requireTenantAccess(tenantId);
  await db.mealPlan.delete({ where: { id: planId, tenantId } });
}

export async function addMealSecure(
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
  const plan = await db.mealPlan.findFirst({ where: { id: mealPlanId, tenantId } });
  if (!plan) throw new Error("Meal plan not found");
  return db.meal.create({ data: { mealPlanId, ...data } });
}

export async function deleteMeal(tenantId: string, mealId: string) {
  await requireTenantAccess(tenantId);
  const meal = await db.meal.findFirst({
    where: { id: mealId },
    include: { mealPlan: { select: { tenantId: true } } },
  });
  if (!meal || meal.mealPlan.tenantId !== tenantId) throw new Error("Meal not found");
  await db.meal.delete({ where: { id: mealId } });
}

export async function deleteRecipe(tenantId: string, recipeId: string) {
  await requireTenantAccess(tenantId);
  await db.recipe.delete({ where: { id: recipeId, tenantId } });
}

export async function getMealStats(tenantId: string) {
  await requireTenantAccess(tenantId);
  const [plans, recipes] = await Promise.all([
    db.mealPlan.count({ where: { tenantId } }),
    db.recipe.count({ where: { tenantId } }),
  ]);
  return { plans, recipes };
}
