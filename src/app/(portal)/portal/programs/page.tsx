import { getSession } from "@/lib/auth/session";
import { getPortalPrograms } from "@/features/client-portal/services/portal-service";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function PortalProgramsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const enrollments = await getPortalPrograms(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Programs</h1>
        <p className="text-muted-foreground text-sm">Your enrolled programs with workouts and meal plans.</p>
      </div>

      {enrollments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No programs assigned yet. Your coach will add programs for you.
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {enrollments.map((enrollment) => (
          <Card key={enrollment.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>{enrollment.program.name}</CardTitle>
                {enrollment.program.description && (
                  <p className="text-sm text-muted-foreground mt-1">{enrollment.program.description}</p>
                )}
              </div>
              <Badge variant={enrollment.isActive ? "default" : "secondary"}>
                {enrollment.isActive ? "Active" : "Inactive"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrollment.program.workoutPlans.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm mb-2">Workout Plans ({enrollment.program.workoutPlans.length})</h3>
                  <div className="space-y-3">
                    {enrollment.program.workoutPlans.map((plan) => (
                      <div key={plan.id} className="border rounded-lg p-3">
                        <p className="font-medium text-sm">{plan.name}</p>
                        {plan.exercises.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {plan.exercises.map((ex) => (
                              <li key={ex.id} className="flex justify-between text-xs text-muted-foreground">
                                <span>{ex.name}</span>
                                <span>{ex.sets}×{ex.reps} {ex.weight ? `@ ${ex.weight}kg` : ""}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {enrollment.program.mealPlans.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm mb-2">Meal Plans ({enrollment.program.mealPlans.length})</h3>
                  <div className="space-y-2">
                    {enrollment.program.mealPlans.map((plan) => (
                      <div key={plan.id} className="border rounded-lg p-3">
                        <p className="font-medium text-sm">{plan.name}</p>
                        {plan.meals.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {plan.meals.map((meal) => (
                              <li key={meal.id} className="flex justify-between text-xs text-muted-foreground">
                                <span>{meal.name} ({meal.mealType})</span>
                                <span>{meal.calories} kcal</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Enrolled {new Date(enrollment.startDate).toLocaleDateString()}
                {enrollment.progress > 0 && ` · ${enrollment.progress}% complete`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
