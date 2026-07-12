import { getSession } from "@/lib/auth/session";
import { getPortalMeals } from "@/features/client-portal/services/portal-service";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function PortalMealsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const enrollments = await getPortalMeals(session.user.id);

  const allMealPlans = enrollments.flatMap((e) =>
    e.program.mealPlans.map((mp) => ({ ...mp, programName: e.program.name }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meal Plans</h1>
        <p className="text-muted-foreground text-sm">Your nutrition plans from all active programs.</p>
      </div>

      {allMealPlans.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No meal plans assigned yet.
          </CardContent>
        </Card>
      )}

      {allMealPlans.map((plan) => (
        <Card key={plan.id}>
          <CardHeader>
            <CardTitle className="text-base">{plan.name}</CardTitle>
            <p className="text-xs text-muted-foreground">From: {plan.programName}</p>
          </CardHeader>
          <CardContent>
            {plan.meals.length === 0 && (
              <p className="text-sm text-muted-foreground">No meals in this plan yet.</p>
            )}
            <div className="space-y-4">
              {["BREAKFAST", "LUNCH", "DINNER", "SNACK", "PRE_WORKOUT", "POST_WORKOUT"].map((type) => {
                const mealsForType = plan.meals.filter((m) => m.mealType === type);
                if (mealsForType.length === 0) return null;
                return (
                  <div key={type}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">{type.replace("_", " ")}</h4>
                    <div className="space-y-2">
                      {mealsForType.map((meal) => (
                        <div key={meal.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-sm">{meal.name}</p>
                            <Badge variant="outline" className="text-xs">{meal.calories} kcal</Badge>
                          </div>
                          {meal.recipes.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium">Ingredients:</p>
                              <ul className="mt-1 space-y-0.5">
                                {meal.recipes.map((mr) => (
                                  <li key={mr.id} className="text-xs text-muted-foreground">
                                    • {mr.recipe?.name ?? "Recipe"}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                            {meal.protein && <span>P: {meal.protein}g</span>}
                            {meal.carbs && <span>C: {meal.carbs}g</span>}
                            {meal.fat && <span>F: {meal.fat}g</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
