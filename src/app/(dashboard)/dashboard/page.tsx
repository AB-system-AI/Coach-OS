import { requireCoachDashboardAccess } from "@/lib/auth/redirects";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calendar,
  CreditCard,
  Dumbbell,
  TrendingUp,
  Heart,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardOverviewPage() {
  const tenant = await requireCoachDashboardAccess();

  let clientCount = 0;
  let bookingCount = 0;
  let programCount = 0;
  let monthlyRevenue = 0;
  let statsUnavailable = false;

  try {
    const [clients, bookings, programs, recentPayments] = await Promise.all([
      db.clientProfile.count({ where: { tenantId: tenant.id, isActive: true } }),
      db.booking.count({
        where: {
          tenantId: tenant.id,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      }),
      db.program.count({ where: { tenantId: tenant.id, status: "ACTIVE" } }),
      db.payment.aggregate({
        where: {
          tenantId: tenant.id,
          status: "COMPLETED",
          createdAt: {
            gte: new Date(new Date().setDate(1)),
          },
        },
        _sum: { amount: true },
      }),
    ]);
    clientCount = clients;
    bookingCount = bookings;
    programCount = programs;
    monthlyRevenue = Number(recentPayments._sum.amount ?? 0);
  } catch (error) {
    console.error("[CoachOS] Dashboard overview stats failed:", error);
    statsUnavailable = true;
  }

  const stats = [
    {
      title: "Active Clients",
      value: clientCount.toString(),
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Upcoming Bookings",
      value: bookingCount.toString(),
      icon: Calendar,
      color: "text-green-500",
    },
    {
      title: "Active Programs",
      value: programCount.toString(),
      icon: Dumbbell,
      color: "text-orange-500",
    },
    {
      title: "Revenue This Month",
      value: formatCurrency(monthlyRevenue),
      icon: CreditCard,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with {tenant.name} today.
        </p>
        {statsUnavailable && (
          <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
            Live stats are temporarily unavailable. Quick actions and navigation still work.
          </p>
        )}
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
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              { label: "Add a new client", href: "/dashboard/clients" },
              { label: "Create a program", href: "/dashboard/programs" },
              { label: "Set up recovery services", href: "/dashboard/recovery" },
              { label: "Customize your website", href: "/dashboard/website" },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-muted transition-colors"
              >
                {action.label}
                <span className="text-muted-foreground">→</span>
              </a>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { task: "Complete your profile", done: false },
              { task: "Customize your website theme", done: false },
              { task: "Add your first recovery service", done: false },
              { task: "Invite your first client", done: false },
            ].map((item) => (
              <div
                key={item.task}
                className="flex items-center gap-3 text-sm"
              >
                <div
                  className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                    item.done
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground"
                  }`}
                >
                  {item.done && <span className="text-xs">✓</span>}
                </div>
                <span
                  className={
                    item.done ? "line-through text-muted-foreground" : ""
                  }
                >
                  {item.task}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
