import { redirect } from "next/navigation";
import { getCurrentTenant, getSession, resolveSessionUserRole } from "@/lib/auth/session";
import { isEmailVerified } from "@/lib/auth/email-verification";
import {
  AUTH_PATHS,
  getRoleHomePath,
  isClientRole,
  isCoachRole,
  isGuestOnlyRoute,
  isOnboardingRoute,
} from "@/lib/auth/routes";
import type { TenantWithRelations } from "@/features/tenancy/types";

async function safeGetCurrentTenant(): Promise<TenantWithRelations | null> {
  try {
    return await getCurrentTenant();
  } catch (error) {
    console.error("[CoachOS] Tenant lookup failed during redirect:", error);
    return null;
  }
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

function isRoleScopedCallback(
  role: string | null,
  callbackUrl: string
): boolean {
  if (role === "SUPER_ADMIN") return callbackUrl.startsWith("/admin");
  if (isClientRole(role)) return callbackUrl.startsWith("/portal");
  if (isCoachRole(role)) return callbackUrl.startsWith("/dashboard");
  return false;
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

  if (!isEmailVerified(session.user)) {
    return "/verify-email";
  }

  const role = await resolveSessionUserRole(session.user);

  if (role === "SUPER_ADMIN") {
    return isSafeCallbackUrl(callbackUrl) && isRoleScopedCallback(role, callbackUrl)
      ? callbackUrl
      : AUTH_PATHS.admin;
  }

  if (isClientRole(role)) {
    return isSafeCallbackUrl(callbackUrl) && callbackUrl.startsWith("/portal")
      ? callbackUrl
      : AUTH_PATHS.portal;
  }

  if (isCoachRole(role)) {
    const tenant = await safeGetCurrentTenant();
    if (!tenant || !tenant.onboardingCompleted) {
      return AUTH_PATHS.onboarding;
    }

    if (isSafeCallbackUrl(callbackUrl) && callbackUrl.startsWith("/dashboard")) {
      return callbackUrl;
    }

    return AUTH_PATHS.dashboard;
  }

  return getRoleHomePath(role, callbackUrl);
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

  if (!isEmailVerified(session.user)) {
    redirect("/verify-email");
  }

  const role = await resolveSessionUserRole(session.user);
  if (!isCoachRole(role)) {
    redirect(await resolveAuthenticatedDestination());
  }

  const tenant = await safeGetCurrentTenant();
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

  if (!isEmailVerified(session.user)) {
    redirect("/verify-email");
  }

  const role = await resolveSessionUserRole(session.user);
  if (role === "SUPER_ADMIN") {
    redirect(AUTH_PATHS.admin);
  }
  if (isClientRole(role)) {
    redirect(AUTH_PATHS.portal);
  }

  const tenant = await safeGetCurrentTenant();
  if (!tenant || !tenant.onboardingCompleted) {
    redirect(AUTH_PATHS.onboarding);
  }

  return tenant;
}

export { AUTH_PATHS, getRoleHomePath };
