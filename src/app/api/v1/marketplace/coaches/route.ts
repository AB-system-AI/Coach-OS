import { NextRequest } from "next/server";
import {
  authenticateApiRequest,
  apiResponse,
  apiError,
} from "@/lib/api/auth";
import { searchMarketplaceCoaches } from "@/features/marketplace";

export async function GET(request: NextRequest) {
  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);

  const { searchParams } = request.nextUrl;
  const page = searchParams.get("page") ?? "1";
  const pageSize = searchParams.get("pageSize") ?? "20";

  const result = await searchMarketplaceCoaches({ page, pageSize });

  return apiResponse({
    coaches: result.coaches,
    pagination: {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    },
  });
}
