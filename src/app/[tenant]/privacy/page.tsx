import { notFound } from "next/navigation";
import { resolveTenantFromSlug } from "@/features/tenancy";
import { getPublicCmsPage } from "@/features/website/services/public-site-service";
import type { Metadata } from "next";

type Props = { params: Promise<{ tenant: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) return {};
  return { title: `Privacy Policy | ${resolved.tenant.name}` };
}

export default async function PrivacyPage({ params }: Props) {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) notFound();

  const { tenant } = resolved;
  const settings = tenant.settings;

  const cmsPage = await getPublicCmsPage(tenant.id, "privacy");

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1
        className="text-3xl font-bold mb-8"
        style={{ fontFamily: "var(--tenant-heading-font)" }}
      >
        {cmsPage?.title ?? "Privacy Policy"}
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
      ) : settings?.privacyPolicy ? (
        <div
          className="prose prose-neutral max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap"
        >
          {settings.privacyPolicy}
        </div>
      ) : (
        <DefaultPrivacyPolicy tenantName={tenant.name} />
      )}

      <p className="mt-10 text-xs text-muted-foreground border-t pt-4">
        Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>
    </div>
  );
}

function DefaultPrivacyPolicy({ tenantName }: { tenantName: string }) {
  return (
    <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us when you book a session,
          contact us, or sign up for our services. This may include your name, email
          address, phone number, and health information relevant to your coaching program.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
        <p>
          We use the information we collect to provide, maintain, and improve our services,
          communicate with you about appointments and updates, and comply with legal obligations.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">3. Information Sharing</h2>
        <p>
          We do not sell, trade, or rent your personal information to third parties.
          We may share your information with service providers who assist us in operating
          our platform and conducting our business.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">4. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your
          personal information against unauthorized access, alteration, disclosure, or destruction.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">5. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact {tenantName} directly
          through our contact page.
        </p>
      </section>
    </div>
  );
}
