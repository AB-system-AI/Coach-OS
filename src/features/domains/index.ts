export {
  addCustomDomain,
  verifyCustomDomain,
  removeCustomDomain,
  setPrimaryDomain,
  getTenantDomains,
} from "./actions/domain-actions";
export {
  resolveTenantByCustomDomain,
  getSubdomainUrl,
  getDnsInstructions,
} from "./services/domain-service";
