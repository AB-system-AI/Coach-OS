"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type ReportsDashboardProps = {
  report: Awaited<ReturnType<typeof import("@/features/reports").getFullReport>>;
};

export function ReportsDashboard({ report }: ReportsDashboardProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1">
          Revenue, clients, bookings, and growth analytics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Revenue"
          value={formatCurrency(report.revenue.total)}
          subtitle={`${report.revenue.count} payments`}
        />
        <StatCard
          title="Active Clients"
          value={String(report.clients.active)}
          subtitle={`${report.clients.newClients} new this period`}
        />
        <StatCard
          title="Bookings"
          value={String(report.bookings.total)}
          subtitle={`${report.bookings.attendanceRate}% attendance`}
        />
        <StatCard
          title="Programs"
          value={String(report.programs.active)}
          subtitle={`${report.programs.enrollments} enrollments`}
        />
      </div>

      {report.revenue.monthly.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={report.revenue.monthly}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {report.clients.growth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Client Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={report.clients.growth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {report.programs.topPrograms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.programs.topPrograms.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {p.enrollments} enrollments
                    </p>
                  </div>
                  <span className="font-semibold text-primary">
                    {formatCurrency(p.price)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
