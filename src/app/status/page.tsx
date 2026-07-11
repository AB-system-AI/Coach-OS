import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  getAllServiceStatuses,
  getMissingRequiredEnvVars,
} from "@/lib/deployment";
import { checkDatabaseConnection, isDatabaseConfigured } from "@/lib/db";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export const metadata = {
  title: "System Status",
  description: "CoachOS platform service status.",
};

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const services = getAllServiceStatuses();
  const missingRequired = getMissingRequiredEnvVars();
  const dbConnected =
    isDatabaseConfigured() && (await checkDatabaseConnection());

  return (
    <div className="min-h-screen bg-muted/20 px-4 py-16">
      <div className="container mx-auto max-w-3xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">CoachOS Status</h1>
          <p className="text-muted-foreground text-sm">
            Live configuration and service availability (no secrets exposed).
          </p>
        </div>

        <section className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Core platform</h2>
          <ul className="space-y-3">
            <StatusRow
              label="Database"
              ok={dbConnected}
              detail={
                dbConnected
                  ? "Connected"
                  : missingRequired.includes("DATABASE_URL")
                    ? "Not configured"
                    : "Unreachable"
              }
            />
            <StatusRow
              label="Authentication"
              ok={!missingRequired.some((v) =>
                ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL"].includes(v)
              )}
              detail="Session and sign-in services"
            />
          </ul>
        </section>

        <section className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Integrations</h2>
          <ul className="space-y-3">
            {services
              .filter((s) => s.service !== "database" && s.service !== "authentication")
              .map((service) => (
                <StatusRow
                  key={service.message}
                  label={service.service}
                  ok={service.configured}
                  detail={service.message}
                />
              ))}
          </ul>
        </section>

        <div className="flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/">Home</Link>
          </Button>
          <Button asChild>
            <Link href="/api/health">JSON health check</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatusRow({
  label,
  ok,
  detail,
}: {
  label: string;
  ok: boolean;
  detail: string;
}) {
  const Icon = ok ? CheckCircle2 : detail.includes("Not configured") ? AlertCircle : XCircle;
  const color = ok
    ? "text-green-600"
    : detail.includes("Not configured")
      ? "text-amber-600"
      : "text-destructive";

  return (
    <li className="flex items-start gap-3 text-sm">
      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${color}`} />
      <div>
        <p className="font-medium capitalize">{label}</p>
        <p className="text-muted-foreground">{detail}</p>
      </div>
    </li>
  );
}
