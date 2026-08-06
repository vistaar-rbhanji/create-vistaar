/**
 * GitInstaller — `git init` at the project root when the user opted in.
 */

import type { ProjectConfig } from "../types/index.js";
import { logger } from "../utils/index.js";
import { runCommand } from "./run-command.js";
import type { Installer, InstallerContext } from "./types.js";

export class GitInstaller implements Installer {
  readonly id = "git";
  readonly label = "git init";

  supports(config: ProjectConfig): boolean {
    return config.git;
  }

  async install(context: InstallerContext): Promise<void> {
    await runCommand("git", ["init"], { cwd: context.paths.root });
    logger.success(`  Git repository initialized at ${context.paths.root}`);
  }
}
