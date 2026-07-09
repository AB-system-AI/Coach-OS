import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";

export async function getMarketingStats(tenantId: string) {
  await requireTenantAccess(tenantId);
  const [campaigns, subscribers, landingPages] = await Promise.all([
    db.marketingCampaign.count({ where: { tenantId, isActive: true } }),
    db.newsletterSubscriber.count({ where: { tenantId, isActive: true } }),
    db.landingPage.count({ where: { tenantId, status: "PUBLISHED" } }),
  ]);
  return { campaigns, subscribers, landingPages };
}

export async function getMarketingConfig(tenantId: string) {
  return db.tenantSettings.findUnique({
    where: { tenantId },
    select: {
      seoTitle: true,
      seoDescription: true,
      seoKeywords: true,
      googleAnalyticsId: true,
      metaPixelId: true,
      tiktokPixelId: true,
      newsletterEnabled: true,
    },
  });
}
