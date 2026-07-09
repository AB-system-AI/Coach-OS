import { getCurrentTenant } from "@/lib/auth/session";
import { getPrograms, getProgramStats } from "@/features/programs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Dumbbell, Plus, Copy } from "lucide-react";

export default async function ProgramsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [programs, stats] = await Promise.all([
    getPrograms(tenant.id),
    getProgramStats(tenant.id),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workout Programs</h1>
          <p className="text-muted-foreground mt-1">
            Build programs with days, exercises, sets, reps, rest time, videos, and templates.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/programs/new">
            <Plus className="h-4 w-4 me-2" />
            New Program
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Programs", value: stats.programs },
          { label: "Active", value: stats.active },
          { label: "Templates", value: stats.templates },
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
            <Dumbbell className="h-5 w-5" />
            Programs
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {programs.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/programs/${p.id}`}
              className="flex items-center justify-between py-4 hover:bg-muted/50 -mx-2 px-2 rounded-lg"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-muted-foreground">
                  {p._count.workoutPlans} workout days · {p._count.enrollments} clients
                </p>
              </div>
              <div className="flex items-center gap-2">
                {p.isTemplate && <Badge variant="outline">Template</Badge>}
                <Badge>{p.status}</Badge>
              </div>
            </Link>
          ))}
          {programs.length === 0 && (
            <p className="text-muted-foreground py-8 text-center">No programs yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Copy className="h-4 w-4" />
            Features
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {["Drag & Drop", "Templates", "Copy Program", "Assign to Client", "Video & Images", "Sets/Reps/Rest"].map((f) => (
            <Badge key={f} variant="secondary">{f}</Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
