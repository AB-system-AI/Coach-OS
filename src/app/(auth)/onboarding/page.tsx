import { OnboardingWizard } from "@/features/onboarding";
import { requireOnboardingPageAccess } from "@/lib/auth/redirects";

export default async function OnboardingPage() {
  const { tenant } = await requireOnboardingPageAccess();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
      <OnboardingWizard
        existingTenantId={tenant?.id}
        existingBusinessName={tenant?.name}
      />
    </div>
  );
}
