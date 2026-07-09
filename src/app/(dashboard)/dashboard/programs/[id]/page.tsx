import { getCurrentTenant } from "@/lib/auth/session";
import { getProgramById } from "@/features/programs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function ProgramDetailPage({ params }: Props) {
  const { id } = await params;
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const program = await getProgramById(tenant.id, id);
  if (!program) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/programs" className="text-sm text-muted-foreground">← Programs</Link>
        <h1 className="text-3xl font-bold mt-2">{program.name}</h1>
        <p className="text-muted-foreground">{program.description}</p>
        <div className="flex gap-2 mt-2">
          <Badge>{program.status}</Badge>
          {program.durationWeeks && <Badge variant="outline">{program.durationWeeks} weeks</Badge>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workout Days ({program.workoutPlans.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {program.workoutPlans.map((plan) => (
              <div key={plan.id} className="rounded-lg border p-4">
                <p className="font-medium">
                  {plan.name}
                  {plan.weekNumber != null && (
                    <span className="text-muted-foreground text-sm ms-2">
                      Week {plan.weekNumber} · Day {plan.dayNumber}
                    </span>
                  )}
                </p>
                <ul className="mt-2 space-y-2">
                  {plan.exercises.map((ex) => (
                    <li key={ex.id} className="text-sm flex justify-between">
                      <span>
                        {ex.name}
                        {ex.muscleGroup && (
                          <span className="text-muted-foreground ms-1">({ex.muscleGroup})</span>
                        )}
                      </span>
                      <span className="text-muted-foreground">
                        {ex.sets}×{ex.reps}
                        {ex.restSeconds ? ` · ${ex.restSeconds}s rest` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enrolled Clients ({program.enrollments.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {program.enrollments.map((e) => (
              <div key={e.id} className="flex justify-between text-sm border-b py-2">
                <span>{e.user.name}</span>
                <span className="text-muted-foreground">{e.progress}%</span>
              </div>
            ))}
            {program.enrollments.length === 0 && (
              <p className="text-muted-foreground text-sm">No clients assigned.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
