import { DashboardSidebar } from "@/features/coach-dashboard/components/dashboard-sidebar";
import { getCurrentTenant } from "@/lib/auth/session";
import { getEnabledModules } from "@/features/modules";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    redirect("/register");
  }

  if (!tenant.onboardingCompleted) {
    redirect("/onboarding");
  }

  const enabledModules = await getEnabledModules(tenant.id);

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar enabledModules={enabledModules} />
      <div className="flex-1 md:ms-64">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/80 backdrop-blur-lg px-6">
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
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
