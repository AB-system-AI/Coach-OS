import { apiResponse } from "@/lib/api/auth";

export async function GET() {
  return apiResponse({
    name: "CoachOS API",
    version: "1.0.0",
    description: "REST API for mobile apps, Flutter, React Native, and third-party integrations",
    documentation: "/docs/api",
    endpoints: {
      marketplace: {
        "GET /api/v1/marketplace/coaches": "List marketplace coaches (public)",
      },
      courses: {
        "GET /api/v1/courses": "List tenant courses (auth required)",
      },
      clients: {
        "GET /api/v1/clients": "List tenant clients (auth required)",
        "POST /api/v1/clients": "Create client (auth required)",
      },
      reports: {
        "GET /api/v1/reports?period=30d": "Get tenant reports (auth required)",
      },
      webhooks: {
        "POST /api/v1/webhooks": "Register webhook endpoint (auth required)",
      },
    },
    authentication: {
      type: "Bearer",
      header: "Authorization: Bearer cos_...",
    },
    mobileReady: true,
    flutterReady: true,
    reactNativeReady: true,
  });
}
