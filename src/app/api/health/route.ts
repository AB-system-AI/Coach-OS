import { NextResponse } from "next/server";
import { getDeploymentEnvIssues } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  const version = process.env.npm_package_version ?? "0.1.0";
  const envIssues = getDeploymentEnvIssues();

  let dbStatus: "ok" | "error" | "skipped" = "skipped";
  let dbError: string | undefined;

  if (envIssues.some((issue) => issue.variable === "DATABASE_URL")) {
    dbStatus = "skipped";
    dbError = "DATABASE_URL is not configured";
  } else {
    try {
      const { db } = await import("@/lib/db");
      await db.$queryRaw`SELECT 1`;
      dbStatus = "ok";
    } catch (err) {
      dbStatus = "error";
      dbError =
        err instanceof Error ? err.message : "Database unreachable";
    }
  }

  const isHealthy = envIssues.length === 0 && dbStatus === "ok";

  return NextResponse.json(
    {
      status: isHealthy ? "ok" : "degraded",
      env: envIssues.length === 0 ? "ok" : "error",
      ...(envIssues.length > 0 ? { envIssues } : {}),
      db: dbStatus,
      ...(dbError ? { dbError } : {}),
      timestamp,
      version,
    },
    { status: isHealthy ? 200 : 503 }
  );
}
