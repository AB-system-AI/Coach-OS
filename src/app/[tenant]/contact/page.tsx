import { notFound } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { resolveTenantFromSlug } from "@/features/tenancy";
import { ContactForm } from "@/features/website/components/contact-form";
import { MapPin, Phone, Mail, ExternalLink, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ tenant: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) return {};
  return {
    title: `Contact | ${resolved.tenant.name}`,
    description: `Get in touch with ${resolved.tenant.name}.`,
  };
}

export default async function ContactPage({ params }: Props) {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) notFound();

  const { tenant } = resolved;
  const theme = tenant.theme;
  const settings = tenant.settings;

  const contactItems = [
    settings?.businessPhone && {
      icon: Phone,
      label: "Phone",
      value: settings.businessPhone,
      href: `tel:${settings.businessPhone}`,
    },
    settings?.businessEmail && {
      icon: Mail,
      label: "Email",
      value: settings.businessEmail,
      href: `mailto:${settings.businessEmail}`,
    },
    settings?.businessAddress && {
      icon: MapPin,
      label: "Address",
      value: `${settings.businessAddress}${settings.city ? `, ${settings.city}` : ""}${settings.country ? `, ${settings.country}` : ""}`,
      href: settings.googleMapsUrl ?? undefined,
    },
    settings?.whatsappNumber && {
      icon: MessageCircle,
      label: "WhatsApp",
      value: settings.whatsappNumber,
      href: `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`,
    },
  ].filter(Boolean) as {
    icon: LucideIcon;
    label: string;
    value: string;
    href?: string;
  }[];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1
          className="text-4xl font-bold mb-3"
          style={{ fontFamily: "var(--tenant-heading-font)" }}
        >
          Get In Touch
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Have a question? We&apos;d love to hear from you. Send us a message and
          we&apos;ll respond as soon as possible.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Contact Info */}
        <div className="md:col-span-2 space-y-4">
          <div
            className="rounded-xl p-6 space-y-4"
            style={{
              background: `linear-gradient(135deg, ${theme?.primaryColor ?? "#6366f1"}11, ${theme?.secondaryColor ?? "#8b5cf6"}11)`,
            }}
          >
            <h2 className="font-semibold">Contact Information</h2>
            {contactItems.map((item) => {
              const Icon = item.icon;
              const content = (
                <div className="flex items-start gap-3 text-sm">
                  <Icon className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--tenant-primary)" }} />
                  <div>
                    <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p>{item.value}</p>
                  </div>
                  {item.href && <ExternalLink className="h-3 w-3 ml-auto shrink-0 text-muted-foreground" />}
                </div>
              );
              return item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="block hover:opacity-80 transition-opacity"
                >
                  {content}
                </a>
              ) : (
                <div key={item.label}>{content}</div>
              );
            })}
          </div>

          {/* Social Links */}
          {(settings?.facebookUrl ||
            settings?.instagramUrl ||
            settings?.tiktokUrl) && (
            <div className="rounded-xl border p-5 space-y-3">
              <h3 className="font-medium text-sm">Follow Us</h3>
              <div className="flex flex-col gap-2 text-sm">
                {settings.facebookUrl && (
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Facebook →
                  </a>
                )}
                {settings.instagramUrl && (
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Instagram →
                  </a>
                )}
                {settings.tiktokUrl && (
                  <a
                    href={settings.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    TikTok →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Google Maps Embed */}
          {settings?.googleMapsUrl && (
            <a
              href={settings.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border p-4 text-sm hover:bg-muted/50 transition-colors"
            >
              <MapPin className="h-4 w-4" style={{ color: "var(--tenant-primary)" }} />
              <span>View on Google Maps</span>
              <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
            </a>
          )}
        </div>

        {/* Form */}
        <div className="md:col-span-3 rounded-xl border p-6">
          <h2 className="font-semibold mb-4">Send a Message</h2>
          <ContactForm tenantId={tenant.id} primaryColor={theme?.primaryColor} />
        </div>
      </div>
    </div>
  );
}
