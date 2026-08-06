/**
 * create-vistaar program — project creation only.
 *
 * Does not register management commands (add/generate/update). Those belong
 * to the vistaar binary so scaffolding stays decoupled from management.
 */

import { Command } from "commander";

import { createCommand } from "../commands/index.js";
import { createContext } from "../commands/types.js";

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

  // Optional explicit subcommand for symmetry with future `vistaar create`.
  program
    .command("create")
    .description(createCommand.description)
    .action(async () => {
      await createCommand.execute(createContext());
    });

  return program;
}
