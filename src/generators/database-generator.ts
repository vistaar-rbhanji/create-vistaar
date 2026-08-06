/**
 * DatabaseGenerator — copies Postgres / MongoDB template assets into `database/`.
 * Skips when database: none. Does not install drivers (installers phase).
 */

import { resolveDatabaseTemplateId } from "../template-engine/index.js";
import type { ProjectConfig } from "../types/index.js";
import type { Generator, GeneratorContext } from "./types.js";

export class DatabaseGenerator implements Generator {
  readonly id = "database";
  readonly label = "Database";

  supports(config: ProjectConfig): boolean {
    return config.database !== "none";
  }

  async generate(context: GeneratorContext): Promise<void> {
    const templateId = resolveDatabaseTemplateId(context.config);
    if (!templateId || !context.paths.database) {
      return;
    }

    await context.engine.copy(templateId, {
      destination: context.paths.database,
      variables: context.variables,
      overwrite: false,
    });
  }
}
