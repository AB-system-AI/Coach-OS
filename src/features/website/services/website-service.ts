import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";

export async function getCmsPages(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.cmsPage.findMany({
    where: { tenantId },
    orderBy: { slug: "asc" },
  });
}

export async function getBlogPosts(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.blogPost.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getFaqs(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.faq.findMany({
    where: { tenantId },
    orderBy: { order: "asc" },
  });
}

export async function getWebsiteStats(tenantId: string) {
  await requireTenantAccess(tenantId);
  const [pages, posts, faqs] = await Promise.all([
    db.cmsPage.count({ where: { tenantId } }),
    db.blogPost.count({ where: { tenantId } }),
    db.faq.count({ where: { tenantId } }),
  ]);
  return { pages, posts, faqs };
}
