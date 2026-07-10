import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { getSession } from "@/lib/auth/session";
import {
  AUTH_PATHS,
  resolveAuthenticatedDestination,
} from "@/lib/auth/redirects";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect(`${AUTH_PATHS.login}?callbackUrl=${encodeURIComponent(AUTH_PATHS.admin)}`);
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "SUPER_ADMIN") {
    redirect(await resolveAuthenticatedDestination());
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 md:ms-64">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/80 backdrop-blur-lg px-6">
          <h1 className="text-lg font-semibold">Platform Administration</h1>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
