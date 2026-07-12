import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { db, isDatabaseConfigured } from "@/lib/db";
import { ServiceUnavailableError } from "@/lib/deployment/errors";
import {
  getTrustedOrigins,
  readRuntimeEnv,
  resolveAuthSecret,
  resolveAuthUrl,
} from "@/lib/env";
import { writeAuditLog } from "@/lib/audit";
import { isProductionEmailVerificationRequired } from "@/lib/auth/email-verification";
import {
  sendEmail,
  resetPasswordEmail,
  verificationEmail,
  magicLinkEmail,
} from "@/lib/email/index";

function createAuth() {
  const baseURL = resolveAuthUrl();

  return betterAuth({
    secret: resolveAuthSecret(),
    baseURL,
    database: prismaAdapter(db, {
      provider: "postgresql",
    }),

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      requireEmailVerification: isProductionEmailVerificationRequired(),
      sendResetPassword: async ({ user, url }) => {
        const template = resetPasswordEmail(user.name, url);
        await sendEmail({
          to: user.email,
          subject: template.subject,
          html: template.html,
        });
      },
    },

    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        const template = verificationEmail(user.name, url);
        await sendEmail({
          to: user.email,
          subject: template.subject,
          html: template.html,
        });
      },
    },

    plugins: [
      magicLink({
        expiresIn: 60 * 5,
        sendMagicLink: async ({ email, url }) => {
          const template = magicLinkEmail(email, url);
          await sendEmail({
            to: email,
            subject: template.subject,
            html: template.html,
          });
        },
      }),
    ],

    socialProviders: {
      google: {
        clientId: readRuntimeEnv("GOOGLE_CLIENT_ID") ?? "",
        clientSecret: readRuntimeEnv("GOOGLE_CLIENT_SECRET") ?? "",
        enabled: !!(
          readRuntimeEnv("GOOGLE_CLIENT_ID") &&
          readRuntimeEnv("GOOGLE_CLIENT_SECRET")
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

    databaseHooks: {
      session: {
        create: {
          after: async (session, ctx) => {
            const req = (ctx as { request?: Request } | undefined)?.request;
            const ipAddress =
              req?.headers?.get("x-forwarded-for")?.split(",")[0].trim() ??
              req?.headers?.get("x-real-ip") ??
              null;
            const userAgent = req?.headers?.get("user-agent") ?? null;

            try {
              await db.loginHistory.create({
                data: {
                  userId: session.userId,
                  ipAddress,
                  userAgent,
                  success: true,
                },
              });

              if (userAgent) {
                const deviceType = /mobile|android|iphone|ipad/i.test(userAgent)
                  ? "mobile"
                  : /tablet/i.test(userAgent)
                  ? "tablet"
                  : "desktop";

                const fingerprint = `${session.userId}:${userAgent.slice(0, 100)}`;
                await db.userDevice.upsert({
                  where: { id: fingerprint },
                  update: { lastSeenAt: new Date() },
                  create: {
                    id: fingerprint,
                    userId: session.userId,
                    deviceType,
                    fingerprint,
                    lastSeenAt: new Date(),
                  },
                });
              }

              await writeAuditLog({
                userId: session.userId,
                action: "LOGIN",
                entity: "Session",
                entityId: session.id,
                ipAddress: ipAddress ?? undefined,
                metadata: { userAgent },
              });
            } catch {
              // Non-fatal: tracking failures must not block session creation
            }
          },
        },
      },
    },

    trustedOrigins: getTrustedOrigins(),

  ...(readRuntimeEnv("E2E_DISABLE_RATE_LIMIT") === "true"
    ? { rateLimit: { enabled: false } }
    : {}),
  });
}

let authInstance: ReturnType<typeof createAuth> | undefined;

export function getAuth() {
  if (!authInstance) {
    if (!isDatabaseConfigured()) {
      throw new ServiceUnavailableError(
        "authentication",
        "Authentication is unavailable — database not configured."
      );
    }
    authInstance = createAuth();
  }
  return authInstance;
}

export type Session = ReturnType<typeof getAuth>["$Infer"]["Session"];
export type User = ReturnType<typeof getAuth>["$Infer"]["Session"]["user"];
