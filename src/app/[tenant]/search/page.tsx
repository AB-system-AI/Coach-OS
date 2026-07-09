import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { resolveTenantFromSlug } from "@/features/tenancy";
import { searchPublicContent } from "@/features/website/services/public-site-service";
import { Search, Dumbbell, BookOpen, Star } from "lucide-react";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) return {};
  return { title: `Search | ${resolved.tenant.name}` };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { tenant: slug } = await params;
  const { q } = await searchParams;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) notFound();

  const { tenant } = resolved;
  const theme = tenant.theme;
  const query = q?.trim() ?? "";

  const results = query.length >= 2
    ? await searchPublicContent(tenant.id, query)
    : null;

  const totalResults = results
    ? results.programs.length + results.posts.length + results.services.length + results.faqs.length
    : 0;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1
        className="text-3xl font-bold mb-8"
        style={{ fontFamily: "var(--tenant-heading-font)" }}
      >
        Search
      </h1>

      {/* Search Input */}
      <form method="get" className="mb-10">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              name="q"
              defaultValue={query}
              placeholder="Search programs, services, blog posts…"
              className="w-full rounded-lg border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 ring-[var(--tenant-primary)]"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--tenant-primary)" }}
          >
            Search
          </button>
        </div>
      </form>

      {!results && (
        <p className="text-muted-foreground text-center py-12">
          Enter a search term to find programs, services, and articles.
        </p>
      )}

      {results && totalResults === 0 && (
        <div className="text-center py-12 space-y-2">
          <Search className="h-10 w-10 mx-auto text-muted-foreground/30" />
          <p className="font-medium">No results for &ldquo;{query}&rdquo;</p>
          <p className="text-sm text-muted-foreground">
            Try different keywords or browse our{" "}
            <Link href={`/${slug}/programs`} className="underline" style={{ color: "var(--tenant-primary)" }}>
              programs
            </Link>{" "}
            and{" "}
            <Link href={`/${slug}/recovery`} className="underline" style={{ color: "var(--tenant-primary)" }}>
              services
            </Link>.
          </p>
        </div>
      )}

      {results && totalResults > 0 && (
        <div className="space-y-10">
          <p className="text-sm text-muted-foreground">
            {totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>

          {/* Programs */}
          {results.programs.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Dumbbell className="h-5 w-5" style={{ color: "var(--tenant-primary)" }} />
                Programs
              </h2>
              <div className="space-y-3">
                {results.programs.map((p) => (
                  <Link
                    key={p.id}
                    href={`/${slug}/programs/${p.slug}`}
                    className="flex gap-4 rounded-xl border p-4 hover:shadow-md transition-shadow group"
                  >
                    {p.coverImageUrl && (
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden shrink-0">
                        <Image src={p.coverImageUrl} alt={p.name} fill className="object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium group-hover:text-[var(--tenant-primary)] transition-colors">
                        {p.name}
                      </p>
                      {p.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                          {p.description}
                        </p>
                      )}
                      <p className="text-sm font-semibold mt-1" style={{ color: "var(--tenant-primary)" }}>
                        {Number(p.price) === 0 ? "Free" : `${p.currency} ${Number(p.price).toFixed(0)}`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Services */}
          {results.services.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5" style={{ color: "var(--tenant-primary)" }} />
                Recovery Services
              </h2>
              <div className="space-y-3">
                {results.services.map((s) => (
                  <Link
                    key={s.id}
                    href={`/${slug}/booking?serviceId=${s.id}`}
                    className="flex gap-4 rounded-xl border p-4 hover:shadow-md transition-shadow group"
                  >
                    {s.imageUrl && (
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden shrink-0">
                        <Image src={s.imageUrl} alt={s.name} fill className="object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium group-hover:text-[var(--tenant-primary)] transition-colors">
                        {s.name}
                      </p>
                      {s.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{s.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{s.duration} min · {s.currency} {Number(s.price).toFixed(0)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Blog Posts */}
          {results.posts.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" style={{ color: "var(--tenant-primary)" }} />
                Blog Articles
              </h2>
              <div className="space-y-3">
                {results.posts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/${slug}/blog/${p.slug}`}
                    className="flex gap-4 rounded-xl border p-4 hover:shadow-md transition-shadow group"
                  >
                    {p.coverImageUrl && (
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden shrink-0">
                        <Image src={p.coverImageUrl} alt={p.title} fill className="object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium group-hover:text-[var(--tenant-primary)] transition-colors">
                        {p.title}
                      </p>
                      {p.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{p.excerpt}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* FAQs */}
          {results.faqs.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4">FAQs</h2>
              <div className="space-y-3">
                {results.faqs.map((f) => (
                  <Link
                    key={f.id}
                    href={`/${slug}/faq`}
                    className="block rounded-xl border p-4 hover:shadow-md transition-shadow group"
                  >
                    <p className="font-medium group-hover:text-[var(--tenant-primary)] transition-colors">
                      {f.question}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{f.answer}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
