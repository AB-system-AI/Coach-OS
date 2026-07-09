import { getCurrentTenant } from "@/lib/auth/session";
import { getTenantDomains } from "@/features/domains/actions/domain-actions";
import { getDnsInstructions, getSubdomainUrl } from "@/features/domains/services/domain-service";
import { redirect } from "next/navigation";
import { DomainsClient } from "./_components/domains-client";

export default async function DomainsSettingsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [domains] = await Promise.all([getTenantDomains(tenant.id)]);
  const subdomainUrl = getSubdomainUrl(tenant.slug);

  const domainsWithDns = domains.map((d) => ({
    ...d,
    dns: getDnsInstructions(d.domain, d.verificationToken),
  }));

  return (
    <DomainsClient
      domains={domainsWithDns}
      subdomainUrl={subdomainUrl}
      tenantId={tenant.id}
    />
  );
}
