import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { suspendTenant, activateTenant } from "@/features/tenancy/actions/tenant-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function AdminCoachesPage() {
  await requireRole("SUPER_ADMIN");

  const tenants = await db.tenant.findMany({
    include: {
      subscription: true,
      _count: { select: { members: true, clients: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const [total, active, suspended, trial] = await Promise.all([
    db.tenant.count(),
    db.tenant.count({ where: { status: "ACTIVE" } }),
    db.tenant.count({ where: { status: "SUSPENDED" } }),
    db.tenant.count({ where: { status: "TRIAL" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Coaches & Tenants</h1>
        <p className="text-muted-foreground mt-1">Manage coaches, suspend accounts, and view usage.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{active}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Trial</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{trial}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Suspended</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{suspended}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="divide-y pt-6">
          {tenants.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-4 gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.slug} · {t.productLine}</p>
                <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{t._count.clients} clients</span>
                  <span>{t._count.members} members</span>
                  <span>{t.subscription?.plan ?? "FREE"}</span>
                  {t.trialEndsAt && t.status === "TRIAL" && (
                    <span>Trial ends {new Date(t.trialEndsAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant={
                  t.status === "ACTIVE" ? "default" :
                  t.status === "SUSPENDED" ? "destructive" :
                  t.status === "TRIAL" ? "secondary" : "outline"
                }>
                  {t.status}
                </Badge>
                {t.status !== "SUSPENDED" ? (
                  <form action={async () => {
                    "use server";
                    await suspendTenant(t.id);
                  }}>
                    <Button variant="outline" size="sm" type="submit" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                      Suspend
                    </Button>
                  </form>
                ) : (
                  <form action={async () => {
                    "use server";
                    await activateTenant(t.id);
                  }}>
                    <Button variant="outline" size="sm" type="submit">
                      Activate
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Link href="/admin" className="text-sm text-muted-foreground hover:underline">← Admin</Link>
    </div>
  );
}
