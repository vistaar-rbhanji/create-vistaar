/**
 * ModuleApplier — copies module template folders and merges manifest metadata.
 *
 * All behavior is driven by LoadedModule.manifest + resolveModulePlan(config).
 * No module-specific branches (auth / rbac / s3 look identical here).
 */

import path from "node:path";

import fs from "fs-extra";

import type { ProjectPaths } from "../generators/index.js";
import { mergeDirectoryInto } from "../generators/merge-template.js";
import {
  mergePackageJson,
  type PackageJsonLike,
} from "../generators/package-json.js";
import type {
  TemplateEngine,
  TemplateVariables,
} from "../template-engine/index.js";
import { replaceTemplateVariables } from "../template-engine/index.js";
import type { ProjectConfig } from "../types/index.js";
import { logger } from "../utils/index.js";
import { resolveModulePlan } from "./module-plan.js";
import type {
  LoadedModule,
  ModuleEnvExample,
  ModuleNpmPackageSet,
  ResolvedModulePlan,
} from "./types.js";

export interface ModuleApplyResult {
  readonly module: LoadedModule;
  readonly plan: ResolvedModulePlan;
  readonly targets: readonly string[];
}

export interface ModuleApplierContext {
  readonly config: ProjectConfig;
  readonly engine: TemplateEngine;
  readonly paths: ProjectPaths;
  readonly variables: TemplateVariables;
}

export class ModuleApplier {
  async apply(
    module: LoadedModule,
    context: ModuleApplierContext,
  ): Promise<ModuleApplyResult> {
    const { manifest, rootDir } = module;
    const plan = resolveModulePlan(manifest, context.config);
    const targets: string[] = [];

    logger.info(
      `  Applying module "${manifest.name}" — ${manifest.description}`,
    );

    for (const [target, relativeFolder] of Object.entries(
      plan.templateFolders,
    )) {
      if (!relativeFolder) {
        continue;
      }

      const destination = resolveTargetPath(target, context.paths);
      if (!destination) {
        logger.warn(
          `  Skipping module "${manifest.name}" template "${target}" — target not in project.`,
        );
        continue;
      }

      const sourceDir = path.join(rootDir, relativeFolder);
      if (!(await fs.pathExists(sourceDir))) {
        throw new Error(
          `Module "${manifest.name}" declares template folder "${relativeFolder}" but ${sourceDir} is missing.`,
        );
      }

      await fs.ensureDir(destination);
      await mergeDirectoryInto(
        context.engine,
        sourceDir,
        destination,
        context.variables,
      );
      targets.push(`${target} ← ${relativeFolder}`);
      logger.success(`    merged ${relativeFolder}/ → ${target}/`);
    }

    await mergeNpmPackages(plan.npmPackages.frontend, context.paths.frontend);
    await mergeNpmPackages(plan.npmPackages.backend, context.paths.backend);

    if (plan.envExample) {
      await appendEnvExamples(
        manifest.name,
        plan.envExample,
        context.paths,
        context.variables,
      );
    }

    printFeatureSummary(plan);

    return { module, plan, targets };
  }
}

function resolveTargetPath(
  target: string,
  paths: ProjectPaths,
): string | null {
  switch (target) {
    case "frontend":
      return paths.frontend;
    case "backend":
      return paths.backend;
    case "database":
      return paths.database;
    case "root":
      return paths.root;
    default:
      return path.join(paths.root, target);
  }
}

async function mergeNpmPackages(
  packages: ModuleNpmPackageSet | undefined,
  destination: string | null,
): Promise<void> {
  if (!packages || !destination) {
    return;
  }

  const hasDeps =
    (packages.dependencies && Object.keys(packages.dependencies).length > 0) ||
    (packages.devDependencies &&
      Object.keys(packages.devDependencies).length > 0);

  if (!hasDeps) {
    return;
  }

  const pkgPath = path.join(destination, "package.json");
  if (!(await fs.pathExists(pkgPath))) {
    logger.warn(
      `    skip npm package merge — no package.json in ${destination}`,
    );
    return;
  }

  const base = (await fs.readJson(pkgPath)) as PackageJsonLike;
  const overlay: PackageJsonLike = {};
  if (packages.dependencies && Object.keys(packages.dependencies).length > 0) {
    overlay.dependencies = packages.dependencies;
  }
  if (
    packages.devDependencies &&
    Object.keys(packages.devDependencies).length > 0
  ) {
    overlay.devDependencies = packages.devDependencies;
  }

  const merged = mergePackageJson(base, overlay);
  await fs.writeJson(pkgPath, merged, { spaces: 2 });
  logger.success(`    merged npm packages into ${path.basename(destination)}/package.json`);
}

async function appendEnvExamples(
  moduleName: string,
  env: ModuleEnvExample,
  paths: ProjectPaths,
  variables: TemplateVariables,
): Promise<void> {
  const jobs: Array<{ lines: readonly string[] | undefined; file: string }> = [
    { lines: env.frontend, file: path.join(paths.frontend, ".env.example") },
    {
      lines: env.backend,
      file: paths.backend ? path.join(paths.backend, ".env.example") : "",
    },
    { lines: env.root, file: path.join(paths.root, ".env.example") },
  ];

  for (const job of jobs) {
    if (!job.lines?.length || !job.file) {
      continue;
    }
    const rendered = job.lines.map((line) =>
      replaceTemplateVariables(line, variables),
    );
    await appendEnvFile(job.file, rendered, moduleName);
  }
}

async function appendEnvFile(
  filePath: string,
  lines: readonly string[],
  moduleName: string,
): Promise<void> {
  const banner = `\n# --- create-vistaar module: ${moduleName} ---\n`;
  const block = banner + lines.map((l) => l.trimEnd()).join("\n") + "\n";

  if (await fs.pathExists(filePath)) {
    const existing = await fs.readFile(filePath, "utf8");
    if (existing.includes(`module: ${moduleName}`)) {
      return;
    }
    await fs.writeFile(filePath, existing.trimEnd() + block, "utf8");
  } else {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, block.trimStart(), "utf8");
  }

  logger.success(
    `    updated ${path.basename(path.dirname(filePath))}/.env.example`,
  );
}

function printFeatureSummary(plan: ResolvedModulePlan): void {
  if (plan.features.length === 0) {
    return;
  }

  logger.blank();
  logger.title(`  ${plan.summaryTitle}`);
  for (const feature of plan.features) {
    logger.info(`    • ${feature}`);
  }
  logger.blank();
}
