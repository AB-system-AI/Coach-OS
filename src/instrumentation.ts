export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
    const { validateDeploymentAtStartup } = await import(
      "@/lib/deployment/startup-validator"
    );
    validateDeploymentAtStartup();
  }
}

export async function onRequestError(
  error: unknown,
  request: { path: string; method: string; headers: { [key: string]: string } },
  context: { routerKind: string; routePath: string; routeType: string }
) {
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(error, request, context);
}
