import { getCurrentTenant } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function ChallengesPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const challenges = await db.challenge.findMany({
    where: { tenantId: tenant.id },
    include: { _count: { select: { participants: true } } },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const active = challenges.filter((c) => c.startDate <= now && c.endDate >= now);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Challenges</h1>
        <p className="text-muted-foreground">Create fitness challenges for your clients.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{challenges.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{active.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Participants</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {challenges.reduce((sum, c) => sum + c._count.participants, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Create Challenge</CardTitle></CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              "use server";
              const t = await getCurrentTenant();
              if (!t) return;
              const title = formData.get("title") as string;
              if (!title) return;

              await db.challenge.create({
                data: {
                  tenantId: t.id,
                  title,
                  slug: slugify(title),
                  description: (formData.get("description") as string) || undefined,
                  startDate: new Date(formData.get("startDate") as string),
                  endDate: new Date(formData.get("endDate") as string),
                  type: (formData.get("type") as "THIRTY_DAY" | "WEIGHT_LOSS" | "MUSCLE_GAIN" | "CUSTOM") || "CUSTOM",
                  pointsPerCheckIn: parseInt(formData.get("pointsPerCheckIn") as string, 10) || 10,
                },
              });
              revalidatePath("/dashboard/challenges");
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" required placeholder="30-Day Fat Loss Challenge" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="type">Type</Label>
                <select id="type" name="type" className="h-10 w-full rounded-md border border-input px-3 text-sm">
                  <option value="CUSTOM">Custom</option>
                  <option value="THIRTY_DAY">30 Day</option>
                  <option value="WEIGHT_LOSS">Weight Loss</option>
                  <option value="MUSCLE_GAIN">Muscle Gain</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="pointsPerCheckIn">Points per Check-in</Label>
                <Input id="pointsPerCheckIn" name="pointsPerCheckIn" type="number" min="0" defaultValue="10" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input id="startDate" name="startDate" type="date" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="endDate">End Date *</Label>
                <Input id="endDate" name="endDate" type="date" required />
              </div>
              <div className="space-y-1 col-span-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={2}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                  placeholder="Challenge description..."
                />
              </div>
            </div>
            <Button type="submit">Create Challenge</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {challenges.map((challenge) => {
          const isActive = challenge.startDate <= now && challenge.endDate >= now;
          return (
            <Card key={challenge.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{challenge.title}</p>
                    <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Ended"}</Badge>
                    <Badge variant="outline" className="text-xs">{challenge.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(challenge.startDate).toLocaleDateString()} — {new Date(challenge.endDate).toLocaleDateString()}
                    {` · ${challenge._count.participants} participants`}
                    {` · ${challenge.pointsPerCheckIn} pts/check-in`}
                  </p>
                  {challenge.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{challenge.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {challenges.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No challenges yet. Create your first challenge above.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
