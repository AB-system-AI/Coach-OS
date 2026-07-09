import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      ],
    });
    flags = await db.featureFlag.findMany({ orderBy: { key: "asc" } });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Feature Flags</h1>
        <p className="text-muted-foreground mt-1">
          Control platform-wide feature rollouts.
        </p>
      </div>

      <div className="grid gap-4">
        {flags.map((flag) => (
          <Card key={flag.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">{flag.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{flag.description}</p>
              </div>
              <Badge variant={flag.isEnabled ? "success" : "secondary"}>
                {flag.isEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Key: <code>{flag.key}</code> · Rollout: {flag.rolloutPercent}%
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
