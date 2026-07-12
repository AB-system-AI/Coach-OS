import * as Sentry from "@sentry/nextjs";
import { readRuntimeEnv } from "@/lib/env/runtime";

const dsn = readRuntimeEnv("NEXT_PUBLIC_SENTRY_DSN");

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    enabled: process.env.NODE_ENV === "production" || Boolean(dsn),
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
