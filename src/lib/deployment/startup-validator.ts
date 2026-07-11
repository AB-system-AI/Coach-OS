import { getDeploymentEnvIssues, isNextBuild, isProduction } from "@/lib/env";
import { getEnvAuditTable, getMissingRequiredEnvVars } from "./env-manifest";
import { getAllServiceStatuses } from "./service-status";

export type StartupValidationReport = {
  ok: boolean;
  timestamp: string;
  environment: string;
  missingRequired: string[];
  envIssues: ReturnType<typeof getDeploymentEnvIssues>;
  services: ReturnType<typeof getAllServiceStatuses>;
};

let lastReport: StartupValidationReport | undefined;

export function validateDeploymentAtStartup(): StartupValidationReport {
  if (isNextBuild()) {
    lastReport = {
      ok: true,
      timestamp: new Date().toISOString(),
      environment: "build",
      missingRequired: [],
      envIssues: [],
      services: [],
    };
    return lastReport;
  }

  const envIssues = getDeploymentEnvIssues();
  const missingRequired = getMissingRequiredEnvVars();
  const services = getAllServiceStatuses();
  const ok = missingRequired.length === 0;

  const report: StartupValidationReport = {
    ok,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "unknown",
    missingRequired,
    envIssues,
    services,
  };

  lastReport = report;

  if (!ok && isProduction()) {
    console.error(
      "[CoachOS] Deployment configuration incomplete. Missing required variables:",
      missingRequired.join(", ")
    );
    for (const issue of envIssues) {
      console.error(`[CoachOS]   ${issue.variable}: ${issue.message}`);
    }
    console.error(
      "[CoachOS] Public pages will continue to load. Protected features show a maintenance screen until configuration is fixed."
    );
    console.error(
      "[CoachOS] Audit table: run `npm run validate:deploy` or GET /api/health for details."
    );
  } else if (!ok) {
    console.warn(
      "[CoachOS] Missing env vars (development):",
      missingRequired.join(", ")
    );
  } else {
    console.info("[CoachOS] Deployment configuration validated successfully.");
  }

  const optionalDown = services.filter(
    (service) => !service.configured && service.service !== "database"
  );
  if (optionalDown.length > 0 && isProduction()) {
    console.info(
      "[CoachOS] Optional services not configured:",
      optionalDown.map((s) => s.message).join(" | ")
    );
  }

  return report;
}

export function getLastStartupReport(): StartupValidationReport | undefined {
  return lastReport;
}

export function formatEnvAuditTableMarkdown(): string {
  const rows = getEnvAuditTable();
  const header =
    "| Variable | Required? | Used in | Missing? | Safe default? |\n|----------|-----------|---------|----------|---------------|";
  const body = rows
    .map(
      (row) =>
        `| ${row.variable} | ${row.required ? "Yes" : "No"} | ${row.usedIn} | ${row.missing ? "Yes" : "No"} | ${row.safeDefault} |`
    )
    .join("\n");
  return `${header}\n${body}`;
}
