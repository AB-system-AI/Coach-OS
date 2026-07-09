import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { revalidatePath } from "next/cache";
import { CheckCircle, Star, Zap, Globe } from "lucide-react";

export default async function AdminMarketplacePage() {
  await requireRole("SUPER_ADMIN");

  const profiles = await db.coachMarketplaceProfile.findMany({
    include: { tenant: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: profiles.length,
    verified: profiles.filter((p) => p.isVerified).length,
    featured: profiles.filter((p) => p.isFeatured).length,
    visible: profiles.filter((p) => p.isVisible).length,
  };

  async function verifyProfile(profileId: string, isVerified: boolean) {
    "use server";
    await requireRole("SUPER_ADMIN");
    await db.coachMarketplaceProfile.update({
      where: { id: profileId },
      data: { isVerified },
    });
    revalidatePath("/admin/marketplace");
  }

  async function toggleFeatured(profileId: string, isFeatured: boolean) {
    "use server";
    await requireRole("SUPER_ADMIN");
    await db.coachMarketplaceProfile.update({
      where: { id: profileId },
      data: { isFeatured },
    });
    revalidatePath("/admin/marketplace");
  }

  async function toggleSponsored(profileId: string, isSponsored: boolean) {
    "use server";
    await requireRole("SUPER_ADMIN");
    await db.coachMarketplaceProfile.update({
      where: { id: profileId },
      data: {
        isSponsored,
        sponsoredUntil: isSponsored ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      },
    });
    revalidatePath("/admin/marketplace");
  }

  async function toggleVisible(profileId: string, isVisible: boolean) {
    "use server";
    await requireRole("SUPER_ADMIN");
    await db.coachMarketplaceProfile.update({
      where: { id: profileId },
      data: { isVisible },
    });
    revalidatePath("/admin/marketplace");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <p className="text-muted-foreground">Manage coach marketplace profiles, verification, and featured listings.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Profiles</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Verified</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{stats.verified}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Featured</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{stats.featured}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Visible</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.visible}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Coach Profiles</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {profiles.length === 0 && (
              <p className="text-muted-foreground text-sm p-6">No marketplace profiles yet.</p>
            )}
            {profiles.map((profile) => (
              <div key={profile.id} className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{profile.tenant.name}</span>
                    <span className="text-xs text-muted-foreground">@{profile.tenant.slug}</span>
                    {profile.isVerified && (
                      <Badge variant="default" className="text-xs gap-1"><CheckCircle className="h-3 w-3" />Verified</Badge>
                    )}
                    {profile.isFeatured && (
                      <Badge variant="secondary" className="text-xs gap-1 bg-yellow-100 text-yellow-800"><Star className="h-3 w-3" />Featured</Badge>
                    )}
                    {profile.isSponsored && (
                      <Badge variant="secondary" className="text-xs gap-1 bg-purple-100 text-purple-800"><Zap className="h-3 w-3" />Sponsored</Badge>
                    )}
                    {profile.isVisible && (
                      <Badge variant="outline" className="text-xs gap-1"><Globe className="h-3 w-3" />Visible</Badge>
                    )}
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                    {profile.headline && <span className="truncate max-w-xs">{profile.headline}</span>}
                    <span>★ {profile.averageRating.toFixed(1)} ({profile.reviewCount} reviews)</span>
                    {profile.marketplaceTier && <span>Tier: {profile.marketplaceTier}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <form action={verifyProfile.bind(null, profile.id, !profile.isVerified)}>
                    <Button type="submit" size="sm" variant={profile.isVerified ? "outline" : "default"} className="text-xs">
                      {profile.isVerified ? "Unverify" : "Verify"}
                    </Button>
                  </form>
                  <form action={toggleFeatured.bind(null, profile.id, !profile.isFeatured)}>
                    <Button type="submit" size="sm" variant="outline" className="text-xs">
                      {profile.isFeatured ? "Unfeature" : "Feature"}
                    </Button>
                  </form>
                  <form action={toggleSponsored.bind(null, profile.id, !profile.isSponsored)}>
                    <Button type="submit" size="sm" variant="outline" className="text-xs">
                      {profile.isSponsored ? "Remove Sponsor" : "Sponsor (30d)"}
                    </Button>
                  </form>
                  <form action={toggleVisible.bind(null, profile.id, !profile.isVisible)}>
                    <Button type="submit" size="sm" variant="outline" className="text-xs">
                      {profile.isVisible ? "Hide" : "Show"}
                    </Button>
                  </form>
                  <a
                    href={`/${profile.tenant.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
