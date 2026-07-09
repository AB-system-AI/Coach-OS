"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Prefer same-origin `/api/auth` in the browser so preview/production hosts
 * work even when NEXT_PUBLIC_APP_URL is missing or points at another domain.
 * Absolute URL is only used when explicitly configured (e.g. split API host).
 */
const configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

export const authClient = createAuthClient({
  baseURL: configuredBaseUrl || undefined,
});

export const { signIn, signUp, signOut, useSession } = authClient;
