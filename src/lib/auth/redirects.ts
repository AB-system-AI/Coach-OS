import { redirect } from "next/navigation";
import { getCurrentTenant, getSession } from "@/lib/auth/session";
import {
  AUTH_PATHS,
  getRoleHomePath,
  isGuestOnlyRoute,
  isOnboardingRoute,
} from "@/lib/auth/routes";

function isSafeCallbackUrl(callbackUrl?: string | null): callbackUrl is string {
  return (
    !!callbackUrl &&
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//") &&
    !isGuestOnlyRoute(callbackUrl) &&
    !isOnboardingRoute(callbackUrl)
  );
}

/**
 * Single source of truth for where an authenticated user should land.
 * Coaches with incomplete onboarding always go to onboarding (never dashboard).
 */
export async function resolveAuthenticatedDestination(
  callbackUrl?: string | null
): Promise<string> {
  const session = await getSession();
  if (!session?.user) {
    return AUTH_PATHS.login;
  }

  const role = session.user.role as string | undefined;

  if (role === "SUPER_ADMIN") {
    return AUTH_PATHS.admin;
  }

  if (role === "CLIENT") {
    return isSafeCallbackUrl(callbackUrl) && callbackUrl.startsWith("/portal")
      ? callbackUrl
      : AUTH_PATHS.portal;
  }

  const tenant = await getCurrentTenant();
  if (!tenant || !tenant.onboardingCompleted) {
    return AUTH_PATHS.onboarding;
  }

  if (isSafeCallbackUrl(callbackUrl) && callbackUrl.startsWith("/dashboard")) {
    return callbackUrl;
  }

  return AUTH_PATHS.dashboard;
}

export async function redirectIfAuthenticated(
  callbackUrl?: string | null
): Promise<void> {
  const session = await getSession();
  if (!session?.user) return;

  redirect(await resolveAuthenticatedDestination(callbackUrl));
}

export async function requireOnboardingPageAccess() {
  const session = await getSession();
  if (!session?.user) {
    redirect(AUTH_PATHS.register);
  }

  const tenant = await getCurrentTenant();
  if (tenant?.onboardingCompleted) {
    redirect(AUTH_PATHS.dashboard);
  }

  return { session, tenant };
}

export async function requireCoachDashboardAccess() {
  const session = await getSession();
  if (!session?.user) {
    redirect(`${AUTH_PATHS.login}?callbackUrl=${encodeURIComponent(AUTH_PATHS.dashboard)}`);
  }

  const tenant = await getCurrentTenant();
  if (!tenant || !tenant.onboardingCompleted) {
    redirect(AUTH_PATHS.onboarding);
  }

  return tenant;
}

export { AUTH_PATHS, getRoleHomePath };
