import type { ModuleContext } from "../../src/module-system/index.js";
import { logger } from "../../src/utils/index.js";

export async function install(_context: ModuleContext): Promise<void> {
  logger.warn('  Module "redis" is a local architecture stub (not installed).');
}
