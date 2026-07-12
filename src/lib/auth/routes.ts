export function isCoachRole(role?: string | null): boolean {
  return role === "COACH" || role === "ASSISTANT_COACH";
}

export function isClientRole(role?: string | null): boolean {
  return role === "CLIENT";
}

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
