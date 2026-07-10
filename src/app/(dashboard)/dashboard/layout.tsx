import { DashboardSidebar } from "@/features/coach-dashboard/components/dashboard-sidebar";
import { requireCoachDashboardAccess } from "@/lib/auth/redirects";
import { getEnabledModules } from "@/features/modules";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await requireCoachDashboardAccess();

  const enabledModules = await getEnabledModules(tenant.id);

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar enabledModules={enabledModules} />
      <div className="flex-1 md:ms-64">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/80 backdrop-blur-lg px-4 ps-16 md:px-6 md:ps-6">
          <span className="font-semibold truncate md:hidden">{tenant.name}</span>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {tenant.name}
            </span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
              {tenant.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
