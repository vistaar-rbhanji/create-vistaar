/**
 * UIGenerator — overlays the selected UI framework onto the frontend app.
 *
 * Depends on frontend existing on disk (ProjectGenerator runs Frontend first).
 * Merges package.json when the UI template declares dependencies.
 */

import { resolveUiTemplateId } from "../template-engine/index.js";
import type { ProjectConfig } from "../types/index.js";
import { mergeTemplateInto } from "./merge-template.js";
import type { Generator, GeneratorContext } from "./types.js";

export class UIGenerator implements Generator {
  readonly id = "ui";
  readonly label = "UI framework";

  supports(_config: ProjectConfig): boolean {
    return true;
  }

  async generate(context: GeneratorContext): Promise<void> {
    const templateId = resolveUiTemplateId(context.config);

    await mergeTemplateInto(
      context.engine,
      templateId,
      context.paths.frontend,
      context.variables,
    );
  }
}
