/**
 * create-vistaar program — project creation + focused add auth (Phase 14).
 *
 * `add auth` is registered here so `npx create-vistaar add auth` works.
 * Broader management remains on the `vistaar` binary as well.
 */

import { Command } from "commander";

import { addCommand, createCommand, doctorCommand } from "../commands/index.js";
import { createContext } from "../commands/types.js";
import { registerCommand } from "./register.js";

export function buildCreateProgram(): Command {
  const program = new Command();

  program
    .name("create-vistaar")
    .description(
      "Bootstrap full-stack projects from interactive prompts and reusable templates",
    )
    .version("0.1.0")
    .action(async () => {
      await createCommand.execute(createContext());
    });

  program
    .command("create")
    .description(createCommand.description)
    .action(async () => {
      await createCommand.execute(createContext());
    });

  registerCommand(program, addCommand);
  registerCommand(program, doctorCommand);

  program.addHelpText(
    "after",
    `
Commands:

  create-vistaar
      Create a new project

  create-vistaar add auth
      Add authentication to an existing Vistaar project

  create-vistaar doctor
      Check project health

Examples:
  npx create-vistaar
  npx create-vistaar add auth
  npx create-vistaar doctor
`,
  );

  return program;
}
