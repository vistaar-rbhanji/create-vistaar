/**
 * Attempts db setup after npm install when an Express + database backend
 * was generated. Also initializes Base Auth schema + Super Admin when present.
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
      (config.database !== "none" || config.authentication === "base-auth")
    );
  }

  async install(context: InstallerContext): Promise<void> {
    const root = context.paths.root;
    const backend = context.paths.backend;
    const authApi = path.join(root, "auth-api");
    const hasAuth = await fs.pathExists(authApi);

    let attempted = false;
    let failures = 0;

    if (backend && context.config.orm !== null) {
      attempted = true;
      const ok = await runBackendDbSetup(backend);
      if (!ok) {
        failures += 1;
      }
    }

    if (hasAuth) {
      attempted = true;
      const migrateOk = await runAuthMigrate(root);
      if (!migrateOk) {
        failures += 1;
        logger.warn(
          "  Auth schema could not be applied yet (is PostgreSQL running?).",
        );
        logger.warn(
          "  Create the database, update auth-api/.env, then run: npm run migrate",
        );
      } else {
        const seedOk = await runAuthSeed(root);
        if (!seedOk) {
          failures += 1;
          logger.warn(
            "  Super Admin was not created yet — finish database setup, then: npm run seed",
          );
        }
      }
    }

    if (!attempted) {
      logger.info(
        "  No ORM migrate step and no auth-api — database will initialize on first server start.",
      );
      return;
    }

    if (failures > 0) {
      throw new Error(
        "Database setup incomplete — see messages above. The project was still generated.",
      );
    }
  }
}

async function runBackendDbSetup(backend: string): Promise<boolean> {
  const pkgPath = path.join(backend, "package.json");
  if (!(await fs.pathExists(pkgPath))) {
    return true;
  }

  const pkg = (await fs.readJson(pkgPath)) as {
    scripts?: Record<string, string>;
  };

  if (!pkg.scripts?.["db:setup"] && !pkg.scripts?.["db:seed"]) {
    logger.warn("  No db:setup / db:seed scripts found — skipping main backend.");
    return true;
  }

  const script = pkg.scripts["db:setup"] ? "db:setup" : "db:seed";
  logger.info(
    `  Running npm run ${script} (requires a reachable database)…`,
  );

  try {
    await runCommand("npm", ["run", script], { cwd: backend });
    logger.success(`  ${script} completed`);
    return true;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    logger.warn(
      "  Database setup could not complete (is PostgreSQL/MongoDB running?).",
    );
    logger.warn(`  ${detail.split("\n")[0]}`);
    logger.warn(
      "  Start your database, then run: npm run migrate && npm run seed",
    );
    return false;
  }
}

async function runAuthMigrate(root: string): Promise<boolean> {
  const script = path.join(root, "scripts", "auth-init-db.js");
  if (!(await fs.pathExists(script))) {
    return true;
  }
  logger.info("  Applying auth-api schema + default roles…");
  try {
    await runCommand("node", ["scripts/auth-init-db.js"], { cwd: root });
    logger.success("  Auth schema ready");
    return true;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    logger.warn(`  ${detail.split("\n")[0]}`);
    return false;
  }
}

async function runAuthSeed(root: string): Promise<boolean> {
  const pending = path.join(root, "auth-api", ".vistaar", "initial-admin.json");
  if (!(await fs.pathExists(pending))) {
    logger.info("  No pending Super Admin to seed.");
    return true;
  }
  logger.info("  Creating initial Super Admin…");
  try {
    await runCommand("npm", ["run", "seed:initial-admin", "--prefix", "auth-api"], {
      cwd: root,
    });
    logger.success("  Super Admin seed completed");
    return true;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    logger.warn(`  ${detail.split("\n")[0]}`);
    return false;
  }
}
