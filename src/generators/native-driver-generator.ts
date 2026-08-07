/**
 * NativeDriverGenerator — merges native DB drivers when orm is null.
 *
 * PostgreSQL → pg, MongoDB → mongodb driver. No ORM schema/migrations.
 */

import type { ProjectConfig } from "../types/index.js";
import { mergeTemplateInto } from "./merge-template.js";
import type { Generator, GeneratorContext } from "./types.js";

function resolveNativeDriverTemplateId(
  config: ProjectConfig,
): string | null {
  if (config.backend !== "express" || config.orm !== null) {
    return null;
  }
  if (config.database === "postgresql") {
    return "drivers/pg";
  }
  if (config.database === "mongodb") {
    return "drivers/mongodb";
  }
  return null;
}

export class NativeDriverGenerator implements Generator {
  readonly id = "native-db-driver";
  readonly label = "Native database driver";

  supports(config: ProjectConfig): boolean {
    return resolveNativeDriverTemplateId(config) !== null;
  }

  async generate(context: GeneratorContext): Promise<void> {
    const templateId = resolveNativeDriverTemplateId(context.config);
    if (!templateId || !context.paths.backend) {
      return;
    }

    await mergeTemplateInto(
      context.engine,
      templateId,
      context.paths.backend,
      context.variables,
    );
  }
}
