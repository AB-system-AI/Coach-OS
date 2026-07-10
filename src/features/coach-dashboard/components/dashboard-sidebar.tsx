"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import {
  CORE_NAV,
  MODULE_NAV,
  SETTINGS_NAV,
  filterNavByModules,
} from "@/features/coach-dashboard/config/nav-config";
import type { TenantModuleKey } from "@prisma/client";
import { Dumbbell, LogOut, Menu, X } from "lucide-react";
import { useState, useMemo } from "react";

const LABEL_FALLBACKS: Record<string, string> = {
  enterprise: "Enterprise",
  branding: "Branding",
  domains: "Domains",
  clients: "Clients",
  progress: "Progress",
  courses: "Courses",
  shop: "Shop",
  crm: "CRM",
  digitalProducts: "Digital Products",
  loyalty: "Loyalty",
  challenges: "Challenges",
  community: "Community",
  automation: "Automation",
  marketing: "Marketing",
  marketplace: "Marketplace",
  files: "Files",
  enterprise: "Enterprise",
  finance: "Finance",
  staff: "Staff",
  attendance: "Attendance",
  "smart-calendar": "Smart Calendar",
  forms: "Forms",
  "automation-builder": "Automation Builder",
  "voice-notes": "Voice Notes",
  "media-pro": "Media Pro",
  audit: "Audit",
  backup: "Backup",
  "theme-builder": "Theme Builder",
  "landing-builder": "Landing Builder",
  "email-builder": "Email Builder",
  "invoice-designer": "Invoice Designer",
  integrations: "Integrations",
  gamification: "Gamification",
  "multi-brand": "Multi Brand",
  franchise: "Franchise",
  pos: "POS",
  inventory: "Inventory",
  payroll: "Payroll",
  "membership-cards": "Membership Cards",
  affiliate: "Affiliate",
  notifications: "Notifications",
  help: "Help Center",
  security: "Security",
  "client-app": "Client App",
  "mobile-api": "Mobile API",
};

type DashboardSidebarProps = {
  enabledModules: TenantModuleKey[];
};

export function DashboardSidebar({ enabledModules }: DashboardSidebarProps) {
  const t = useTranslations("dashboard");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(() => {
    const enabled = new Set(enabledModules);
    return [
      ...CORE_NAV,
      ...filterNavByModules(MODULE_NAV, enabled),
      ...SETTINGS_NAV,
    ];
  }, [enabledModules]);

  function label(key: string) {
    try {
      return t(key as "overview");
    } catch {
      return LABEL_FALLBACKS[key] ?? key;
    }
  }

  async function handleSignOut() {
    await signOut();
    window.location.href = "/";
  }

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Dumbbell className="h-4 w-4" />
        </div>
        <span className="font-bold">TrainerOS</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <>
      <button
        className="fixed top-4 start-4 z-50 md:hidden p-2 rounded-lg bg-background border shadow"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-40 flex w-64 flex-col border-e bg-background transition-transform md:translate-x-0",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full rtl:translate-x-full rtl:md:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
