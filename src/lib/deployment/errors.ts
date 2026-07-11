export type ServiceKind =
  | "database"
  | "authentication"
  | "maintenance"
  | "payments"
  | "email"
  | "realtime"
  | "general";

export class ServiceUnavailableError extends Error {
  readonly service: ServiceKind;

  constructor(service: ServiceKind, message?: string) {
    super(message ?? `Service unavailable: ${service}`);
    this.name = "ServiceUnavailableError";
    this.service = service;
  }
}

export function isServiceUnavailableError(
  error: unknown
): error is ServiceUnavailableError {
  return error instanceof ServiceUnavailableError;
}

export function getServiceKindFromError(error: unknown): ServiceKind | null {
  if (isServiceUnavailableError(error)) return error.service;

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("database_url") ||
      message.includes("database") ||
      message.includes("prisma")
    ) {
      return "database";
    }
    if (
      message.includes("better_auth") ||
      message.includes("authentication") ||
      message.includes("session")
    ) {
      return "authentication";
    }
  }

  return null;
}
