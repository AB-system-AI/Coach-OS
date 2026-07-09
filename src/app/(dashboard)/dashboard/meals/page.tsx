import { getCurrentTenant } from "@/lib/auth/session";
import { getMealPlans, getMealStats } from "@/features/meals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Utensils } from "lucide-react";
import { MealPlanDeleteButton } from "./_components/meal-plan-delete-button";

export default async function MealsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [plans, stats] = await Promise.all([
    getMealPlans(tenant.id),
    getMealStats(tenant.id),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meal Plans</h1>
          <p className="text-muted-foreground mt-1">
            Build meal plans with macros, recipes, alternatives, and weekly schedules.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/meals/new">
            <Plus className="h-4 w-4 me-2" />
            New Meal Plan
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { label: "Meal Plans", value: stats.plans },
          { label: "Recipes", value: stats.recipes },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Meal Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {plans.map((plan) => {
            const totalCalories = plan.meals.reduce((acc, m) => acc + (m.calories ?? 0), 0);
            return (
              <div key={plan.id} className="flex items-center justify-between py-4">
                <Link href={`/dashboard/meals/${plan.id}`} className="flex-1 hover:underline">
                  <p className="font-medium">{plan.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {plan.meals.length} meals
                    {totalCalories > 0 && ` · ${totalCalories} kcal/day`}
                    {plan.program ? ` · ${plan.program.name}` : ""}
                  </p>
                </Link>
                <div className="flex items-center gap-2">
                  {plan.isTemplate && <Badge variant="secondary">Template</Badge>}
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/meals/${plan.id}`}>View</Link>
                  </Button>
                  <MealPlanDeleteButton tenantId={tenant.id} planId={plan.id} planName={plan.name} />
                </div>
              </div>
            );
          })}
          {plans.length === 0 && (
            <div className="py-12 text-center">
              <Utensils className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No meal plans yet.</p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/dashboard/meals/new">Create your first meal plan</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
