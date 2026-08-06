/**
 * `vistaar update` — placeholder for upgrading scaffolding / modules.
 */

import { printComingSoon } from "../shared/index.js";
import type { CliCommand, CommandContext } from "../types.js";

export async function execute(_context: CommandContext): Promise<void> {
  printComingSoon(
    "vistaar update",
    "Will update Vistaar tooling and installed modules inside an existing project.",
  );
}

export const updateCommand: CliCommand = {
  name: "update",
  description: "Update Vistaar tooling and modules (coming soon)",
  category: "management",
  execute,
};

export default updateCommand;
