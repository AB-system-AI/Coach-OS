import type { SubscriptionPlan } from "@prisma/client";

export type PlanLimitKey =
  | "clients"
  | "programs"
  | "videos"
  | "storageBytes"
  | "customDomain"
  | "assistantCoaches"
  | "recoveryBooking"
  | "ai"
  | "analytics"
  | "marketplace"
  | "apiAccess"
  | "webhooks"
  | "whiteLabel";

export type PlanLimits = Record<PlanLimitKey, number | boolean>;

export type PlanDefinition = {
  plan: SubscriptionPlan;
  name: string;
  description: string;
  monthlyPrice: number;
  limits: PlanLimits;
};

const GB = 1024 * 1024 * 1024;

export const PLAN_DEFINITIONS: Record<SubscriptionPlan, PlanDefinition> = {
  FREE: {
    plan: "FREE",
    name: "Free",
    description: "Get started with basic features",
    monthlyPrice: 0,
    limits: {
      clients: 5,
      programs: 1,
      videos: 10,
      storageBytes: 1 * GB,
      customDomain: false,
      assistantCoaches: 0,
      recoveryBooking: false,
      ai: false,
      analytics: false,
      marketplace: false,
      apiAccess: false,
      webhooks: false,
      whiteLabel: false,
    },
  },
  STARTER: {
    plan: "STARTER",
    name: "Starter",
    description: "For coaches starting their business",
    monthlyPrice: 29,
    limits: {
      clients: 25,
      programs: 5,
      videos: 50,
      storageBytes: 5 * GB,
      customDomain: false,
      assistantCoaches: 0,
      recoveryBooking: true,
      ai: false,
      analytics: true,
      marketplace: true,
      apiAccess: false,
      webhooks: false,
      whiteLabel: false,
    },
  },
  PROFESSIONAL: {
    plan: "PROFESSIONAL",
    name: "Professional",
    description: "For growing coaching businesses",
    monthlyPrice: 79,
    limits: {
      clients: 100,
      programs: 25,
      videos: 200,
      storageBytes: 25 * GB,
      customDomain: true,
      assistantCoaches: 2,
      recoveryBooking: true,
      ai: true,
      analytics: true,
      marketplace: true,
      apiAccess: true,
      webhooks: false,
      whiteLabel: true,
    },
  },
  BUSINESS: {
    plan: "BUSINESS",
    name: "Business",
    description: "For established coaching teams",
    monthlyPrice: 149,
    limits: {
      clients: 500,
      programs: 100,
      videos: 1000,
      storageBytes: 100 * GB,
      customDomain: true,
      assistantCoaches: 5,
      recoveryBooking: true,
      ai: true,
      analytics: true,
      marketplace: true,
      apiAccess: true,
      webhooks: true,
      whiteLabel: true,
    },
  },
  ENTERPRISE: {
    plan: "ENTERPRISE",
    name: "Enterprise",
    description: "Unlimited scale for large organizations",
    monthlyPrice: 299,
    limits: {
      clients: -1, // unlimited
      programs: -1,
      videos: -1,
      storageBytes: 500 * GB,
      customDomain: true,
      assistantCoaches: -1,
      recoveryBooking: true,
      ai: true,
      analytics: true,
      marketplace: true,
      apiAccess: true,
      webhooks: true,
      whiteLabel: true,
    },
  },
};

export function getPlanLimits(plan: SubscriptionPlan): PlanLimits {
  return PLAN_DEFINITIONS[plan].limits;
}

export function isWithinLimit(
  current: number,
  limit: number
): boolean {
  if (limit === -1) return true;
  return current < limit;
}

export function hasFeature(
  plan: SubscriptionPlan,
  feature: PlanLimitKey
): boolean {
  const limit = getPlanLimits(plan)[feature];
  if (typeof limit === "boolean") return limit;
  return limit !== 0;
}
