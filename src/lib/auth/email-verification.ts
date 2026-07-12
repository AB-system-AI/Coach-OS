import { readRuntimeEnv } from "@/lib/env/runtime";

/**
 * Controls whether email verification is required before sign-in.
 * Set REQUIRE_EMAIL_VERIFICATION=true to re-enable for production launch.
 */
export function isEmailVerificationRequired(): boolean {
  if (readRuntimeEnv("E2E_TEST") === "true") return false;

  const value = readRuntimeEnv("REQUIRE_EMAIL_VERIFICATION")?.toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}

/** @deprecated Use isEmailVerificationRequired() */
export function isProductionEmailVerificationRequired(): boolean {
  return isEmailVerificationRequired();
}

export function isEmailVerified(
  user: { emailVerified?: boolean | null } | null | undefined
): boolean {
  if (!user) return false;
  if (!isEmailVerificationRequired()) return true;
  return user.emailVerified === true;
}

export function isUnverifiedAuthError(error: {
  code?: string;
  message?: string;
}): boolean {
  if (!isEmailVerificationRequired()) return false;

  const code = error.code?.toUpperCase() ?? "";
  const message = error.message?.toLowerCase() ?? "";
  return (
    code === "EMAIL_NOT_VERIFIED" ||
    message.includes("email not verified") ||
    message.includes("verify your email")
  );
}
