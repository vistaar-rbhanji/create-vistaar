/**
 * vistaar program — project management CLI (Version 2 surface).
 *
 * Registers doctor + coming-soon add/generate/update. Command implementations
 * live under commands/ and can be extracted into a standalone package later.
 */

import { Command } from "commander";

import { managementCommands } from "../commands/index.js";
import { registerCommands } from "./register.js";

export function buildManageProgram(): Command {
  const program = new Command();

  program
    .name("vistaar")
    .description(
      "Vistaar project management CLI (doctor, modules, generate — more coming soon)",
    )
    .version("0.1.0");

  registerCommands(program, managementCommands);

  program.addHelpText(
    "after",
    `
Examples:
  vistaar doctor
  vistaar add auth
  vistaar generate crud User
  vistaar update

Scaffold a new project with:
  npx create-vistaar
`,
  );

  return program;
}
