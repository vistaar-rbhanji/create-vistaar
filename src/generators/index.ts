/**
 * Generators public API.
 *
 * Architectural decision:
 * Each generator accepts GeneratorContext and copies/adapts templates into
 * the target directory. ProjectGenerator orchestrates; TemplateEngine copies;
 * installers (later) handle npm/git/docker.
 */

export { BackendGenerator } from "./backend-generator.js";
export { DatabaseGenerator } from "./database-generator.js";
export { DockerGenerator } from "./docker-generator.js";
export { FrontendGenerator } from "./frontend-generator.js";
export { mergeDirectoryInto, mergeTemplateInto } from "./merge-template.js";
export { ModuleGenerator } from "./module-generator.js";
export { NativeDriverGenerator } from "./native-driver-generator.js";
export { OrmGenerator } from "./orm-generator.js";
export { mergePackageJson } from "./package-json.js";
export type { PackageJsonLike } from "./package-json.js";
export { ProjectGenerator } from "./project-generator.js";
export type { ProjectGeneratorOptions } from "./project-generator.js";
export { ReadmeGenerator } from "./readme-generator.js";
export { resolveProjectPaths } from "./project-paths.js";
export { RootExtrasGenerator } from "./root-extras-generator.js";
export { UIGenerator } from "./ui-generator.js";
export type {
  GenerationResult,
  Generator,
  GeneratorContext,
  ProjectPaths,
} from "./types.js";
