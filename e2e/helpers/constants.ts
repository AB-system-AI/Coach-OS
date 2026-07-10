export const DEMO_PASSWORD =
  process.env.E2E_DEMO_PASSWORD ??
  process.env.DEMO_SEED_PASSWORD ??
  "CoachOS-Demo-2026!";

export const DEMO_USERS = {
  admin: {
    email: "admin@coachos.app",
    role: "SUPER_ADMIN" as const,
    home: "/admin",
  },
  coach: {
    email: "coach@demo.coachos.app",
    role: "COACH" as const,
    home: "/dashboard",
  },
  client: {
    email: "client-alpha@demo.coachos.app",
    role: "CLIENT" as const,
    home: "/portal",
  },
} as const;

export const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
] as const;

export const PROTECTED_ROUTES = {
  dashboard: [
    "/dashboard",
    "/dashboard/clients",
    "/dashboard/programs",
    "/dashboard/settings/subscription",
  ],
  portal: ["/portal", "/portal/programs", "/portal/bookings"],
  admin: ["/admin", "/admin/users", "/admin/coaches"],
} as const;

export const GUEST_AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
  "/onboarding",
] as const;

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@e2e.coachos.app`;
}
