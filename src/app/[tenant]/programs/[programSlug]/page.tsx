import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { resolveTenantFromSlug } from "@/features/tenancy";
import { Button } from "@/components/ui/button";
import {
  getPublicProgram,
  getPublicPrograms,
} from "@/features/website/services/public-site-service";
import { JsonLd, buildProgramJsonLd } from "@/features/website/components/json-ld";
import { Clock, CheckCircle, ArrowLeft, Dumbbell } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ tenant: string; programSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: slug, programSlug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) return {};

  const program = await getPublicProgram(resolved.tenant.id, programSlug);
  if (!program) return {};

  return {
    title: `${program.name} | ${resolved.tenant.name}`,
    description: program.description ?? undefined,
    openGraph: {
      images: program.coverImageUrl ? [program.coverImageUrl] : undefined,
    },
  };
}

export default async function ProgramDetailPage({ params }: Props) {
  const { tenant: slug, programSlug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) notFound();

  const { tenant } = resolved;
  const theme = tenant.theme;

  const [program, allPrograms] = await Promise.all([
    getPublicProgram(tenant.id, programSlug),
    getPublicPrograms(tenant.id),
  ]);

  if (!program || program.status !== "ACTIVE" || !program.isPublic) notFound();

  const related = allPrograms
    .filter((p) => p.id !== program.id)
    .slice(0, 3);

  const baseUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/${slug}`;
  const jsonLd = buildProgramJsonLd({
    name: program.name,
    description: program.description ?? undefined,
    url: `${baseUrl}/programs/${program.slug}`,
    price: Number(program.price),
    currency: program.currency,
    imageUrl: program.coverImageUrl ?? undefined,
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Link
          href={`/${slug}/programs`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Programs
        </Link>

        <div className="grid md:grid-cols-2 gap-10 mb-12">
          <div>
            {program.coverImageUrl ? (
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={program.coverImageUrl}
                  alt={program.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div
                className="aspect-[4/3] rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${theme?.primaryColor ?? "#6366f1"}22, ${theme?.secondaryColor ?? "#8b5cf6"}33)`,
                }}
              >
                <Dumbbell className="h-20 w-20" style={{ color: "var(--tenant-primary)" }} />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1
                className="text-3xl font-bold mb-3"
                style={{ fontFamily: "var(--tenant-heading-font)" }}
              >
                {program.name}
              </h1>
              {program.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {program.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {program.durationWeeks ? `${program.durationWeeks} weeks` : "Ongoing"}
              </span>
            </div>

            <div
              className="rounded-xl p-5 space-y-2"
              style={{
                background: `linear-gradient(135deg, ${theme?.primaryColor ?? "#6366f1"}11, ${theme?.secondaryColor ?? "#8b5cf6"}11)`,
              }}
            >
              <p className="text-3xl font-bold" style={{ color: "var(--tenant-primary)" }}>
                {Number(program.price) === 0
                  ? "Free"
                  : `${program.currency} ${Number(program.price).toFixed(2)}`}
              </p>
              <p className="text-xs text-muted-foreground">One-time payment · Lifetime access</p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                asChild
                size="lg"
                className="w-full text-white"
                style={{ backgroundColor: "var(--tenant-primary)" }}
              >
                <Link href={`/${slug}/booking?service=${program.id}`}>
                  Enroll Now
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="w-full">
                <Link href={`/${slug}/contact`}>Ask a Question</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Features */}
        {program.features.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-5" style={{ fontFamily: "var(--tenant-heading-font)" }}>
              What&apos;s Included
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {program.features.map((f) => (
                <div key={f} className="flex items-start gap-3 rounded-xl border p-4">
                  <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "var(--tenant-primary)" }} />
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Programs */}
        {related.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-5" style={{ fontFamily: "var(--tenant-heading-font)" }}>
              Other Programs
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/${slug}/programs/${p.slug}`}
                  className="group rounded-xl border p-4 hover:shadow-md transition-all"
                >
                  {p.coverImageUrl && (
                    <div className="relative h-28 rounded-lg overflow-hidden mb-3">
                      <Image src={p.coverImageUrl} alt={p.name} fill className="object-cover" />
                    </div>
                  )}
                  <p className="font-medium group-hover:text-[var(--tenant-primary)] transition-colors">
                    {p.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {Number(p.price) === 0 ? "Free" : `${p.currency} ${Number(p.price).toFixed(0)}`}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
