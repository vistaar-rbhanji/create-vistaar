/**
 * Module-system public API.
 */

export { standardInstall } from "./apply.js";
export {
  isModuleCompatible,
  resolveModulePlan,
  type ResolvedModulePlan,
} from "./plan.js";
export { ModuleRegistry, ModuleRegistryError } from "./registry.js";
export type { ModuleRegistryOptions } from "./registry.js";
export type {
  LoadedModule,
  ModuleContext,
  ModuleEnabledWhen,
  ModuleEnvExample,
  ModuleInstallFn,
  ModuleInstaller,
  ModuleManifest,
  ModuleNpmPackageSet,
  ModulePostInstallCommand,
  ModuleTemplateFolders,
  ModuleVariant,
  RegisteredModule,
} from "./types.js";
