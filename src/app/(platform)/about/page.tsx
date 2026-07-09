import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CtaSection } from "@/components/layout/landing-sections";

export default function AboutPage() {
  return (
    <>
      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-6">About CoachOS</h1>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            CoachOS is the operating system for fitness coaches, personal trainers,
            and wellness professionals. We help you build your brand, manage clients,
            sell programs, handle bookings, and get paid — all from one platform.
          </p>
          <p>
            Whether you run a solo coaching practice or a multi-coach team, CoachOS
            gives you the tools to grow without juggling spreadsheets, scattered apps,
            and manual workflows.
          </p>
          <p>
            Our mission is simple: let coaches focus on coaching while we handle
            the business infrastructure behind the scenes.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-8">
          <Button asChild>
            <Link href="/register">Start Free Trial</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/marketplace">Browse Coaches</Link>
          </Button>
        </div>
      </section>
      <CtaSection />
    </>
  );
}
