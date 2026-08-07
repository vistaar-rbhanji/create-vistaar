/**
 * Final success banner: paths, modules, database guidance, next commands.
 */

import path from "node:path";

import chalk from "chalk";

import type { GenerationResult } from "../generators/index.js";
import { resolveModulePlan } from "../module-system/index.js";
import type { ProjectConfig } from "../types/index.js";
import { logger } from "../utils/index.js";
import type { InstallerOutcome } from "./types.js";

export function printSuccessMessage(
  generation: GenerationResult,
  outcomes: readonly InstallerOutcome[],
): void {
  const { paths, config, appliedModules } = generation;
  const relativeRoot = path.relative(process.cwd(), paths.root) || paths.root;

  logger.blank();
  console.log(chalk.bold.green("────────────────────────────────────────"));
  console.log(chalk.bold.green("  create-vistaar — success"));
  console.log(chalk.bold.green("────────────────────────────────────────"));
  logger.blank();

  logger.info(`  Project    ${paths.root}`);
  logger.info(`  Frontend   ${paths.frontend}`);
  if (paths.backend) {
    logger.info(`  Backend    ${paths.backend}`);
  } else {
    logger.info("  Backend    (none)");
  }
  if (paths.database) {
    logger.info(`  Database   ${paths.database}`);
  }

  if (appliedModules.length > 0) {
    logger.blank();
    logger.title("  Installed modules");
    for (const mod of appliedModules) {
      const plan = resolveModulePlan(mod.manifest, config);
      console.log(
        chalk.cyan(`  ▸ ${mod.manifest.name}`) +
          chalk.dim(` — ${mod.manifest.description}`),
      );
      logger.title(`    ${plan.summaryTitle}`);
      for (const feature of plan.features) {
        console.log(chalk.white(`      • ${feature}`));
      }
    }
  }

  logger.blank();
  logger.title("  Installer results");
  for (const outcome of outcomes) {
    const icon =
      outcome.status === "success"
        ? chalk.green("✔")
        : outcome.status === "skipped"
          ? chalk.yellow("–")
          : chalk.red("✖");
    const detail = outcome.detail ? chalk.dim(` — ${outcome.detail}`) : "";
    console.log(`  ${icon} ${outcome.label}${detail}`);
  }

  if (config.database !== "none") {
    logger.blank();
    logger.title("  Database Setup");
    console.log(
      chalk.white(
        `  Your ${config.database === "postgresql" ? "PostgreSQL" : "MongoDB"} database is required before continuing.`,
      ),
    );
    console.log(chalk.white(`  Database name: ${config.projectName}`));
    logger.blank();
    console.log(chalk.white("  Create the database using your preferred method."));
    console.log(chalk.white("  Then update .env:"));
    if (config.database === "postgresql") {
      console.log(
        chalk.cyan(
          `    DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/${config.projectName}`,
        ),
      );
      if (config.authentication === "base-auth") {
        console.log(chalk.dim("    (also set the same URL in auth-api/.env)"));
      }
    } else {
      console.log(
        chalk.cyan(
          `    MONGODB_URI=mongodb://localhost:27017/${config.projectName}`,
        ),
      );
    }
    logger.blank();
    console.log(
      chalk.green("  ✓ After updating .env, start the app — the Setup Wizard guides the rest."),
    );
  }

  if (config.initialAdmin) {
    logger.blank();
    logger.title("  Initial administrator");
    console.log(
      chalk.white(
        `  ${config.initialAdmin.firstName} ${config.initialAdmin.lastName} <${config.initialAdmin.email}>`,
      ),
    );
    console.log(
      chalk.dim(
        "  Will be created as Super Admin when the database is available (npm run seed).",
      ),
    );
  }

  logger.blank();
  logger.title("  Next steps");
  console.log(chalk.white(`  cd ${relativeRoot}`));
  console.log(chalk.white("  npm run dev:backend"));
  console.log(chalk.white("  npm run dev:frontend"));
  if (config.authentication === "base-auth") {
    console.log(chalk.white("  npm run dev:auth-api"));
  }
  console.log(
    chalk.dim(
      "\n  Tip: open the frontend — the Setup Wizard shows what is done and what to do next.",
    ),
  );
  console.log(
    chalk.dim(
      "  Advanced: npm run migrate / npm run seed remain available if you prefer the CLI.",
    ),
  );

  const failed = outcomes.filter((o) => o.status === "failed");
  if (failed.length > 0) {
    logger.blank();
    logger.warn(
      "  Some installers failed. The project was still generated — fix the errors above and re-run the failed commands manually.",
    );
  }

  logger.blank();
}

function backendNextCommands(config: ProjectConfig): string[] {
  switch (config.backend) {
    case "express":
      return ["cd backend && npm run dev"];
    case "fastapi":
      return [
        "cd backend && python -m venv .venv",
        "cd backend && .venv\\Scripts\\activate  # or: source .venv/bin/activate",
        "cd backend && pip install -r requirements.txt",
        "cd backend && uvicorn main:app --reload",
      ];
    case "none":
      return [];
    default: {
      const _exhaustive: never = config.backend;
      return _exhaustive;
    }
  }
}

// keep helper referenced for potential reuse / exhaustiveness
void backendNextCommands;
