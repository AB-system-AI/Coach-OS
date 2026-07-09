import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";
import {
  getTrustedOrigins,
  resolveAuthSecret,
  resolveAuthUrl,
} from "@/lib/env";

function createAuth() {
  return betterAuth({
    secret: resolveAuthSecret(),
    baseURL: resolveAuthUrl(),
    database: prismaAdapter(db, {
      provider: "postgresql",
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        enabled: !!(
          process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ),
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "CLIENT",
          input: false,
        },
        locale: {
          type: "string",
          defaultValue: "en",
        },
        timezone: {
          type: "string",
          defaultValue: "UTC",
        },
      },
    },
    trustedOrigins: getTrustedOrigins(),
  });
}

let authInstance: ReturnType<typeof createAuth> | undefined;

export function getAuth() {
  if (!authInstance) {
    authInstance = createAuth();
  }
  return authInstance;
}

export type Session = ReturnType<typeof getAuth>["$Infer"]["Session"];
export type User = ReturnType<typeof getAuth>["$Infer"]["Session"]["user"];
