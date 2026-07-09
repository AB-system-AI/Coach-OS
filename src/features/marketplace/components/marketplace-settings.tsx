"use client";

import { useState } from "react";
import { toggleMarketplaceVisibility } from "@/features/marketplace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Store } from "lucide-react";

type MarketplaceSettingsProps = {
  tenantId: string;
  profile: {
    isVisible: boolean;
    headline: string | null;
    bio: string | null;
    country: string | null;
    city: string | null;
    specialties: string[];
    languages: string[];
    startingPrice: number | null;
  } | null;
};

export function MarketplaceSettings({
  tenantId,
  profile,
}: MarketplaceSettingsProps) {
  const [visible, setVisible] = useState(profile?.isVisible ?? false);
  const [loading, setLoading] = useState(false);

  async function handleToggle(checked: boolean) {
    setLoading(true);
    try {
      await toggleMarketplaceVisibility(tenantId, checked);
      setVisible(checked);
      toast.success(
        checked
          ? "Your profile is now visible on the marketplace"
          : "Your profile has been hidden from the marketplace"
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update visibility"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Store className="h-8 w-8" />
          Marketplace
        </h1>
        <p className="text-muted-foreground mt-1">
          Control your public marketplace profile visibility and settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Marketplace Visibility</CardTitle>
          <CardDescription>
            When enabled, your profile appears in the public coach marketplace
            where clients can discover and book you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="marketplace-visible">Show on Marketplace</Label>
            <Switch
              id="marketplace-visible"
              checked={visible}
              onCheckedChange={handleToggle}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {profile.headline && (
              <div>
                <span className="text-muted-foreground">Headline: </span>
                {profile.headline}
              </div>
            )}
            {(profile.city || profile.country) && (
              <div>
                <span className="text-muted-foreground">Location: </span>
                {[profile.city, profile.country].filter(Boolean).join(", ")}
              </div>
            )}
            {profile.specialties.length > 0 && (
              <div>
                <span className="text-muted-foreground">Specialties: </span>
                {profile.specialties.join(", ")}
              </div>
            )}
            {profile.startingPrice != null && (
              <div>
                <span className="text-muted-foreground">Starting Price: </span>
                ${profile.startingPrice}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
