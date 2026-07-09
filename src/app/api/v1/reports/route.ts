import { NextRequest } from "next/server";
import {
  authenticateApiRequest,
  apiResponse,
  apiError,
} from "@/lib/api/auth";
import { getFullReport } from "@/features/reports";
import type { ReportPeriod } from "@/features/reports";

export async function GET(request: NextRequest) {
  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);
  if (ctx.scope === "WRITE") return apiError("Insufficient permissions", 403);

  const period = (request.nextUrl.searchParams.get("period") ??
    "30d") as ReportPeriod;

  const report = await getFullReport(ctx.tenantId, period);
  return apiResponse(report);
}
