import { readRuntimeEnv } from "@/lib/env/runtime";
import { ServiceUnavailableError } from "@/lib/deployment/errors";

export const BILLING_NOT_CONFIGURED_MESSAGE =
  "Billing is currently being configured. Please contact support to activate your subscription.";

export function isStripeConfigured(): boolean {
  return Boolean(readRuntimeEnv("STRIPE_SECRET_KEY"));
}

export function isPaymobConfigured(): boolean {
  return Boolean(
    readRuntimeEnv("PAYMOB_API_KEY") &&
      readRuntimeEnv("PAYMOB_INTEGRATION_ID") &&
      readRuntimeEnv("PAYMOB_IFRAME_ID")
  );
}

export function isPaymentProviderConfigured(
  provider: "stripe" | "paymob"
): boolean {
  return provider === "paymob" ? isPaymobConfigured() : isStripeConfigured();
}

export function assertStripeBillingConfigured(): void {
  if (!isStripeConfigured()) {
    throw new ServiceUnavailableError("payments", BILLING_NOT_CONFIGURED_MESSAGE);
  }
}

export function assertPaymentProviderConfigured(
  provider: "stripe" | "paymob"
): void {
  if (!isPaymentProviderConfigured(provider)) {
    throw new ServiceUnavailableError("payments", BILLING_NOT_CONFIGURED_MESSAGE);
  }
}
