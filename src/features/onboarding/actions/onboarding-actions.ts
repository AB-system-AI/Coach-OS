"use server";

import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";
import { smartOnboardingSchema } from "@/features/onboarding/schemas/onboarding-schema";
import {
  initializeTenantModules,
  seedDefaultAutomations,
  seedDefaultCrmPipeline,
  seedLoyaltyProgram,
  seedEnterpriseDemoData,
  getAutoEnabledModules,
} from "@/features/modules";
import { getProductLineForBusinessType } from "@/features/platform";
import {
  seedCoachMarketplaceProfile,
  seedCoachWebsite,
} from "@/features/onboarding/services/onboarding-seed-service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/types";

function deriveSecondaryColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lighten = (c: number) => Math.min(255, Math.round(c + (255 - c) * 0.35));
  return `#${lighten(r).toString(16).padStart(2, "0")}${lighten(g).toString(16).padStart(2, "0")}${lighten(b).toString(16).padStart(2, "0")}`;
}

export async function completeOnboarding(
  input: Parameters<typeof smartOnboardingSchema.parse>[0]
): Promise<ActionResult | void> {
  const parsed = smartOnboardingSchema.safeParse(input);
  if (!parsed.success) {
    console.error(
      "[CoachOS] completeOnboarding validation failed:",
      parsed.error.flatten()
    );
    return {
      success: false,
      error: "Please complete all required fields and try again.",
    };
  }

  const data = parsed.data;
  const {
    tenantId,
    businessType,
    coachingSpecialty,
    country,
    language,
    businessName,
    brandColor,
    businessEmail,
  } = data;

  try {
    await requireTenantAccess(tenantId);
  } catch (error) {
    console.error("[CoachOS] completeOnboarding access denied:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "You do not have access to complete onboarding for this business.",
    };
  }

  const secondaryColor = deriveSecondaryColor(brandColor);
  const autoModules = getAutoEnabledModules(businessType);
  const plan = "STARTER" as const;

  try {
    await db.$transaction(async (tx) => {
      await tx.tenant.update({
        where: { id: tenantId },
        data: {
          name: businessName,
          businessType,
          productLine: getProductLineForBusinessType(businessType),
          plan,
          onboardingCompleted: true,
        },
      });

      await tx.tenantTheme.upsert({
        where: { tenantId },
        update: {
          primaryColor: brandColor,
          secondaryColor,
          accentColor: brandColor,
          fontFamily: "Inter",
          headingFont: "Inter",
        },
        create: {
          tenantId,
          primaryColor: brandColor,
          secondaryColor,
          accentColor: brandColor,
          fontFamily: "Inter",
          headingFont: "Inter",
        },
      });

      await tx.tenantSettings.upsert({
        where: { tenantId },
        update: {
          businessName,
          businessEmail: businessEmail ?? undefined,
          country,
          locale: language === "Arabic" ? "ar" : "en",
        },
        create: {
          tenantId,
          businessName,
          businessEmail,
          country,
          locale: language === "Arabic" ? "ar" : "en",
        },
      });

      await tx.tenantSubscription.upsert({
        where: { tenantId },
        update: { plan },
        create: { tenantId, plan, status: "TRIALING" },
      });
    }, { maxWait: 10_000, timeout: 20_000 });

    await initializeTenantModules(tenantId, businessType, autoModules, true);

    if (autoModules.includes("AUTOMATION")) {
      await seedDefaultAutomations(tenantId);
    }
    if (autoModules.includes("CRM")) {
      await seedDefaultCrmPipeline(tenantId);
    }
    if (autoModules.includes("LOYALTY")) {
      await seedLoyaltyProgram(tenantId);
    }

    await seedEnterpriseDemoData(tenantId);

    await seedCoachWebsite({
      tenantId,
      businessName,
      businessType,
      coachingSpecialty,
      brandColor,
      country,
      language,
    });

    await seedCoachMarketplaceProfile({
      tenantId,
      businessName,
      businessType,
      coachingSpecialty,
      country,
      language,
    });
  } catch (error) {
    console.error("[CoachOS] completeOnboarding failed:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Onboarding could not be completed. Please try again.",
    };
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
      slug: true,
      theme: true,
      settings: true,
    },
  });
  return tenant;
}
