import type { ModuleContext } from "../../src/module-system/index.js";

export async function install(context: ModuleContext): Promise<void> {
  await context.helpers.standardInstall(context);
}
