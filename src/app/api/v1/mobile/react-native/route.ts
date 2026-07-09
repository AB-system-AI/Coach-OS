import { apiResponse } from "@/lib/api/auth";

export async function GET() {
  return apiResponse({
    platform: "CoachOS Mobile API",
    framework: "React Native",
    version: "1.0.0",
    documentation: "/developers",
    sdk: {
      npm: "@coachos/react-native-sdk",
      install: "npm install @coachos/react-native-sdk",
    },
    endpoints: {
      config: "GET /api/v1/mobile/config",
      sync: "GET|POST /api/v1/mobile/sync",
      push: "POST /api/v1/mobile/push/register",
      deepLinks: "GET /api/v1/mobile/deep-links/{code}",
      clientDashboard: "GET /api/v1/mobile/client/dashboard?userId=",
    },
  });
}
