#!/usr/bin/env node
/**
 * vistaar entry — project management CLI (Version 2 surface).
 *
 * Placeholder commands establish UX for add/generate/update today.
 * Real implementations will replace execute() bodies without changing
 * this entry point or Commander registration.
 */

import { buildManageProgram } from "./cli/manage-program.js";
import { logger } from "./utils/index.js";

async function main(): Promise<void> {
  const program = buildManageProgram();
  await program.parseAsync(process.argv);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(`\nvistaar failed: ${message}`);
  process.exitCode = 1;
});
