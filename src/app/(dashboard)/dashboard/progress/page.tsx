import { getCurrentTenant } from "@/lib/auth/session";
import { getPendingCheckIns, getProgressStats } from "@/features/progress";
import { ModuleOverview } from "@/components/layout/module-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

export default async function ProgressPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [checkIns, stats] = await Promise.all([
    getPendingCheckIns(tenant.id),
    getProgressStats(tenant.id),
  ]);

  return (
    <div className="space-y-8">
      <ModuleOverview
        title="Client Progress & Check-ins"
        description="Weight, BMI, measurements, photos, graphs, and weekly client check-ins."
        stats={[
          { label: "Active Clients", value: stats.clients },
          { label: "Pending Check-ins", value: stats.pendingCheckIns },
        ]}
        actions={[{ label: "Clients", href: "/dashboard/clients" }]}
      />
      <div className="flex flex-wrap gap-2">
        {["Weight", "BMI", "Body Fat", "Measurements", "Photos", "Before/After", "Weekly Check-in"].map((f) => (
          <Badge key={f} variant="secondary">{f}</Badge>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Pending Weekly Check-ins</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {checkIns.map((c) => (
            <div key={c.id} className="py-4">
              <div className="flex justify-between">
                <p className="font-medium">{c.client.user.name}</p>
                <Badge>{c.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Week of {c.weekStartDate.toLocaleDateString()}
                {c.weight != null && ` · ${c.weight} kg`}
                {c.adherenceScore != null && ` · Adherence ${c.adherenceScore}/10`}
              </p>
              {c.notes && <p className="text-sm mt-2">{c.notes}</p>}
            </div>
          ))}
          {checkIns.length === 0 && (
            <p className="text-muted-foreground py-4">No pending check-ins.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
