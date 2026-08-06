/**
 * DockerGenerator — adds compose/Dockerfile when the user opted into Docker.
 */

import type { ProjectConfig } from "../types/index.js";
import type { Generator, GeneratorContext } from "./types.js";

export class DockerGenerator implements Generator {
  readonly id = "docker";
  readonly label = "Docker";

  supports(config: ProjectConfig): boolean {
    return config.docker;
  }

  async generate(context: GeneratorContext): Promise<void> {
    await context.engine.copy("docker/default", {
      destination: context.paths.root,
      variables: context.variables,
      overwrite: true,
    });
  }
}
