export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
    const { validateDeploymentAtStartup } = await import(
      "@/lib/deployment/startup-validator"
    );
    validateDeploymentAtStartup();
  }
}
