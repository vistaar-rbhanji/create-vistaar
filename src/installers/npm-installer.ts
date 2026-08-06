/**
 * NpmInstaller — runs `npm install` in every generated Node package.
 *
 * Always eligible after generation when package.json targets exist.
 * FastAPI backends are skipped automatically (no package.json).
 */

import path from "node:path";

import type { ProjectConfig } from "../types/index.js";
import { logger } from "../utils/index.js";
import { findNpmProjectDirs } from "./npm-targets.js";
import { runCommand } from "./run-command.js";
import type { Installer, InstallerContext } from "./types.js";

export class NpmInstaller implements Installer {
  readonly id = "npm";
  readonly label = "npm install";

  supports(_config: ProjectConfig): boolean {
    // Always attempt; install() no-ops when no package.json dirs exist.
    return true;
  }

  async install(context: InstallerContext): Promise<void> {
    const targets = await findNpmProjectDirs(context.paths);

    if (targets.length === 0) {
      logger.warn("  No package.json directories found — skipping npm install.");
      return;
    }

    for (const cwd of targets) {
      logger.info(`  Installing dependencies in ${path.basename(cwd)}…`);
      await runCommand("npm", ["install"], { cwd });
      logger.success(`  npm install completed in ${cwd}`);
    }
  }
}
