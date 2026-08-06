/**
 * Registers reusable CliCommand modules onto a Commander program.
 *
 * Architectural decision:
 * This is the only place that knows about Commander APIs. Command modules
 * stay framework-agnostic via execute(context).
 */

import type { Command } from "commander";

import type { CliCommand } from "../commands/types.js";
import { createContext } from "../commands/types.js";

export function registerCommand(program: Command, command: CliCommand): void {
  const cmd = program
    .command(command.name)
    .description(command.description);

  // Positional catch-all so `vistaar add auth` / `vistaar generate crud User` work.
  cmd.argument("[args...]", "command arguments");

  cmd.action(async (args: string[] = []) => {
    await command.execute(
      createContext({
        cwd: process.cwd(),
        args,
        options: {},
      }),
    );
  });
}

export function registerCommands(
  program: Command,
  commands: readonly CliCommand[],
): void {
  for (const command of commands) {
    registerCommand(program, command);
  }
}
