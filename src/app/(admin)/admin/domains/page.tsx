import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminDomainsPage() {
  await requireRole("SUPER_ADMIN");

  const domains = await db.customDomain.findMany({
    include: { tenant: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  const verified = domains.filter((d) => d.verifiedAt !== null).length;
  const pending = domains.filter((d) => d.verifiedAt === null).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Custom Domains</h1>
        <p className="text-muted-foreground mt-1">All custom domains across tenants.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{domains.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Verified</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{verified}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{pending}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="divide-y pt-6">
          {domains.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">No custom domains configured.</p>
          )}
          {domains.map((domain) => (
            <div key={domain.id} className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium font-mono">{domain.domain}</p>
                <p className="text-sm text-muted-foreground">
                  {domain.tenant.name} ({domain.tenant.slug})
                </p>
                <p className="text-xs text-muted-foreground">
                  Added: {new Date(domain.createdAt).toLocaleDateString()}
                  {domain.verifiedAt && ` · Verified: ${new Date(domain.verifiedAt).toLocaleDateString()}`}
                </p>
                {domain.verificationToken && (
                  <p className="text-xs font-mono text-muted-foreground mt-1 truncate max-w-xs">
                    TXT: {domain.verificationToken}
                  </p>
                )}
              </div>
              <Badge variant={domain.verifiedAt ? "default" : "secondary"}>
                {domain.verifiedAt ? "Verified" : "Pending"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
