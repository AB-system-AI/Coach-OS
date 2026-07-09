import { getCurrentTenant } from "@/lib/auth/session";
import { getWebsiteStats, getCmsPages, getFaqs } from "@/features/website";
import { redirect } from "next/navigation";
import { WebsiteCmsClient } from "./_components/website-cms-client";

export default async function WebsitePage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [stats, pages, faqs] = await Promise.all([
    getWebsiteStats(tenant.id),
    getCmsPages(tenant.id),
    getFaqs(tenant.id),
  ]);

  return (
    <WebsiteCmsClient
      stats={stats}
      pages={pages}
      faqs={faqs}
      tenantId={tenant.id}
    />
  );
}
