import { apiResponse } from "@/lib/api/auth";

export async function GET() {
  return apiResponse({
    name: "CoachOS Platform API",
    version: "2.0.0",
    description:
      "Multi-product REST API — CoachOS, GymOS, AcademyOS, PhysioOS, SportsOS",
    documentation: "/developers",
    openapi: "/api/v1/openapi",
    productLines: ["COACH_OS", "GYM_OS", "ACADEMY_OS", "PHYSIO_OS", "SPORTS_OS"],
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
      mobile: {
        "GET /api/v1/mobile/config": "Mobile app config (Flutter/RN)",
        "GET|POST /api/v1/mobile/sync": "Offline sync queue",
        "POST /api/v1/mobile/push/register": "Push notification registration",
        "GET /api/v1/mobile/deep-links/{code}": "Resolve deep link",
        "GET /api/v1/mobile/client/dashboard": "Client app dashboard",
        "GET /api/v1/mobile/flutter": "Flutter SDK metadata",
        "GET /api/v1/mobile/react-native": "React Native SDK metadata",
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
    offlineSync: true,
    pushNotifications: true,
    deepLinks: true,
  });
}
