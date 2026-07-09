import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { resolveTenantFromSlug } from "@/features/tenancy";
import { Button } from "@/components/ui/button";
import {
  getPublicCmsPage,
  getPublicCertifications,
  getPublicMarketplaceProfile,
  getReviewStats,
} from "@/features/website/services/public-site-service";
import { Award, Star, CheckCircle } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ tenant: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) return {};
  return {
    title: `About | ${resolved.tenant.name}`,
    description: `Learn more about ${resolved.tenant.name} and our coaching philosophy.`,
  };
}

export default async function AboutPage({ params }: Props) {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) notFound();

  const { tenant } = resolved;
  const theme = tenant.theme;
  const settings = tenant.settings;

  const [cmsPage, certifications, profile, reviewStats] = await Promise.all([
    getPublicCmsPage(tenant.id, "about"),
    getPublicCertifications(tenant.id),
    getPublicMarketplaceProfile(tenant.id),
    getReviewStats(tenant.id),
  ]);

  const bio = cmsPage?.title
    ? null
    : profile?.bio ?? settings?.seoDescription ?? null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* ── Hero ── */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h1
            className="text-4xl font-bold mb-4"
            style={{ fontFamily: "var(--tenant-heading-font)" }}
          >
            {cmsPage?.title ?? `About ${tenant.name}`}
          </h1>
          <p className="text-muted-foreground leading-relaxed text-lg">
            {bio ??
              `Welcome! I'm passionate about helping people achieve their fitness goals through personalized coaching and evidence-based training.`}
          </p>
          {profile && (
            <div className="mt-4 space-y-1 text-sm text-muted-foreground">
              {profile.city && profile.country && (
                <p>📍 {profile.city}, {profile.country}</p>
              )}
              {profile.yearsExperience && (
                <p>🏆 {profile.yearsExperience}+ years experience</p>
              )}
              {profile.specialties.length > 0 && (
                <p>⚡ {profile.specialties.join(" · ")}</p>
              )}
            </div>
          )}
          {reviewStats.count > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4"
                    fill={i < Math.round(reviewStats.avg) ? "var(--tenant-primary)" : "none"}
                    stroke="var(--tenant-primary)"
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {reviewStats.avg.toFixed(1)} ({reviewStats.count} reviews)
              </span>
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <Button
              asChild
              style={{ backgroundColor: "var(--tenant-primary)", color: "#fff" }}
            >
              <Link href={`/${slug}/booking`}>Book a Session</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${slug}/contact`}>Get in Touch</Link>
            </Button>
          </div>
        </div>
        <div>
          {profile?.profileImageUrl || theme?.heroImageUrl ? (
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={profile?.profileImageUrl ?? theme!.heroImageUrl!}
                alt={tenant.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className="aspect-square rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${theme?.primaryColor ?? "#6366f1"}22, ${theme?.secondaryColor ?? "#8b5cf6"}33)`,
              }}
            >
              <span className="text-6xl font-bold" style={{ color: "var(--tenant-primary)" }}>
                {tenant.name[0]}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── CMS Content ── */}
      {cmsPage && (
        <div className="prose prose-neutral max-w-none mb-16">
          {typeof cmsPage.content === "string" ? (
            <p>{cmsPage.content}</p>
          ) : (
            <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
              {JSON.stringify(cmsPage.content, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* ── Specialties ── */}
      {profile && profile.specialties.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--tenant-heading-font)" }}>
            Specialties
          </h2>
          <div className="flex flex-wrap gap-3">
            {profile.specialties.map((s) => (
              <span
                key={s}
                className="rounded-full px-4 py-1.5 text-sm font-medium text-white"
                style={{ backgroundColor: "var(--tenant-primary)" }}
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── Certifications ── */}
      {certifications.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--tenant-heading-font)" }}>
            Certifications &amp; Credentials
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="flex items-start gap-3 rounded-xl border p-4"
              >
                <Award className="h-5 w-5 mt-0.5 shrink-0" style={{ color: "var(--tenant-primary)" }} />
                <div>
                  <p className="font-medium">{cert.name}</p>
                  {cert.issuer && (
                    <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                  )}
                  {cert.year && (
                    <p className="text-xs text-muted-foreground">{cert.year}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Why Choose Us ── */}
      <section className="rounded-2xl p-8 mb-16"
        style={{ background: `linear-gradient(135deg, ${theme?.primaryColor ?? "#6366f1"}11, ${theme?.secondaryColor ?? "#8b5cf6"}11)` }}
      >
        <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--tenant-heading-font)" }}>
          Why Work With Me
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            "Personalized programs built around your goals",
            "Evidence-based training and nutrition guidance",
            "Ongoing support and accountability",
            "Flexible scheduling to fit your lifestyle",
          ].map((reason) => (
            <div key={reason} className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 shrink-0" style={{ color: "var(--tenant-primary)" }} />
              <span className="text-sm">{reason}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact CTA ── */}
      <section className="text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to Transform?</h2>
        <p className="text-muted-foreground mb-6">
          Let&apos;s work together to build the healthiest version of you.
        </p>
        <Button
          asChild
          size="lg"
          style={{ backgroundColor: "var(--tenant-primary)", color: "#fff" }}
        >
          <Link href={`/${slug}/contact`}>Start Your Journey</Link>
        </Button>
      </section>
    </div>
  );
}
