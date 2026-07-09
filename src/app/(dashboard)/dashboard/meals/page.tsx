import { getCurrentTenant } from "@/lib/auth/session";
import { getMealPlans, getMealStats } from "@/features/meals";
import { ModuleOverview } from "@/components/layout/module-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

export default async function MealsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [plans, stats] = await Promise.all([
    getMealPlans(tenant.id),
    getMealStats(tenant.id),
  ]);

  return (
    <div className="space-y-8">
      <ModuleOverview
        title="Meal Plans"
        description="Build meal plans with macros, recipes, alternatives, and weekly schedules."
        stats={[
          { label: "Meal Plans", value: stats.plans },
          { label: "Recipes", value: stats.recipes },
        ]}
        actions={[{ label: "Recipe Library", href: "/dashboard/meals/recipes" }]}
      />
      <div className="flex flex-wrap gap-2">
        {["Meals", "Calories", "Protein", "Carbs", "Fat", "Templates", "Assign to Client"].map((f) => (
          <Badge key={f} variant="secondary">{f}</Badge>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Plans</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {plans.map((plan) => (
            <div key={plan.id} className="py-4">
              <p className="font-medium">{plan.name}</p>
              <p className="text-sm text-muted-foreground">
                {plan.meals.length} meals
                {plan.program ? ` · ${plan.program.name}` : ""}
              </p>
            </div>
          ))}
          {plans.length === 0 && <p className="text-muted-foreground py-4">No meal plans yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
