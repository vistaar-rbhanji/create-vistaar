/**
 * Generator contracts.
 *
 * Architectural decision (Interface Segregation + Open/Closed):
 * Each stack concern implements Generator independently. ProjectGenerator
 * only depends on this interface, so new stacks (e.g. mobile) plug in without
 * editing siblings. `supports()` lets generators self-skip (backend: none).
 */

import type { LoadedModule } from "../module-system/index.js";
import type {
  TemplateEngine,
  TemplateVariables,
} from "../template-engine/index.js";
import type { ProjectConfig } from "../types/index.js";

/** Resolved output paths for the generated project tree. */
export interface ProjectPaths {
  readonly root: string;
  readonly frontend: string;
  /** `null` when backend === "none". */
  readonly backend: string | null;
  /** `null` when database === "none". */
  readonly database: string | null;
}

/**
 * Shared runtime context passed to every generator.
 * Built once by ProjectGenerator — generators never create project folders.
 */
export interface GeneratorContext {
  readonly config: ProjectConfig;
  readonly paths: ProjectPaths;
  readonly variables: TemplateVariables;
  readonly engine: TemplateEngine;
  /**
   * Mutable collector filled by ModuleGenerator.
   * Installers read the final list from GenerationResult.
   */
  readonly appliedModules: LoadedModule[];
}

export interface Generator {
  /** Stable id for logging / registries (e.g. "frontend"). */
  readonly id: string;

  /** Human-readable label shown in the ora spinner. */
  readonly label: string;

  /** Whether this generator should run for the given config. */
  supports(config: ProjectConfig): boolean;

  /** Copy / merge templates into the project. Must be idempotent-safe. */
  generate(context: GeneratorContext): Promise<void>;
}

/** Result returned to the CLI after scaffolding (used by Phase 4 installers). */
export interface GenerationResult {
  readonly paths: ProjectPaths;
  readonly config: ProjectConfig;
  /** Generators that actually ran. */
  readonly completedGenerators: readonly string[];
  /** Modules applied from templates/modules (data-driven). */
  readonly appliedModules: readonly LoadedModule[];
}
