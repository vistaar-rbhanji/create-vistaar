/**
 * `create` command — default action for `npx create-vistaar`.
 *
 * Flow: prompt → print config → generate (stacks + modules) → install.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import { ModuleGenerator, ProjectGenerator } from "../generators/index.js";
import { ProjectInstaller } from "../installers/index.js";
import { ModuleLoader } from "../modules/index.js";
import { collectProjectConfig } from "../prompts/index.js";
import { TemplateEngine } from "../template-engine/index.js";
import { logger, printProjectConfig } from "../utils/index.js";

/** Resolve package roots whether running from src/ (tsx) or dist/ (node). */
function resolvePackageRoot(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, "../..");
}

export async function runCreateCommand(): Promise<void> {
  logger.title("\n  create-vistaar\n");
  logger.info("Answer a few questions to configure your project.\n");

  const config = await collectProjectConfig();
  printProjectConfig(config);

  const packageRoot = resolvePackageRoot();
  const engine = new TemplateEngine({
    templatesRoot: path.join(packageRoot, "templates"),
  });
  const moduleLoader = new ModuleLoader({
    modulesRoot: path.join(packageRoot, "templates", "modules"),
  });
  const moduleGenerator = new ModuleGenerator(moduleLoader);

  const generator = new ProjectGenerator({ engine, moduleGenerator });
  const generation = await generator.generate(config);

  const installer = new ProjectInstaller();
  await installer.install(generation);
}
