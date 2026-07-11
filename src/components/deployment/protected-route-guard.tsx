import { ServiceUnavailablePage } from "@/components/deployment/service-unavailable-screen";
import { getProtectedRouteUnavailableProps } from "@/lib/deployment/guards";

type ProtectedRouteGuardProps = {
  children: React.ReactNode;
};

/**
 * Renders a maintenance screen when core services (database/auth) are unavailable.
 * Used by protected layouts before any database queries run.
 */
export async function ProtectedRouteGuard({ children }: ProtectedRouteGuardProps) {
  const unavailable = await getProtectedRouteUnavailableProps();
  if (unavailable) {
    return <ServiceUnavailablePage {...unavailable} />;
  }
  return <>{children}</>;
}
