import { readRuntimeEnv } from "@/lib/env/runtime";

export function isProductionEmailVerificationRequired(): boolean {
  return readRuntimeEnv("E2E_TEST") !== "true";
}

export function isEmailVerified(
  user: { emailVerified?: boolean | null } | null | undefined
): boolean {
  if (!user) return false;
  if (!isProductionEmailVerificationRequired()) return true;
  return user.emailVerified === true;
}

export function isUnverifiedAuthError(error: {
  code?: string;
  message?: string;
}): boolean {
  const code = error.code?.toUpperCase() ?? "";
  const message = error.message?.toLowerCase() ?? "";
  return (
    code === "EMAIL_NOT_VERIFIED" ||
    message.includes("email not verified") ||
    message.includes("verify your email")
  );
}
