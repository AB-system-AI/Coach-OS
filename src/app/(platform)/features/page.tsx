import {
  FeaturesSection,
  CtaSection,
} from "@/components/layout/landing-sections";

export default function FeaturesPage() {
  return (
    <>
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Platform Features</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to run a modern fitness coaching business — from
          client management to payments and recovery booking.
        </p>
      </section>
      <div id="recovery">
        <FeaturesSection />
      </div>
      <CtaSection />
    </>
  );
}
