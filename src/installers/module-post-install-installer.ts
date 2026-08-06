/**
 * Runs `postInstallCommands` from each applied module's resolved plan.
 *
 * Commands come from module.json (+ variants) — never hardcoded per module.
 */

import path from "node:path";

import { resolveModulePlan } from "../modules/module-plan.js";
import type { ProjectConfig } from "../types/index.js";
import { logger } from "../utils/index.js";
import { runCommand } from "./run-command.js";
import type { Installer, InstallerContext } from "./types.js";

export class ModulePostInstallInstaller implements Installer {
  readonly id = "module-postinstall";
  readonly label = "module post-install";

  supports(_config: ProjectConfig, context?: InstallerContext): boolean {
    if (!context) {
      return true;
    }
    return context.appliedModules.some((m) => {
      const plan = resolveModulePlan(m.manifest, context.config);
      return plan.postInstallCommands.length > 0;
    });
  }

  async install(context: InstallerContext): Promise<void> {
    for (const mod of context.appliedModules) {
      const plan = resolveModulePlan(mod.manifest, context.config);
      for (const cmd of plan.postInstallCommands) {
        const cwd = resolveCwd(cmd.cwd, context);
        logger.info(
          `  [${mod.manifest.name}] ${cmd.command} ${(cmd.args ?? []).join(" ")}`,
        );
        await runCommand(cmd.command, cmd.args ?? [], { cwd });
      }
    }

    logger.success("  Module post-install commands finished");
  }
}

function resolveCwd(cwdToken: string, context: InstallerContext): string {
  switch (cwdToken) {
    case ".":
    case "root":
      return context.paths.root;
    case "frontend":
      return context.paths.frontend;
    case "backend":
      if (!context.paths.backend) {
        throw new Error(
          `postInstallCommand cwd "backend" but project has no backend`,
        );
      }
      return context.paths.backend;
    default:
      return path.join(context.paths.root, cwdToken);
  }
}
