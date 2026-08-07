/**
 * Install missing backend / database / ORM into an existing project,
 * then install the auth module via install(context).
 */

import path from "node:path";

import fs from "fs-extra";

import {
  BackendGenerator,
  DatabaseGenerator,
  NativeDriverGenerator,
  OrmGenerator,
  mergePackageJson,
  resolveProjectPaths,
  type GenerationResult,
  type GeneratorContext,
  type PackageJsonLike,
} from "../../generators/index.js";
import { ProjectInstaller } from "../../installers/index.js";
import {
  ModuleRegistry,
  standardInstall,
  type LoadedModule,
} from "../../module-system/index.js";
import {
  createTemplateVariables,
  TemplateEngine,
  type TemplateVariables,
} from "../../template-engine/index.js";
import type { ProjectConfig } from "../../types/index.js";
import { logger } from "../../utils/index.js";

export function resolvePackageRoot(fromCommandsAddDir: string): string {
  // src/commands/add → package root
  return path.resolve(fromCommandsAddDir, "../../..");
}

export async function mergeRootScriptsFromTemplate(
  projectRoot: string,
  templatesRoot: string,
  variables: TemplateVariables,
  engine: TemplateEngine,
): Promise<void> {
  const templatePkgPath = path.join(
    templatesRoot,
    "project-root",
    "package.json",
  );

  if (!(await fs.pathExists(templatePkgPath))) {
    return;
  }

  let overlayRaw = await fs.readFile(templatePkgPath, "utf8");
  overlayRaw = overlayRaw.replace(
    /\{\{\s*([A-Z0-9_]+)\s*\}\}/g,
    (match, key: string) =>
      Object.prototype.hasOwnProperty.call(variables, key)
        ? (variables[key] ?? match)
        : match,
  );

  const overlay = JSON.parse(overlayRaw) as PackageJsonLike;
  const rootPkgPath = path.join(projectRoot, "package.json");
  if (!(await fs.pathExists(rootPkgPath))) {
    await fs.writeJson(rootPkgPath, overlay, { spaces: 2 });
  } else {
    const base = (await fs.readJson(rootPkgPath)) as PackageJsonLike;
    const merged = mergePackageJson(
      base,
      overlay.scripts ? { scripts: overlay.scripts } : {},
    );
    await fs.writeJson(rootPkgPath, merged, { spaces: 2 });
  }

  const scriptsDest = path.join(projectRoot, "scripts");
  const scriptsSrc = path.join(templatesRoot, "project-root", "scripts");
  if (
    (await fs.pathExists(scriptsSrc)) &&
    !(await fs.pathExists(scriptsDest))
  ) {
    await engine.copyDirectory(scriptsSrc, {
      destination: scriptsDest,
      variables,
      overwrite: false,
    });
  }
}

export interface AddAuthInstallOptions {
  readonly projectRoot: string;
  readonly config: ProjectConfig;
  readonly packageRoot: string;
  readonly needsBackend: boolean;
  readonly needsDatabase: boolean;
  readonly needsOrm: boolean;
}

export async function installMissingStackAndAuth(
  options: AddAuthInstallOptions,
): Promise<GenerationResult> {
  const {
    projectRoot,
    config,
    packageRoot,
    needsBackend,
    needsDatabase,
    needsOrm,
  } = options;

  const templatesRoot = path.join(packageRoot, "templates");
  const engine = new TemplateEngine({ templatesRoot });
  const paths = resolveProjectPaths(projectRoot, config);
  const variables = createTemplateVariables(config);
  const appliedModules: LoadedModule[] = [];
  const completedGenerators: string[] = [];

  const context: GeneratorContext = {
    config,
    paths,
    variables,
    engine,
    appliedModules,
  };

  if (needsBackend) {
    if (!paths.backend) {
      throw new Error("Backend path resolved to null unexpectedly.");
    }
    if (await fs.pathExists(paths.backend)) {
      throw new Error(
        `Backend directory already exists at ${paths.backend}. Refusing to overwrite.`,
      );
    }
    logger.info("  Installing Express backend…");
    await new BackendGenerator().generate(context);
    completedGenerators.push("backend");
    logger.success("  ✓ Backend installed");
  }

  if (needsDatabase) {
    if (!paths.database) {
      throw new Error("Database path resolved to null unexpectedly.");
    }
    if (await fs.pathExists(paths.database)) {
      throw new Error(
        `Database directory already exists at ${paths.database}. Refusing to overwrite.`,
      );
    }
    logger.info("  Installing database assets…");
    await new DatabaseGenerator().generate(context);
    completedGenerators.push("database");
    logger.success("  ✓ Database assets installed");
  }

  if (needsOrm) {
    if (!paths.backend || !(await fs.pathExists(paths.backend))) {
      throw new Error("Cannot install persistence — backend directory is missing.");
    }
    if (config.orm) {
      logger.info(`  Installing ORM (${config.orm})…`);
      await new OrmGenerator().generate(context);
      completedGenerators.push("orm");
      logger.success("  ✓ ORM installed");
    } else {
      logger.info("  Installing native database driver (no ORM)…");
      await new NativeDriverGenerator().generate(context);
      completedGenerators.push("native-db-driver");
      logger.success("  ✓ Native database driver installed");
    }
  } else if (
    config.orm === null &&
    config.database !== "none" &&
    paths.backend &&
    (await fs.pathExists(paths.backend))
  ) {
    const driverFile =
      config.database === "postgresql" ? "db-pg.js" : "db-mongodb.js";
    const driverPath = path.join(paths.backend, "src", driverFile);
    if (!(await fs.pathExists(driverPath))) {
      logger.info("  Installing native database driver (no ORM)…");
      await new NativeDriverGenerator().generate(context);
      completedGenerators.push("native-db-driver");
      logger.success("  ✓ Native database driver installed");
    }
  }

  if (needsBackend || needsDatabase) {
    await mergeRootScriptsFromTemplate(
      projectRoot,
      templatesRoot,
      variables,
      engine,
    );
  }

  logger.info("  Installing Base Auth module…");
  const registry = new ModuleRegistry({
    modulesRoot: path.join(packageRoot, "modules"),
  });
  const authModule = await registry.get("auth");
  await authModule.install({
    projectPath: paths.root,
    paths,
    config,
    stack: {
      frontend: config.frontend,
      backend: config.backend,
      language: config.language,
      database: config.database,
      orm: config.orm,
      uiFramework: config.uiFramework,
    },
    variables,
    engine,
    moduleRoot: authModule.rootDir,
    manifest: authModule.manifest,
    helpers: { standardInstall },
  });
  appliedModules.push(authModule);
  completedGenerators.push("modules");
  logger.success("  ✓ Base Auth installed");

  const generation: GenerationResult = {
    paths,
    config,
    completedGenerators,
    appliedModules,
  };

  const installer = new ProjectInstaller();
  await installer.install(generation);

  return generation;
}
