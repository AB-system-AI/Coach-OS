import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { resolveTenantFromSlug } from "@/features/tenancy";
import { Button } from "@/components/ui/button";
import { getPublicPrograms } from "@/features/website/services/public-site-service";
import { Dumbbell, Clock, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ tenant: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) return {};
  return {
    title: `Programs | ${resolved.tenant.name}`,
    description: `Explore training programs offered by ${resolved.tenant.name}.`,
  };
}

export default async function ProgramsPage({ params }: Props) {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) notFound();

  const { tenant } = resolved;
  const theme = tenant.theme;
  const programs = await getPublicPrograms(tenant.id);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1
          className="text-4xl font-bold mb-4"
          style={{ fontFamily: "var(--tenant-heading-font)" }}
        >
          Training Programs
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Structured programs designed to help you achieve your goals — whether
          you&apos;re a beginner or an experienced athlete.
        </p>
      </div>

      {programs.length === 0 ? (
        <div className="text-center py-24 space-y-4">
          <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <p className="text-muted-foreground">No programs available yet. Check back soon!</p>
          <Button asChild variant="outline">
            <Link href={`/${slug}/contact`}>Get in Touch</Link>
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Link
              key={program.id}
              href={`/${slug}/programs/${program.slug}`}
              className="group rounded-xl border bg-card hover:shadow-lg transition-all overflow-hidden"
            >
              {program.coverImageUrl ? (
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={program.coverImageUrl}
                    alt={program.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div
                  className="h-48 w-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${theme?.primaryColor ?? "#6366f1"}22, ${theme?.secondaryColor ?? "#8b5cf6"}33)`,
                  }}
                >
                  <Dumbbell className="h-12 w-12" style={{ color: "var(--tenant-primary)" }} />
                </div>
              )}

              <div className="p-5">
                <h2 className="text-lg font-semibold mb-2 group-hover:text-[var(--tenant-primary)] transition-colors">
                  {program.name}
                </h2>
                {program.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {program.description}
                  </p>
                )}

                {program.features.length > 0 && (
                  <ul className="mb-3 space-y-1">
                    {program.features.slice(0, 3).map((f) => (
                      <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-[var(--tenant-primary)]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{program.durationWeeks ? `${program.durationWeeks} weeks` : "Ongoing"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold" style={{ color: "var(--tenant-primary)" }}>
                      {Number(program.price) === 0
                        ? "Free"
                        : `${program.currency} ${Number(program.price).toFixed(0)}`}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[var(--tenant-primary)] transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-16 rounded-2xl p-8 text-center"
        style={{ background: `linear-gradient(135deg, ${theme?.primaryColor ?? "#6366f1"}11, ${theme?.secondaryColor ?? "#8b5cf6"}11)` }}
      >
        <h2 className="text-2xl font-bold mb-3">Not Sure Which Program?</h2>
        <p className="text-muted-foreground mb-6">
          Book a free consultation and we&apos;ll help you find the perfect fit.
        </p>
        <Button
          asChild
          style={{ backgroundColor: "var(--tenant-primary)", color: "#fff" }}
        >
          <Link href={`/${slug}/contact`}>Free Consultation</Link>
        </Button>
      </div>
    </div>
  );
}
