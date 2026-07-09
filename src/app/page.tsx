import {
  HeroSection,
  FeaturesSection,
  CtaSection,
} from "@/components/layout/landing-sections";
import { PlatformHeader } from "@/components/layout/platform-header";
import { PlatformFooter } from "@/components/layout/platform-footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PlatformHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <CtaSection />
      </main>
      <PlatformFooter />
    </div>
  );
}
