import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function AdminSubscriptionsPage() {
  await requireRole("SUPER_ADMIN");

  const subs = await db.tenantSubscription.findMany({
    include: { tenant: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">SaaS Subscriptions</h1>
      <p className="text-muted-foreground">Starter, Professional, Business, Enterprise plans.</p>
      <Card>
        <CardContent className="divide-y pt-6">
          {subs.map((s) => (
            <div key={s.id} className="flex justify-between py-4 text-sm">
              <span className="font-medium">{s.tenant.name}</span>
              <div className="flex gap-2">
                <Badge>{s.plan}</Badge>
                <Badge variant="outline">{s.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Link href="/admin" className="text-sm text-muted-foreground hover:underline">← Admin</Link>
    </div>
  );
}
