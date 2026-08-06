/**
 * Attempts `db:setup` (migrate/push + seed) after npm install when an ORM
 * backend was generated. Failures are non-fatal — DB may not be running yet.
 */

import path from "node:path";

import fs from "fs-extra";

import type { ProjectConfig } from "../types/index.js";
import { logger } from "../utils/index.js";
import { runCommand } from "./run-command.js";
import type { Installer, InstallerContext } from "./types.js";

export class DatabaseSetupInstaller implements Installer {
  readonly id = "database-setup";
  readonly label = "database setup (migrate + seed)";

  supports(config: ProjectConfig): boolean {
    return (
      config.backend === "express" &&
      config.database !== "none" &&
      config.orm !== null
    );
  }

  async install(context: InstallerContext): Promise<void> {
    const backend = context.paths.backend;
    if (!backend) {
      return;
    }

    const pkgPath = path.join(backend, "package.json");
    if (!(await fs.pathExists(pkgPath))) {
      return;
    }

    const pkg = (await fs.readJson(pkgPath)) as {
      scripts?: Record<string, string>;
    };

    if (!pkg.scripts?.["db:setup"] && !pkg.scripts?.["db:seed"]) {
      logger.warn("  No db:setup / db:seed scripts found — skipping.");
      return;
    }

    const script = pkg.scripts["db:setup"] ? "db:setup" : "db:seed";
    logger.info(
      `  Running npm run ${script} (requires a reachable database)…`,
    );

    try {
      await runCommand("npm", ["run", script], { cwd: backend });
      logger.success(`  ${script} completed`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      logger.warn(
        "  Database setup could not complete (is PostgreSQL/MongoDB running?).",
      );
      logger.warn(`  ${detail.split("\n")[0]}`);
      logger.warn(
        "  Start your database, then run: cd backend && npm run db:setup",
      );
      // Non-fatal: rethrow so ProjectInstaller records failed status but continues.
      throw error;
    }
  }
}
