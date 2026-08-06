/**
 * FrontendGenerator — copies the selected frontend template into `frontend/`.
 *
 * Independent of backend/UI/database. UI overlays are applied later by
 * UIGenerator so this class never needs to know about ShadCN vs Bootstrap.
 */

import {
  resolveFrontendTemplateId,
} from "../template-engine/index.js";
import type { ProjectConfig } from "../types/index.js";
import type { Generator, GeneratorContext } from "./types.js";

export class FrontendGenerator implements Generator {
  readonly id = "frontend";
  readonly label = "Frontend";

  supports(_config: ProjectConfig): boolean {
    // Frontend is always required in Phase 1–3 prompts.
    return true;
  }

  async generate(context: GeneratorContext): Promise<void> {
    const templateId = resolveFrontendTemplateId(context.config);

    await context.engine.copy(templateId, {
      destination: context.paths.frontend,
      variables: context.variables,
      overwrite: false,
    });
  }
}
