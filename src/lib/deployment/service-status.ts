import { getDeploymentEnvIssues } from "@/lib/env";
import { hasAllRuntimeEnv, readRuntimeEnv } from "@/lib/env/runtime";
import type { ServiceKind } from "./errors";

export type ServiceStatus = {
  service: ServiceKind;
  available: boolean;
  configured: boolean;
  message: string;
};

function hasEnv(...names: string[]): boolean {
  return hasAllRuntimeEnv(...names);
}

export function isMaintenanceModeEnabled(): boolean {
  const value = readRuntimeEnv("MAINTENANCE_MODE")?.toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}

export function getDatabaseServiceStatus(): ServiceStatus {
  const issues = getDeploymentEnvIssues().filter(
    (issue) => issue.variable === "DATABASE_URL"
  );

  if (issues.length > 0) {
    return {
      service: "database",
      available: false,
      configured: false,
      message:
        "Our database is not configured. Account features are temporarily unavailable.",
    };
  }

  return {
    service: "database",
    available: true,
    configured: true,
    message: "Database configured.",
  };
}

export function getAuthenticationServiceStatus(): ServiceStatus {
  const issues = getDeploymentEnvIssues().filter((issue) =>
    ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL"].includes(
      issue.variable
    )
  );

  if (issues.length > 0) {
    return {
      service: "authentication",
      available: false,
      configured: false,
      message:
        "Sign-in is temporarily unavailable while we complete deployment configuration.",
    };
  }

  return {
    service: "authentication",
    available: true,
    configured: true,
    message: "Authentication configured.",
  };
}

export function getEmailServiceStatus(): ServiceStatus {
  const configured = hasEnv("RESEND_API_KEY");
  return {
    service: "email",
    available: configured,
    configured,
    message: configured
      ? "Email delivery configured."
      : "Email delivery is not configured (Resend).",
  };
}

export function getPaymentServiceStatus(): ServiceStatus {
  const stripe = hasEnv("STRIPE_SECRET_KEY");
  const paymob = hasEnv("PAYMOB_API_KEY", "PAYMOB_INTEGRATION_ID");
  const configured = stripe || paymob;

  return {
    service: "payments",
    available: configured,
    configured,
    message: configured
      ? "At least one payment provider is configured."
      : "Payments are not configured (Stripe or Paymob).",
  };
}

export function getRedisServiceStatus(): ServiceStatus {
  const configured = hasEnv("UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN");
  return {
    service: "general",
    available: configured,
    configured,
    message: configured
      ? "Distributed rate limiting configured (Upstash)."
      : "Using in-memory rate limiting (not ideal for multi-instance production).",
  };
}

export function getSentryServiceStatus(): ServiceStatus {
  const configured =
    hasEnv("SENTRY_DSN") || hasEnv("NEXT_PUBLIC_SENTRY_DSN");
  return {
    service: "general",
    available: configured,
    configured,
    message: configured
      ? "Error monitoring configured (Sentry)."
      : "Sentry is not configured.",
  };
}

export function getGoogleOAuthStatus(): ServiceStatus {
  const configured = hasEnv("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET");
  return {
    service: "authentication",
    available: configured,
    configured,
    message: configured
      ? "Google sign-in configured."
      : "Google OAuth is not configured.",
  };
}

export function getPusherServiceStatus(): ServiceStatus {
  const configured = hasEnv("PUSHER_APP_ID", "PUSHER_KEY", "PUSHER_SECRET");
  return {
    service: "realtime",
    available: configured,
    configured,
    message: configured
      ? "Realtime messaging configured (Pusher)."
      : "Realtime messaging is not configured.",
  };
}

export function getVapidServiceStatus(): ServiceStatus {
  const configured = hasEnv("VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY");
  return {
    service: "realtime",
    available: configured,
    configured,
    message: configured
      ? "Web push notifications configured."
      : "Web push is not configured (VAPID keys).",
  };
}

export function getAllServiceStatuses(): ServiceStatus[] {
  return [
    getDatabaseServiceStatus(),
    getAuthenticationServiceStatus(),
    getEmailServiceStatus(),
    getPaymentServiceStatus(),
    getRedisServiceStatus(),
    getSentryServiceStatus(),
    getGoogleOAuthStatus(),
    getPusherServiceStatus(),
    getVapidServiceStatus(),
  ];
}
