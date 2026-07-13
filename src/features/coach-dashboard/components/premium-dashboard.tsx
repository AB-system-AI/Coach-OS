"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import type { CoachDashboardData } from "@/features/coach-dashboard/services/dashboard-service";
import {
  Users,
  Calendar,
  CreditCard,
  TrendingUp,
  Bell,
  Sparkles,
  Globe,
  Store,
  UserPlus,
  Dumbbell,
  ArrowRight,
  Zap,
  CheckCircle2,
  Circle,
} from "lucide-react";

type PremiumDashboardProps = {
  businessName: string;
  brandColor: string;
  data: CoachDashboardData;
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  href?: string;
}) {
  const content = (
    <Card className="relative overflow-hidden border-0 bg-background/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300 group">
      <div
        className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"
        style={{ background: color }}
      />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}18`, color }}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}

export function PremiumDashboard({ businessName, brandColor, data }: PremiumDashboardProps) {
  const checklist = [
    { task: "Invite your first client", done: data.hasClients, href: "/dashboard/clients" },
    { task: "Create a coaching program", done: data.hasPrograms, href: "/dashboard/programs" },
    { task: "Set up your coach website", done: data.hasWebsite, href: "/dashboard/website" },
    { task: "Schedule your first session", done: data.hasBookings, href: "/dashboard/bookings" },
  ];

  const quickActions = [
    { label: "Add Client", href: "/dashboard/clients", icon: UserPlus },
    { label: "New Program", href: "/dashboard/programs", icon: Dumbbell },
    { label: "Book Session", href: "/dashboard/bookings", icon: Calendar },
    { label: "Coach Website", href: "/dashboard/website", icon: Globe },
  ];

  const healthScore = Math.round(
    (checklist.filter((c) => c.done).length / checklist.length) * 100
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coach Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back — here&apos;s how {businessName} is performing today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="capitalize"
            style={{ borderColor: `${brandColor}40`, color: brandColor }}
          >
            {data.subscriptionPlan.toLowerCase()} · {data.subscriptionStatus.toLowerCase()}
          </Badge>
          {data.unreadNotifications > 0 && (
            <Badge className="gap-1" style={{ backgroundColor: brandColor }}>
              <Bell className="h-3 w-3" />
              {data.unreadNotifications}
            </Badge>
          )}
        </div>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Sessions"
          value={data.todaySessions.toString()}
          icon={Calendar}
          color={brandColor}
          href="/dashboard/bookings"
        />
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(data.todayRevenue)}
          icon={CreditCard}
          color="#10b981"
          href="/dashboard/payments"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(data.monthlyRevenue)}
          subtitle={`${data.newClientsThisMonth} new clients`}
          icon={TrendingUp}
          color="#8b5cf6"
          href="/dashboard/reports"
        />
        <StatCard
          title="Active Clients"
          value={data.activeClients.toString()}
          subtitle={
            data.clientGrowthPercent !== 0
              ? `${data.clientGrowthPercent > 0 ? "+" : ""}${data.clientGrowthPercent}% growth`
              : "Growing your roster"
          }
          icon={Users}
          color="#f59e0b"
          href="/dashboard/clients"
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          <Card className="border-0 bg-background/60 backdrop-blur-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.revenueChart}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={brandColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={brandColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <Tooltip
                    formatter={(v: number) => [formatCurrency(v), "Revenue"]}
                    contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={brandColor}
                    fill="url(#revenueGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 bg-background/60 backdrop-blur-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Upcoming Appointments</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/bookings">
                  View all <ArrowRight className="h-3.5 w-3.5 ms-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.upcomingAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  No upcoming sessions — book your first appointment
                </div>
              ) : (
                data.upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between rounded-xl border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{apt.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {apt.clientName ?? "Client"} · {format(new Date(apt.startTime), "EEE, MMM d · h:mm a")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="space-y-6">
          <Card className="border-0 bg-background/60 backdrop-blur-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4" style={{ color: brandColor }} />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 rounded-xl border p-3 text-sm hover:bg-muted/50 transition-all hover:shadow-sm"
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    {action.label}
                    <ArrowRight className="h-3.5 w-3.5 ms-auto text-muted-foreground" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-0 bg-background/60 backdrop-blur-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Business Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Setup progress</span>
                  <span className="font-medium">{healthScore}%</span>
                </div>
                <Progress value={healthScore} className="h-2" />
              </div>
              {checklist.map((item) => (
                <Link
                  key={item.task}
                  href={item.href}
                  className="flex items-center gap-3 text-sm group"
                >
                  {item.done ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary" />
                  )}
                  <span className={item.done ? "line-through text-muted-foreground" : ""}>
                    {item.task}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 bg-background/60 backdrop-blur-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Store className="h-4 w-4" />
                Marketplace
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Profile completion</span>
                <span className="font-medium">{data.profileCompletion}%</span>
              </div>
              <Progress value={data.profileCompletion} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Marketplace score</span>
                <span className="font-medium">{data.marketplaceScore}/100</span>
              </div>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/settings/marketplace">Improve Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={item}>
          <Card className="border-0 bg-background/60 backdrop-blur-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Client Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.clientGrowthChart}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8 }} />
                  <Bar dataKey="clients" fill={brandColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 bg-background/60 backdrop-blur-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Activity will appear as you work with clients
                </p>
              ) : (
                data.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 text-sm">
                    <div
                      className="mt-0.5 h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: brandColor }}
                    />
                    <div>
                      <p>{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card
          className="border-0 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${brandColor}12, ${brandColor}05)`,
          }}
        >
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: brandColor }}
              >
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Platform Tip</p>
                <p className="text-sm text-muted-foreground">
                  Your coach website is live at{" "}
                  <a
                    href={data.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                    style={{ color: brandColor }}
                  >
                    {data.websiteUrl.replace("https://", "")}
                  </a>
                </p>
              </div>
            </div>
            <Button asChild style={{ backgroundColor: brandColor }}>
              <a href={data.websiteUrl} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4 me-2" />
                View Coach Website
              </a>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
