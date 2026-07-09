import { getCurrentTenant } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { MarketplaceSettings } from "@/features/marketplace/components/marketplace-settings";
import { redirect } from "next/navigation";

export default async function MarketplaceSettingsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const profile = await db.coachMarketplaceProfile.findUnique({
    where: { tenantId: tenant.id },
  });

  return (
    <MarketplaceSettings
      tenantId={tenant.id}
      profile={
        profile
          ? {
              isVisible: profile.isVisible,
              headline: profile.headline,
              bio: profile.bio,
              country: profile.country,
              city: profile.city,
              specialties: profile.specialties,
              languages: profile.languages,
              startingPrice: profile.startingPrice
                ? Number(profile.startingPrice)
                : null,
            }
          : null
      }
    />
  );
}
