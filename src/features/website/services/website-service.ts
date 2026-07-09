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

export async function getBlogPostById(tenantId: string, postId: string) {
  await requireTenantAccess(tenantId);
  return db.blogPost.findFirst({ where: { id: postId, tenantId } });
}

export async function createBlogPost(
  tenantId: string,
  data: {
    title: string;
    slug: string;
    content?: string;
    excerpt?: string;
    status?: "DRAFT" | "PUBLISHED";
    coverImageUrl?: string;
    authorName?: string;
  }
) {
  await requireTenantAccess(tenantId);
  return db.blogPost.create({
    data: {
      tenantId,
      title: data.title,
      slug: data.slug,
      content: data.content ?? "",
      excerpt: data.excerpt,
      status: data.status ?? "DRAFT",
      coverImageUrl: data.coverImageUrl,
      authorName: data.authorName,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    },
  });
}

export async function updateBlogPost(
  tenantId: string,
  postId: string,
  data: Partial<{
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    status: "DRAFT" | "PUBLISHED";
    coverImageUrl: string;
  }>
) {
  await requireTenantAccess(tenantId);
  return db.blogPost.update({
    where: { id: postId, tenantId },
    data: {
      ...data,
      ...(data.status === "PUBLISHED" ? { publishedAt: new Date() } : {}),
    },
  });
}

export async function deleteBlogPost(tenantId: string, postId: string) {
  await requireTenantAccess(tenantId);
  await db.blogPost.delete({ where: { id: postId, tenantId } });
}

export async function getCmsPageById(tenantId: string, pageId: string) {
  await requireTenantAccess(tenantId);
  return db.cmsPage.findFirst({ where: { id: pageId, tenantId } });
}

export async function createCmsPage(
  tenantId: string,
  data: { title: string; slug: string; content?: string; status?: "DRAFT" | "PUBLISHED" }
) {
  await requireTenantAccess(tenantId);
  return db.cmsPage.create({
    data: {
      tenantId,
      title: data.title,
      slug: data.slug,
      content: data.content ?? "{}",
      status: data.status ?? "DRAFT",
    },
  });
}

export async function updateCmsPage(
  tenantId: string,
  pageId: string,
  data: Partial<{ title: string; content: string; status: "DRAFT" | "PUBLISHED" }>
) {
  await requireTenantAccess(tenantId);
  return db.cmsPage.update({
    where: { id: pageId, tenantId },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    },
  });
}

export async function deleteCmsPage(tenantId: string, pageId: string) {
  await requireTenantAccess(tenantId);
  await db.cmsPage.delete({ where: { id: pageId, tenantId } });
}

export async function createFaq(
  tenantId: string,
  data: { question: string; answer: string; order?: number }
) {
  await requireTenantAccess(tenantId);
  return db.faq.create({ data: { tenantId, ...data } });
}

export async function deleteFaq(tenantId: string, faqId: string) {
  await requireTenantAccess(tenantId);
  await db.faq.delete({ where: { id: faqId, tenantId } });
}
