import type { MetadataRoute } from "next";
import { resolveTenantFromSlug } from "@/features/tenancy";
import { resolveTenantPublicUrl } from "@/lib/env";
import {
  getPublicPrograms,
  getPublicBlogPosts,
} from "@/features/website/services/public-site-service";

export default async function sitemap({
  params,
}: {
  params: { tenant: string };
}): Promise<MetadataRoute.Sitemap> {
  const slug = params.tenant;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) return [];

  const { tenant } = resolved;
  const baseUrl = resolveTenantPublicUrl(slug, tenant.customDomain);

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/programs`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/recovery`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/gallery`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/reviews`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/booking`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const [programs, posts] = await Promise.all([
    getPublicPrograms(tenant.id),
    getPublicBlogPosts(tenant.id),
  ]);

  const programPages: MetadataRoute.Sitemap = programs.map((p) => ({
    url: `${baseUrl}/programs/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...programPages, ...blogPages];
}
