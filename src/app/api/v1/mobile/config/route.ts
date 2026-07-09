import { authenticateApiRequest, apiResponse, apiError } from "@/lib/api/auth";
import { db } from "@/lib/db";
import { getEnabledModules } from "@/features/modules";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);

  const tenant = await db.tenant.findUnique({
    where: { id: ctx.tenantId },
    select: {
      id: true,
      name: true,
      slug: true,
      productLine: true,
      plan: true,
      theme: true,
      settings: true,
    },
  });

  if (!tenant) return apiError("Tenant not found", 404);

  const modules = await getEnabledModules(ctx.tenantId);

  return apiResponse({
    tenant,
    enabledModules: modules,
    mobile: {
      flutterReady: true,
      reactNativeReady: true,
      pushNotifications: true,
      deepLinks: true,
      offlineSync: true,
    },
    endpoints: {
      sync: "/api/v1/mobile/sync",
      pushRegister: "/api/v1/mobile/push/register",
      clientDashboard: "/api/v1/mobile/client/dashboard",
    },
  });
}
