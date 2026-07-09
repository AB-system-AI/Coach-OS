"use server";

import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { isReservedSlug } from "@/features/tenancy/types";
import type { SubscriptionPlan } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type CreateTenantInput = {
  name: string;
  slug?: string;
  ownerUserId: string;
  plan?: SubscriptionPlan;
};

export async function createTenant(input: CreateTenantInput) {
  const slug = input.slug ?? slugify(input.name);

  if (isReservedSlug(slug)) {
    throw new Error("This slug is reserved");
  }

  const existing = await db.tenant.findUnique({ where: { slug } });
  if (existing) {
    throw new Error("A coach with this URL already exists");
  }

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  const tenant = await db.$transaction(async (tx) => {
    const newTenant = await tx.tenant.create({
      data: {
        name: input.name,
        slug,
        plan: input.plan ?? "FREE",
        status: "TRIAL",
        trialEndsAt,
        theme: { create: {} },
        settings: { create: { businessName: input.name, marketplaceEnabled: true } },
        subscription: {
          create: {
            plan: input.plan ?? "FREE",
            status: "TRIALING",
            currentPeriodEnd: trialEndsAt,
          },
        },
        marketplaceProfile: {
          create: {
            isVisible: false,
            specialties: [],
            languages: ["English"],
          },
        },
        members: {
          create: {
            userId: input.ownerUserId,
            role: "COACH",
          },
        },
      },
      include: { theme: true, settings: true },
    });

    await tx.user.update({
      where: { id: input.ownerUserId },
      data: { role: "COACH" },
    });

    const defaultPages = [
      { slug: "home", title: "Home" },
      { slug: "about", title: "About" },
      { slug: "contact", title: "Contact" },
      { slug: "recovery", title: "Recovery" },
      { slug: "pricing", title: "Pricing" },
      { slug: "faq", title: "FAQ" },
    ];

    await tx.cmsPage.createMany({
      data: defaultPages.map((page) => ({
        tenantId: newTenant.id,
        slug: page.slug,
        title: page.title,
        status: "DRAFT" as const,
      })),
    });

    return newTenant;
  });

  revalidatePath("/admin/coaches");
  return tenant;
}

export async function suspendTenant(tenantId: string) {
  await db.tenant.update({
    where: { id: tenantId },
    data: { status: "SUSPENDED" },
  });
  revalidatePath("/admin/coaches");
}

export async function activateTenant(tenantId: string) {
  await db.tenant.update({
    where: { id: tenantId },
    data: { status: "ACTIVE" },
  });
  revalidatePath("/admin/coaches");
}

export async function deleteTenant(tenantId: string) {
  await db.tenant.delete({ where: { id: tenantId } });
  revalidatePath("/admin/coaches");
}
