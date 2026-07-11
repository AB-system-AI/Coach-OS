import { PlatformHeader } from "@/components/layout/platform-header";
import { ProtectedRouteGuard } from "@/components/deployment/protected-route-guard";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PlatformHeader />
      <main className="flex-1">
        <ProtectedRouteGuard>{children}</ProtectedRouteGuard>
      </main>
    </div>
  );
}
