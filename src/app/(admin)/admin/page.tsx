import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, TrendingUp, Globe } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const [tenantCount, activeTenants, trialTenants, totalRevenue] =
    await Promise.all([
      db.tenant.count(),
      db.tenant.count({ where: { status: "ACTIVE" } }),
      db.tenant.count({ where: { status: "TRIAL" } }),
      db.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
    ]);

  const stats = [
    { title: "Total Coaches", value: tenantCount, icon: Users },
    { title: "Active", value: activeTenants, icon: TrendingUp },
    { title: "On Trial", value: trialTenants, icon: Globe },
    {
      title: "Platform Revenue",
      value: formatCurrency(Number(totalRevenue._sum.amount ?? 0)),
      icon: CreditCard,
    },
  ];

  const recentTenants = await db.tenant.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      members: {
        where: { role: "COACH" },
        include: { user: { select: { name: true, email: true } } },
      },
      subscription: true,
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Platform Overview</h1>
        <p className="text-muted-foreground mt-1">
          Monitor and manage the CoachOS platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Coaches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTenants.map((tenant) => {
              const coach = tenant.members[0]?.user;
              return (
                <div
                  key={tenant.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{tenant.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {coach?.email ?? "—"}
                    </p>
                  </div>
                  <div className="text-end">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        tenant.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : tenant.status === "TRIAL"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {tenant.status}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tenant.plan}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
