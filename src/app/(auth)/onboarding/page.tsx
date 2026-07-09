import { OnboardingWizard } from "@/features/onboarding";
import { getCurrentTenant } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const tenant = await getCurrentTenant();

  if (tenant?.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
      <OnboardingWizard
        existingTenantId={tenant?.id}
        existingBusinessName={tenant?.name}
      />
    </div>
  );
}
