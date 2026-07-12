import { isNextBuild, isProduction } from "@/lib/env";
import { readRuntimeEnv } from "@/lib/env/runtime";

export type EnvVarCategory =
  | "core"
  | "auth"
  | "payments"
  | "email"
  | "monitoring"
  | "realtime"
  | "integrations"
  | "platform";

export type EnvVarDefinition = {
  name: string;
  required: boolean;
  category: EnvVarCategory;
  usedIn: string[];
  safeDefault?: string;
  description: string;
  /** When true, production can boot without this var (feature disabled). */
  optionalInProduction?: boolean;
};

function isSet(name: string): boolean {
  return readRuntimeEnv(name) !== undefined;
}

/** Catalog of environment variables referenced by CoachOS. */
export const ENV_MANIFEST: EnvVarDefinition[] = [
  {
    name: "DATABASE_URL",
    required: true,
    category: "core",
    usedIn: [
      "src/lib/db",
      "src/lib/auth",
      "prisma/schema.prisma",
      "src/app/api/health",
    ],
    description: "PostgreSQL connection string (use pooled URL on Vercel/serverless).",
  },
  {
    name: "DIRECT_URL",
    required: false,
    category: "core",
    usedIn: ["prisma/schema.prisma (migrations)"],
    optionalInProduction: true,
    description: "Direct DB URL for Prisma migrations when DATABASE_URL uses PgBouncer.",
  },
  {
    name: "BETTER_AUTH_SECRET",
    required: true,
    category: "auth",
    usedIn: ["src/lib/auth", "src/lib/env"],
    description: "Session signing secret (min 32 characters).",
  },
  {
    name: "BETTER_AUTH_URL",
    required: true,
    category: "auth",
    usedIn: ["src/lib/auth", "src/lib/env"],
    safeDefault: "VERCEL_URL / VERCEL_PROJECT_PRODUCTION_URL on Vercel",
    description: "Public app URL for auth callbacks.",
  },
  {
    name: "BETTER_AUTH_TRUSTED_ORIGINS",
    required: false,
    category: "auth",
    usedIn: ["src/lib/env"],
    optionalInProduction: true,
    description:
      "Comma-separated extra origins for Better Auth CSRF checks (custom domains).",
  },
  {
    name: "NEXT_PUBLIC_APP_URL",
    required: false,
    category: "platform",
    usedIn: [
      "src/lib/env",
      "src/lib/auth/client",
      "src/app/layout.tsx",
      "billing, tenant URLs",
    ],
    safeDefault: "Same as BETTER_AUTH_URL or same-origin",
    optionalInProduction: true,
    description: "Browser-visible app URL for links and auth client.",
  },
  {
    name: "NEXT_PUBLIC_PLATFORM_DOMAIN",
    required: false,
    category: "platform",
    usedIn: ["src/lib/middleware/tenancy", "tenant resolver"],
    safeDefault: "coachos.app",
    optionalInProduction: true,
    description: "Root domain for tenant subdomains.",
  },
  {
    name: "MAINTENANCE_MODE",
    required: false,
    category: "platform",
    usedIn: ["src/middleware.ts"],
    safeDefault: "false",
    optionalInProduction: true,
    description: "When true, shows maintenance screen for non-public routes.",
  },
  {
    name: "RESEND_API_KEY",
    required: false,
    category: "email",
    usedIn: ["src/lib/email"],
    optionalInProduction: true,
    description: "Resend API key for transactional email.",
  },
  {
    name: "RESEND_FROM_EMAIL",
    required: false,
    category: "email",
    usedIn: ["src/lib/email"],
    safeDefault: "noreply@coachos.app",
    optionalInProduction: true,
    description: "From address for Resend emails (must be a verified domain).",
  },
  {
    name: "RESEND_FROM_NAME",
    required: false,
    category: "email",
    usedIn: ["src/lib/email"],
    safeDefault: "CoachOS",
    optionalInProduction: true,
    description: "Display name for the Resend from address.",
  },
  {
    name: "STRIPE_SECRET_KEY",
    required: false,
    category: "payments",
    usedIn: ["src/lib/payments/stripe", "billing-service"],
    optionalInProduction: true,
    description: "Stripe secret key for card payments.",
  },
  {
    name: "STRIPE_WEBHOOK_SECRET",
    required: false,
    category: "payments",
    usedIn: ["src/app/api/webhooks/stripe"],
    optionalInProduction: true,
    description: "Stripe webhook signing secret.",
  },
  {
    name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    required: false,
    category: "payments",
    usedIn: ["checkout UI (if enabled)"],
    optionalInProduction: true,
    description: "Stripe publishable key for client checkout.",
  },
  {
    name: "STRIPE_PRICE_STARTER",
    required: false,
    category: "payments",
    usedIn: ["billing-service", "stripe webhook"],
    optionalInProduction: true,
    description: "Stripe price ID for Starter plan.",
  },
  {
    name: "STRIPE_PRICE_PROFESSIONAL",
    required: false,
    category: "payments",
    usedIn: ["billing-service", "stripe webhook"],
    optionalInProduction: true,
    description: "Stripe price ID for Professional plan.",
  },
  {
    name: "STRIPE_PRICE_BUSINESS",
    required: false,
    category: "payments",
    usedIn: ["billing-service", "stripe webhook"],
    optionalInProduction: true,
    description: "Stripe price ID for Business plan.",
  },
  {
    name: "STRIPE_PRICE_ENTERPRISE",
    required: false,
    category: "payments",
    usedIn: ["billing-service", "stripe webhook"],
    optionalInProduction: true,
    description: "Stripe price ID for Enterprise plan.",
  },
  {
    name: "PAYMOB_API_KEY",
    required: false,
    category: "payments",
    usedIn: ["src/lib/payments/paymob"],
    optionalInProduction: true,
    description: "Paymob API key.",
  },
  {
    name: "PAYMOB_INTEGRATION_ID",
    required: false,
    category: "payments",
    usedIn: ["src/lib/payments/paymob"],
    optionalInProduction: true,
    description: "Paymob integration ID.",
  },
  {
    name: "PAYMOB_IFRAME_ID",
    required: false,
    category: "payments",
    usedIn: ["src/lib/payments/paymob"],
    optionalInProduction: true,
    description: "Paymob iframe ID.",
  },
  {
    name: "PAYMOB_HMAC_SECRET",
    required: false,
    category: "payments",
    usedIn: ["src/lib/payments/paymob", "paymob webhook"],
    optionalInProduction: true,
    description: "Paymob webhook HMAC secret.",
  },
  {
    name: "SENTRY_DSN",
    required: false,
    category: "monitoring",
    usedIn: ["sentry.server.config.ts", "sentry.edge.config.ts"],
    optionalInProduction: true,
    description: "Sentry server DSN.",
  },
  {
    name: "NEXT_PUBLIC_SENTRY_DSN",
    required: false,
    category: "monitoring",
    usedIn: ["sentry.client.config.ts", "instrumentation-client.ts"],
    optionalInProduction: true,
    description: "Sentry browser DSN.",
  },
  {
    name: "UPSTASH_REDIS_REST_URL",
    required: false,
    category: "integrations",
    usedIn: ["src/lib/rate-limit"],
    optionalInProduction: true,
    description: "Upstash Redis REST URL for distributed rate limiting.",
  },
  {
    name: "UPSTASH_REDIS_REST_TOKEN",
    required: false,
    category: "integrations",
    usedIn: ["src/lib/rate-limit"],
    optionalInProduction: true,
    description: "Upstash Redis REST token.",
  },
  {
    name: "GOOGLE_CLIENT_ID",
    required: false,
    category: "auth",
    usedIn: ["src/lib/auth"],
    optionalInProduction: true,
    description: "Google OAuth client ID.",
  },
  {
    name: "GOOGLE_CLIENT_SECRET",
    required: false,
    category: "auth",
    usedIn: ["src/lib/auth"],
    optionalInProduction: true,
    description: "Google OAuth client secret.",
  },
  {
    name: "PUSHER_APP_ID",
    required: false,
    category: "realtime",
    usedIn: ["src/lib/pusher/server"],
    optionalInProduction: true,
    description: "Pusher app ID.",
  },
  {
    name: "PUSHER_KEY",
    required: false,
    category: "realtime",
    usedIn: ["src/lib/pusher/server"],
    optionalInProduction: true,
    description: "Pusher key (server).",
  },
  {
    name: "PUSHER_SECRET",
    required: false,
    category: "realtime",
    usedIn: ["src/lib/pusher/server"],
    optionalInProduction: true,
    description: "Pusher secret.",
  },
  {
    name: "PUSHER_CLUSTER",
    required: false,
    category: "realtime",
    usedIn: ["src/lib/pusher/server"],
    safeDefault: "mt1",
    optionalInProduction: true,
    description: "Pusher cluster (server).",
  },
  {
    name: "NEXT_PUBLIC_PUSHER_KEY",
    required: false,
    category: "realtime",
    usedIn: ["src/lib/pusher/client"],
    optionalInProduction: true,
    description: "Pusher key (browser).",
  },
  {
    name: "NEXT_PUBLIC_PUSHER_CLUSTER",
    required: false,
    category: "realtime",
    usedIn: ["src/lib/pusher/client"],
    safeDefault: "mt1",
    optionalInProduction: true,
    description: "Pusher cluster (browser).",
  },
  {
    name: "VAPID_PUBLIC_KEY",
    required: false,
    category: "realtime",
    usedIn: ["push-service", "mobile API routes"],
    optionalInProduction: true,
    description: "Web push VAPID public key.",
  },
  {
    name: "VAPID_PRIVATE_KEY",
    required: false,
    category: "realtime",
    usedIn: ["push-service"],
    optionalInProduction: true,
    description: "Web push VAPID private key.",
  },
  {
    name: "VAPID_EMAIL",
    required: false,
    category: "realtime",
    usedIn: ["push-service"],
    safeDefault: "noreply@coachos.app",
    optionalInProduction: true,
    description: "VAPID contact email.",
  },
  {
    name: "OPENAI_API_KEY",
    required: false,
    category: "integrations",
    usedIn: ["src/features/ai/services/ai-service.ts"],
    optionalInProduction: true,
    description: "OpenAI API key for AI features.",
  },
  {
    name: "E2E_DISABLE_RATE_LIMIT",
    required: false,
    category: "platform",
    usedIn: ["src/lib/auth (E2E only)"],
    optionalInProduction: true,
    description: "Disables Better Auth rate limiting during Playwright E2E runs.",
  },
];

export type EnvAuditRow = {
  variable: string;
  required: boolean;
  usedIn: string;
  missing: boolean;
  safeDefault: string;
  category: EnvVarCategory;
};

export function getEnvAuditTable(): EnvAuditRow[] {
  const hasVercelUrl =
    isSet("VERCEL_URL") || isSet("VERCEL_PROJECT_PRODUCTION_URL");

  return ENV_MANIFEST.map((def) => {
    let missing = def.required && !isSet(def.name);

    if (
      def.name === "BETTER_AUTH_URL" &&
      missing &&
      (isSet("NEXT_PUBLIC_APP_URL") || hasVercelUrl)
    ) {
      missing = false;
    }

    if (def.name === "NEXT_PUBLIC_APP_URL" && missing && isSet("BETTER_AUTH_URL")) {
      missing = false;
    }

    if (isNextBuild()) {
      missing = false;
    }

    return {
      variable: def.name,
      required: def.required,
      usedIn: def.usedIn.join("; "),
      missing: isProduction() && !isNextBuild() ? missing : !isSet(def.name),
      safeDefault: def.safeDefault ?? (def.optionalInProduction ? "— (optional)" : "—"),
      category: def.category,
    };
  });
}

export function getMissingRequiredEnvVars(): string[] {
  return getEnvAuditTable()
    .filter((row) => row.required && row.missing)
    .map((row) => row.variable);
}
