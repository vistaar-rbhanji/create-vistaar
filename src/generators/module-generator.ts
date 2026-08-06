/**
 * ModuleGenerator — applies modules selected from module.json enabledWhen rules.
 *
 * Architectural decision:
 * This generator never mentions "auth" (or any module id). ModuleLoader reads
 * the catalog; resolveModulesForConfig matches ProjectConfig; ModuleApplier
 * copies whatever the manifests describe.
 */

import {
  ModuleApplier,
  ModuleLoader,
  resolveModulesForConfig,
  type LoadedModule,
} from "../modules/index.js";
import type { ProjectConfig } from "../types/index.js";
import type { Generator, GeneratorContext } from "./types.js";

export class ModuleGenerator implements Generator {
  readonly id = "modules";
  readonly label = "Modules";

  private readonly loader: ModuleLoader;
  private readonly applier: ModuleApplier;
  private applied: LoadedModule[] = [];

  constructor(loader: ModuleLoader, applier: ModuleApplier = new ModuleApplier()) {
    this.loader = loader;
    this.applier = applier;
  }

  /**
   * Runs when at least one catalog module would be enabled for this config.
   * Cheap sync check is impossible without I/O — always return true and
   * no-op inside generate when the resolved set is empty.
   */
  supports(_config: ProjectConfig): boolean {
    return true;
  }

  async generate(context: GeneratorContext): Promise<void> {
    const catalog = await this.loader.loadAll();
    const selected = resolveModulesForConfig(context.config, catalog);
    this.applied = [];

    if (selected.length === 0) {
      return;
    }

    for (const mod of selected) {
      await this.applier.apply(mod, {
        config: context.config,
        engine: context.engine,
        paths: context.paths,
        variables: context.variables,
      });
      this.applied.push(mod);
      context.appliedModules.push(mod);
    }
  }

  /** Modules applied during the last generate() call. */
  getAppliedModules(): readonly LoadedModule[] {
    return this.applied;
  }
}
