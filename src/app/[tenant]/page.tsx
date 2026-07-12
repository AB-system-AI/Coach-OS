import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { resolveTenantFromSlug } from "@/features/tenancy";
import { Button } from "@/components/ui/button";
import {
  getPublicPrograms,
  getPublicServices,
  getPublicReviews,
  getHomePageStats,
  getPublicGallery,
} from "@/features/website/services/public-site-service";
import { Star, ArrowRight, Dumbbell, Clock } from "lucide-react";
import type { Metadata } from "next";

type TenantHomeProps = {
  params: Promise<{ tenant: string }>;
};

export async function generateMetadata({ params }: TenantHomeProps): Promise<Metadata> {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) return {};
  const { tenant } = resolved;
  return {
    title: tenant.settings?.seoTitle ?? tenant.name,
    description: tenant.settings?.seoDescription ?? tenant.theme?.heroSubtitle ?? undefined,
  };
}

export default async function TenantHomePage({ params }: TenantHomeProps) {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);

  if (!resolved) notFound();

  const { tenant } = resolved;
  const theme = tenant.theme;
  const settings = tenant.settings;

  const [programs, services, reviews, stats, galleryItems] = await Promise.all([
    getPublicPrograms(tenant.id),
    getPublicServices(tenant.id),
    getPublicReviews(tenant.id),
    getHomePageStats(tenant.id),
    getPublicGallery(tenant.id),
  ]);

  const featuredReviews = reviews.slice(0, 3);
  const featuredGallery = galleryItems.slice(0, 6);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        {theme?.heroImageUrl ? (
          <Image
            src={theme.heroImageUrl}
            alt={tenant.name}
            fill
            className="object-cover"
            priority
          />
        ) : null}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: theme?.heroImageUrl
              ? "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.7))"
              : `linear-gradient(135deg, ${theme?.primaryColor ?? "#6366f1"}22, ${theme?.secondaryColor ?? "#8b5cf6"}33)`,
          }}
        />
        {theme?.heroImageUrl && <div className="absolute inset-0 bg-black/50" />}

        <div className="relative container mx-auto px-4 py-24 text-center">
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            style={{
              fontFamily: "var(--tenant-heading-font)",
              color: theme?.heroImageUrl ? "#fff" : undefined,
            }}
          >
            {theme?.heroTitle ?? `Welcome to ${tenant.name}`}
          </h1>
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: theme?.heroImageUrl ? "rgba(255,255,255,0.85)" : undefined }}
          >
            {theme?.heroSubtitle ??
              settings?.seoDescription ??
              "Transform your body and mind with professional coaching."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="text-white shadow-lg"
              style={{ backgroundColor: "var(--tenant-primary)" }}
            >
              <Link href={theme?.heroCtaLink ?? `/${slug}/booking`}>
                {theme?.heroCtaText ?? "Book a Session"}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className={theme?.heroImageUrl ? "border-white text-white hover:bg-white/10" : ""}>
              <Link href={`/${slug}/programs`}>View Programs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ────────────────────────────────────────────────── */}
      {(stats.programCount > 0 || stats.serviceCount > 0 || stats.reviewCount > 0) && (
        <section className="border-y bg-muted/30 py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.programCount > 0 && (
                <div>
                  <p className="text-3xl font-bold" style={{ color: "var(--tenant-primary)" }}>
                    {stats.programCount}+
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Programs</p>
                </div>
              )}
              {stats.serviceCount > 0 && (
                <div>
                  <p className="text-3xl font-bold" style={{ color: "var(--tenant-primary)" }}>
                    {stats.serviceCount}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Services</p>
                </div>
              )}
              {stats.reviewCount > 0 && (
                <div>
                  <p className="text-3xl font-bold" style={{ color: "var(--tenant-primary)" }}>
                    {stats.avgRating.toFixed(1)}★
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Avg Rating ({stats.reviewCount} reviews)
                  </p>
                </div>
              )}
              <div>
                <p className="text-3xl font-bold" style={{ color: "var(--tenant-primary)" }}>
                  100%
                </p>
                <p className="text-sm text-muted-foreground mt-1">Satisfaction</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Services Preview ───────────────────────────────────────────── */}
      {services.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--tenant-heading-font)" }}>
              Recovery Services
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Professional recovery and wellness services tailored to your needs.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service) => (
              <Link
                key={service.id}
                href={`/${slug}/recovery`}
                className="group rounded-xl border p-6 hover:shadow-lg transition-all hover:border-[var(--tenant-primary)/30]"
              >
                {service.imageUrl && (
                  <div className="relative h-40 w-full rounded-lg overflow-hidden mb-4">
                    <Image
                      src={service.imageUrl}
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-base">{service.name}</h3>
                  <span className="text-sm font-bold shrink-0" style={{ color: "var(--tenant-primary)" }}>
                    {service.currency} {Number(service.price).toFixed(0)}
                  </span>
                </div>
                {service.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {service.duration} min
                </p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link href={`/${slug}/recovery`}>
                View All Services <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* ── Programs ───────────────────────────────────────────────────── */}
      {programs.length > 0 && (
        <section className="bg-muted/20 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--tenant-heading-font)" }}>
                Training Programs
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Structured programs designed to help you achieve lasting results.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.slice(0, 3).map((program) => (
                <Link
                  key={program.id}
                  href={`/${slug}/programs/${program.slug}`}
                  className="group rounded-xl border bg-background p-6 hover:shadow-lg transition-all"
                >
                  {program.coverImageUrl && (
                    <div className="relative h-44 w-full rounded-lg overflow-hidden mb-4">
                      <Image
                        src={program.coverImageUrl}
                        alt={program.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold text-lg mb-2">{program.name}</h3>
                  {program.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {program.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Dumbbell className="h-3 w-3" />
                      {program.durationWeeks ? `${program.durationWeeks} weeks` : "Ongoing"}
                    </span>
                    <span className="font-bold" style={{ color: "var(--tenant-primary)" }}>
                      {Number(program.price) === 0
                        ? "Free"
                        : `${program.currency} ${Number(program.price).toFixed(0)}`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            {programs.length > 3 && (
              <div className="text-center mt-8">
                <Button variant="outline" asChild>
                  <Link href={`/${slug}/programs`}>
                    View All Programs <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Gallery Preview ────────────────────────────────────────────── */}
      {featuredGallery.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--tenant-heading-font)" }}>
              Gallery
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {featuredGallery.map((item) => (
              <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden group">
                <Image
                  src={item.imageUrl}
                  alt={item.caption ?? "Gallery"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.caption && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-3">
                    <p className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Button variant="outline" asChild>
              <Link href={`/${slug}/gallery`}>
                View Full Gallery <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* ── Reviews ────────────────────────────────────────────────────── */}
      {featuredReviews.length > 0 && (
        <section className="bg-muted/20 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--tenant-heading-font)" }}>
                What Clients Say
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredReviews.map((review) => (
                <div key={review.id} className="rounded-xl border bg-background p-6 space-y-3">
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
                  {review.comment && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    {review.user.image ? (
                      <Image
                        src={review.user.image}
                        alt={review.user.name ?? ""}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-xs text-white font-bold"
                        style={{ backgroundColor: "var(--tenant-primary)" }}
                      >
                        {(review.user.name ?? "?")[0].toUpperCase()}
                      </div>
                    )}
                    <p className="text-sm font-medium">{review.user.name ?? "Anonymous"}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link href={`/${slug}/reviews`}>
                  Read All Reviews <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "var(--tenant-heading-font)" }}
          >
            Ready to Start Your Journey?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Take the first step towards a healthier, stronger you. Book your first session today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="text-white"
              style={{ backgroundColor: "var(--tenant-primary)" }}
            >
              <Link href={`/${slug}/booking`}>Book Now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={`/${slug}/contact`}>Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
