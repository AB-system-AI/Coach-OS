import { redirect } from "next/navigation";
import { getCurrentTenant, getSession } from "@/lib/auth/session";

export const AUTH_PATHS = {
  login: "/login",
  register: "/register",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
  portal: "/portal",
  admin: "/admin",
} as const;

export const GUEST_ONLY_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/magic-link",
  "/invite",
] as const;

export const ONBOARDING_ROUTE = "/onboarding";

export function stripLocalePrefix(pathname: string): string {
  return pathname.replace(/^\/(en|ar)/, "") || "/";
}

export function isGuestOnlyRoute(pathname: string): boolean {
  const path = stripLocalePrefix(pathname);
  return GUEST_ONLY_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
}

export function isOnboardingRoute(pathname: string): boolean {
  const path = stripLocalePrefix(pathname);
  return path === ONBOARDING_ROUTE || path.startsWith(`${ONBOARDING_ROUTE}/`);
}

export function isProtectedRoute(pathname: string): boolean {
  const path = stripLocalePrefix(pathname);
  return (
    path.startsWith("/admin") ||
    path.startsWith("/dashboard") ||
    path.startsWith("/portal")
  );
}

function isSafeCallbackUrl(callbackUrl?: string | null): callbackUrl is string {
  return (
    !!callbackUrl &&
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//") &&
    !isGuestOnlyRoute(callbackUrl) &&
    !isOnboardingRoute(callbackUrl)
  );
}

/** Client-safe default home for a role (does not check onboarding). */
export function getRoleHomePath(
  role?: string | null,
  callbackUrl?: string | null
): string {
  if (isSafeCallbackUrl(callbackUrl)) {
    return callbackUrl;
  }

  switch (role) {
    case "SUPER_ADMIN":
      return AUTH_PATHS.admin;
    case "CLIENT":
      return AUTH_PATHS.portal;
    default:
      return AUTH_PATHS.dashboard;
  }
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
