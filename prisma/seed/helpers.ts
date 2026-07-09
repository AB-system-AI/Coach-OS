import type { PrismaClient, UserRole } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

/** Default demo password — override with DEMO_SEED_PASSWORD in production demos. */
export const DEMO_SEED_PASSWORD =
  process.env.DEMO_SEED_PASSWORD ?? "CoachOS-Demo-2026!";

export async function upsertUserWithCredentials(
  prisma: PrismaClient,
  params: {
    email: string;
    name: string;
    role: UserRole;
    password?: string;
  }
) {
  const plainPassword = params.password ?? DEMO_SEED_PASSWORD;
  const hashed = await hashPassword(plainPassword);

  const user = await prisma.user.upsert({
    where: { email: params.email },
    update: {
      name: params.name,
      role: params.role,
      emailVerified: true,
    },
    create: {
      name: params.name,
      email: params.email,
      emailVerified: true,
      role: params.role,
    },
  });

  const existingAccount = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
  });

  if (existingAccount) {
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: { password: hashed },
    });
  } else {
    await prisma.account.create({
      data: {
        userId: user.id,
        providerId: "credential",
        accountId: user.id,
        password: hashed,
      },
    });
  }

  return user;
}

export function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function daysAgo(days: number): Date {
  return daysFromNow(-days);
}
