import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { db } from "@/lib/db";
import {
  getTrustedOrigins,
  resolveAuthSecret,
  resolveAuthUrl,
} from "@/lib/env";
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
      requireEmailVerification: false,
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
            } catch {
              // Non-fatal: tracking failures must not block session creation
            }
          },
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
