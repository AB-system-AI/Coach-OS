import { getCurrentTenant } from "@/lib/auth/session";
import { getAutomationRules, toggleAutomationRule } from "@/features/automation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Zap, Plus } from "lucide-react";

export default async function AutomationPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const rules = await getAutomationRules(tenant.id);
  const activeCount = rules.filter((r) => r.isActive).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automation</h1>
          <p className="text-muted-foreground">Automated emails, notifications, tasks, and rewards.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/automation/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Rules</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{activeCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Rules</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{rules.length}</div></CardContent>
        </Card>
      </div>

      {rules.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground mb-4">
              No automation rules yet. Create rules to automatically send emails, notifications, and tasks.
            </p>
            <Button asChild>
              <Link href="/dashboard/automation/new">Create First Rule</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="flex items-start justify-between gap-4 py-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{rule.name}</p>
                  <Badge variant={rule.isActive ? "default" : "secondary"}>
                    {rule.isActive ? "Active" : "Paused"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">{rule.trigger}</Badge>
                  <span>→</span>
                  <Badge variant="outline" className="text-xs">{rule.action}</Badge>
                  {rule.template && <span className="text-xs">· {rule.template}</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Created {new Date(rule.createdAt).toLocaleDateString()}
                </p>
              </div>
              <form
                action={async () => {
                  "use server";
                  await toggleAutomationRule(tenant.id, rule.id, !rule.isActive);
                  revalidatePath("/dashboard/automation");
                }}
              >
                <Button type="submit" variant="outline" size="sm">
                  {rule.isActive ? "Pause" : "Activate"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
