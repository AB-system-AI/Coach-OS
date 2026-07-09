"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { upsertIntegrationAction } from "@/features/enterprise/actions/enterprise-actions";
import type { IntegrationProvider } from "@prisma/client";

type Integration = {
  provider: IntegrationProvider;
  id: string | null;
  isEnabled: boolean;
  config: unknown;
  lastSyncAt: Date | null | undefined;
};

const PROVIDER_META: Record<IntegrationProvider, { label: string; description: string; category: string }> = {
  STRIPE: { label: "Stripe", description: "Payment processing and subscriptions", category: "Payments" },
  PAYMOB: { label: "Paymob", description: "MENA payment gateway", category: "Payments" },
  WHATSAPP: { label: "WhatsApp", description: "WhatsApp Business messaging", category: "Communication" },
  ZOOM: { label: "Zoom", description: "Video conferencing for sessions", category: "Communication" },
  GOOGLE_MEET: { label: "Google Meet", description: "Video meetings via Google", category: "Communication" },
  GOOGLE_CALENDAR: { label: "Google Calendar", description: "Calendar sync and scheduling", category: "Productivity" },
  OUTLOOK: { label: "Outlook", description: "Microsoft Outlook calendar sync", category: "Productivity" },
  GOOGLE_DRIVE: { label: "Google Drive", description: "File storage and sharing", category: "Storage" },
  DROPBOX: { label: "Dropbox", description: "Cloud file storage", category: "Storage" },
  ONEDRIVE: { label: "OneDrive", description: "Microsoft cloud storage", category: "Storage" },
  META_PIXEL: { label: "Meta Pixel", description: "Facebook/Instagram conversion tracking", category: "Analytics" },
  GOOGLE_ANALYTICS: { label: "Google Analytics", description: "Website analytics", category: "Analytics" },
  TIKTOK_PIXEL: { label: "TikTok Pixel", description: "TikTok conversion tracking", category: "Analytics" },
};

export function IntegrationsModule({
  tenantId,
  initialIntegrations,
}: {
  tenantId: string;
  initialIntegrations: Integration[];
}) {
  const router = useRouter();
  const [toggling, setToggling] = useState<string | null>(null);

  async function handleToggle(provider: IntegrationProvider, isEnabled: boolean, config: Record<string, unknown> | undefined) {
    setToggling(provider);
    await upsertIntegrationAction(tenantId, provider, isEnabled, config ?? {});
    setToggling(null);
    router.refresh();
  }

  const categories = [...new Set(Object.values(PROVIDER_META).map((m) => m.category))];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Integrations</h2>
        <p className="text-sm text-muted-foreground">
          {initialIntegrations.filter((i) => i.isEnabled).length} active integrations
        </p>
      </div>

      {categories.map((category) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {category}
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {initialIntegrations
              .filter((i) => PROVIDER_META[i.provider]?.category === category)
              .map((integration) => {
                const meta = PROVIDER_META[integration.provider];
                return (
                  <Card key={integration.provider}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">{meta.label}</CardTitle>
                        <Switch
                          checked={integration.isEnabled}
                          onCheckedChange={(checked) =>
                            handleToggle(
                              integration.provider,
                              checked,
                              (integration.config as Record<string, unknown>) ?? {}
                            )
                          }
                          disabled={toggling === integration.provider}
                        />
                      </div>
                      <CardDescription className="text-xs">{meta.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={integration.isEnabled ? "default" : "secondary"} className="text-xs">
                          {integration.isEnabled ? "Connected" : "Disconnected"}
                        </Badge>
                        {integration.lastSyncAt && (
                          <span className="text-xs text-muted-foreground">
                            Last sync: {new Date(integration.lastSyncAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
