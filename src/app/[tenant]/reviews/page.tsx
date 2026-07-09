import { notFound } from "next/navigation";
import Image from "next/image";
import { resolveTenantFromSlug } from "@/features/tenancy";
import { getPublicReviews, getReviewStats } from "@/features/website/services/public-site-service";
import { ReviewForm } from "@/features/website/components/review-form";
import { getSession } from "@/lib/auth/session";
import { Star } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ tenant: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) return {};
  return {
    title: `Reviews | ${resolved.tenant.name}`,
    description: `Read what clients say about ${resolved.tenant.name}.`,
  };
}

export default async function ReviewsPage({ params }: Props) {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) notFound();

  const { tenant } = resolved;
  const theme = tenant.theme;

  const [reviews, stats, session] = await Promise.all([
    getPublicReviews(tenant.id),
    getReviewStats(tenant.id),
    getSession(),
  ]);

  const isLoggedIn = !!session?.user;

  const breakdown = stats.breakdown as Record<number, number>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1
          className="text-4xl font-bold mb-3"
          style={{ fontFamily: "var(--tenant-heading-font)" }}
        >
          Client Reviews
        </h1>
        <p className="text-muted-foreground">
          Real experiences from real clients.
        </p>
      </div>

      {/* Stats */}
      {stats.count > 0 && (
        <div className="rounded-2xl border p-6 mb-10 grid sm:grid-cols-2 gap-6 items-center">
          <div className="text-center">
            <p className="text-6xl font-bold" style={{ color: "var(--tenant-primary)" }}>
              {stats.avg.toFixed(1)}
            </p>
            <div className="flex justify-center gap-1 my-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5"
                  fill={i < Math.round(stats.avg) ? "var(--tenant-primary)" : "none"}
                  stroke="var(--tenant-primary)"
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{stats.count} reviews</p>
          </div>
          <div className="space-y-2">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const count = breakdown[star] ?? 0;
              const pct = stats.count > 0 ? (count / stats.count) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-4 text-right">{star}</span>
                  <Star className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--tenant-primary)" }} fill="var(--tenant-primary)" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: "var(--tenant-primary)" }}
                    />
                  </div>
                  <span className="w-6 text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Star className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No reviews yet. Be the first!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="rounded-xl border p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {review.user.image ? (
                      <Image
                        src={review.user.image}
                        alt={review.user.name ?? ""}
                        width={36}
                        height={36}
                        className="rounded-full"
                      />
                    ) : (
                      <div
                        className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ backgroundColor: "var(--tenant-primary)" }}
                      >
                        {(review.user.name ?? "?")[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{review.user.name ?? "Anonymous"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4"
                        fill={i < review.rating ? "var(--tenant-primary)" : "none"}
                        stroke="var(--tenant-primary)"
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Submit Review */}
        <div className="space-y-4">
          <div className="rounded-xl border p-5">
            <h2 className="font-semibold mb-4">Share Your Experience</h2>
            <ReviewForm
              tenantId={tenant.id}
              isLoggedIn={isLoggedIn}
              loginUrl={`/login?callbackUrl=/${slug}/reviews`}
              primaryColor={theme?.primaryColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
