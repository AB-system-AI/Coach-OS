"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Plus, Trash2, RefreshCw, Star } from "lucide-react";
import {
  addCustomDomain,
  verifyCustomDomain,
  removeCustomDomain,
  setPrimaryDomain,
} from "@/features/domains/actions/domain-actions";

type DomainWithDns = {
  id: string;
  domain: string;
  status: string;
  isPrimary: boolean;
  verificationToken: string;
  verifiedAt: Date | null;
  dns: {
    cname: { type: string; host: string; value: string };
    txt: { type: string; host: string; value: string };
  };
};

interface Props {
  domains: DomainWithDns[];
  subdomainUrl: string;
  tenantId: string;
}

export function DomainsClient({ domains, subdomainUrl, tenantId }: Props) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newDomain.trim()) { toast.error("Enter a domain"); return; }
    setAdding(true);
    try {
      await addCustomDomain({ tenantId, domain: newDomain.trim() });
      toast.success("Domain added. Configure your DNS records below.");
      setNewDomain("");
      setShowAdd(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add domain");
    } finally {
      setAdding(false);
    }
  }

  async function handleVerify(domainId: string, domainName: string) {
    setVerifyingId(domainId);
    try {
      await verifyCustomDomain(tenantId, domainId);
      toast.success(`${domainName} verified successfully`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed. Check DNS records.");
    } finally {
      setVerifyingId(null);
    }
  }

  async function handleRemove(domainId: string, domainName: string) {
    if (!confirm(`Remove domain "${domainName}"?`)) return;
    setRemovingId(domainId);
    try {
      await removeCustomDomain(tenantId, domainId);
      toast.success("Domain removed");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setRemovingId(null);
    }
  }

  async function handleSetPrimary(domainId: string, domainName: string) {
    setSettingPrimaryId(domainId);
    try {
      await setPrimaryDomain(tenantId, domainId);
      toast.success(`${domainName} set as primary domain`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to set primary");
    } finally {
      setSettingPrimaryId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8" />Custom Domains
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect your own domain or use your default subdomain.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 me-2" />Add Domain
        </Button>
      </div>

      {/* Default subdomain */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default Subdomain</CardTitle>
        </CardHeader>
        <CardContent>
          <code className="text-sm bg-muted px-3 py-2 rounded-lg block select-all">
            {subdomainUrl}
          </code>
          <p className="text-xs text-muted-foreground mt-2">
            Always available on all plans. Your site is accessible at this URL.
          </p>
        </CardContent>
      </Card>

      {/* Add domain form */}
      {showAdd && (
        <Card>
          <CardHeader><CardTitle className="text-base">Add Custom Domain</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  placeholder="yourdomain.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  required
                  pattern="^[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?)+$"
                  title="Enter a valid domain like example.com"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={adding}>{adding ? "Adding..." : "Add Domain"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Custom domains list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom Domains ({domains.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {domains.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No custom domains configured. Add a domain to use your own brand URL.
            </p>
          ) : (
            <div className="space-y-5">
              {domains.map((domain) => (
                <div key={domain.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{domain.domain}</span>
                      {domain.isPrimary && (
                        <Badge variant="outline" className="text-xs">
                          <Star className="h-3 w-3 me-1" />Primary
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={domain.status === "VERIFIED" ? "success" : "secondary"}>
                        {domain.status}
                      </Badge>
                      {domain.status === "VERIFIED" && !domain.isPrimary && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetPrimary(domain.id, domain.domain)}
                          disabled={settingPrimaryId === domain.id}
                          className="h-7 text-xs"
                        >
                          <Star className="h-3 w-3 me-1" />
                          {settingPrimaryId === domain.id ? "Setting..." : "Set Primary"}
                        </Button>
                      )}
                      {domain.status !== "VERIFIED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerify(domain.id, domain.domain)}
                          disabled={verifyingId === domain.id}
                          className="h-7 text-xs"
                        >
                          <RefreshCw className={`h-3 w-3 me-1 ${verifyingId === domain.id ? "animate-spin" : ""}`} />
                          {verifyingId === domain.id ? "Checking..." : "Verify DNS"}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemove(domain.id, domain.domain)}
                        disabled={removingId === domain.id}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {domain.status !== "VERIFIED" && (
                    <div className="space-y-2 bg-muted/50 rounded-md p-3">
                      <p className="text-xs font-medium">Add these DNS records at your registrar:</p>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">CNAME record:</p>
                        <code className="block bg-background border text-xs p-2 rounded">
                          {domain.dns.cname.type} <strong>{domain.dns.cname.host}</strong> → {domain.dns.cname.value}
                        </code>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">TXT record (verification):</p>
                        <code className="block bg-background border text-xs p-2 rounded">
                          {domain.dns.txt.type} <strong>{domain.dns.txt.host}</strong> → {domain.dns.txt.value}
                        </code>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        DNS changes can take up to 48 hours to propagate. Click &quot;Verify DNS&quot; once propagated.
                      </p>
                    </div>
                  )}

                  {domain.verifiedAt && (
                    <p className="text-xs text-muted-foreground">
                      Verified {new Date(domain.verifiedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
