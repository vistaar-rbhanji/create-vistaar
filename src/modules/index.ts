/**
 * Modules public API — configuration-driven optional feature packs.
 */

export { ModuleApplier } from "./module-applier.js";
export type {
  ModuleApplyResult,
  ModuleApplierContext,
} from "./module-applier.js";
export { ModuleLoader, ModuleLoadError } from "./module-loader.js";
export type { ModuleLoaderOptions } from "./module-loader.js";
export { resolveModulePlan } from "./module-plan.js";
export { resolveModulesForConfig } from "./module-resolver.js";
export type {
  LoadedModule,
  ModuleEnabledWhen,
  ModuleEnvExample,
  ModuleManifest,
  ModuleNpmPackageSet,
  ModulePostInstallCommand,
  ModuleTemplateFolders,
  ModuleVariant,
  ResolvedModulePlan,
} from "./types.js";
