import { getCurrentTenant } from "@/lib/auth/session";
import { getExercises, getExerciseStats } from "@/features/exercises";
import { ModuleOverview } from "@/components/layout/module-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

export default async function ExerciseLibraryPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [exercises, stats] = await Promise.all([
    getExercises(tenant.id),
    getExerciseStats(tenant.id),
  ]);

  return (
    <div className="space-y-8">
      <ModuleOverview
        title="Exercise Library"
        description="Database of exercises with muscle group, level, video, tips, and common mistakes."
        stats={[{ label: "Exercises", value: stats.total }]}
        actions={[{ label: "Add Exercise", href: "/dashboard/videos/new" }]}
      />
      <Card>
        <CardHeader><CardTitle>Exercises</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {exercises.map((ex) => (
            <div key={ex.id} className="rounded-lg border p-4">
              <p className="font-medium">{ex.title}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {ex.muscleGroup && <Badge variant="outline">{ex.muscleGroup}</Badge>}
                {ex.level && <Badge variant="secondary">{ex.level}</Badge>}
              </div>
              {ex.tips && <p className="text-xs text-muted-foreground mt-2">{ex.tips}</p>}
            </div>
          ))}
          {exercises.length === 0 && (
            <p className="text-muted-foreground col-span-2 py-4">No exercises in library.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
