"use client";

import { createAuthClient } from "better-auth/react";
import { magicLinkClient, inferAdditionalFields } from "better-auth/client/plugins";
import type { getAuth } from "@/lib/auth";

/**
 * Prefer same-origin `/api/auth` in the browser so preview/production hosts
 * work even when NEXT_PUBLIC_APP_URL is missing or points at another domain.
 */
const configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

export const authClient = createAuthClient({
  baseURL: configuredBaseUrl || undefined,
  plugins: [
    magicLinkClient(),
    inferAdditionalFields<ReturnType<typeof getAuth>>(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;

// Session helpers - exposed directly from the auth client
export const getSession = authClient.getSession;
export const listSessions = authClient.listSessions;
export const revokeSession = authClient.revokeSession;
export const revokeOtherSessions = authClient.revokeOtherSessions;
export const revokeSessions = authClient.revokeSessions;

// Password & email helpers
/** Reset password with token (from email link). */
export const resetPassword = authClient.resetPassword;
/** Initiate password reset — sends an email with a reset link. */
export const requestPasswordReset: (opts: { email: string; redirectTo?: string }) => Promise<unknown> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (authClient as any).requestPasswordReset ?? authClient.resetPassword;
export const sendVerificationEmail = authClient.sendVerificationEmail;
export const verifyEmail = authClient.verifyEmail;
export const changePassword = authClient.changePassword;
export const changeEmail = authClient.changeEmail;

// User helpers
export const updateUser = authClient.updateUser;
export const deleteUser = authClient.deleteUser;

/** Convenience magic-link sign-in helper */
export const magicLink = {
  signIn: (email: string, callbackURL = "/dashboard") =>
    authClient.signIn.magicLink({ email, callbackURL }),
};
