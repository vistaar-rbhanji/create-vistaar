#!/usr/bin/env node
/**
 * create-vistaar entry — project creation only (Version 1).
 *
 * Architectural decision (Phase 9):
 * This binary registers creation commands exclusively. Management lives in
 * `vistaar` so scaffolding never tightly couples to add/generate/update.
 */

import { buildCreateProgram } from "./cli/create-program.js";
import { logger } from "./utils/index.js";

async function main(): Promise<void> {
  const program = buildCreateProgram();
  await program.parseAsync(process.argv);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(`\ncreate-vistaar failed: ${message}`);
  process.exitCode = 1;
});
