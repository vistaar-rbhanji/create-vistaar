/**
 * Auth module installer (typed).
 * Runtime entry is install.js — keep both in sync.
 */

import type { ModuleContext } from "../../src/module-system/index.js";

export async function install(context: ModuleContext): Promise<void> {
  await context.helpers.standardInstall(context);
}
