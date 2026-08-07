/**
 * Create command — project scaffolding (Version 1).
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import { ModuleGenerator, ProjectGenerator } from "../../generators/index.js";
import { ProjectInstaller } from "../../installers/index.js";
import { ModuleRegistry } from "../../module-system/index.js";
import {
  manifestFromProjectConfig,
  writeVistaarManifest,
} from "../../project-manifest/index.js";
import { writeStackFile } from "../../project-stack/index.js";
import { collectProjectConfig } from "../../prompts/index.js";
import { TemplateEngine } from "../../template-engine/index.js";
import { logger, printProjectConfig } from "../../utils/index.js";
import type { CliCommand, CommandContext } from "../types.js";

function resolvePackageRoot(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, "../../..");
}

export async function execute(
  _context: CommandContext = {
    cwd: process.cwd(),
    args: [],
    options: {},
  },
): Promise<void> {
  logger.title("\n  create-vistaar\n");
  logger.info("Answer a few questions to configure your project.\n");

  const config = await collectProjectConfig();
  printProjectConfig(config);

  const packageRoot = resolvePackageRoot();
  const engine = new TemplateEngine({
    templatesRoot: path.join(packageRoot, "templates"),
  });
  const registry = new ModuleRegistry({
    modulesRoot: path.join(packageRoot, "modules"),
  });
  const moduleGenerator = new ModuleGenerator(registry);

  const generator = new ProjectGenerator({
    engine,
    moduleGenerator,
    cwd: _context.cwd,
  });
  const generation = await generator.generate(config);

  const installer = new ProjectInstaller();
  await installer.install(generation);

  const modules: Record<string, { name: string; version: string }> = {};
  for (const mod of generation.appliedModules) {
    modules[mod.manifest.name] = {
      name: mod.manifest.name === "auth" ? "base-auth" : mod.manifest.name,
      version: mod.manifest.version,
    };
  }
  await writeVistaarManifest(
    generation.paths.root,
    manifestFromProjectConfig(config, modules),
  );
  // Ensure stack.js matches final config (same helper used by add/remove).
  await writeStackFile(generation.paths.root, config);
  logger.success("  Wrote vistaar.json");
  logger.success("  Wrote scripts/lib/stack.js");
}

export const createCommand: CliCommand = {
  name: "create",
  description: "Scaffold a new full-stack project interactively",
  category: "creation",
  execute,
};

export default createCommand;
