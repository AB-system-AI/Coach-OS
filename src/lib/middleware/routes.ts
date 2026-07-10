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
