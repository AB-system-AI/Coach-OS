import { NextRequest, NextResponse } from "next/server";
import { resolveTenantFromSlug } from "@/features/tenancy";
import { getPublicBlogPosts } from "@/features/website/services/public-site-service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);

  if (!resolved) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const { tenant } = resolved;
  const posts = await getPublicBlogPosts(tenant.id, 50);

  const baseUrl =
    tenant.customDomain
      ? `https://${tenant.customDomain}`
      : `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/${slug}`;

  const items = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid>${baseUrl}/blog/${post.slug}</guid>
      ${post.excerpt ? `<description><![CDATA[${post.excerpt}]]></description>` : ""}
      ${post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ""}
      ${post.authorName ? `<author>${post.authorName}</author>` : ""}
      ${post.category ? `<category>${post.category.name}</category>` : ""}
    </item>`
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${tenant.name} Blog]]></title>
    <link>${baseUrl}/blog</link>
    <description><![CDATA[Latest articles from ${tenant.name}]]></description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
