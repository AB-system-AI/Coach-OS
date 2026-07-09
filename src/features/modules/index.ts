export {
  MODULE_REGISTRY,
  BUSINESS_TYPES,
  ALL_MODULE_KEYS,
  getRecommendedModules,
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
} from "./services/module-service";
