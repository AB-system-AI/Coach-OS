import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_LINES } from "@/features/platform";

export default function DevelopersPage() {
  return (
    <div className="container max-w-4xl py-16 space-y-10">
      <div className="space-y-4">
        <Badge>Developer Portal</Badge>
        <h1 className="text-4xl font-bold">CoachOS Public API</h1>
        <p className="text-lg text-muted-foreground">
          Build on the multi-product platform: CoachOS, GymOS, AcademyOS, PhysioOS,
          and SportsOS — one core, toggleable modules per business type.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/api/v1/openapi" target="_blank">
              OpenAPI / Swagger
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/api/v1">API Root</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/api/v1/mobile/flutter">Flutter API</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/api/v1/mobile/react-native">React Native API</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Use API keys with Bearer authentication:</p>
            <code className="block bg-muted p-3 rounded text-foreground">
              Authorization: Bearer cos_your_api_key
            </code>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SDKs</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Flutter and React Native SDK packages:</p>
            <code className="block bg-muted p-3 rounded text-foreground">
              npm install @coachos/react-native-sdk
            </code>
            <code className="block bg-muted p-3 rounded text-foreground">
              flutter pub add coachos_sdk
            </code>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Product Lines</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {PRODUCT_LINES.map((line) => (
            <Card key={line.line}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{line.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{line.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mobile Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              "Push Notifications",
              "Deep Links",
              "Offline Sync",
              "Client App API",
              "Webhooks",
            ].map((f) => (
              <Badge key={f} variant="secondary">
                {f}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
