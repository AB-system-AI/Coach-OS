import { getCurrentTenant } from "@/lib/auth/session";
import { getCrmPipeline, moveCrmLead } from "@/features/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function CrmPipelinePage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const pipeline = await getCrmPipeline(tenant.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pipeline</h1>
          <p className="text-muted-foreground">{pipeline.name}</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/crm/leads/new">Add Lead</Link>
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {pipeline.stages.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-72">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: stage.color ?? "#6366f1" }}
                />
                <span className="font-medium text-sm">{stage.name}</span>
              </div>
              <Badge variant="secondary" className="text-xs">{stage.leads.length}</Badge>
            </div>
            <div className="space-y-2 min-h-[200px]">
              {stage.leads.map((lead) => (
                <Card key={lead.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{lead.name}</p>
                        {lead.email && <p className="text-xs text-muted-foreground truncate">{lead.email}</p>}
                        {lead.phone && <p className="text-xs text-muted-foreground">{lead.phone}</p>}
                        {lead.value && (
                          <p className="text-xs font-medium text-green-600 mt-1">
                            ${Number(lead.value).toLocaleString()}
                          </p>
                        )}
                      </div>
                      {lead._count.tasks > 0 && (
                        <Badge variant="outline" className="text-xs shrink-0">{lead._count.tasks} tasks</Badge>
                      )}
                    </div>
                    {pipeline.stages.length > 1 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {pipeline.stages
                          .filter((s) => s.id !== stage.id)
                          .slice(0, 2)
                          .map((s) => (
                            <form
                              key={s.id}
                              action={async () => {
                                "use server";
                                await moveCrmLead(tenant.id, lead.id, s.id);
                                revalidatePath("/dashboard/crm/pipeline");
                              }}
                            >
                              <Button type="submit" variant="ghost" size="sm" className="h-6 text-xs px-2">
                                → {s.name}
                              </Button>
                            </form>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {stage.leads.length === 0 && (
                <div className="border-2 border-dashed rounded-lg h-24 flex items-center justify-center text-xs text-muted-foreground">
                  No leads
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
