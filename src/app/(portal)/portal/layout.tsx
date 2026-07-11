import { getSession } from "@/lib/auth/session";
import { AUTH_PATHS, resolveAuthenticatedDestination } from "@/lib/auth/redirects";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ServiceUnavailablePage } from "@/components/deployment/service-unavailable-screen";
import { getProtectedRouteUnavailableProps } from "@/lib/deployment/guards";
import { ServiceUnavailableError } from "@/lib/deployment/errors";
import {
  LayoutDashboard,
  Dumbbell,
  Salad,
  TrendingUp,
  Calendar,
  Receipt,
  Bell,
  MessageSquare,
  Download,
  Award,
  LogOut,
} from "lucide-react";

const portalNav = [
  { label: "Dashboard", href: "/portal", icon: LayoutDashboard },
  { label: "Programs", href: "/portal/programs", icon: Dumbbell },
  { label: "Meals", href: "/portal/meals", icon: Salad },
  { label: "Progress", href: "/portal/progress", icon: TrendingUp },
  { label: "Bookings", href: "/portal/bookings", icon: Calendar },
  { label: "Invoices", href: "/portal/invoices", icon: Receipt },
  { label: "Notifications", href: "/portal/notifications", icon: Bell },
  { label: "Messages", href: "/portal/messages", icon: MessageSquare },
  { label: "Downloads", href: "/portal/downloads", icon: Download },
  { label: "Certificates", href: "/portal/certificates", icon: Award },
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const unavailable = await getProtectedRouteUnavailableProps();
  if (unavailable) {
    return <ServiceUnavailablePage {...unavailable} />;
  }

  try {
    const session = await getSession();
    if (!session?.user) {
      redirect(`${AUTH_PATHS.login}?callbackUrl=${encodeURIComponent(AUTH_PATHS.portal)}`);
    }

    if (session.user.role !== "CLIENT") {
      redirect(await resolveAuthenticatedDestination());
    }

    const membership = await db.tenantMember.findFirst({
      where: { userId: session.user.id, role: "CLIENT", isActive: true },
      include: { tenant: { include: { theme: true } } },
    });

    if (!membership) {
      redirect(AUTH_PATHS.login);
    }

    const tenant = membership.tenant;

    return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden md:flex w-64 flex-col border-r bg-background fixed inset-y-0">
        <div className="flex h-16 items-center border-b px-6">
          <span className="font-bold text-lg truncate">{tenant.name}</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {portalNav.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
              {session.user.name?.charAt(0)?.toUpperCase() ?? "C"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
            </div>
          </div>
          <Link
            href="/api/auth/sign-out"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Link>
        </div>
      </aside>

      <div className="flex-1 md:ms-64">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/80 backdrop-blur-lg px-6 md:hidden">
          <span className="font-bold">{tenant.name}</span>
          <span className="ms-auto text-sm text-muted-foreground">{session.user.name}</span>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
    );
  } catch (error) {
    if (error instanceof ServiceUnavailableError) {
      return (
        <ServiceUnavailablePage
          service={error.service}
          title="Client portal temporarily unavailable"
          description="We could not load your portal. Please try again shortly."
        />
      );
    }
    throw error;
  }
}
