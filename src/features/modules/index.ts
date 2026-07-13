export {
  MODULE_REGISTRY,
  BUSINESS_TYPES,
  ALL_MODULE_KEYS,
  getRecommendedModules,
  getAutoEnabledModules,
  COACHING_SPECIALTIES,
  COACH_HIDDEN_NAV_KEYS,
  isPlanSufficient,
} from "./types/registry";
export type { ModuleDefinition, BusinessTypeDefinition } from "./types/registry";
export {
  getTenantModules,
  getEnabledModules,
  isModuleEnabled,
  initializeTenantModules,
  updateTenantModules,
  seedDefaultAutomations,
  seedDefaultCrmPipeline,
  seedLoyaltyProgram,
  seedEnterpriseDemoData,
} from "./services/module-service";
