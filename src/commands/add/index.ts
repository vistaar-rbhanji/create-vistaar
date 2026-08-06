/**
 * `vistaar add <module>` — placeholder for the future module marketplace.
 *
 * Architecture only: modules (auth, rbac, s3, …) will plug in here later.
 * Do not implement install logic in Phase 9.
 */

import { FUTURE_ADD_MODULES, printComingSoon } from "../shared/index.js";
import type { CliCommand, CommandContext } from "../types.js";

export async function execute(context: CommandContext): Promise<void> {
  const moduleId = context.args[0];
  const label = moduleId ? `vistaar add ${moduleId}` : "vistaar add";

  const hint = moduleId
    ? `Module "${moduleId}" is reserved for the Vistaar module system. Planned modules: ${FUTURE_ADD_MODULES.join(", ")}.`
    : `Usage: vistaar add <module>\n  Planned modules: ${FUTURE_ADD_MODULES.join(", ")}`;

  printComingSoon(label, hint);
}

export const addCommand: CliCommand = {
  name: "add",
  description: "Add a Vistaar module to the current project (coming soon)",
  category: "management",
  execute,
};

export default addCommand;
