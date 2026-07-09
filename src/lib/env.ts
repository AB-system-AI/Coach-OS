/**
 * Environment variable resolution for CoachOS.
 * Build-time placeholders are used only during `next build` so compilation succeeds
 * without a live database. Runtime (dev/prod) enforces real values.
 */

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

export function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) return url;

  if (isNextBuild()) {
    return BUILD_PLACEHOLDER_DATABASE_URL;
  }

  if (isDevelopment()) {
    throw new Error(
      "[CoachOS] DATABASE_URL is missing. Copy .env.example to .env and set your PostgreSQL connection string."
    );
  }

  throw new Error("[CoachOS] DATABASE_URL is required in production.");
}

export function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    if (isDevelopment()) {
      throw new Error(
        "[CoachOS] DATABASE_URL is missing. Copy .env.example to .env and set your PostgreSQL connection string."
      );
    }
    throw new Error("[CoachOS] DATABASE_URL is required at runtime.");
  }
  return url;
}

export function resolveAuthSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET?.trim();

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

  throw new Error("[CoachOS] BETTER_AUTH_SECRET is required in production.");
}

export function resolveAuthUrl(): string {
  const url =
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (url) {
    return url.replace(/\/$/, "");
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

  throw new Error(
    "[CoachOS] BETTER_AUTH_URL or NEXT_PUBLIC_APP_URL is required in production."
  );
}

export function resolvePublicAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (url) return url.replace(/\/$/, "");
  return resolveAuthUrl();
}

export function getTrustedOrigins(): string[] {
  const origins = new Set<string>();
  const authUrl = process.env.BETTER_AUTH_URL?.trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (authUrl) origins.add(authUrl.replace(/\/$/, ""));
  if (appUrl) origins.add(appUrl.replace(/\/$/, ""));

  if (origins.size === 0) {
    origins.add(resolveAuthUrl());
  }

  return Array.from(origins);
}
