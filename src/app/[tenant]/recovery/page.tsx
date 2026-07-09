import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { resolveTenantFromSlug } from "@/features/tenancy";
import { Button } from "@/components/ui/button";
import {
  getPublicServices,
  getPublicPackages,
} from "@/features/website/services/public-site-service";
import { Clock, Users, Star, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ tenant: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) return {};
  return {
    title: `Recovery Services | ${resolved.tenant.name}`,
    description: `Professional recovery services including massage, stretching, ice bath and more.`,
  };
}

export default async function RecoveryPage({ params }: Props) {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) notFound();

  const { tenant } = resolved;
  const theme = tenant.theme;

  const [services, packages] = await Promise.all([
    getPublicServices(tenant.id),
    getPublicPackages(tenant.id),
  ]);

  const DAY_MAP: Record<string, string> = {
    MONDAY: "Mon",
    TUESDAY: "Tue",
    WEDNESDAY: "Wed",
    THURSDAY: "Thu",
    FRIDAY: "Fri",
    SATURDAY: "Sat",
    SUNDAY: "Sun",
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1
          className="text-4xl font-bold mb-4"
          style={{ fontFamily: "var(--tenant-heading-font)" }}
        >
          Recovery Services
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Accelerate your recovery and enhance performance with our professional
          wellness services. Book a session today.
        </p>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <Star className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">No recovery services available yet.</p>
          <Button asChild variant="outline">
            <Link href={`/${slug}/contact`}>Contact Us</Link>
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {services.map((service) => (
            <div
              key={service.id}
              className="rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {service.imageUrl ? (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={service.imageUrl}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div
                  className="h-48 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${theme?.primaryColor ?? "#6366f1"}22, ${theme?.secondaryColor ?? "#8b5cf6"}22)`,
                  }}
                >
                  <Star className="h-14 w-14" style={{ color: "var(--tenant-primary)" }} />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="font-semibold text-lg">{service.name}</h2>
                  <span className="font-bold shrink-0" style={{ color: "var(--tenant-primary)" }}>
                    {service.currency} {Number(service.price).toFixed(0)}
                  </span>
                </div>

                {service.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {service.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {service.duration} min
                  </span>
                  {service.capacity > 1 && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      Up to {service.capacity}
                    </span>
                  )}
                </div>

                {service.timeSlots.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium mb-1 text-muted-foreground">
                      Available days:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {[...new Set(service.timeSlots.map((s) => s.dayOfWeek))].map((day) => (
                        <span
                          key={day}
                          className="text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: "var(--tenant-primary)" }}
                        >
                          {DAY_MAP[day] ?? day}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  asChild
                  className="w-full text-white"
                  style={{ backgroundColor: "var(--tenant-primary)" }}
                >
                  <Link href={`/${slug}/booking?serviceId=${service.id}`}>
                    Book This Service
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Packages ── */}
      {packages.length > 0 && (
        <section>
          <h2
            className="text-2xl font-bold mb-6 text-center"
            style={{ fontFamily: "var(--tenant-heading-font)" }}
          >
            Service Packages
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-xl border p-6 space-y-4 hover:shadow-lg transition-shadow"
              >
                <div>
                  <h3 className="font-semibold text-lg mb-1">{pkg.name}</h3>
                  {pkg.description && (
                    <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  )}
                </div>
                <div className="text-3xl font-bold" style={{ color: "var(--tenant-primary)" }}>
                  {pkg.currency} {Number(pkg.price).toFixed(0)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    · {pkg.sessions} sessions
                  </span>
                </div>
                {pkg.validityDays && (
                  <p className="text-xs text-muted-foreground">Valid for {pkg.validityDays} days</p>
                )}
                {pkg.items.length > 0 && (
                  <ul className="space-y-1">
                    {pkg.items.map((item) => (
                      <li key={item.id} className="text-sm flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--tenant-primary)" }} />
                        {item.quantity > 1 && `${item.quantity}× `}
                        {item.service.name}
                      </li>
                    ))}
                  </ul>
                )}
                <Button
                  asChild
                  className="w-full text-white"
                  style={{ backgroundColor: "var(--tenant-primary)" }}
                >
                  <Link href={`/${slug}/booking`}>
                    Get Package <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to Book?</h2>
        <p className="text-muted-foreground mb-6">
          Schedule your session and start feeling better today.
        </p>
        <Button
          asChild
          size="lg"
          style={{ backgroundColor: "var(--tenant-primary)", color: "#fff" }}
        >
          <Link href={`/${slug}/booking`}>Book a Session</Link>
        </Button>
      </div>
    </div>
  );
}
