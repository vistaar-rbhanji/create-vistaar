/**
 * RootExtrasGenerator — copies project-root helpers into the project folder.
 *
 * Architectural decision:
 * Root package.json scripts (setup/migrate/doctor), shell wrappers, and doctor
 * live under templates/project-root/ so Phase 8 DX is configuration-driven
 * rather than hardcoded in this class.
 */

import type { ProjectConfig } from "../types/index.js";
import type { Generator, GeneratorContext } from "./types.js";

export class RootExtrasGenerator implements Generator {
  readonly id = "project-root";
  readonly label = "Project root scripts";

  supports(_config: ProjectConfig): boolean {
    return true;
  }

  async generate(context: GeneratorContext): Promise<void> {
    await context.engine.copy("project-root", {
      destination: context.paths.root,
      variables: context.variables,
      overwrite: true,
    });
  }
}
