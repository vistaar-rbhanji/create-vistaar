/**
 * ModuleGenerator — installs modules selected by ModuleRegistry.
 *
 * Never hardcodes module names. Asks the registry, then calls install().
 */

import {
  ModuleRegistry,
  standardInstall,
  type RegisteredModule,
} from "../module-system/index.js";
import type { ProjectConfig } from "../types/index.js";
import type { Generator, GeneratorContext } from "./types.js";

export class ModuleGenerator implements Generator {
  readonly id = "modules";
  readonly label = "Modules";

  private readonly registry: ModuleRegistry;
  private applied: RegisteredModule[] = [];

  constructor(registry: ModuleRegistry) {
    this.registry = registry;
  }

  supports(_config: ProjectConfig): boolean {
    return true;
  }

  async generate(context: GeneratorContext): Promise<void> {
    const selected = await this.registry.resolveForConfig(context.config);
    this.applied = [];

    for (const mod of selected) {
      await mod.install({
        projectPath: context.paths.root,
        paths: context.paths,
        config: context.config,
        stack: {
          frontend: context.config.frontend,
          backend: context.config.backend,
          language: context.config.language,
          database: context.config.database,
          orm: context.config.orm,
          uiFramework: context.config.uiFramework,
        },
        variables: context.variables,
        engine: context.engine,
        moduleRoot: mod.rootDir,
        manifest: mod.manifest,
        helpers: { standardInstall },
      });
      this.applied.push(mod);
      context.appliedModules.push(mod);
    }
  }

  getAppliedModules(): readonly RegisteredModule[] {
    return this.applied;
  }
}
