import type { Tenant, TenantTheme, TenantSettings } from "@prisma/client";
import { resolvePublicAppUrl } from "@/lib/env";

export type TenantWithRelations = Tenant & {
  theme: TenantTheme | null;
  settings: TenantSettings | null;
};

export type TenantContext = {
  tenant: TenantWithRelations;
  tenantId: string;
  slug: string;
};

export type TenantResolutionSource =
  | "custom_domain"
  | "subdomain"
  | "path"
  | "session";

export type ResolvedTenant = {
  tenant: TenantWithRelations;
  source: TenantResolutionSource;
};

export const PLATFORM_DOMAIN =
  process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "coachos.app";

export const RESERVED_SLUGS = [
  "admin",
  "api",
  "auth",
  "dashboard",
  "portal",
  "login",
  "register",
  "pricing",
  "features",
  "about",
  "contact",
  "blog",
  "help",
  "support",
  "docs",
  "status",
  "app",
  "www",
  "marketplace",
  "onboarding",
];

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase());
}

export function extractSubdomain(host: string): string | null {
  const hostname = host.split(":")[0];
  const platformDomain = PLATFORM_DOMAIN;

  if (hostname === platformDomain || hostname === `www.${platformDomain}`) {
    return null;
  }

  if (hostname.endsWith(`.${platformDomain}`)) {
    const subdomain = hostname.replace(`.${platformDomain}`, "");
    if (subdomain && subdomain !== "www") {
      return subdomain;
    }
  }

  return null;
}

/** Hosts that serve the main CoachOS platform, not a tenant custom domain. */
export function isPlatformHost(host: string): boolean {
  const hostname = host.split(":")[0].toLowerCase();
  const platformDomain = PLATFORM_DOMAIN;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return true;
  }

  if (hostname === platformDomain || hostname === `www.${platformDomain}`) {
    return true;
  }

  // Vercel preview and production URLs (*.vercel.app)
  if (hostname.endsWith(".vercel.app")) {
    return true;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      if (hostname === new URL(appUrl).hostname.toLowerCase()) {
        return true;
      }
    } catch {
      // ignore invalid NEXT_PUBLIC_APP_URL
    }
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl && hostname === vercelUrl.toLowerCase()) {
    return true;
  }

  return false;
}

export function buildTenantUrl(slug: string, path = ""): string {
  const base = resolvePublicAppUrl();
  return `${base}/${slug}${path}`;
}

export function buildTenantSubdomainUrl(slug: string, path = ""): string {
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) {
    return buildTenantUrl(slug, path);
  }
  return `https://${slug}.${PLATFORM_DOMAIN}${path}`;
}
