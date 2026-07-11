import { isProduction } from "@/lib/env";
import { getServiceKindFromError } from "./errors";

const INTERNAL_PATTERNS = [
  /\[CoachOS\]/i,
  /DATABASE_URL/i,
  /BETTER_AUTH/i,
  /prisma/i,
  /ECONNREFUSED/i,
  /ENOTFOUND/i,
  /required in production/i,
  /required at runtime/i,
];

export function isInternalErrorMessage(message: string): boolean {
  return INTERNAL_PATTERNS.some((pattern) => pattern.test(message));
}

export function sanitizeErrorMessageForClient(
  error: Error & { digest?: string }
): { title: string; description: string; service: ReturnType<typeof getServiceKindFromError> } {
  const service = getServiceKindFromError(error);

  if (!isProduction()) {
    return {
      title: "Something went wrong",
      description: error.message || "An unexpected error occurred.",
      service,
    };
  }

  if (service === "database") {
    return {
      title: "Database temporarily unavailable",
      description:
        "We are having trouble loading this page. Please try again in a few minutes.",
      service,
    };
  }

  if (service === "authentication") {
    return {
      title: "Sign-in temporarily unavailable",
      description:
        "Authentication services are unavailable. Please try again later.",
      service,
    };
  }

  if (isInternalErrorMessage(error.message)) {
    return {
      title: "Service temporarily unavailable",
      description:
        "Something went wrong on our end. Our team has been notified. Please try again shortly.",
      service,
    };
  }

  return {
    title: "Something went wrong",
    description: "An unexpected error occurred. Please try again.",
    service,
  };
}
