"use server";

import { resolveAuthenticatedDestination } from "@/lib/auth/redirects";
import { getEnabledAuthProviders } from "@/lib/auth/providers";

export async function getPostLoginDestination(
  callbackUrl?: string | null
): Promise<string> {
  return resolveAuthenticatedDestination(callbackUrl);
}

export async function getAuthProviders() {
  return getEnabledAuthProviders();
}
