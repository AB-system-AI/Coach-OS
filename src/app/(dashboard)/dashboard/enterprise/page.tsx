import { getCurrentTenant } from "@/lib/auth/session";
import { getEnterpriseDashboardMetrics } from "@/features/enterprise";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function EnterpriseDashboardPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const metrics = await getEnterpriseDashboardMetrics(tenant.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Enterprise Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Revenue, MRR, ARR, churn, growth, subscriptions, and usage.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "MRR", value: `$${metrics.mrr.toFixed(2)}` },
          { label: "ARR", value: `$${metrics.arr.toFixed(2)}` },
          { label: "Active Clients", value: metrics.activeClients },
          { label: "Churn (inactive)", value: metrics.churn },
          { label: "Growth", value: metrics.growth },
          { label: "Plan", value: metrics.plan },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
