import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent } from "@/components/ui/card";
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
    take: 50,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Coaches & Tenants</h1>
        <p className="text-muted-foreground mt-1">Manage coaches, suspend accounts, and view usage.</p>
      </div>
      <Card>
        <CardContent className="divide-y pt-6">
          {tenants.map((t) => (
            <div key={t.id} className="flex justify-between py-4">
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.slug} · {t.productLine}</p>
              </div>
              <div className="text-end text-sm">
                <Badge>{t.status}</Badge>
                <p className="text-muted-foreground mt-1">
                  {t.subscription?.plan ?? "FREE"} · {t._count.clients} clients
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Link href="/admin" className="text-sm text-muted-foreground hover:underline">← Admin</Link>
    </div>
  );
}
