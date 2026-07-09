import { cache } from "react";
import { db } from "@/lib/db";
import {
  extractSubdomain,
  isReservedSlug,
  type ResolvedTenant,
  type TenantWithRelations,
} from "@/features/tenancy/types";

const tenantInclude = {
  theme: true,
  settings: true,
} as const;

async function fetchTenantBySlug(
  slug: string
): Promise<TenantWithRelations | null> {
  if (isReservedSlug(slug)) return null;

  return db.tenant.findUnique({
    where: { slug, status: { in: ["ACTIVE", "TRIAL"] } },
    include: tenantInclude,
  });
}

async function fetchTenantByDomain(
  domain: string
): Promise<TenantWithRelations | null> {
  const hostname = domain.toLowerCase();

  const customDomain = await db.customDomain.findFirst({
    where: {
      domain: hostname,
      status: "VERIFIED",
      tenant: { status: { in: ["ACTIVE", "TRIAL"] } },
    },
    include: { tenant: { include: tenantInclude } },
  });
  if (customDomain?.tenant) return customDomain.tenant;

  return db.tenant.findFirst({
    where: {
      customDomain: hostname,
      domainVerified: true,
      status: { in: ["ACTIVE", "TRIAL"] },
    },
    include: tenantInclude,
  });
}

export const resolveTenantFromHost = cache(
  async (host: string): Promise<ResolvedTenant | null> => {
    const subdomain = extractSubdomain(host);
    if (subdomain) {
      const tenant = await fetchTenantBySlug(subdomain);
      if (tenant) {
        return { tenant, source: "subdomain" };
      }
    }

    const hostname = host.split(":")[0];
    const isPlatformDomain =
      hostname.endsWith("localhost") ||
      hostname.endsWith(process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "coachos.app");

    if (!isPlatformDomain) {
      const tenant = await fetchTenantByDomain(hostname);
      if (tenant) {
        return { tenant, source: "custom_domain" };
      }
    }

    return null;
  }
);

export const resolveTenantFromSlug = cache(
  async (slug: string): Promise<ResolvedTenant | null> => {
    const tenant = await fetchTenantBySlug(slug);
    if (tenant) return { tenant, source: "path" };

    // Custom domain passed as slug segment (from middleware rewrite)
    if (slug.includes(".")) {
      const domainTenant = await fetchTenantByDomain(slug);
      if (domainTenant) {
        return { tenant: domainTenant, source: "custom_domain" };
      }
    }

    return null;
  }
);

export async function getTenantById(
  tenantId: string
): Promise<TenantWithRelations | null> {
  return db.tenant.findUnique({
    where: { id: tenantId },
    include: tenantInclude,
  });
}
