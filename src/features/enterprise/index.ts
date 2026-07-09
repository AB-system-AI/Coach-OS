export {
  ENTERPRISE_MODULE_PAGES,
  getEnterprisePage,
  getEnterprisePageByModule,
} from "./config/modules";
export type { EnterpriseModulePage } from "./config/modules";
export {
  getEnterpriseModuleStats,
  getEnterpriseDashboardMetrics,
  getSystemHealthMetrics,
} from "./services/stats-service";
export type { ModuleStat } from "./services/stats-service";
