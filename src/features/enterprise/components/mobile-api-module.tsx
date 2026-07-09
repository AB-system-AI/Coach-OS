import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Smartphone, TabletSmartphone, Zap, Wifi } from "lucide-react";

const MOBILE_ENDPOINTS = [
  {
    method: "GET",
    path: "/api/v1/mobile/flutter",
    description: "Flutter SDK configuration and app manifest",
    category: "Flutter",
  },
  {
    method: "GET",
    path: "/api/v1/mobile/react-native",
    description: "React Native configuration and app manifest",
    category: "React Native",
  },
  {
    method: "POST",
    path: "/api/v1/mobile/sync",
    description: "Offline sync queue — push pending mutations",
    category: "Sync",
  },
];

export function MobileApiModule({
  apiKeysCount,
  pushSubscribersCount,
  deepLinksCount,
  pendingSyncCount,
}: {
  apiKeysCount: number;
  pushSubscribersCount: number;
  deepLinksCount: number;
  pendingSyncCount: number;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Mobile API</h2>
          <p className="text-sm text-muted-foreground">
            Flutter & React Native ready endpoints with push, deep links, and offline sync.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/settings/security">
            API Keys
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { icon: Zap, label: "API Keys", value: apiKeysCount },
          { icon: Smartphone, label: "Push Subscribers", value: pushSubscribersCount },
          { icon: TabletSmartphone, label: "Deep Links", value: deepLinksCount },
          { icon: Wifi, label: "Pending Sync", value: pendingSyncCount },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="text-base font-semibold mb-3">API Endpoints</h3>
        <div className="rounded-md border divide-y">
          {MOBILE_ENDPOINTS.map((ep) => (
            <div key={ep.path} className="p-4 flex items-start gap-4">
              <Badge
                variant={ep.method === "GET" ? "secondary" : "default"}
                className="font-mono shrink-0 mt-0.5"
              >
                {ep.method}
              </Badge>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm font-medium">{ep.path}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{ep.description}</div>
              </div>
              <Badge variant="outline" className="shrink-0">{ep.category}</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md bg-muted/50 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Authentication</p>
        <p>All mobile API endpoints require Bearer token authentication. Include your API key as <code className="font-mono bg-muted px-1 rounded">Authorization: Bearer &lt;api-key&gt;</code> in request headers.</p>
      </div>
    </div>
  );
}
