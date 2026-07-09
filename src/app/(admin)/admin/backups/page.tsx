import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { revalidatePath } from "next/cache";

async function createBackup() {
  "use server";
  await requireRole("SUPER_ADMIN");

  const firstTenant = await db.tenant.findFirst({ select: { id: true } });
  if (!firstTenant) return;

  const counts = await Promise.all([
    db.tenant.count(),
    db.user.count(),
    db.clientProfile.count(),
    db.payment.count(),
  ]);

  await db.backupRecord.create({
    data: {
      tenantId: firstTenant.id,
      type: "FULL",
      status: "COMPLETED",
      completedAt: new Date(),
      metadata: {
        tenants: counts[0],
        users: counts[1],
        clients: counts[2],
        payments: counts[3],
        note: "Metadata-only backup. Configure storage credentials for full backups.",
        timestamp: new Date().toISOString(),
      },
    },
  });

  revalidatePath("/admin/backups");
}

export default async function AdminBackupsPage() {
  await requireRole("SUPER_ADMIN");

  const backups = await db.backupRecord.findMany({
    include: { tenant: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const hasStorageConfig = !!(
    process.env.AWS_S3_BUCKET || process.env.CLOUDFLARE_R2_BUCKET
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Backups</h1>
          <p className="text-muted-foreground mt-1">Database backup records.</p>
        </div>
        <form action={createBackup}>
          <Button type="submit">Create Backup Record</Button>
        </form>
      </div>

      {!hasStorageConfig && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="py-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              No storage backend configured. Set <code>AWS_S3_BUCKET</code> or{" "}
              <code>CLOUDFLARE_R2_BUCKET</code> for actual file backups. Currently storing metadata only.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Backup History</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {backups.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">No backups recorded yet.</p>
          )}
          {backups.map((b) => {
            const meta = b.metadata as Record<string, unknown> | null;
            return (
              <div key={b.id} className="flex items-start justify-between py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm font-mono">{b.id.slice(0, 8)}...</p>
                    <Badge variant={b.status === "COMPLETED" ? "default" : b.status === "FAILED" ? "destructive" : "secondary"}>
                      {b.status}
                    </Badge>
                    <Badge variant="outline">{b.type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(b.createdAt).toLocaleString()}
                  </p>
                  {meta && (
                    <p className="text-xs text-muted-foreground">
                      Tenants: {String(meta.tenants ?? 0)} · Users: {String(meta.users ?? 0)} · Clients: {String(meta.clients ?? 0)}
                    </p>
                  )}
                </div>
                {b.fileUrl && (
                  <a href={b.fileUrl} className="text-xs text-blue-600 hover:underline">
                    Download
                  </a>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
