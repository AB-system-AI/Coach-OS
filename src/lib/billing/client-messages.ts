import { isServiceUnavailableError } from "@/lib/deployment/errors";
import { BILLING_NOT_CONFIGURED_MESSAGE } from "@/lib/payments/availability";

export function formatBillingClientError(error: unknown): string {
  if (isServiceUnavailableError(error) && error.service === "payments") {
    return error.message;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("stripe") ||
      message.includes("paymob") ||
      message.includes("price id") ||
      message.includes("not configured")
    ) {
      return BILLING_NOT_CONFIGURED_MESSAGE;
    }
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
