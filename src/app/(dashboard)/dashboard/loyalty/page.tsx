import { getCurrentTenant } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function LoyaltyPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  let program = await db.loyaltyProgram.findUnique({
    where: { tenantId: tenant.id },
    include: { _count: { select: { pointEntries: true, levels: true, badges: true } } },
  });

  if (!program) {
    program = await db.loyaltyProgram.create({
      data: {
        tenantId: tenant.id,
        pointsPerDollar: 1,
        referralBonus: 100,
        isActive: true,
      },
      include: { _count: { select: { pointEntries: true, levels: true, badges: true } } },
    });
  }

  const recentEntries = await db.loyaltyPointEntry.findMany({
    where: { programId: program.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const userIds = [...new Set(recentEntries.map((e) => e.userId))];
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const clients = await db.clientProfile.findMany({
    where: { tenantId: tenant.id, isActive: true },
    include: { user: { select: { id: true, name: true, email: true } } },
    take: 50,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Loyalty Program</h1>
        <p className="text-muted-foreground">Reward clients for bookings, check-ins, and referrals.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Point Entries</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{program._count.pointEntries}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Levels</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{program._count.levels}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Badges</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{program._count.badges}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Program Settings</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>Points per Dollar: {program.pointsPerDollar}</p>
          <p>Referral Bonus: {program.referralBonus} points</p>
          <p>Status: {program.isActive ? "Active" : "Inactive"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Award Points</CardTitle></CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              "use server";
              const t = await getCurrentTenant();
              if (!t) return;
              const prog = await db.loyaltyProgram.findUnique({ where: { tenantId: t.id } });
              if (!prog) return;

              const userId = formData.get("userId") as string;
              const points = parseInt(formData.get("points") as string, 10);
              const reason = formData.get("reason") as string;

              if (userId && !isNaN(points) && points > 0) {
                await db.loyaltyPointEntry.create({
                  data: { programId: prog.id, userId, points, reason: reason || undefined },
                });
              }
              revalidatePath("/dashboard/loyalty");
            }}
            className="flex flex-wrap gap-4 items-end"
          >
            <div className="space-y-1">
              <Label htmlFor="userId">Client</Label>
              <select id="userId" name="userId" className="h-10 rounded-md border border-input px-3 text-sm min-w-[200px]">
                <option value="">Select client...</option>
                {clients.map((c) => (
                  <option key={c.user.id} value={c.user.id}>{c.user.name ?? c.user.email}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="points">Points</Label>
              <Input id="points" name="points" type="number" min="1" defaultValue="10" className="w-24" />
            </div>
            <div className="space-y-1 flex-1">
              <Label htmlFor="reason">Reason</Label>
              <Input id="reason" name="reason" placeholder="Bonus for completing challenge" />
            </div>
            <Button type="submit">Award Points</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Point Activity</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {recentEntries.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">No point activity yet.</p>
          )}
          {recentEntries.map((entry) => {
            const user = userMap[entry.userId];
            return (
              <div key={entry.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-sm">{user?.name ?? user?.email ?? entry.userId}</p>
                  {entry.reason && <p className="text-xs text-muted-foreground">{entry.reason}</p>}
                  <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`font-bold ${entry.points > 0 ? "text-green-600" : "text-red-600"}`}>
                  {entry.points > 0 ? "+" : ""}{entry.points} pts
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
