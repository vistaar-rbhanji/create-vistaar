/**
 * Compatibility barrel — prefer importing from `../module-system/index.js`.
 *
 * Old ModuleLoader / ModuleApplier APIs are replaced by ModuleRegistry +
 * standardInstall. These re-exports keep existing import paths compiling.
 */

export {
  ModuleRegistry as ModuleLoader,
  ModuleRegistryError as ModuleLoadError,
  ModuleRegistry,
  ModuleRegistryError,
  resolveModulePlan,
  standardInstall,
  type LoadedModule,
  type ModuleContext,
  type ModuleManifest,
  type ModuleRegistryOptions as ModuleLoaderOptions,
  type RegisteredModule,
  type ResolvedModulePlan,
} from "../module-system/index.js";

/** @deprecated Use resolveForConfig on ModuleRegistry. */
export { isModuleCompatible } from "../module-system/index.js";
