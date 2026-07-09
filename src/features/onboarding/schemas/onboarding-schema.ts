import { z } from "zod";
import type { BusinessType, SubscriptionPlan, TenantModuleKey } from "@prisma/client";

export const onboardingStep1Schema = z.object({
  businessType: z.enum([
    "FITNESS_COACH",
    "PERSONAL_TRAINER",
    "NUTRITION_COACH",
    "GYM",
    "FITNESS_ACADEMY",
    "FOOTBALL_COACH",
    "SWIMMING_COACH",
    "CROSSFIT_COACH",
    "YOGA_INSTRUCTOR",
    "PILATES_INSTRUCTOR",
    "BOXING_COACH",
    "MARTIAL_ARTS_COACH",
    "RUNNING_COACH",
    "CYCLING_COACH",
    "PHYSIOTHERAPIST",
    "REHABILITATION_CENTER",
    "SPORTS_CLINIC",
  ] as const),
  businessName: z.string().min(2).max(100),
});

export const onboardingStep2Schema = z.object({
  logoUrl: z.string().url().nullable().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  fontFamily: z.string().optional(),
  headingFont: z.string().optional(),
});

export const onboardingStep3Schema = z.object({
  businessEmail: z.string().email().optional(),
  businessPhone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  tiktokUrl: z.string().url().optional().or(z.literal("")),
  youtubeUrl: z.string().url().optional().or(z.literal("")),
  city: z.string().optional(),
  country: z.string().optional(),
  googleMapsUrl: z.string().url().optional().or(z.literal("")),
});

export const onboardingStep4Schema = z.object({
  plan: z.enum(["FREE", "STARTER", "PROFESSIONAL", "BUSINESS", "ENTERPRISE"]),
});

export const onboardingStep5Schema = z.object({
  modules: z.array(
    z.enum([
      "PROGRAMS", "NUTRITION", "RECOVERY", "MARKETPLACE", "COURSES",
      "BLOG", "SHOP", "BOOKINGS", "AI", "REPORTS", "CRM", "LOYALTY",
      "CHALLENGES", "COMMUNITY", "AUTOMATION", "MARKETING", "DIGITAL_PRODUCTS",
    ] as const)
  ),
});

export const completeOnboardingSchema = z.object({
  tenantId: z.string(),
  step1: onboardingStep1Schema,
  step2: onboardingStep2Schema,
  step3: onboardingStep3Schema,
  step4: onboardingStep4Schema,
  step5: onboardingStep5Schema,
});

export type OnboardingData = {
  step1: z.infer<typeof onboardingStep1Schema>;
  step2: z.infer<typeof onboardingStep2Schema>;
  step3: z.infer<typeof onboardingStep3Schema>;
  step4: z.infer<typeof onboardingStep4Schema>;
  step5: { modules: TenantModuleKey[] };
};

export type { BusinessType, SubscriptionPlan };
