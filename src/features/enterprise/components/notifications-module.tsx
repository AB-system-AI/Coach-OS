"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { upsertNotificationChannelAction } from "@/features/enterprise/actions/enterprise-actions";

type ChannelConfig = {
  id: string;
  channel: string;
  isEnabled: boolean;
  config: unknown;
};

const DEFAULT_CHANNELS = [
  { channel: "EMAIL", label: "Email", description: "Send notifications via email" },
  { channel: "SMS", label: "SMS", description: "Send SMS text notifications" },
  { channel: "WHATSAPP", label: "WhatsApp", description: "Send WhatsApp messages" },
  { channel: "PUSH", label: "Push Notifications", description: "Mobile and browser push" },
  { channel: "IN_APP", label: "In-App", description: "In-app notification center" },
];

export function NotificationsModule({
  tenantId,
  initialChannels,
}: {
  tenantId: string;
  initialChannels: ChannelConfig[];
}) {
  const router = useRouter();
  const channelMap = new Map(initialChannels.map((c) => [c.channel, c]));
  const [toggling, setToggling] = useState<string | null>(null);

  async function handleToggle(channel: string, isEnabled: boolean) {
    setToggling(channel);
    const existing = channelMap.get(channel);
    await upsertNotificationChannelAction(
      tenantId,
      channel,
      isEnabled,
      (existing?.config as Record<string, unknown>) ?? {}
    );
    setToggling(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Notification Channels</h2>
        <p className="text-sm text-muted-foreground">
          Configure which channels are active for your tenant.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {DEFAULT_CHANNELS.map(({ channel, label, description }) => {
          const config = channelMap.get(channel);
          const isEnabled = config?.isEnabled ?? false;
          return (
            <Card key={channel}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{label}</CardTitle>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => handleToggle(channel, checked)}
                    disabled={toggling === channel}
                  />
                </div>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Status:{" "}
                  <span className={isEnabled ? "text-green-600 font-medium" : "text-muted-foreground"}>
                    {isEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
