import { getCurrentTenant } from "@/lib/auth/session";
import { getFullReport, getRevenueReport, getClientsReport } from "@/features/reports";
import { ReportsDashboard } from "@/features/reports/components/reports-dashboard";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; export?: string }>;
}) {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const { period = "30d" } = await searchParams;
  const validPeriod = ["7d", "30d", "90d", "12m"].includes(period)
    ? (period as "7d" | "30d" | "90d" | "12m")
    : "30d";

  const report = await getFullReport(tenant.id, validPeriod);

  const mrrResult = await db.payment.aggregate({
    where: { tenantId: tenant.id, status: "COMPLETED" },
    _sum: { amount: true },
  });

  const mrr = Number(mrrResult._sum.amount ?? 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">Revenue, clients, bookings, and growth analytics.</p>
        </div>
        <div className="flex items-center gap-2">
          <form method="get" className="flex gap-2">
            {(["7d", "30d", "90d", "12m"] as const).map((p) => (
              <button
                key={p}
                name="period"
                value={p}
                type="submit"
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  validPeriod === p
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-input hover:bg-muted"
                }`}
              >
                {p}
              </button>
            ))}
          </form>
          <a
            href={`/api/v1/reports/export?tenantId=${tenant.id}&period=${validPeriod}&type=revenue`}
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-md border border-input hover:bg-muted"
          >
            Export CSV
          </a>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Revenue ({validPeriod})</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(report.revenue.total)}</div>
            <p className="text-xs text-muted-foreground">{report.revenue.count} payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">MRR</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mrr)}</div>
            <p className="text-xs text-muted-foreground">ARR: {formatCurrency(mrr * 12)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Clients</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.clients.active}</div>
            <p className="text-xs text-muted-foreground">+{report.clients.newClients} new</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Bookings</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.bookings.total}</div>
            <p className="text-xs text-muted-foreground">{report.bookings.attendanceRate}% attendance</p>
          </CardContent>
        </Card>
      </div>

      <ReportsDashboard report={report} />
    </div>
  );
}
