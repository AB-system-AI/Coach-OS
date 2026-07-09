import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveTenantFromSlug } from "@/features/tenancy";
import { getPublicFaqs } from "@/features/website/services/public-site-service";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ tenant: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) return {};
  return {
    title: `FAQ | ${resolved.tenant.name}`,
    description: `Frequently asked questions about ${resolved.tenant.name}.`,
  };
}

export default async function FaqPage({ params }: Props) {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) notFound();

  const { tenant } = resolved;
  const theme = tenant.theme;
  const faqs = await getPublicFaqs(tenant.id);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-12">
        <h1
          className="text-4xl font-bold mb-3"
          style={{ fontFamily: "var(--tenant-heading-font)" }}
        >
          Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground">
          Everything you need to know before getting started.
        </p>
      </div>

      {faqs.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">No FAQs available yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details
              key={faq.id}
              className="group rounded-xl border overflow-hidden"
              open={i === 0}
            >
              <summary className="flex cursor-pointer items-center justify-between p-5 font-medium hover:bg-muted/40 transition-colors">
                <span>{faq.question}</span>
                <span
                  className="ml-4 shrink-0 text-xl font-light transition-transform group-open:rotate-45"
                  style={{ color: "var(--tenant-primary)" }}
                >
                  +
                </span>
              </summary>
              <div className="px-5 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed border-t">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      )}

      <div
        className="mt-12 rounded-2xl p-6 text-center"
        style={{
          background: `linear-gradient(135deg, ${theme?.primaryColor ?? "#6366f1"}11, ${theme?.secondaryColor ?? "#8b5cf6"}11)`,
        }}
      >
        <HelpCircle className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--tenant-primary)" }} />
        <h2 className="font-semibold mb-2">Still Have Questions?</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Can&apos;t find what you&apos;re looking for? Reach out directly.
        </p>
        <Button
          asChild
          style={{ backgroundColor: "var(--tenant-primary)", color: "#fff" }}
        >
          <Link href={`/${slug}/contact`}>Contact Us</Link>
        </Button>
      </div>
    </div>
  );
}
