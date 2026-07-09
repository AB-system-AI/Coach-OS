import { notFound } from "next/navigation";
import { resolveTenantFromSlug } from "@/features/tenancy";
import { getPublicServices } from "@/features/website/services/public-site-service";
import { BookingForm } from "@/features/website/components/booking-form";
import { Calendar, CheckCircle } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ tenant: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) return {};
  return {
    title: `Book a Session | ${resolved.tenant.name}`,
    description: `Book a recovery session or consultation with ${resolved.tenant.name}.`,
  };
}

export default async function BookingPage({ params }: Props) {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) notFound();

  const { tenant } = resolved;
  const theme = tenant.theme;
  const settings = tenant.settings;

  const services = await getPublicServices(tenant.id);

  const highlights = [
    "Quick confirmation within 24 hours",
    "Flexible rescheduling policy",
    settings?.cancellationPolicy
      ? `Cancellation: ${settings.cancellationPolicy}`
      : "Easy cancellation",
    "Professional, certified coaches",
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-10">
        <h1
          className="text-4xl font-bold mb-3"
          style={{ fontFamily: "var(--tenant-heading-font)" }}
        >
          Book a Session
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Fill in the form below and we&apos;ll confirm your appointment as soon as possible.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl p-6 space-y-4"
            style={{ background: `linear-gradient(135deg, ${theme?.primaryColor ?? "#6366f1"}11, ${theme?.secondaryColor ?? "#8b5cf6"}11)` }}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" style={{ color: "var(--tenant-primary)" }} />
              <h2 className="font-semibold">How It Works</h2>
            </div>
            <ol className="space-y-3 text-sm text-muted-foreground list-none">
              {[
                "Fill in your details and select a service",
                "Choose your preferred date and time",
                "Submit your booking request",
                "We confirm via email within 24 hours",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-xs text-white font-bold shrink-0 mt-0.5"
                    style={{ backgroundColor: "var(--tenant-primary)" }}
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border p-5 space-y-3">
            <h2 className="font-semibold text-sm">Why Book With Us</h2>
            {highlights.map((h) => (
              <div key={h} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--tenant-primary)" }} />
                {h}
              </div>
            ))}
          </div>

          {settings?.whatsappNumber && (
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border p-4 text-sm hover:bg-muted/50 transition-colors"
            >
              <span className="text-xl">💬</span>
              <div>
                <p className="font-medium">WhatsApp Us</p>
                <p className="text-muted-foreground text-xs">Book via WhatsApp</p>
              </div>
            </a>
          )}
        </div>

        {/* Form */}
        <div className="md:col-span-2 rounded-xl border p-6">
          <BookingForm
            tenantId={tenant.id}
            services={services}
            primaryColor={theme?.primaryColor}
          />
        </div>
      </div>
    </div>
  );
}
