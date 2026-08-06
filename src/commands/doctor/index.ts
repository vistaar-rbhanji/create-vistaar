/**
 * Doctor command — project health checks (Version 2 surface).
 *
 * Today: if run inside a generated project, delegates to scripts/doctor.js.
 * Later: full implementation moves with this module into the vistaar package.
 */

import path from "node:path";

import fs from "fs-extra";

import { runCommand } from "../../installers/run-command.js";
import { logger } from "../../utils/index.js";
import { printComingSoon } from "../shared/index.js";
import type { CliCommand, CommandContext } from "../types.js";

export async function execute(context: CommandContext): Promise<void> {
  const doctorJs = path.join(context.cwd, "scripts", "doctor.js");
  const rootPkg = path.join(context.cwd, "package.json");

  if (await fs.pathExists(doctorJs)) {
    logger.title("\n  vistaar doctor\n");
    logger.info(`  Running project doctor in ${context.cwd}\n`);
    await runCommand("node", ["scripts/doctor.js"], { cwd: context.cwd });
    return;
  }

  if (await fs.pathExists(rootPkg)) {
    const pkg = (await fs.readJson(rootPkg)) as { scripts?: Record<string, string> };
    if (pkg.scripts?.doctor) {
      logger.title("\n  vistaar doctor\n");
      await runCommand("npm", ["run", "doctor"], { cwd: context.cwd });
      return;
    }
  }

  printComingSoon(
    "vistaar doctor",
    "Run this inside a project scaffolded by create-vistaar (look for scripts/doctor.js), or use the upcoming Vistaar management CLI.",
  );
}

export const doctorCommand: CliCommand = {
  name: "doctor",
  description: "Diagnose a Vistaar project's environment and setup",
  category: "management",
  execute,
};

export default doctorCommand;
