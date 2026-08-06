import type { ModuleContext } from "../../src/module-system/index.js";
import { logger } from "../../src/utils/index.js";

/** Placeholder — no templates yet. Reserved for vistaar add rbac. */
export async function install(_context: ModuleContext): Promise<void> {
  logger.warn("  Module \"rbac\" is a local architecture stub (not installed).");
}
