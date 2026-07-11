import { NextResponse } from "next/server";
import { getDeploymentEnvIssues } from "@/lib/env";
import {
  checkDatabaseConnection,
  isDatabaseConfigured,
} from "@/lib/db";
import {
  getAllServiceStatuses,
  getEnvAuditTable,
  getLastStartupReport,
} from "@/lib/deployment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  const version = process.env.npm_package_version ?? "0.1.0";
  const envIssues = getDeploymentEnvIssues();
  const services = getAllServiceStatuses();
  const startup = getLastStartupReport();

  let dbStatus: "ok" | "error" | "skipped" | "unconfigured" = "skipped";
  let dbError: string | undefined;

  if (!isDatabaseConfigured()) {
    dbStatus = "unconfigured";
    dbError = "DATABASE_URL is not configured";
  } else {
    const connected = await checkDatabaseConnection();
    if (connected) {
      dbStatus = "ok";
    } else {
      dbStatus = "error";
      dbError = "Database unreachable";
    }
  }

  const coreReady = envIssues.length === 0 && dbStatus === "ok";

  return NextResponse.json(
    {
      status: coreReady ? "ok" : "degraded",
      env: envIssues.length === 0 ? "ok" : "error",
      ...(envIssues.length > 0 ? { envIssues } : {}),
      db: dbStatus,
      ...(dbError ? { dbError } : {}),
      services: services.map((service) => ({
        service: service.service,
        configured: service.configured,
        available: service.available,
        message: service.message,
      })),
      ...(startup
        ? {
            startup: {
              ok: startup.ok,
              missingRequired: startup.missingRequired,
            },
          }
        : {}),
      envAudit: getEnvAuditTable(),
      timestamp,
      version,
    },
    { status: coreReady ? 200 : 503 }
  );
}
