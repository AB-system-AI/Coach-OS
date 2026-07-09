import { getCurrentTenant } from "@/lib/auth/session";
import { getMarketingStats } from "@/features/marketing";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function MarketingPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [stats, campaigns, subscribers] = await Promise.all([
    getMarketingStats(tenant.id),
    db.marketingCampaign.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.newsletterSubscriber.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Marketing</h1>
        <p className="text-muted-foreground">Campaigns, landing pages, and newsletter subscribers.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Campaigns</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.campaigns}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Subscribers</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.subscribers}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Landing Pages</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.landingPages}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Create Campaign</CardTitle></CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              "use server";
              const t = await getCurrentTenant();
              if (!t) return;
              await db.marketingCampaign.create({
                data: {
                  tenantId: t.id,
                  name: formData.get("name") as string,
                  utmSource: (formData.get("utmSource") as string) || undefined,
                  utmMedium: (formData.get("utmMedium") as string) || undefined,
                  utmCampaign: (formData.get("utmCampaign") as string) || undefined,
                  landingPageUrl: (formData.get("landingPageUrl") as string) || undefined,
                  isActive: true,
                },
              });
              revalidatePath("/dashboard/marketing");
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <Label htmlFor="name">Campaign Name *</Label>
                <Input id="name" name="name" required placeholder="January Newsletter" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="utmSource">UTM Source</Label>
                <Input id="utmSource" name="utmSource" placeholder="newsletter" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="utmMedium">UTM Medium</Label>
                <Input id="utmMedium" name="utmMedium" placeholder="email" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="utmCampaign">UTM Campaign</Label>
                <Input id="utmCampaign" name="utmCampaign" placeholder="jan-2026" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="landingPageUrl">Landing Page URL</Label>
                <Input id="landingPageUrl" name="landingPageUrl" type="url" placeholder="https://..." />
              </div>
            </div>
            <Button type="submit">Create Campaign</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Campaigns ({campaigns.length})</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {campaigns.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">No campaigns yet.</p>
          )}
          {campaigns.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-sm">{c.name}</p>
                <div className="flex gap-2 mt-0.5 text-xs text-muted-foreground">
                  {c.utmSource && <span>Source: {c.utmSource}</span>}
                  {c.utmMedium && <span>Medium: {c.utmMedium}</span>}
                  <span>Clicks: {c.clicks}</span>
                  <span>Conversions: {c.conversions}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={c.isActive ? "default" : "secondary"}>{c.isActive ? "Active" : "Inactive"}</Badge>
                <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Subscribers ({stats.subscribers})</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {subscribers.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">No subscribers yet.</p>
          )}
          {subscribers.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2.5 text-sm">
              <span>{s.email}</span>
              <span className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
