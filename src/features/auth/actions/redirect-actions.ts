"use server";

import { resolveAuthenticatedDestination } from "@/lib/auth/redirects";

export async function getPostLoginDestination(
  callbackUrl?: string | null
): Promise<string> {
  return resolveAuthenticatedDestination(callbackUrl);
}
