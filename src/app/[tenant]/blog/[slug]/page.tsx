import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { resolveTenantFromSlug } from "@/features/tenancy";
import { resolveTenantPublicUrl } from "@/lib/env";
import {
  getPublicBlogPost,
  getRelatedBlogPosts,
} from "@/features/website/services/public-site-service";
import { JsonLd, buildBlogPostJsonLd } from "@/features/website/components/json-ld";
import { Calendar, ArrowLeft, User } from "lucide-react";
import { format } from "date-fns";
import type { Metadata } from "next";

type Props = { params: Promise<{ tenant: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: tenantSlug, slug } = await params;
  const resolved = await resolveTenantFromSlug(tenantSlug);
  if (!resolved) return {};

  const post = await getPublicBlogPost(resolved.tenant.id, slug);
  if (!post) return {};

  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
      publishedTime: post.publishedAt?.toISOString(),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { tenant: tenantSlug, slug } = await params;
  const resolved = await resolveTenantFromSlug(tenantSlug);
  if (!resolved) notFound();

  const { tenant } = resolved;

  const post = await getPublicBlogPost(tenant.id, slug);
  if (!post || post.status !== "PUBLISHED") notFound();

  const related = await getRelatedBlogPosts(
    tenant.id,
    post.categoryId,
    post.slug,
    3
  );

  const baseUrl = resolveTenantPublicUrl(tenantSlug, tenant.customDomain);
  const jsonLd = buildBlogPostJsonLd({
    title: post.title,
    description: post.excerpt ?? undefined,
    url: `${baseUrl}/blog/${post.slug}`,
    imageUrl: post.coverImageUrl ?? undefined,
    authorName: post.authorName ?? tenant.name,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="container mx-auto px-4 py-12 max-w-3xl">
        <Link
          href={`/${tenantSlug}/blog`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        {/* Category */}
        {post.category && (
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--tenant-primary)" }}
          >
            {post.category.name}
          </span>
        )}

        <h1
          className="text-3xl md:text-4xl font-bold mt-2 mb-4"
          style={{ fontFamily: "var(--tenant-heading-font)" }}
        >
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
          {post.authorName && (
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.authorName}
            </span>
          )}
          {post.publishedAt && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {format(new Date(post.publishedAt), "MMMM d, yyyy")}
            </span>
          )}
        </div>

        {post.coverImageUrl && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-10 shadow-lg">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {post.excerpt && (
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed font-medium">
            {post.excerpt}
          </p>
        )}

        <div
          className="prose prose-neutral max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Sharing */}
        <div className="mt-12 pt-8 border-t flex flex-wrap gap-3">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${baseUrl}/blog/${post.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Share on X/Twitter →
          </a>
        </div>
      </article>

      {/* Related Posts */}
      {related.length > 0 && (
        <section className="bg-muted/20 py-12 mt-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/${tenantSlug}/blog/${p.slug}`}
                  className="group rounded-xl border bg-background overflow-hidden hover:shadow-md transition-shadow"
                >
                  {p.coverImageUrl && (
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={p.coverImageUrl}
                        alt={p.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold group-hover:text-[var(--tenant-primary)] transition-colors line-clamp-2">
                      {p.title}
                    </h3>
                    {p.publishedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(p.publishedAt), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
