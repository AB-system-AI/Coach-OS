import { getCurrentTenant } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NewExerciseForm } from "./new-exercise-form";

export default async function NewExercisePage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/dashboard/videos" className="text-sm text-muted-foreground hover:text-foreground">
          ← Exercise Library
        </Link>
        <h1 className="text-3xl font-bold mt-2">Add Exercise</h1>
        <p className="text-muted-foreground">Add a new exercise with video, muscle group, and coaching tips.</p>
      </div>
      <NewExerciseForm tenantId={tenant.id} />
    </div>
  );
}
