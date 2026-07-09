"use server";

import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";
import { completeOnboardingSchema } from "@/features/onboarding/schemas/onboarding-schema";
import {
  initializeTenantModules,
  seedDefaultAutomations,
  seedDefaultCrmPipeline,
  seedLoyaltyProgram,
} from "@/features/modules";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function completeOnboarding(
  input: Parameters<typeof completeOnboardingSchema.parse>[0]
) {
  const data = completeOnboardingSchema.parse(input);
  const { tenantId, step1, step2, step3, step4, step5 } = data;

  await requireTenantAccess(tenantId);

  await db.$transaction(async (tx) => {
    await tx.tenant.update({
      where: { id: tenantId },
      data: {
        name: step1.businessName,
        businessType: step1.businessType,
        plan: step4.plan,
        onboardingCompleted: true,
      },
    });

    await tx.tenantTheme.upsert({
      where: { tenantId },
      update: {
        logoUrl: step2.logoUrl,
        primaryColor: step2.primaryColor,
        secondaryColor: step2.secondaryColor,
        fontFamily: step2.fontFamily,
        headingFont: step2.headingFont,
      },
      create: {
        tenantId,
        logoUrl: step2.logoUrl,
        primaryColor: step2.primaryColor ?? "#6366f1",
        secondaryColor: step2.secondaryColor ?? "#8b5cf6",
        fontFamily: step2.fontFamily ?? "Inter",
        headingFont: step2.headingFont ?? "Inter",
      },
    });

    await tx.tenantSettings.upsert({
      where: { tenantId },
      update: {
        businessName: step1.businessName,
        businessEmail: step3.businessEmail,
        businessPhone: step3.businessPhone,
        whatsappNumber: step3.whatsappNumber,
        facebookUrl: step3.facebookUrl || null,
        instagramUrl: step3.instagramUrl || null,
        tiktokUrl: step3.tiktokUrl || null,
        youtubeUrl: step3.youtubeUrl || null,
        city: step3.city,
        country: step3.country,
        googleMapsUrl: step3.googleMapsUrl || null,
      },
      create: {
        tenantId,
        businessName: step1.businessName,
        businessEmail: step3.businessEmail,
        businessPhone: step3.businessPhone,
        whatsappNumber: step3.whatsappNumber,
        facebookUrl: step3.facebookUrl || null,
        instagramUrl: step3.instagramUrl || null,
        tiktokUrl: step3.tiktokUrl || null,
        youtubeUrl: step3.youtubeUrl || null,
        city: step3.city,
        country: step3.country,
        googleMapsUrl: step3.googleMapsUrl || null,
      },
    });

    await tx.tenantSubscription.upsert({
      where: { tenantId },
      update: { plan: step4.plan },
      create: { tenantId, plan: step4.plan, status: "TRIALING" },
    });
  });

  await initializeTenantModules(tenantId, step1.businessType, step5.modules);

  if (step5.modules.includes("AUTOMATION")) {
    await seedDefaultAutomations(tenantId);
  }
  if (step5.modules.includes("CRM")) {
    await seedDefaultCrmPipeline(tenantId);
  }
  if (step5.modules.includes("LOYALTY")) {
    await seedLoyaltyProgram(tenantId);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function getOnboardingStatus(tenantId: string) {
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    select: {
      onboardingCompleted: true,
      businessType: true,
      plan: true,
      name: true,
      theme: true,
      settings: true,
    },
  });
  return tenant;
}
