/**
 * HuskyInstaller — installs husky at the project root when selected.
 *
 * Requires git. If the user enabled husky without git, we fail gracefully
 * with a clear message (ProjectInstaller records status: failed).
 */

import path from "node:path";

import fs from "fs-extra";

import type { PackageJsonLike } from "../generators/index.js";
import type { ProjectConfig } from "../types/index.js";
import { logger } from "../utils/index.js";
import { runCommand } from "./run-command.js";
import type { Installer, InstallerContext } from "./types.js";

export class HuskyInstaller implements Installer {
  readonly id = "husky";
  readonly label = "husky";

  supports(config: ProjectConfig): boolean {
    return config.husky;
  }

  async install(context: InstallerContext): Promise<void> {
    if (!context.config.git) {
      throw new Error(
        "Husky requires Git. Re-run with Git enabled, or initialize git manually first.",
      );
    }

    const root = context.paths.root;
    await ensureRootPackageJson(root, context.config.projectName);

    logger.info("  Installing husky…");
    await runCommand("npm", ["install", "--save-dev", "husky"], { cwd: root });

    // Modern husky: ensure prepare script + create .husky/
    await runCommand("npx", ["husky", "init"], { cwd: root });
    logger.success(`  Husky initialized at ${root}`);
  }
}

async function ensureRootPackageJson(
  root: string,
  projectName: string,
): Promise<void> {
  const pkgPath = path.join(root, "package.json");
  if (await fs.pathExists(pkgPath)) {
    const pkg = (await fs.readJson(pkgPath)) as PackageJsonLike;
    pkg.scripts = { ...pkg.scripts, prepare: "husky" };
    await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    return;
  }

  const pkg: PackageJsonLike = {
    name: projectName,
    private: true,
    version: "0.0.1",
    scripts: {
      prepare: "husky",
    },
  };
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });
  logger.info("  Created root package.json for husky prepare script");
}
