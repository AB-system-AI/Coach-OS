"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink } from "lucide-react";

type UserDevice = {
  id: string;
  userId: string;
  deviceName: string | null;
  deviceType: string | null;
  fingerprint: string | null;
  isTrusted: boolean;
  lastSeenAt: Date;
  createdAt: Date;
};

type LoginHistory = {
  id: string;
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
  location: string | null;
  success: boolean;
  createdAt: Date;
};

export function SecurityModule({
  devices,
  loginHistory,
}: {
  devices: UserDevice[];
  loginHistory: LoginHistory[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Security Center</h2>
          <p className="text-sm text-muted-foreground">
            Active devices and login history for tenant members.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/settings/security">
            Personal Security Settings
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="devices">
        <TabsList>
          <TabsTrigger value="devices">Devices ({devices.length})</TabsTrigger>
          <TabsTrigger value="logins">Login History ({loginHistory.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="mt-4">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Device</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Last Seen</th>
                  <th className="px-4 py-3 text-left font-medium">Trust</th>
                </tr>
              </thead>
              <tbody>
                {devices.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No devices recorded.
                    </td>
                  </tr>
                )}
                {devices.map((dev) => (
                  <tr key={dev.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3">{dev.deviceName ?? "Unknown Device"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{dev.deviceType ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(dev.lastSeenAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={dev.isTrusted ? "default" : "secondary"}>
                        {dev.isTrusted ? "Trusted" : "Untrusted"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="logins" className="mt-4">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">IP Address</th>
                  <th className="px-4 py-3 text-left font-medium">Location</th>
                  <th className="px-4 py-3 text-left font-medium">User Agent</th>
                  <th className="px-4 py-3 text-left font-medium">Result</th>
                </tr>
              </thead>
              <tbody>
                {loginHistory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No login history.
                    </td>
                  </tr>
                )}
                {loginHistory.map((log) => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{log.ipAddress ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{log.location ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate">
                      {log.userAgent ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={log.success ? "default" : "destructive"}>
                        {log.success ? "Success" : "Failed"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
