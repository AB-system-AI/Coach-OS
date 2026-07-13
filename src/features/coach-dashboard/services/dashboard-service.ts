import { db } from "@/lib/db";
import { startOfDay, endOfDay, startOfMonth, subDays, format } from "date-fns";

export type CoachDashboardData = {
  todaySessions: number;
  todayRevenue: number;
  monthlyRevenue: number;
  newClientsThisMonth: number;
  activeClients: number;
  clientGrowthPercent: number;
  upcomingAppointments: Array<{
    id: string;
    title: string;
    startTime: Date;
    clientName: string | null;
  }>;
  recentPayments: Array<{
    id: string;
    amount: number;
    clientName: string | null;
    createdAt: Date;
  }>;
  unreadNotifications: number;
  subscriptionStatus: string;
  subscriptionPlan: string;
  trialEndsAt: Date | null;
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    createdAt: Date;
  }>;
  revenueChart: Array<{ date: string; revenue: number }>;
  clientGrowthChart: Array<{ date: string; clients: number }>;
  websiteUrl: string;
  marketplaceScore: number;
  profileCompletion: number;
  hasClients: boolean;
  hasPrograms: boolean;
  hasBookings: boolean;
  hasWebsite: boolean;
};

export async function getCoachDashboardData(
  tenantId: string,
  tenantSlug: string
): Promise<CoachDashboardData> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const thirtyDaysAgo = subDays(now, 30);

  const [
    todayBookings,
    todayPayments,
    monthlyPayments,
    newClients,
    activeClients,
    clientsLastMonth,
    upcomingBookings,
    recentPayments,
    unreadNotifications,
    subscription,
    tenant,
    programs,
    faqCount,
    marketplaceProfile,
  ] = await Promise.all([
    db.booking.count({
      where: {
        tenantId,
        date: { gte: todayStart, lte: todayEnd },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),
    db.payment.aggregate({
      where: {
        tenantId,
        status: "COMPLETED",
        createdAt: { gte: todayStart, lte: todayEnd },
      },
      _sum: { amount: true },
    }),
    db.payment.aggregate({
      where: {
        tenantId,
        status: "COMPLETED",
        createdAt: { gte: monthStart },
      },
      _sum: { amount: true },
    }),
    db.clientProfile.count({
      where: { tenantId, joinedAt: { gte: monthStart } },
    }),
    db.clientProfile.count({ where: { tenantId, isActive: true } }),
    db.clientProfile.count({
      where: {
        tenantId,
        joinedAt: { gte: subDays(monthStart, 30), lt: monthStart },
      },
    }),
    db.booking.findMany({
      where: {
        tenantId,
        date: { gte: todayStart },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 5,
      include: {
        user: { select: { name: true } },
        service: { select: { name: true } },
      },
    }),
    db.payment.findMany({
      where: { tenantId, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true } },
      },
    }),
    db.notification.count({
      where: { tenantId, isRead: false },
    }),
    db.tenantSubscription.findUnique({ where: { tenantId } }),
    db.tenant.findUnique({
      where: { id: tenantId },
      select: { trialEndsAt: true, onboardingCompleted: true },
    }),
    db.program.count({ where: { tenantId } }),
    db.faq.count({ where: { tenantId } }),
    db.coachMarketplaceProfile.findUnique({ where: { tenantId } }),
  ]);

  const paymentsLast30 = await db.payment.findMany({
    where: {
      tenantId,
      status: "COMPLETED",
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { amount: true, createdAt: true },
  });

  const revenueByDay = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = subDays(now, i);
    revenueByDay.set(format(d, "MMM d"), 0);
  }
  for (const p of paymentsLast30) {
    const key = format(p.createdAt, "MMM d");
    if (revenueByDay.has(key)) {
      revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + Number(p.amount));
    }
  }

  const clientGrowthChart = await Promise.all(
    Array.from({ length: 6 }, async (_, i) => {
      const monthDate = subDays(monthStart, (5 - i) * 30);
      const count = await db.clientProfile.count({
        where: { tenantId, joinedAt: { lte: monthDate } },
      });
      return { date: format(monthDate, "MMM"), clients: count };
    })
  );

  const recentClients = await db.clientProfile.findMany({
    where: { tenantId },
    orderBy: { joinedAt: "desc" },
    take: 3,
    include: { user: { select: { name: true } } },
  });

  const recentActivity = [
    ...recentPayments.slice(0, 2).map((p) => ({
      id: p.id,
      type: "payment",
      message: `Payment received${p.user?.name ? ` from ${p.user.name}` : ""}`,
      createdAt: p.createdAt,
    })),
    ...recentClients.map((c) => ({
      id: c.id,
      type: "client",
      message: `New client joined${c.user?.name ? `: ${c.user.name}` : ""}`,
      createdAt: c.joinedAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const profileFields = [
    marketplaceProfile?.headline,
    marketplaceProfile?.bio,
    marketplaceProfile?.country,
    marketplaceProfile?.specialties?.length,
    marketplaceProfile?.startingPrice,
  ];
  const profileCompletion = Math.round(
    (profileFields.filter(Boolean).length / profileFields.length) * 100
  );

  const marketplaceScore = Math.min(
    100,
    profileCompletion +
      (marketplaceProfile?.isVisible ? 20 : 0) +
      (marketplaceProfile?.instantBooking ? 10 : 0)
  );

  const clientGrowthPercent =
    clientsLastMonth > 0
      ? Math.round(((newClients - clientsLastMonth) / clientsLastMonth) * 100)
      : newClients > 0
        ? 100
        : 0;

  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "coachos.app";

  return {
    todaySessions: todayBookings,
    todayRevenue: Number(todayPayments._sum.amount ?? 0),
    monthlyRevenue: Number(monthlyPayments._sum.amount ?? 0),
    newClientsThisMonth: newClients,
    activeClients,
    clientGrowthPercent,
    upcomingAppointments: upcomingBookings.map((b) => ({
      id: b.id,
      title: b.service?.name ?? "Session",
      startTime: b.date,
      clientName: b.user?.name ?? null,
    })),
    recentPayments: recentPayments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      clientName: p.user?.name ?? null,
      createdAt: p.createdAt,
    })),
    unreadNotifications,
    subscriptionStatus: subscription?.status ?? "TRIALING",
    subscriptionPlan: subscription?.plan ?? "STARTER",
    trialEndsAt: tenant?.trialEndsAt ?? null,
    recentActivity,
    revenueChart: Array.from(revenueByDay.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    })),
    clientGrowthChart,
    websiteUrl: `https://${tenantSlug}.${platformDomain}`,
    marketplaceScore,
    profileCompletion,
    hasClients: activeClients > 0,
    hasPrograms: programs > 0,
    hasBookings: todayBookings > 0 || upcomingBookings.length > 0,
    hasWebsite: faqCount > 0 || tenant?.onboardingCompleted === true,
  };
}
