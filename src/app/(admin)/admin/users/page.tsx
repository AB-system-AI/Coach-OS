import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  await requireRole("SUPER_ADMIN");
  const { q, role } = await searchParams;

  const users = await db.user.findMany({
    where: {
      ...(q ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
      ...(role ? { role: role as "SUPER_ADMIN" | "COACH" | "ASSISTANT_COACH" | "CLIENT" } : {}),
    },
    include: {
      memberships: { include: { tenant: { select: { name: true, slug: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const [total, coaches, clients, admins] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "COACH" } }),
    db.user.count({ where: { role: "CLIENT" } }),
    db.user.count({ where: { role: "SUPER_ADMIN" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-1">All platform users.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Coaches</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{coaches}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Clients</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{clients}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Admins</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{admins}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users</CardTitle>
          </div>
          <form className="flex gap-2 mt-2" method="get">
            <Input name="q" defaultValue={q} placeholder="Search name or email..." className="max-w-xs" />
            <select name="role" defaultValue={role ?? ""} className="h-10 rounded-md border border-input px-3 text-sm">
              <option value="">All roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="COACH">Coach</option>
              <option value="ASSISTANT_COACH">Assistant Coach</option>
              <option value="CLIENT">Client</option>
            </select>
            <button type="submit" className="rounded-md bg-primary px-4 text-sm text-primary-foreground">Filter</button>
          </form>
        </CardHeader>
        <CardContent className="divide-y">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-sm">{u.name ?? "(no name)"}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
                {u.memberships.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {u.memberships.map((m) => `${m.tenant.name} (${m.role})`).join(", ")}
                  </p>
                )}
              </div>
              <div className="text-end">
                <Badge variant={u.role === "SUPER_ADMIN" ? "destructive" : u.role === "COACH" ? "default" : "secondary"}>
                  {u.role}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {u.emailVerified ? "Verified" : "Unverified"} · {new Date(u.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
