/**
 * Environment variable resolution for CoachOS.
 * Build-time placeholders are used only during `next build` so compilation succeeds
 * without a live database. Runtime (dev/prod) reads env via bracket access so
 * Vercel runtime injection is not replaced by empty build-time values.
 */

import { hasAllRuntimeEnv, hasRuntimeEnv, readRuntimeEnv } from "@/lib/env/runtime";
import { ServiceUnavailableError } from "@/lib/deployment/errors";

const BUILD_PLACEHOLDER_DATABASE_URL =
  "postgresql://build:build@127.0.0.1:5432/build?schema=public";

const BUILD_PLACEHOLDER_AUTH_SECRET =
  "build-placeholder-secret-minimum-32-characters";

export function isNextBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function normalizeOrigin(url: string): string {
  return url.replace(/\/$/, "");
}

/** Prefer https for Vercel-provided hostnames (VERCEL_URL has no protocol). */
function originFromHost(host: string): string {
  const trimmed = host.trim().replace(/\/$/, "");
  if (/^https?:\/\//i.test(trimmed)) {
    return normalizeOrigin(trimmed);
  }
  return `https://${trimmed}`;
}

/** Non-throwing runtime lookup used by Prisma, guards, and health checks. */
export function getRuntimeDatabaseUrl(): string | undefined {
  return readRuntimeEnv("DATABASE_URL");
}

export function isRuntimeDatabaseConfigured(): boolean {
  return Boolean(getRuntimeDatabaseUrl()) || isNextBuild();
}

export function resolveDatabaseUrl(): string {
  const url = getRuntimeDatabaseUrl();
  if (url) return url;

  if (isNextBuild()) {
    return BUILD_PLACEHOLDER_DATABASE_URL;
  }

  if (isDevelopment()) {
    throw new Error(
      "[CoachOS] DATABASE_URL is missing. Copy .env.example to .env and set your PostgreSQL connection string."
    );
  }

  throw new ServiceUnavailableError(
    "database",
    "[CoachOS] DATABASE_URL is not configured."
  );
}

export function requireDatabaseUrl(): string {
  const url = getRuntimeDatabaseUrl();
  if (url) return url;

  if (isDevelopment()) {
    throw new Error(
      "[CoachOS] DATABASE_URL is missing. Copy .env.example to .env and set your PostgreSQL connection string."
    );
  }

  throw new ServiceUnavailableError(
    "database",
    "[CoachOS] DATABASE_URL is not configured."
  );
}

export function resolveAuthSecret(): string {
  const secret = readRuntimeEnv("BETTER_AUTH_SECRET");

  if (secret) {
    if (secret.length < 32 && !isNextBuild()) {
      throw new Error(
        "[CoachOS] BETTER_AUTH_SECRET must be at least 32 characters. Generate one with: openssl rand -base64 32"
      );
    }
    return secret;
  }

  if (isNextBuild()) {
    return BUILD_PLACEHOLDER_AUTH_SECRET;
  }

  if (isDevelopment()) {
    throw new Error(
      "[CoachOS] BETTER_AUTH_SECRET is missing. Generate one with: openssl rand -base64 32"
    );
  }

  throw new ServiceUnavailableError(
    "authentication",
    "[CoachOS] BETTER_AUTH_SECRET is not configured."
  );
}

export function resolveAuthUrl(): string {
  const explicit =
    readRuntimeEnv("BETTER_AUTH_URL") || readRuntimeEnv("NEXT_PUBLIC_APP_URL");

  if (explicit) {
    return normalizeOrigin(explicit);
  }

  const vercelProduction = readRuntimeEnv("VERCEL_PROJECT_PRODUCTION_URL");
  if (vercelProduction) {
    return originFromHost(vercelProduction);
  }

  const vercelUrl = readRuntimeEnv("VERCEL_URL");
  if (vercelUrl) {
    return originFromHost(vercelUrl);
  }

  if (isNextBuild()) {
    return "http://localhost:3000";
  }

  if (isDevelopment()) {
    console.warn(
      "[CoachOS] BETTER_AUTH_URL is not set. Using http://localhost:3000 for local development."
    );
    return "http://localhost:3000";
  }

  throw new ServiceUnavailableError(
    "authentication",
    "[CoachOS] BETTER_AUTH_URL or NEXT_PUBLIC_APP_URL is not configured."
  );
}

export function resolvePublicAppUrl(): string {
  const url = readRuntimeEnv("NEXT_PUBLIC_APP_URL");
  if (url) return normalizeOrigin(url);
  return resolveAuthUrl();
}

export type DeploymentEnvIssue = {
  variable: string;
  message: string;
};

/** Non-throwing audit for deployment dashboards and health checks. */
export function getDeploymentEnvIssues(): DeploymentEnvIssue[] {
  const issues: DeploymentEnvIssue[] = [];

  if (!getRuntimeDatabaseUrl()) {
    issues.push({
      variable: "DATABASE_URL",
      message: "PostgreSQL connection string is required at runtime.",
    });
  }

  const authSecret = readRuntimeEnv("BETTER_AUTH_SECRET");
  if (!authSecret) {
    issues.push({
      variable: "BETTER_AUTH_SECRET",
      message:
        "Session signing secret is required (minimum 32 characters). Generate with: openssl rand -base64 32",
    });
  } else if (authSecret.length < 32 && !isNextBuild()) {
    issues.push({
      variable: "BETTER_AUTH_SECRET",
      message: "Must be at least 32 characters.",
    });
  }

  const hasAuthUrl =
    hasRuntimeEnv("BETTER_AUTH_URL") ||
    hasRuntimeEnv("NEXT_PUBLIC_APP_URL") ||
    hasRuntimeEnv("VERCEL_PROJECT_PRODUCTION_URL") ||
    hasRuntimeEnv("VERCEL_URL");

  if (!hasAuthUrl && isProduction() && !isNextBuild()) {
    issues.push({
      variable: "BETTER_AUTH_URL",
      message:
        "Set BETTER_AUTH_URL or NEXT_PUBLIC_APP_URL to your public app URL (e.g. https://your-app.vercel.app).",
    });
  }

  return issues;
}

export function getTrustedOrigins(): string[] {
  const origins = new Set<string>();

  const candidates = [
    readRuntimeEnv("BETTER_AUTH_URL"),
    readRuntimeEnv("NEXT_PUBLIC_APP_URL"),
    readRuntimeEnv("VERCEL_PROJECT_PRODUCTION_URL")
      ? originFromHost(readRuntimeEnv("VERCEL_PROJECT_PRODUCTION_URL")!)
      : undefined,
    readRuntimeEnv("VERCEL_URL")
      ? originFromHost(readRuntimeEnv("VERCEL_URL")!)
      : undefined,
  ];

  for (const candidate of candidates) {
    if (candidate) origins.add(normalizeOrigin(candidate));
  }

  if (origins.size === 0) {
    origins.add(resolveAuthUrl());
  }

  for (const origin of [...origins]) {
    try {
      const url = new URL(origin);
      if (url.hostname === "127.0.0.1") {
        origins.add(origin.replace("127.0.0.1", "localhost"));
      } else if (url.hostname === "localhost") {
        origins.add(origin.replace("localhost", "127.0.0.1"));
      }
    } catch {
      // ignore malformed origins
    }
  }

  return Array.from(origins);
}

export { hasAllRuntimeEnv, hasRuntimeEnv, readRuntimeEnv };
