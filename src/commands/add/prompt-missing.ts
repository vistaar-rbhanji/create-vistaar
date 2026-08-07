/**
 * Prompt only for stack pieces missing from an existing Vistaar project.
 * Base Auth requires Express + PostgreSQL (ORM optional — uses native pg in auth-api).
 */

import { select } from "@inquirer/prompts";

import type { OrmAdapter, ProjectConfig } from "../../types/index.js";
import type { VistaarProjectManifest } from "../../project-manifest/index.js";
import { logger } from "../../utils/index.js";

export interface MissingAuthStack {
  needsBackend: boolean;
  needsDatabase: boolean;
  /** True when a database is being added and ORM choice is still needed. */
  needsOrm: boolean;
}

export function detectMissingForAuth(
  manifest: VistaarProjectManifest,
): MissingAuthStack {
  const needsDatabase = manifest.database === null;
  return {
    needsBackend: manifest.backend === null,
    needsDatabase,
    // Prompt ORM only when installing a new database; existing orm:null means No ORM.
    needsOrm: needsDatabase,
  };
}

export function printStackDetection(manifest: VistaarProjectManifest): void {
  const fe = manifest.frontend;
  logger.success(
    `  ✓ ${fe.framework === "react" ? "React" : fe.framework} detected`,
  );
  logger.success(
    `  ✓ ${fe.language === "typescript" ? "TypeScript" : "JavaScript"} detected`,
  );
  logger.success(`  ✓ UI: ${fe.ui} detected`);

  if (manifest.backend) {
    logger.success(`  ✓ Backend: ${manifest.backend.framework} found`);
  } else {
    logger.warn("  ✗ Backend not found");
  }

  if (manifest.database) {
    logger.success(`  ✓ Database: ${manifest.database.type} found`);
  } else {
    logger.warn("  ✗ Database not found");
  }

  if (manifest.orm) {
    logger.success(`  ✓ ORM: ${manifest.orm.name} found`);
  } else if (manifest.database) {
    logger.success("  ✓ ORM: none (native driver)");
  } else {
    logger.warn("  ✗ ORM not found");
  }

  if (manifest.modules.auth) {
    logger.success("  ✓ Authentication found");
  } else {
    logger.warn("  ✗ Authentication not found");
  }

  logger.blank();
}

/**
 * Validate that an existing backend/db stack can host Base Auth.
 * Throws a clear error for unsupported combinations.
 */
export function assertExistingStackSupportsBaseAuth(
  manifest: VistaarProjectManifest,
): void {
  if (manifest.backend && manifest.backend.framework !== "express") {
    throw new Error(
      "Authentication could not be installed.\n" +
        `Reason: Base Auth is not compatible with backend "${manifest.backend.framework}".\n` +
        "Base Auth requires Express + PostgreSQL.",
    );
  }
  if (manifest.database && manifest.database.type !== "postgresql") {
    throw new Error(
      "Authentication could not be installed.\n" +
        `Reason: Base Auth is not compatible with database "${manifest.database.type}".\n` +
        "Base Auth requires Express + PostgreSQL.",
    );
  }
  if (manifest.orm && manifest.orm.name === "mongoose") {
    throw new Error(
      "Authentication could not be installed.\n" +
        "Reason: Base Auth is not compatible with Mongoose / MongoDB.\n" +
        "Base Auth requires Express + PostgreSQL (ORM optional).",
    );
  }
}

export async function promptMissingAuthStack(
  missing: MissingAuthStack,
): Promise<Pick<ProjectConfig, "backend" | "database" | "orm">> {
  let backend: ProjectConfig["backend"] = "express";
  let database: ProjectConfig["database"] = "postgresql";
  let orm: OrmAdapter | null = null;

  if (missing.needsBackend) {
    backend = await select({
      message: "Select backend (Base Auth requires Express):",
      choices: [{ name: "Express", value: "express" as const }],
    });
  }

  if (missing.needsDatabase) {
    database = await select({
      message: "Select database (Base Auth requires PostgreSQL):",
      choices: [{ name: "PostgreSQL", value: "postgresql" as const }],
    });
  }

  if (missing.needsOrm) {
    const ormChoice = await select({
      message: "Select ORM:",
      choices: [
        { name: "Prisma", value: "prisma" as const },
        { name: "Drizzle", value: "drizzle" as const },
        { name: "No ORM", value: "none" as const },
      ],
    });
    orm = ormChoice === "none" ? null : ormChoice;
  }

  return { backend, database, orm };
}
