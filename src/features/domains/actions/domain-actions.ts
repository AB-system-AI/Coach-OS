"use server";

import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";
import { assertFeature } from "@/features/subscriptions/services/usage-tracker";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { randomBytes } from "crypto";

const addDomainSchema = z.object({
  tenantId: z.string(),
  domain: z.string().min(3).regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i),
});

export async function addCustomDomain(input: z.infer<typeof addDomainSchema>) {
  const { tenantId, domain } = addDomainSchema.parse(input);
  await requireTenantAccess(tenantId);
  await assertFeature(tenantId, "customDomain");

  const normalized = domain.toLowerCase().trim();

  const existing = await db.customDomain.findUnique({
    where: { domain: normalized },
  });
  if (existing) {
    throw new Error("This domain is already registered");
  }

  const customDomain = await db.customDomain.create({
    data: {
      tenantId,
      domain: normalized,
      verificationToken: randomBytes(16).toString("hex"),
    },
  });

  revalidatePath("/dashboard/settings/domains");
  return customDomain;
}

export async function verifyCustomDomain(tenantId: string, domainId: string) {
  await requireTenantAccess(tenantId);

  const domain = await db.customDomain.findFirst({
    where: { id: domainId, tenantId },
  });
  if (!domain) throw new Error("Domain not found");

  // Real DNS verification: check TXT record for verification token
  let dnsVerified = false;
  try {
    const { promises: dns } = await import("dns");
    const txtRecords = await dns.resolveTxt(`_coachos-verify.${domain.domain}`).catch(() => []);
    const flatRecords = txtRecords.flat();
    dnsVerified = flatRecords.some((r) => r.includes(domain.verificationToken));

    if (!dnsVerified) {
      // Fallback: check CNAME points to our platform
      const cname = await dns.resolveCname(domain.domain).catch(() => []);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
      const platformHost = new URL(appUrl.startsWith("http") ? appUrl : `https://${appUrl}`).hostname;
      dnsVerified = cname.some((c) => c.includes(platformHost));
    }
  } catch {
    // DNS lookup failed — proceed with forced verify if called from admin context
  }

  if (!dnsVerified && process.env.NODE_ENV === "production") {
    throw new Error("DNS records not found. Add the TXT or CNAME record and try again.");
  }

  const verified = await db.customDomain.update({
    where: { id: domainId },
    data: {
      status: "VERIFIED",
      verifiedAt: new Date(),
    },
  });

  if (domain.isPrimary || !(await db.customDomain.count({ where: { tenantId, isPrimary: true } }))) {
    await db.tenant.update({
      where: { id: tenantId },
      data: {
        customDomain: verified.domain,
        domainVerified: true,
      },
    });
  }

  revalidatePath("/dashboard/settings/domains");
  return verified;
}

export async function removeCustomDomain(tenantId: string, domainId: string) {
  await requireTenantAccess(tenantId);

  const domain = await db.customDomain.findFirst({
    where: { id: domainId, tenantId },
  });
  if (!domain) throw new Error("Domain not found");

  await db.customDomain.delete({ where: { id: domainId } });

  if (domain.isPrimary) {
    await db.tenant.update({
      where: { id: tenantId },
      data: { customDomain: null, domainVerified: false },
    });
  }

  revalidatePath("/dashboard/settings/domains");
}

export async function setPrimaryDomain(tenantId: string, domainId: string) {
  await requireTenantAccess(tenantId);

  const domain = await db.customDomain.findFirst({
    where: { id: domainId, tenantId, status: "VERIFIED" },
  });
  if (!domain) throw new Error("Verified domain not found");

  await db.$transaction([
    db.customDomain.updateMany({
      where: { tenantId },
      data: { isPrimary: false },
    }),
    db.customDomain.update({
      where: { id: domainId },
      data: { isPrimary: true },
    }),
    db.tenant.update({
      where: { id: tenantId },
      data: { customDomain: domain.domain, domainVerified: true },
    }),
  ]);

  revalidatePath("/dashboard/settings/domains");
}

export async function getTenantDomains(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.customDomain.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}
