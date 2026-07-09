import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { revalidatePath } from "next/cache";

async function toggleFlag(id: string, isEnabled: boolean) {
  "use server";
  await requireRole("SUPER_ADMIN");
  await db.featureFlag.update({ where: { id }, data: { isEnabled } });
  revalidatePath("/admin/feature-flags");
}

async function updateRollout(id: string, rolloutPercent: number) {
  "use server";
  await requireRole("SUPER_ADMIN");
  await db.featureFlag.update({ where: { id }, data: { rolloutPercent } });
  revalidatePath("/admin/feature-flags");
}

export default async function FeatureFlagsPage() {
  await requireRole("SUPER_ADMIN");

  let flags = await db.featureFlag.findMany({ orderBy: { key: "asc" } });

  if (flags.length === 0) {
    await db.featureFlag.createMany({
      data: [
        { key: "marketplace", name: "Public Marketplace", description: "Coach discovery marketplace", isEnabled: true, rolloutPercent: 100 },
        { key: "ai_assistant", name: "AI Assistant", description: "Platform-wide AI features", isEnabled: true, rolloutPercent: 100 },
        { key: "courses", name: "Courses Module", description: "Online courses globally", isEnabled: true, rolloutPercent: 100 },
        { key: "shop", name: "Shop Module", description: "E-commerce for all tenants", isEnabled: true, rolloutPercent: 100 },
        { key: "community", name: "Community", description: "Community features", isEnabled: false, rolloutPercent: 0 },
        { key: "api_v1", name: "REST API v1", description: "Public API access", isEnabled: true, rolloutPercent: 100 },
        { key: "whatsapp", name: "WhatsApp Integration", description: "WhatsApp messaging", isEnabled: false, rolloutPercent: 0 },
        { key: "push_notifications", name: "Push Notifications", description: "Browser push notifications", isEnabled: true, rolloutPercent: 100 },
      ],
    });
    flags = await db.featureFlag.findMany({ orderBy: { key: "asc" } });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Feature Flags</h1>
        <p className="text-muted-foreground mt-1">Control platform-wide feature rollouts.</p>
      </div>

      <div className="grid gap-4">
        {flags.map((flag) => (
          <Card key={flag.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">{flag.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{flag.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Key: <code className="font-mono">{flag.key}</code>
                </p>
              </div>
              <Badge variant={flag.isEnabled ? "default" : "secondary"}>
                {flag.isEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <form action={async () => {
                "use server";
                await toggleFlag(flag.id, !flag.isEnabled);
              }}>
                <Button
                  type="submit"
                  variant={flag.isEnabled ? "destructive" : "default"}
                  size="sm"
                >
                  {flag.isEnabled ? "Disable" : "Enable"}
                </Button>
              </form>

              <form
                action={async (formData: FormData) => {
                  "use server";
                  const pct = parseInt(formData.get("rollout") as string, 10);
                  if (!isNaN(pct) && pct >= 0 && pct <= 100) {
                    await updateRollout(flag.id, pct);
                  }
                }}
                className="flex items-center gap-2"
              >
                <Label htmlFor={`rollout-${flag.id}`} className="text-sm">Rollout %</Label>
                <Input
                  id={`rollout-${flag.id}`}
                  name="rollout"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={flag.rolloutPercent}
                  className="w-20 h-8"
                />
                <Button type="submit" variant="outline" size="sm">Update</Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
