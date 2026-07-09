import { getCurrentTenant } from "@/lib/auth/session";
import { getTenantDomains, getDnsInstructions } from "@/features/domains";
import { getSubdomainUrl } from "@/features/domains/services/domain-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { Globe } from "lucide-react";

export default async function DomainsSettingsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const domains = await getTenantDomains(tenant.id);
  const subdomainUrl = getSubdomainUrl(tenant.slug);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Globe className="h-8 w-8" />
          Custom Domains
        </h1>
        <p className="text-muted-foreground mt-1">
          Connect your own domain or use your TrainerOS subdomain.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default Subdomain</CardTitle>
        </CardHeader>
        <CardContent>
          <code className="text-sm bg-muted px-3 py-2 rounded-lg block">
            {subdomainUrl}
          </code>
          <p className="text-xs text-muted-foreground mt-2">
            Available on all plans. Your site is always accessible at this URL.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom Domains</CardTitle>
        </CardHeader>
        <CardContent>
          {domains.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No custom domains configured. Add a domain from your dashboard to
              use your own brand URL (Professional plan and above).
            </p>
          ) : (
            <div className="space-y-4">
              {domains.map((domain) => {
                const dns = getDnsInstructions(
                  domain.domain,
                  domain.verificationToken
                );
                return (
                  <div key={domain.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{domain.domain}</span>
                      <Badge
                        variant={
                          domain.status === "VERIFIED" ? "success" : "secondary"
                        }
                      >
                        {domain.status}
                      </Badge>
                    </div>
                    {domain.status !== "VERIFIED" && (
                      <div className="text-xs text-muted-foreground space-y-1 mt-2">
                        <p>Add DNS record:</p>
                        <code className="block bg-muted p-2 rounded">
                          {dns.cname.type} {dns.cname.host} → {dns.cname.value}
                        </code>
                        <code className="block bg-muted p-2 rounded mt-1">
                          {dns.txt.type} {dns.txt.host} → {dns.txt.value}
                        </code>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
