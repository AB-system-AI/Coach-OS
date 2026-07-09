import { notFound } from "next/navigation";
import { resolveTenantFromSlug } from "@/features/tenancy";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type TenantHomeProps = {
  params: Promise<{ tenant: string }>;
};

export default async function TenantHomePage({ params }: TenantHomeProps) {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);

  if (!resolved) {
    notFound();
  }

  const { tenant } = resolved;
  const theme = tenant.theme;

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10 opacity-10"
        style={{
          background: `linear-gradient(135deg, ${theme?.primaryColor ?? "#6366f1"}, ${theme?.secondaryColor ?? "#8b5cf6"})`,
        }}
      />

      <div className="container mx-auto px-4 py-20 md:py-32 text-center">
        <h1
          className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
          style={{ fontFamily: "var(--tenant-heading-font)" }}
        >
          {theme?.heroTitle ?? `Welcome to ${tenant.name}`}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          {theme?.heroSubtitle ??
            "Transform your body and mind with professional coaching."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            asChild
            style={{
              backgroundColor: "var(--tenant-primary)",
              color: "#fff",
            }}
          >
            <Link href={`/${slug}/recovery`}>
              {theme?.heroCtaText ?? "Book Recovery Session"}
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={`/${slug}/programs`}>View Programs</Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Personal Training",
              desc: "Customized workout programs tailored to your goals.",
            },
            {
              title: "Nutrition Coaching",
              desc: "Meal plans and nutrition guidance for optimal results.",
            },
            {
              title: "Recovery Services",
              desc: "Massage, stretching, ice bath and more.",
            },
          ].map((service) => (
            <div
              key={service.title}
              className="rounded-xl border p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
