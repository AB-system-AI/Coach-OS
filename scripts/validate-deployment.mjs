#!/usr/bin/env node
/**
 * Validates production deployment configuration before launch.
 * Usage: npm run validate:deploy
 */
import nextEnv from "@next/env";
import path from "path";
import { fileURLToPath } from "node:url";

const { loadEnvConfig } = nextEnv;
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnvConfig(root);

function isSet(name) {
  return Boolean(process.env[name]?.trim());
}

const hasVercelUrl =
  isSet("VERCEL_URL") || isSet("VERCEL_PROJECT_PRODUCTION_URL");

const requiredChecks = [
  {
    name: "DATABASE_URL",
    ok: isSet("DATABASE_URL"),
    usedIn: "Prisma, auth, all data routes",
  },
  {
    name: "BETTER_AUTH_SECRET",
    ok: isSet("BETTER_AUTH_SECRET") && (process.env.BETTER_AUTH_SECRET?.trim().length ?? 0) >= 32,
    usedIn: "Session signing",
  },
  {
    name: "BETTER_AUTH_URL",
    ok: isSet("BETTER_AUTH_URL") || isSet("NEXT_PUBLIC_APP_URL") || hasVercelUrl,
    usedIn: "Auth callbacks",
  },
];

const missing = requiredChecks.filter((check) => !check.ok);

console.log("\n=== CoachOS Deployment Validation ===\n");

if (missing.length > 0) {
  console.error("FAIL — missing required environment variables:\n");
  for (const check of missing) {
    console.error(`  • ${check.name} — used in: ${check.usedIn}`);
  }
  console.error(
    "\nSet variables in Vercel → Project → Settings → Environment Variables."
  );
  console.error("See .env.example for reference.\n");
  process.exit(1);
}

console.log("PASS — all required environment variables are set.\n");

const optional = [
  ["RESEND_API_KEY", "Email (Resend)"],
  ["STRIPE_SECRET_KEY", "Stripe payments"],
  ["PAYMOB_API_KEY", "Paymob payments"],
  ["SENTRY_DSN", "Sentry monitoring"],
  ["UPSTASH_REDIS_REST_URL", "Redis rate limiting"],
  ["GOOGLE_CLIENT_ID", "Google OAuth"],
  ["PUSHER_APP_ID", "Pusher realtime"],
  ["VAPID_PUBLIC_KEY", "Web push"],
];

const optionalMissing = optional.filter(([name]) => !isSet(name));
if (optionalMissing.length > 0) {
  console.log("Optional services not configured (features may be disabled):\n");
  for (const [name, label] of optionalMissing) {
    console.log(`  • ${name} — ${label}`);
  }
  console.log("");
}

console.log("Next steps:");
console.log("  1. Run: npx prisma migrate deploy");
console.log("  2. Deploy and verify GET /api/health returns status: ok");
console.log("  3. Smoke-test login, register, onboarding, dashboard\n");

process.exit(0);
