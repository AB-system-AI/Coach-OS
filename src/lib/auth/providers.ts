import { hasAllRuntimeEnv } from "@/lib/env/runtime";

export function isGoogleAuthEnabled(): boolean {
  return hasAllRuntimeEnv("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET");
}

export type EnabledAuthProviders = {
  google: boolean;
};

export function getEnabledAuthProviders(): EnabledAuthProviders {
  return {
    google: isGoogleAuthEnabled(),
  };
}
