/**
 * Client-safe subscription exports (plan definitions / limits only).
 * Server billing: `@/features/subscriptions/billing`
 * Server usage: `@/features/subscriptions/services/usage-tracker`
 */
export {
  PLAN_DEFINITIONS,
  getPlanLimits,
  isWithinLimit,
  hasFeature,
} from "./types/plan-limits";
export type { PlanLimits, PlanLimitKey, PlanDefinition } from "./types/plan-limits";
