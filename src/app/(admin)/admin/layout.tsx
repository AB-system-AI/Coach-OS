import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { requireRole } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("SUPER_ADMIN");

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
