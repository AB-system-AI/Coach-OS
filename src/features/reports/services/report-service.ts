import { db } from "@/lib/db";
import { subMonths, format } from "date-fns";

export type ReportPeriod = "7d" | "30d" | "90d" | "12m";

function getPeriodStart(period: ReportPeriod): Date {
  const now = new Date();
  switch (period) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "12m":
      return subMonths(now, 12);
  }
}

export async function getRevenueReport(tenantId: string, period: ReportPeriod) {
  const since = getPeriodStart(period);

  const [total, byMonth, byStatus] = await Promise.all([
    db.payment.aggregate({
      where: { tenantId, status: "COMPLETED", createdAt: { gte: since } },
      _sum: { amount: true },
      _count: true,
    }),
    db.payment.findMany({
      where: { tenantId, status: "COMPLETED", createdAt: { gte: since } },
      select: { amount: true, createdAt: true },
    }),
    db.payment.groupBy({
      by: ["status"],
      where: { tenantId, createdAt: { gte: since } },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const monthlyMap = new Map<string, number>();
  for (const p of byMonth) {
    const key = format(p.createdAt, "yyyy-MM");
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + Number(p.amount));
  }

  return {
    total: Number(total._sum.amount ?? 0),
    count: total._count,
    monthly: Array.from(monthlyMap.entries()).map(([month, amount]) => ({
      month,
      amount,
    })),
    byStatus: byStatus.map((s) => ({
      status: s.status,
      amount: Number(s._sum.amount ?? 0),
      count: s._count,
    })),
  };
}

export async function getClientsReport(tenantId: string, period: ReportPeriod) {
  const since = getPeriodStart(period);

  const [total, active, newClients, growth] = await Promise.all([
    db.clientProfile.count({ where: { tenantId } }),
    db.clientProfile.count({ where: { tenantId, isActive: true } }),
    db.clientProfile.count({ where: { tenantId, joinedAt: { gte: since } } }),
    db.clientProfile.findMany({
      where: { tenantId, joinedAt: { gte: since } },
      select: { joinedAt: true },
      orderBy: { joinedAt: "asc" },
    }),
  ]);

  const growthMap = new Map<string, number>();
  for (const c of growth) {
    const key = format(c.joinedAt, "yyyy-MM-dd");
    growthMap.set(key, (growthMap.get(key) ?? 0) + 1);
  }

  return {
    total,
    active,
    newClients,
    growth: Array.from(growthMap.entries()).map(([date, count]) => ({
      date,
      count,
    })),
  };
}

export async function getBookingsReport(tenantId: string, period: ReportPeriod) {
  const since = getPeriodStart(period);

  const [byStatus, recovery, attendance] = await Promise.all([
    db.booking.groupBy({
      by: ["status"],
      where: { tenantId, createdAt: { gte: since } },
      _count: true,
    }),
    db.booking.count({
      where: { tenantId, createdAt: { gte: since } },
    }),
    db.booking.count({
      where: {
        tenantId,
        status: "COMPLETED",
        createdAt: { gte: since },
      },
    }),
  ]);

  return {
    total: recovery,
    completed: attendance,
    attendanceRate: recovery > 0 ? Math.round((attendance / recovery) * 100) : 0,
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
  };
}

export async function getProgramsReport(tenantId: string) {
  const [total, active, enrollments] = await Promise.all([
    db.program.count({ where: { tenantId } }),
    db.program.count({ where: { tenantId, status: "ACTIVE" } }),
    db.programEnrollment.count({
      where: { program: { tenantId }, isActive: true },
    }),
  ]);

  const topPrograms = await db.program.findMany({
    where: { tenantId },
    select: {
      name: true,
      _count: { select: { enrollments: true } },
      price: true,
    },
    orderBy: { enrollments: { _count: "desc" } },
    take: 5,
  });

  return {
    total,
    active,
    enrollments,
    topPrograms: topPrograms.map((p) => ({
      name: p.name,
      enrollments: p._count.enrollments,
      price: Number(p.price),
    })),
  };
}

export async function getFullReport(tenantId: string, period: ReportPeriod = "30d") {
  const [revenue, clients, bookings, programs] = await Promise.all([
    getRevenueReport(tenantId, period),
    getClientsReport(tenantId, period),
    getBookingsReport(tenantId, period),
    getProgramsReport(tenantId),
  ]);

  return { revenue, clients, bookings, programs, period };
}
