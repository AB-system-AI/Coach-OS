import { db } from "@/lib/db";

export async function resolveTenantByCustomDomain(host: string) {
  const hostname = host.split(":")[0].toLowerCase();

  const domain = await db.customDomain.findFirst({
    where: {
      domain: hostname,
      status: "VERIFIED",
      tenant: { status: { in: ["ACTIVE", "TRIAL"] } },
    },
    include: {
      tenant: { include: { theme: true, settings: true } },
    },
  });

  return domain?.tenant ?? null;
}

export function getSubdomainUrl(slug: string): string {
  const platformDomain =
    process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "coachos.app";
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) {
    return `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/${slug}`;
  }
  return `https://${slug}.${platformDomain}`;
}

export function getDnsInstructions(domain: string, verificationToken: string) {
  const platformDomain =
    process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "coachos.app";

  return {
    cname: {
      type: "CNAME",
      host: domain.startsWith("www.") ? "www" : "@",
      value: `proxy.${platformDomain}`,
    },
    txt: {
      type: "TXT",
      host: `_coachos-verify.${domain}`,
      value: verificationToken,
    },
  };
}
