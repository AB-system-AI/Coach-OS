import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { resolveTenantFromSlug } from "@/features/tenancy";
import { Button } from "@/components/ui/button";
import {
  getPublicPrograms,
  getPublicServices,
  getPublicPackages,
} from "@/features/website/services/public-site-service";
import { CheckCircle, Clock } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ tenant: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) return {};
  return {
    title: `Pricing | ${resolved.tenant.name}`,
    description: `Pricing for programs and recovery services at ${resolved.tenant.name}.`,
  };
}

export default async function PricingPage({ params }: Props) {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) notFound();

  const { tenant } = resolved;
  const theme = tenant.theme;

  const [programs, services, packages] = await Promise.all([
    getPublicPrograms(tenant.id),
    getPublicServices(tenant.id),
    getPublicPackages(tenant.id),
  ]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-14">
        <h1
          className="text-4xl font-bold mb-3"
          style={{ fontFamily: "var(--tenant-heading-font)" }}
        >
          Pricing
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Transparent pricing with no hidden fees. Invest in your health today.
        </p>
      </div>

      {/* ── Programs ── */}
      {programs.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--tenant-heading-font)" }}>
            Training Programs
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div
                key={program.id}
                className="rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow"
              >
                {program.coverImageUrl && (
                  <div className="relative h-36 overflow-hidden">
                    <Image
                      src={program.coverImageUrl}
                      alt={program.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-semibold text-base mb-1">{program.name}</h3>
                  {program.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {program.description}
                    </p>
                  )}
                  {program.features.length > 0 && (
                    <ul className="mb-4 space-y-1.5">
                      {program.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "var(--tenant-primary)" }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t mt-auto">
                    <div>
                      <p className="text-2xl font-bold" style={{ color: "var(--tenant-primary)" }}>
                        {Number(program.price) === 0
                          ? "Free"
                          : `${program.currency} ${Number(program.price).toFixed(0)}`}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {program.durationWeeks ? `${program.durationWeeks} weeks` : "Ongoing"}
                      </p>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      className="text-white"
                      style={{ backgroundColor: "var(--tenant-primary)" }}
                    >
                      <Link href={`/${slug}/programs/${program.slug}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Recovery Services ── */}
      {services.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--tenant-heading-font)" }}>
            Recovery Sessions
          </h2>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left p-4 font-semibold">Service</th>
                  <th className="text-left p-4 font-semibold">Duration</th>
                  <th className="text-left p-4 font-semibold">Price</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        {service.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{service.duration} min</td>
                    <td className="p-4 font-bold" style={{ color: "var(--tenant-primary)" }}>
                      {service.currency} {Number(service.price).toFixed(0)}
                    </td>
                    <td className="p-4">
                      <Button
                        asChild
                        size="sm"
                        className="text-white"
                        style={{ backgroundColor: "var(--tenant-primary)" }}
                      >
                        <Link href={`/${slug}/booking?serviceId=${service.id}`}>Book</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Packages ── */}
      {packages.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--tenant-heading-font)" }}>
            Value Packages
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg, i) => (
              <div
                key={pkg.id}
                className={`rounded-xl border p-6 space-y-4 hover:shadow-lg transition-shadow relative overflow-hidden ${
                  i === 1 ? "border-[var(--tenant-primary)] shadow-md" : ""
                }`}
              >
                {i === 1 && (
                  <div
                    className="absolute top-4 right-4 text-xs font-bold text-white px-2 py-1 rounded-full"
                    style={{ backgroundColor: "var(--tenant-primary)" }}
                  >
                    Popular
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg">{pkg.name}</h3>
                  {pkg.description && (
                    <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
                  )}
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: "var(--tenant-primary)" }}>
                    {pkg.currency} {Number(pkg.price).toFixed(0)}
                  </p>
                  <p className="text-sm text-muted-foreground">{pkg.sessions} sessions</p>
                  {pkg.validityDays && (
                    <p className="text-xs text-muted-foreground">Valid for {pkg.validityDays} days</p>
                  )}
                </div>
                {pkg.items.length > 0 && (
                  <ul className="space-y-1.5">
                    {pkg.items.map((item) => (
                      <li key={item.id} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 shrink-0" style={{ color: "var(--tenant-primary)" }} />
                        {item.quantity > 1 ? `${item.quantity}× ` : ""}
                        {item.service.name}
                        <span className="text-muted-foreground text-xs">
                          ({item.service.duration} min)
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <Button
                  asChild
                  className="w-full text-white"
                  style={{ backgroundColor: "var(--tenant-primary)" }}
                >
                  <Link href={`/${slug}/booking`}>Get This Package</Link>
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {programs.length === 0 && services.length === 0 && packages.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p>Pricing information coming soon.</p>
        </div>
      )}

      {/* CTA */}
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: `linear-gradient(135deg, ${theme?.primaryColor ?? "#6366f1"}11, ${theme?.secondaryColor ?? "#8b5cf6"}11)` }}
      >
        <h2 className="text-2xl font-bold mb-2">Not Sure What You Need?</h2>
        <p className="text-muted-foreground mb-5">
          Book a free consultation and we&apos;ll find the perfect plan for you.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            style={{ backgroundColor: "var(--tenant-primary)", color: "#fff" }}
          >
            <Link href={`/${slug}/booking`}>Book Now</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/${slug}/contact`}>Ask a Question</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
