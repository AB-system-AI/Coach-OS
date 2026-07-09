"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Globe,
  HardDrive,
  ScrollText,
  HeadphonesIcon,
  Megaphone,
  Flag,
  LogOut,
  Shield,
} from "lucide-react";

const adminNav = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Coaches", href: "/admin/coaches", icon: Users },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Domains", href: "/admin/domains", icon: Globe },
  { label: "Storage", href: "/admin/storage", icon: HardDrive },
  { label: "Logs", href: "/admin/logs", icon: ScrollText },
  { label: "Support", href: "/admin/support", icon: HeadphonesIcon },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { label: "Feature Flags", href: "/admin/feature-flags", icon: Flag },
  { label: "System Health", href: "/admin/system-health", icon: Shield },
];

export function AdminSidebar() {
  const pathname = usePathname();

  async function handleSignOut() {
    await signOut();
    window.location.href = "/";
  }

  return (
    <aside className="fixed inset-y-0 start-0 z-40 flex w-64 flex-col border-e bg-background">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive text-destructive-foreground">
          <Shield className="h-4 w-4" />
        </div>
        <div>
          <span className="font-bold text-sm">CoachOS</span>
          <span className="block text-xs text-muted-foreground">Super Admin</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {adminNav.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
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
    </aside>
  );
}
