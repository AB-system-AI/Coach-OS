import { authenticateApiRequest, apiResponse, apiError } from "@/lib/api/auth";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);

  const baseUrl = process.env.BETTER_AUTH_URL ?? "https://coachos.app";

  return apiResponse({
    platform: "Flutter",
    apiVersion: "v1",
    baseUrl: `${baseUrl}/api/v1`,
    capabilities: {
      authentication: {
        method: "bearer",
        header: "Authorization",
        prefix: "Bearer cos_",
        tokenEndpoint: `${baseUrl}/api/auth/sign-in/email`,
      },
      endpoints: {
        clients: { list: "GET /api/v1/clients", create: "POST /api/v1/clients" },
        courses: { list: "GET /api/v1/courses" },
        bookings: { list: "GET /api/v1/bookings", create: "POST /api/v1/bookings" },
        payments: { list: "GET /api/v1/payments" },
        progress: { list: "GET /api/v1/progress", create: "POST /api/v1/progress" },
        reports: { get: "GET /api/v1/reports?period=30d" },
        marketplace: { coaches: "GET /api/v1/marketplace/coaches" },
        mobile: {
          config: "GET /api/v1/mobile/config",
          sync: "GET|POST /api/v1/mobile/sync",
          push: "POST /api/v1/mobile/push/register",
          deepLinks: "GET /api/v1/mobile/deep-links/{code}",
          clientDashboard: "GET /api/v1/mobile/client/dashboard",
          flutter: "GET /api/v1/mobile/flutter",
        },
      },
      features: {
        offlineSync: true,
        pushNotifications: !!process.env.VAPID_PUBLIC_KEY,
        realtime: !!process.env.PUSHER_KEY,
        payments: !!(process.env.STRIPE_SECRET_KEY || process.env.PAYMOB_API_KEY),
        whatsapp: !!(process.env.TWILIO_ACCOUNT_SID || process.env.WHATSAPP_CLOUD_API_TOKEN),
      },
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY ?? null,
      pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY ?? null,
      pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "mt1",
    },
  });
}
