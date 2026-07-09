import { getCurrentTenant } from "@/lib/auth/session";
import { getCrmStats, getCrmLeads } from "@/features/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CrmPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [stats, leads] = await Promise.all([
    getCrmStats(tenant.id),
    getCrmLeads(tenant.id),
  ]);

  const leadsByStatus = {
    WON: leads.filter((l) => l.status === "WON"),
    LOST: leads.filter((l) => l.status === "LOST"),
    ACTIVE: leads.filter((l) => l.status !== "WON" && l.status !== "LOST"),
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM</h1>
          <p className="text-muted-foreground">Manage leads, pipeline, and tasks.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/crm/pipeline">Pipeline View</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/crm/leads/new">Add Lead</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Leads</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.leads}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Open Tasks</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.tasks}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Won Deals</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{stats.won}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Leads</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/crm/pipeline">View Pipeline →</Link>
          </Button>
        </CardHeader>
        <CardContent className="divide-y">
          {leads.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">No leads yet. <Link href="/dashboard/crm/leads/new" className="underline">Add your first lead.</Link></p>
          )}
          {leads.slice(0, 20).map((lead) => (
            <div key={lead.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-sm">{lead.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {lead.email && <span className="text-xs text-muted-foreground">{lead.email}</span>}
                  {lead.stage && <span className="text-xs text-muted-foreground">· {lead.stage.name}</span>}
                  {lead._count.tasks > 0 && (
                    <span className="text-xs text-muted-foreground">· {lead._count.tasks} tasks</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {lead.value && (
                  <span className="text-sm font-medium">${Number(lead.value).toLocaleString()}</span>
                )}
                <Badge variant={
                  lead.status === "WON" ? "default" :
                  lead.status === "LOST" ? "destructive" : "secondary"
                }>
                  {lead.status}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
