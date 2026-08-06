/**
 * BackendGenerator — copies Express / FastAPI templates into `backend/`.
 * Skips entirely when the user selected backend: none.
 */

import { resolveBackendTemplateId } from "../template-engine/index.js";
import type { ProjectConfig } from "../types/index.js";
import type { Generator, GeneratorContext } from "./types.js";

export class BackendGenerator implements Generator {
  readonly id = "backend";
  readonly label = "Backend";

  supports(config: ProjectConfig): boolean {
    return config.backend !== "none";
  }

  async generate(context: GeneratorContext): Promise<void> {
    const templateId = resolveBackendTemplateId(context.config);
    if (!templateId || !context.paths.backend) {
      return;
    }

    await context.engine.copy(templateId, {
      destination: context.paths.backend,
      variables: context.variables,
      overwrite: false,
    });
  }
}
