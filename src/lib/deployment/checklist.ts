export type DeploymentChecklistItem = {
  id: string;
  category: string;
  label: string;
  required: boolean;
};

/** Items that MUST be verified before a production launch. */
export const PRODUCTION_DEPLOYMENT_CHECKLIST: DeploymentChecklistItem[] = [
  { id: "db-url", category: "Database", label: "DATABASE_URL set (pooled URL for serverless)", required: true },
  { id: "db-direct", category: "Database", label: "DIRECT_URL set for Prisma migrations (if using PgBouncer)", required: false },
  { id: "db-migrate", category: "Database", label: "Run `prisma migrate deploy` against production database", required: true },
  { id: "db-ping", category: "Database", label: "GET /api/health returns db: ok", required: true },
  { id: "auth-secret", category: "Auth", label: "BETTER_AUTH_SECRET set (32+ chars, unique per environment)", required: true },
  { id: "auth-url", category: "Auth", label: "BETTER_AUTH_URL matches production domain (https)", required: true },
  { id: "public-url", category: "Auth", label: "NEXT_PUBLIC_APP_URL matches production domain", required: true },
  { id: "auth-smoke", category: "Auth", label: "Login, register, logout smoke-tested on production URL", required: true },
  { id: "redirects", category: "Auth", label: "No redirect loops on /login, /onboarding, /dashboard (E2E redirect tests)", required: true },
  { id: "resend", category: "Email", label: "RESEND_API_KEY + RESEND_FROM_EMAIL (verified domain)", required: false },
  { id: "stripe", category: "Payments", label: "STRIPE_SECRET_KEY + webhook secret + price IDs", required: false },
  { id: "paymob", category: "Payments", label: "Paymob keys + HMAC secret for MENA payments", required: false },
  { id: "sentry", category: "Monitoring", label: "SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN", required: false },
  { id: "redis", category: "Infrastructure", label: "UPSTASH_REDIS_REST_URL + TOKEN for rate limiting", required: false },
  { id: "google", category: "OAuth", label: "GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET (if Google login enabled)", required: false },
  { id: "pusher", category: "Realtime", label: "Pusher app credentials + NEXT_PUBLIC_PUSHER_*", required: false },
  { id: "vapid", category: "Push", label: "VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY + VAPID_EMAIL", required: false },
  { id: "validate-script", category: "Deploy", label: "Run `npm run validate:deploy` — exits non-zero if core env missing", required: true },
  { id: "health", category: "Deploy", label: "Wire Vercel deployment check to GET /api/health", required: true },
  { id: "maintenance", category: "Deploy", label: "MAINTENANCE_MODE=false for launch (true only during planned downtime)", required: true },
];
