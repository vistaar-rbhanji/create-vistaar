/**
 * Template engine public API.
 *
 * Architectural decision:
 * Prefer copying reusable template trees over AI code generation. Variable
 * substitution and path resolution live here so generators stay thin
 * orchestration layers in later phases.
 */

export { FsExtraFileSystem } from "./file-system.js";
export {
  resolveBackendTemplateId,
  resolveDatabaseTemplateId,
  resolveFrontendTemplateId,
  resolveOrmTemplateId,
  resolveTemplateIds,
  resolveUiTemplateId,
} from "./paths.js";
export { TemplateEngine } from "./template-engine.js";
export type { TemplateEngineOptions } from "./template-engine.js";
export type {
  CopyTemplateOptions,
  FileSystemPort,
  TemplateId,
  TemplateVariables,
} from "./types.js";
export {
  TemplateDestinationError,
  TemplateNotFoundError,
} from "./types.js";
export {
  createTemplateVariables,
  replaceTemplateVariables,
  resolveDbDriver,
  toDbName,
  toPackageName,
} from "./variables.js";
