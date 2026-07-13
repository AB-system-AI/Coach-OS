import { requireCoachDashboardAccess } from "@/lib/auth/redirects";
import { db } from "@/lib/db";
import { getCoachDashboardData } from "@/features/coach-dashboard/services/dashboard-service";
import { PremiumDashboard } from "@/features/coach-dashboard/components/premium-dashboard";

export default async function DashboardOverviewPage() {
  const tenant = await requireCoachDashboardAccess();

  let dashboardData;
  let statsUnavailable = false;

  try {
    dashboardData = await getCoachDashboardData(tenant.id, tenant.slug);
  } catch (error) {
    console.error("[CoachOS] Dashboard overview stats failed:", error);
    statsUnavailable = true;
    dashboardData = {
      todaySessions: 0,
      todayRevenue: 0,
      monthlyRevenue: 0,
      newClientsThisMonth: 0,
      activeClients: 0,
      clientGrowthPercent: 0,
      upcomingAppointments: [],
      recentPayments: [],
      unreadNotifications: 0,
      subscriptionStatus: "TRIALING",
      subscriptionPlan: tenant.plan ?? "STARTER",
      trialEndsAt: tenant.trialEndsAt,
      recentActivity: [],
      revenueChart: [],
      clientGrowthChart: [],
      websiteUrl: `https://${tenant.slug}.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "coachos.app"}`,
      marketplaceScore: 0,
      profileCompletion: 0,
      hasClients: false,
      hasPrograms: false,
      hasBookings: false,
      hasWebsite: tenant.onboardingCompleted,
    };
  }

  const theme = await db.tenantTheme.findUnique({
    where: { tenantId: tenant.id },
    select: { primaryColor: true },
  });

  const brandColor = theme?.primaryColor ?? "#6366f1";

  return (
    <div className="relative">
      {statsUnavailable && (
        <p className="mb-4 text-sm text-amber-600 dark:text-amber-400">
          Some live stats are temporarily unavailable. Your dashboard and navigation still work.
        </p>
      )}
      <PremiumDashboard
        businessName={tenant.name}
        brandColor={brandColor}
        data={dashboardData}
      />
    </div>
  );
}
