/**
 * Pretty-prints a ProjectConfig for Phase 1 verification.
 *
 * Generation is intentionally deferred — printing the resolved config proves
 * the prompt → type pipeline before template copying is introduced.
 */

import chalk from "chalk";

import type { ProjectConfig } from "../types/index.js";

function formatValue(value: unknown): string {
  if (value === null) {
    return chalk.gray("null");
  }
  if (typeof value === "boolean") {
    return value ? chalk.green("true") : chalk.red("false");
  }
  return chalk.white(String(value));
}

/** Renders the configuration as a labeled key/value block. */
export function printProjectConfig(config: ProjectConfig): void {
  console.log(chalk.bold("\nProject configuration\n"));

  const rows: Array<[string, unknown]> = [
    ["Project name", config.projectName],
    ["Frontend", config.frontend],
    ["Language", config.language],
    ["UI framework", config.uiFramework],
    ["Backend", config.backend],
    ["Database", config.database],
    ["ORM", config.orm],
    ["Authentication", config.authentication],
    [
      "Initial admin",
      config.initialAdmin
        ? `${config.initialAdmin.firstName} ${config.initialAdmin.lastName} <${config.initialAdmin.email}>`
        : null,
    ],
    ["Docker", config.docker],
    ["Git", config.git],
    ["Husky", config.husky],
    ["ESLint + Prettier", config.eslintPrettier],
  ];

  const labelWidth = Math.max(...rows.map(([label]) => label.length));

  for (const [label, value] of rows) {
    console.log(
      `  ${chalk.cyan(label.padEnd(labelWidth))}  ${formatValue(value)}`,
    );
  }

  console.log();
  console.log(chalk.dim("Raw JSON:"));
  console.log(JSON.stringify(config, null, 2));
  console.log();
}
