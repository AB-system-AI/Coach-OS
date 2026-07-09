import { getSystemHealthMetrics } from "@/features/enterprise";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SystemHealthPage() {
  const health = await getSystemHealthMetrics();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">System Health</h1>
        <p className="text-muted-foreground mt-1">
          CPU, memory, storage, cron jobs, queues, and logs.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "CPU", value: `${health.cpu}%` },
          { label: "Memory", value: `${health.memory}%` },
          { label: "Storage", value: `${health.storage}%` },
          { label: "Active Tenants", value: health.activeTenants },
          { label: "Cron Jobs (24h)", value: health.cronJobs24h },
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
