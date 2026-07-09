import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { subDays, format } from "date-fns";

export default async function AdminAnalyticsPage() {
  await requireRole("SUPER_ADMIN");

  const since30d = subDays(new Date(), 30);
  const since7d = subDays(new Date(), 7);

  const [
    totalTenants,
    activeTenants,
    newTenants7d,
    totalRevenue,
    revenue30d,
    topTenants,
    eventsByType,
    recentPayments,
  ] = await Promise.all([
    db.tenant.count(),
    db.tenant.count({ where: { status: "ACTIVE" } }),
    db.tenant.count({ where: { createdAt: { gte: since7d } } }),
    db.payment.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
    db.payment.aggregate({
      where: { status: "COMPLETED", createdAt: { gte: since30d } },
      _sum: { amount: true },
      _count: true,
    }),
    db.tenant.findMany({
      take: 10,
      orderBy: { clients: { _count: "desc" } },
      include: {
        _count: { select: { clients: true, members: true } },
        subscription: { select: { plan: true } },
      },
    }),
    db.analyticsEvent.groupBy({
      by: ["event"],
      _count: { event: true },
      where: { createdAt: { gte: since30d } },
      orderBy: { _count: { event: "desc" } },
      take: 10,
    }),
    db.payment.findMany({
      where: { status: "COMPLETED", createdAt: { gte: since30d } },
      select: { amount: true, createdAt: true, tenant: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const mrr = Number(totalRevenue._sum.amount ?? 0);
  const arr = mrr * 12;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <p className="text-muted-foreground mt-1">Revenue, tenants, and platform usage.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Tenants</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalTenants}</div><p className="text-xs text-muted-foreground">{activeTenants} active</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">New (7d)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{newTenants7d}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Revenue (30d)</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(Number(revenue30d._sum.amount ?? 0))}</div>
            <p className="text-xs text-muted-foreground">{revenue30d._count} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">MRR / ARR</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mrr)}</div>
            <p className="text-xs text-muted-foreground">ARR: {formatCurrency(arr)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top Tenants by Clients</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {topTenants.map((t) => (
              <div key={t.id} className="flex justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.slug} · {t.subscription?.plan ?? "FREE"}</p>
                </div>
                <div className="text-end">
                  <p className="font-medium">{t._count.clients} clients</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Analytics Events (30d)</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {eventsByType.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">No analytics events recorded yet.</p>
            )}
            {eventsByType.map((e) => (
              <div key={e.event} className="flex justify-between py-3 text-sm">
                <span className="font-mono text-xs">{e.event}</span>
                <span className="font-medium">{e._count.event}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Payments</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {recentPayments.map((p) => (
            <div key={p.createdAt.toISOString() + p.tenant?.name} className="flex justify-between py-3 text-sm">
              <div>
                <p className="font-medium">{p.tenant?.name ?? "Unknown"}</p>
                <p className="text-xs text-muted-foreground">{format(p.createdAt, "MMM d, yyyy")}</p>
              </div>
              <span className="font-medium">{formatCurrency(Number(p.amount))}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
