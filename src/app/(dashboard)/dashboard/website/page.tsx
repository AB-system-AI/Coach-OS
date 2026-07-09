import { getCurrentTenant } from "@/lib/auth/session";
import { getWebsiteStats, getCmsPages } from "@/features/website";
import { ModuleOverview } from "@/components/layout/module-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

export default async function WebsitePage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [stats, pages] = await Promise.all([
    getWebsiteStats(tenant.id),
    getCmsPages(tenant.id),
  ]);

  return (
    <div className="space-y-8">
      <ModuleOverview
        title="Website Builder"
        description="Drag & drop pages: Home, About, Programs, Recovery, Shop, Blog, Contact."
        stats={[
          { label: "Pages", value: stats.pages },
          { label: "Blog Posts", value: stats.posts },
          { label: "FAQs", value: stats.faqs },
        ]}
        actions={[
          { label: "Branding & Theme", href: "/dashboard/settings/branding" },
          { label: "Domains", href: "/dashboard/settings/domains" },
          { label: "Blog", href: "/dashboard/blog" },
        ]}
      />
      <div className="flex flex-wrap gap-2">
        {["Hero", "Testimonials", "Gallery", "Pricing", "FAQ", "CTA", "SEO"].map((f) => (
          <Badge key={f} variant="secondary">{f}</Badge>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>CMS Pages</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {pages.map((p) => (
            <div key={p.id} className="flex justify-between py-3">
              <span className="font-medium capitalize">{p.slug}</span>
              <Badge variant="outline">{p.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
