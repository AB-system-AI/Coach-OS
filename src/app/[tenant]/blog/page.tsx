import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { resolveTenantFromSlug } from "@/features/tenancy";
import { getPublicBlogPosts } from "@/features/website/services/public-site-service";
import { BookOpen, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { Metadata } from "next";

type Props = { params: Promise<{ tenant: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) return {};
  return {
    title: `Blog | ${resolved.tenant.name}`,
    description: `Articles, tips and insights from ${resolved.tenant.name}.`,
  };
}

export default async function BlogPage({ params }: Props) {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) notFound();

  const { tenant } = resolved;
  const theme = tenant.theme;
  const posts = await getPublicBlogPosts(tenant.id);

  const [featured, ...rest] = posts;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1
          className="text-4xl font-bold mb-4"
          style={{ fontFamily: "var(--tenant-heading-font)" }}
        >
          Blog
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Tips, guides and insights to help you on your fitness journey.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">No blog posts yet. Check back soon!</p>
        </div>
      ) : (
        <>
          {/* Featured */}
          {featured && (
            <Link
              href={`/${slug}/blog/${featured.slug}`}
              className="group grid md:grid-cols-2 gap-6 rounded-2xl border bg-card overflow-hidden hover:shadow-lg transition-shadow mb-12"
            >
              {featured.coverImageUrl ? (
                <div className="relative h-64 md:h-full min-h-[280px] overflow-hidden">
                  <Image
                    src={featured.coverImageUrl}
                    alt={featured.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    priority
                  />
                </div>
              ) : (
                <div
                  className="h-64 md:h-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${theme?.primaryColor ?? "#6366f1"}22, ${theme?.secondaryColor ?? "#8b5cf6"}33)`,
                  }}
                >
                  <BookOpen className="h-16 w-16" style={{ color: "var(--tenant-primary)" }} />
                </div>
              )}
              <div className="p-6 flex flex-col justify-center">
                <span
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--tenant-primary)" }}
                >
                  {featured.category?.name ?? "Featured"}
                </span>
                <h2 className="text-2xl font-bold mb-3 group-hover:text-[var(--tenant-primary)] transition-colors">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-muted-foreground line-clamp-3 mb-4">{featured.excerpt}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {featured.authorName && <span>{featured.authorName}</span>}
                  {featured.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(featured.publishedAt), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )}

          {/* Rest */}
          {rest.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post) => (
                <Link
                  key={post.id}
                  href={`/${slug}/blog/${post.slug}`}
                  className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {post.coverImageUrl ? (
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div
                      className="h-44 flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${theme?.primaryColor ?? "#6366f1"}11, ${theme?.secondaryColor ?? "#8b5cf6"}22)`,
                      }}
                    >
                      <BookOpen className="h-10 w-10" style={{ color: "var(--tenant-primary)" }} />
                    </div>
                  )}
                  <div className="p-4">
                    {post.category && (
                      <span
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--tenant-primary)" }}
                      >
                        {post.category.name}
                      </span>
                    )}
                    <h3 className="font-semibold mt-1 mb-2 group-hover:text-[var(--tenant-primary)] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {post.authorName && <span>{post.authorName}</span>}
                      {post.publishedAt && (
                        <span>{format(new Date(post.publishedAt), "MMM d, yyyy")}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
