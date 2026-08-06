/**
 * OrmGenerator — merges the selected ORM template into the backend app.
 *
 * Architectural decision:
 * ORM trees live under templates/orm/* and overlay `backend/` so Express
 * apps get prisma/drizzle/mongoose without BackendGenerator knowing ORMs.
 * FastAPI persistence is embedded in the FastAPI template (Python drivers).
 */

import {
  resolveOrmTemplateId,
} from "../template-engine/index.js";
import type { ProjectConfig } from "../types/index.js";
import { mergeTemplateInto } from "./merge-template.js";
import type { Generator, GeneratorContext } from "./types.js";

export class OrmGenerator implements Generator {
  readonly id = "orm";
  readonly label = "ORM";

  supports(config: ProjectConfig): boolean {
    return resolveOrmTemplateId(config) !== null;
  }

  async generate(context: GeneratorContext): Promise<void> {
    const templateId = resolveOrmTemplateId(context.config);
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
