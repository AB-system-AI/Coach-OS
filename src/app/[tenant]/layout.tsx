import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { resolveTenantFromSlug } from "@/features/tenancy";
import { TenantThemeProvider } from "@/features/theme";
import { JsonLd, buildLocalBusinessJsonLd } from "@/features/website/components/json-ld";
import { NewsletterForm } from "@/features/website/components/newsletter-form";
import { getHomePageStats } from "@/features/website/services/public-site-service";
import { resolveMetadataBase, resolveTenantPublicUrl } from "@/lib/env";
import type { Metadata } from "next";
import {
  Facebook,
  Instagram,
  Youtube,
  ExternalLink,
} from "lucide-react";
import { MobileNav } from "./mobile-nav";

type TenantLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string }>;
}): Promise<Metadata> {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) return {};

  const { tenant } = resolved;
  const settings = tenant.settings;
  const theme = tenant.theme;

  const title = settings?.seoTitle ?? tenant.name;
  const description =
    settings?.seoDescription ??
    theme?.heroSubtitle ??
    `${tenant.name} — Professional coaching services`;
  const url = resolveTenantPublicUrl(slug, tenant.customDomain);

  return {
    title: { default: title, template: `%s | ${tenant.name}` },
    description,
    keywords: settings?.seoKeywords ?? undefined,
    metadataBase: (() => {
      try {
        return new URL(url);
      } catch {
        return resolveMetadataBase();
      }
    })(),
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: tenant.name,
      ...(theme?.heroImageUrl && { images: [theme.heroImageUrl] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(theme?.heroImageUrl && { images: [theme.heroImageUrl] }),
    },
  };
}

const NAV_ITEMS = [
  { label: "Home", path: "" },
  { label: "About", path: "about" },
  { label: "Programs", path: "programs" },
  { label: "Recovery", path: "recovery" },
  { label: "Blog", path: "blog" },
  { label: "Pricing", path: "pricing" },
  { label: "Gallery", path: "gallery" },
  { label: "Contact", path: "contact" },
];

export default async function TenantWebsiteLayout({
  children,
  params,
}: TenantLayoutProps) {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);

  if (!resolved) {
    notFound();
  }

  const { tenant } = resolved;
  const theme = tenant.theme;
  const settings = tenant.settings;

  const socialLinks =
    (theme?.socialLinks as Record<string, string> | null) ?? {};

  // Hide "Powered by CoachOS" for tenants with a custom domain or non-free plan
  const isWhiteLabel = !!(tenant.customDomain) || tenant.plan !== "FREE";

  const stats = await getHomePageStats(tenant.id);

  const baseUrl = resolveTenantPublicUrl(slug, tenant.customDomain);

  const jsonLd = buildLocalBusinessJsonLd({
    name: tenant.name,
    description: settings?.seoDescription ?? theme?.heroSubtitle ?? undefined,
    url: baseUrl,
    logoUrl: theme?.logoUrl ?? undefined,
    phone: settings?.businessPhone ?? undefined,
    address: settings?.businessAddress ?? undefined,
    city: settings?.city ?? undefined,
    country: settings?.country ?? undefined,
    latitude: settings?.latitude ?? undefined,
    longitude: settings?.longitude ?? undefined,
    avgRating: stats.avgRating > 0 ? stats.avgRating : undefined,
    reviewCount: stats.reviewCount > 0 ? stats.reviewCount : undefined,
  });

  return (
    <TenantThemeProvider theme={theme}>
      <JsonLd data={jsonLd} />
      {theme?.customCss && (
        <style dangerouslySetInnerHTML={{ __html: theme.customCss }} />
      )}
      <div className="min-h-screen flex flex-col">
        {/* ── Header ────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 border-b bg-[var(--tenant-background)]/90 backdrop-blur-lg">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            {/* Logo */}
            <Link
              href={`/${slug}`}
              className="flex items-center gap-2 font-bold text-lg shrink-0"
            >
              {theme?.logoUrl ? (
                <Image
                  src={theme.logoUrl}
                  alt={tenant.name}
                  width={120}
                  height={36}
                  className="h-9 w-auto object-contain"
                />
              ) : (
                <span style={{ color: "var(--tenant-primary)" }}>
                  {tenant.name}
                </span>
              )}
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-5 text-sm">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  href={`/${slug}${item.path ? `/${item.path}` : ""}`}
                  className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                href={`/${slug}/booking`}
                className="hidden sm:inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--tenant-primary)" }}
              >
                Book Now
              </Link>
              <MobileNav slug={slug} navItems={NAV_ITEMS} tenantName={tenant.name} />
            </div>
          </div>
        </header>

        {/* ── Main ──────────────────────────────────────────────────── */}
        <main className="flex-1">{children}</main>

        {/* ── Footer ────────────────────────────────────────────────── */}
        <footer className="border-t bg-muted/30 mt-16">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
              {/* Brand */}
              <div className="md:col-span-2 space-y-3">
                <p className="font-bold text-lg" style={{ color: "var(--tenant-primary)" }}>
                  {tenant.name}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  {theme?.footerText ??
                    settings?.seoDescription ??
                    "Professional coaching services to help you reach your full potential."}
                </p>
                <div className="flex gap-3 pt-1">
                  {(settings?.facebookUrl || socialLinks.facebook) && (
                    <a
                      href={settings?.facebookUrl ?? socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Facebook className="h-4 w-4" />
                    </a>
                  )}
                  {(settings?.instagramUrl || socialLinks.instagram) && (
                    <a
                      href={settings?.instagramUrl ?? socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                  )}
                  {(settings?.youtubeUrl || socialLinks.youtube) && (
                    <a
                      href={settings?.youtubeUrl ?? socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Youtube className="h-4 w-4" />
                    </a>
                  )}
                  {settings?.tiktokUrl && (
                    <a
                      href={settings.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground text-sm font-bold"
                    >
                      TikTok
                    </a>
                  )}
                  {settings?.whatsappNumber && (
                    <a
                      href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground text-sm"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-3">
                <p className="font-semibold text-sm">Quick Links</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    { label: "Programs", path: "programs" },
                    { label: "Recovery", path: "recovery" },
                    { label: "Pricing", path: "pricing" },
                    { label: "Blog", path: "blog" },
                    { label: "Gallery", path: "gallery" },
                    { label: "Reviews", path: "reviews" },
                    { label: "FAQ", path: "faq" },
                    { label: "Contact", path: "contact" },
                  ].map((l) => (
                    <li key={l.path}>
                      <Link
                        href={`/${slug}/${l.path}`}
                        className="hover:text-foreground transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter */}
              <div className="space-y-3">
                <p className="font-semibold text-sm">Stay Updated</p>
                <p className="text-sm text-muted-foreground">
                  Subscribe for tips, offers and updates.
                </p>
                <NewsletterForm
                  tenantId={tenant.id}
                  primaryColor={theme?.primaryColor}
                />
                <div className="space-y-1 text-sm text-muted-foreground">
                  {settings?.businessPhone && (
                    <p>{settings.businessPhone}</p>
                  )}
                  {settings?.businessEmail && (
                    <p>{settings.businessEmail}</p>
                  )}
                  {settings?.businessAddress && (
                    <p>{settings.businessAddress}</p>
                  )}
                  {settings?.googleMapsUrl && (
                    <a
                      href={settings.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View on Maps
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
              <p>
                © {new Date().getFullYear()} {tenant.name}. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <Link href={`/${slug}/privacy`} className="hover:text-foreground">
                  Privacy Policy
                </Link>
                <Link href={`/${slug}/terms`} className="hover:text-foreground">
                  Terms of Service
                </Link>
                {!isWhiteLabel && (
                  <Link href="/" className="hover:text-foreground">
                    Powered by CoachOS
                  </Link>
                )}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </TenantThemeProvider>
  );
}
