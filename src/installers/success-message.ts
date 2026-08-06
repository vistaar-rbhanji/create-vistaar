/**
 * Final success banner: paths, modules, suggested next commands.
 */

import path from "node:path";

import chalk from "chalk";

import type { GenerationResult } from "../generators/index.js";
import { resolveModulePlan } from "../modules/module-plan.js";
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

  logger.blank();
  logger.title("  Next steps");
  console.log(chalk.white(`  cd ${relativeRoot}`));
  console.log(chalk.white(`  cd frontend && npm run dev`));

  if (paths.backend) {
    for (const line of backendNextCommands(config)) {
      console.log(chalk.white(`  ${line}`));
    }
  }

  if (config.eslintPrettier) {
    console.log(chalk.white("  cd frontend && npm run lint"));
    console.log(chalk.white("  cd frontend && npm run format"));
  }

  if (config.database !== "none" && config.backend === "express") {
    console.log(chalk.white("  npm run migrate"));
    console.log(chalk.white("  npm run seed"));
  }

  console.log(chalk.white("  npm run setup"));
  console.log(chalk.white("  npm run doctor"));
  console.log(chalk.dim("\n  Tip: open the frontend — the Setup Wizard guides first-time configuration."));

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
