/**
 * `vistaar generate <type> [name]` — placeholder for code generation (CRUD, etc.).
 */

import { printComingSoon } from "../shared/index.js";
import type { CliCommand, CommandContext } from "../types.js";

export async function execute(context: CommandContext): Promise<void> {
  const [type, name] = context.args;
  const label = ["vistaar generate", type, name].filter(Boolean).join(" ");

  printComingSoon(
    label || "vistaar generate",
    "Examples (coming soon): vistaar generate crud User · vistaar generate module payments",
  );
}

export const generateCommand: CliCommand = {
  name: "generate",
  description: "Generate project artifacts (coming soon)",
  category: "management",
  execute,
};

export default generateCommand;
