import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  const version = process.env.npm_package_version ?? "0.1.0";

  let dbStatus: "ok" | "error" = "error";
  let dbError: string | undefined;

  try {
    await db.$queryRaw`SELECT 1`;
    dbStatus = "ok";
  } catch (err) {
    dbError =
      process.env.NODE_ENV === "development"
        ? (err instanceof Error ? err.message : String(err))
        : "Database unreachable";
  }

  const isHealthy = dbStatus === "ok";

  return NextResponse.json(
    {
      status: isHealthy ? "ok" : "degraded",
      db: dbStatus,
      ...(dbError ? { dbError } : {}),
      timestamp,
      version,
    },
    { status: isHealthy ? 200 : 503 }
  );
}
