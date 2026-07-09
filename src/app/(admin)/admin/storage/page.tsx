import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default async function AdminStoragePage() {
  await requireRole("SUPER_ADMIN");

  const [totalMedia, mediaByTenant, recentMedia] = await Promise.all([
    db.media.aggregate({ _sum: { sizeBytes: true }, _count: true }),
    db.media.groupBy({
      by: ["tenantId"],
      _sum: { sizeBytes: true },
      _count: { tenantId: true },
      orderBy: { _sum: { sizeBytes: "desc" } },
      take: 20,
    }),
    db.media.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { tenant: { select: { name: true, slug: true } } },
    }),
  ]);

  const tenantIds = mediaByTenant.map((m) => m.tenantId);
  const tenants = await db.tenant.findMany({
    where: { id: { in: tenantIds } },
    select: { id: true, name: true, slug: true },
  });
  const tenantMap = Object.fromEntries(tenants.map((t) => [t.id, t]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Storage</h1>
        <p className="text-muted-foreground mt-1">Media usage per tenant.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Files</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalMedia._count}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Storage</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(Number(totalMedia._sum.sizeBytes ?? 0))}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Storage by Tenant</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {mediaByTenant.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">No media files uploaded yet.</p>
          )}
          {mediaByTenant.map((m) => {
            const tenant = tenantMap[m.tenantId];
            return (
              <div key={m.tenantId} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{tenant?.name ?? m.tenantId}</p>
                  <p className="text-sm text-muted-foreground">{m._count.tenantId} files</p>
                </div>
                <span className="font-mono text-sm">{formatBytes(Number(m._sum.sizeBytes ?? 0))}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Uploads</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {recentMedia.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-sm truncate max-w-xs">{m.name}</p>
                <p className="text-xs text-muted-foreground">
                  {m.tenant?.name} · {m.mimeType} · {new Date(m.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">{formatBytes(Number(m.sizeBytes ?? 0))}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
