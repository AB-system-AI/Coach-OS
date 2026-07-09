import { authenticateApiRequest, apiError } from "@/lib/api/auth";
import { getRevenueReport, getClientsReport } from "@/features/reports";
import type { NextRequest } from "next/server";

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = String(row[h] ?? "");
          return val.includes(",") ? `"${val}"` : val;
        })
        .join(",")
    ),
  ];
  return lines.join("\n");
}

export async function GET(request: NextRequest) {
  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "revenue";
  const period = (searchParams.get("period") ?? "30d") as "7d" | "30d" | "90d" | "12m";

  let csv = "";
  let filename = "";

  if (type === "revenue") {
    const report = await getRevenueReport(ctx.tenantId, period);
    csv = toCSV(
      report.monthly.map((m) => ({ month: m.month, revenue: m.amount }))
    );
    filename = `revenue-${period}.csv`;
  } else if (type === "clients") {
    const report = await getClientsReport(ctx.tenantId, period);
    csv = toCSV(report.growth.map((g) => ({ date: g.date, new_clients: g.count })));
    filename = `clients-${period}.csv`;
  } else {
    return apiError("Unknown export type", 400);
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
