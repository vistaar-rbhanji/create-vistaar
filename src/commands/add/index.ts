/**
 * `create-vistaar add auth` / `vistaar add auth` — add Base Auth to an
 * existing Vistaar project (Phase 14).
 *
 * Other `add <module>` ids remain coming-soon.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  isVistaarProject,
  loadOrInferManifest,
  manifestFromProjectConfig,
  projectConfigFromManifest,
  writeVistaarManifest,
} from "../../project-manifest/index.js";
import { FUTURE_ADD_MODULES, printComingSoon } from "../shared/index.js";
import type { CliCommand, CommandContext } from "../types.js";
import { withInitialAdmin } from "../../prompts/index.js";
import { logger } from "../../utils/index.js";
import { installMissingStackAndAuth } from "./install-missing.js";
import {
  assertExistingStackSupportsBaseAuth,
  detectMissingForAuth,
  printStackDetection,
  promptMissingAuthStack,
} from "./prompt-missing.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, "../../..");

export async function execute(context: CommandContext): Promise<void> {
  const moduleId = context.args[0];

  if (!moduleId) {
    printComingSoon(
      "create-vistaar add",
      "Usage: create-vistaar add auth\n  Planned modules: " +
        FUTURE_ADD_MODULES.join(", "),
    );
    return;
  }

  if (moduleId === "auth") {
    await executeAddAuth(context);
    return;
  }

  printComingSoon(
    `create-vistaar add ${moduleId}`,
    `Module "${moduleId}" is not implemented yet. Use: create-vistaar add auth\n  Planned: ${FUTURE_ADD_MODULES.join(", ")}`,
  );
}

async function executeAddAuth(context: CommandContext): Promise<void> {
  const projectRoot = path.resolve(context.cwd);

  logger.title("\n  create-vistaar add auth\n");

  if (!(await isVistaarProject(projectRoot))) {
    logger.error("✖ This does not appear to be a Vistaar project.");
    logger.info(
      "  Run this command from a project created with create-vistaar",
    );
    logger.info("  (expected vistaar.json or frontend/ + package.json).");
    process.exitCode = 1;
    return;
  }

  const manifest = await loadOrInferManifest(projectRoot);
  printStackDetection(manifest);

  if (manifest.modules.auth) {
    logger.success("✓ Authentication is already installed.");
    return;
  }

  try {
    assertExistingStackSupportsBaseAuth(manifest);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
    return;
  }

  const missing = detectMissingForAuth(manifest);

  // If backend exists but is express and db missing — prompt those only.
  // ORM is optional (No ORM allowed); Base Auth uses native pg in auth-api.
  let backend = manifest.backend?.framework ?? ("none" as const);
  let database = manifest.database?.type ?? ("none" as const);
  let orm = manifest.orm?.name ?? null;

  if (missing.needsBackend || missing.needsDatabase || missing.needsOrm) {
    const answers = await promptMissingAuthStack(missing);
    if (missing.needsBackend) {
      backend = answers.backend;
    }
    if (missing.needsDatabase) {
      database = answers.database;
    }
    if (missing.needsOrm) {
      orm = answers.orm;
    }
  }

  // Final config must be Base Auth compatible (ORM optional)
  if (backend !== "express" || database !== "postgresql") {
    logger.error(
      "Authentication could not be installed.\n" +
        "Reason: Base Auth requires Express + PostgreSQL.",
    );
    process.exitCode = 1;
    return;
  }

  if (orm === "mongoose") {
    logger.error(
      "Authentication could not be installed.\n" +
        "Reason: Base Auth is not compatible with Mongoose.",
    );
    process.exitCode = 1;
    return;
  }

  const config = await withInitialAdmin(
    projectConfigFromManifest(manifest, {
      backend,
      database,
      orm,
      authentication: "base-auth",
    }),
  );

  logger.blank();
  logger.info("Installing missing pieces + Base Auth…\n");

  try {
    await installMissingStackAndAuth({
      projectRoot,
      config,
      packageRoot,
      needsBackend: missing.needsBackend,
      needsDatabase: missing.needsDatabase,
      needsOrm: missing.needsOrm,
    });
  } catch (error) {
    logger.error(
      "✖ Authentication could not be installed.\n" +
        (error instanceof Error ? error.message : String(error)),
    );
    process.exitCode = 1;
    return;
  }

  const nextManifest = manifestFromProjectConfig(config, {
    ...manifest.modules,
    auth: { name: "base-auth", version: "2.0.0" },
  });
  await writeVistaarManifest(projectRoot, nextManifest);

  logger.blank();
  logger.success("✓ Authentication added successfully.");
  logger.info("  Updated vistaar.json");
  logger.info("  Next steps:");
  logger.info("    1. Ensure auth-api/.env has DATABASE_URL (created from .env.example)");
  logger.info("    2. Create your PostgreSQL database, then: npm run migrate && npm run seed");
  logger.info("    3. npm run dev:backend && npm run dev:auth-api && npm run dev:frontend");
  logger.info("    4. Open the Setup Wizard — it shows remaining steps");
  logger.blank();
}

export const addCommand: CliCommand = {
  name: "add",
  description:
    "Add a module to the current Vistaar project (auth supported)",
  category: "management",
  execute,
};

export default addCommand;
