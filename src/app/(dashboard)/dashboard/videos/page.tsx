import { getCurrentTenant } from "@/lib/auth/session";
import { getExercises, getExerciseStats } from "@/features/exercises";
import { redirect } from "next/navigation";
import { ExerciseLibraryClient } from "./_components/exercise-library-client";

export default async function ExerciseLibraryPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [exercises, stats] = await Promise.all([
    getExercises(tenant.id),
    getExerciseStats(tenant.id),
  ]);

  return (
    <ExerciseLibraryClient
      exercises={exercises}
      stats={stats}
      tenantId={tenant.id}
    />
  );
}
