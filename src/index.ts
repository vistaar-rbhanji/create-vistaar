#!/usr/bin/env node
/**
 * CLI entry point for create-vistaar.
 *
 * Architectural decisions:
 * 1. Commander owns argv parsing only — business flow lives in commands/.
 * 2. Default action (no subcommand) runs the interactive create flow so
 *    `npx create-vistaar` matches the product UX users expect.
 * 3. ESM + TypeScript compile to dist/; the shebang makes the bin executable
 *    after `npm link` / publish.
 * 4. Folders for generators, template-engine, and installers exist as stubs
 *    so Phase 2 can land without restructuring the package.
 */

import { Command } from "commander";

import { runCreateCommand } from "./commands/index.js";
import { logger } from "./utils/index.js";

async function main(): Promise<void> {
  const program = new Command();

  program
    .name("create-vistaar")
    .description(
      "Bootstrap full-stack projects from interactive prompts and reusable templates",
    )
    .version("0.1.0")
    // Default command: interactive create. Subcommands can be added later
    // without breaking the primary `npx create-vistaar` experience.
    .action(async () => {
      await runCreateCommand();
    });

  await program.parseAsync(process.argv);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(`\ncreate-vistaar failed: ${message}`);
  process.exitCode = 1;
});
