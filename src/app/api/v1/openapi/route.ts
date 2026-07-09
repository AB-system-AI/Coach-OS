export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "CoachOS Public API",
      version: "1.0.0",
      description:
        "Multi-product platform API (CoachOS, GymOS, AcademyOS, PhysioOS, SportsOS). Flutter & React Native ready.",
    },
    servers: [{ url: "/api/v1" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "API Key",
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      "/": {
        get: { summary: "API metadata" },
      },
      "/clients": {
        get: { summary: "List clients" },
        post: { summary: "Create client" },
      },
      "/courses": {
        get: { summary: "List courses" },
      },
      "/reports": {
        get: { summary: "Tenant reports" },
      },
      "/marketplace/coaches": {
        get: { summary: "Public marketplace coaches" },
      },
      "/mobile/config": {
        get: { summary: "Mobile app configuration" },
      },
      "/mobile/sync": {
        get: { summary: "Pull offline sync queue" },
        post: { summary: "Push offline changes" },
      },
      "/mobile/push/register": {
        post: { summary: "Register push subscription" },
      },
      "/mobile/deep-links/{code}": {
        get: { summary: "Resolve deep link" },
      },
      "/mobile/client/dashboard": {
        get: { summary: "Client app aggregated dashboard" },
      },
      "/mobile/flutter": {
        get: { summary: "Flutter SDK endpoints" },
      },
      "/mobile/react-native": {
        get: { summary: "React Native SDK endpoints" },
      },
      "/programs": {
        get: { summary: "List programs" },
        post: { summary: "Create program" },
      },
      "/exercises": {
        get: { summary: "Exercise library" },
        post: { summary: "Add exercise" },
      },
      "/bookings": {
        get: { summary: "List bookings" },
        post: { summary: "Create booking" },
      },
      "/payments": {
        get: { summary: "List payments" },
        post: { summary: "Create payment" },
      },
      "/progress": {
        get: { summary: "Progress and check-ins" },
        post: { summary: "Submit weekly check-in" },
      },
      "/ai": {
        post: { summary: "AI coach assistant" },
      },
    },
  };

  return Response.json(spec);
}
