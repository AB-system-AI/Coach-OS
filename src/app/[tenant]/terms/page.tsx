import { notFound } from "next/navigation";
import { resolveTenantFromSlug } from "@/features/tenancy";
import { getPublicCmsPage } from "@/features/website/services/public-site-service";
import type { Metadata } from "next";

type Props = { params: Promise<{ tenant: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) return {};
  return { title: `Terms of Service | ${resolved.tenant.name}` };
}

export default async function TermsPage({ params }: Props) {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) notFound();

  const { tenant } = resolved;
  const settings = tenant.settings;

  const cmsPage = await getPublicCmsPage(tenant.id, "terms");

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1
        className="text-3xl font-bold mb-8"
        style={{ fontFamily: "var(--tenant-heading-font)" }}
      >
        {cmsPage?.title ?? "Terms of Service"}
      </h1>

      {cmsPage ? (
        <div className="prose prose-neutral max-w-none">
          {typeof cmsPage.content === "string" ? (
            <div dangerouslySetInnerHTML={{ __html: cmsPage.content }} />
          ) : (
            <p className="text-muted-foreground whitespace-pre-wrap">
              {JSON.stringify(cmsPage.content)}
            </p>
          )}
        </div>
      ) : settings?.termsOfService ? (
        <div className="prose prose-neutral max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {settings.termsOfService}
        </div>
      ) : (
        <DefaultTerms tenantName={tenant.name} />
      )}

      <p className="mt-10 text-xs text-muted-foreground border-t pt-4">
        Last updated:{" "}
        {new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  );
}

function DefaultTerms({ tenantName }: { tenantName: string }) {
  return (
    <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
        <p>
          By booking a session or using any service offered by {tenantName}, you agree to
          be bound by these Terms of Service.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">2. Services</h2>
        <p>
          {tenantName} provides fitness coaching, recovery services, and related wellness
          programs. All services are subject to availability and scheduling.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">3. Booking & Cancellation</h2>
        <p>
          Sessions must be booked in advance. Cancellations must be made at least 24 hours
          before the scheduled session. Late cancellations or no-shows may be subject to a fee.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">4. Health & Safety</h2>
        <p>
          You are responsible for informing your coach of any medical conditions, injuries,
          or physical limitations before beginning any program. Participation in coaching
          programs involves inherent physical risks.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">5. Payments</h2>
        <p>
          All payments are due at the time of booking unless otherwise agreed. Prices are
          subject to change with reasonable notice.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">6. Limitation of Liability</h2>
        <p>
          {tenantName} shall not be liable for any injuries, damages, or losses arising from
          participation in coaching programs beyond what is required by applicable law.
        </p>
      </section>
    </div>
  );
}
