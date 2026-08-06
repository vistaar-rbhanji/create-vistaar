/**
 * ModuleLoader — discovers and parses templates/modules/<name>/module.json.
 *
 * Architectural decision (Dependency Inversion):
 * Callers depend on LoadedModule data, never on folder-name conventions beyond
 * "each child dir with module.json is a module". Validation keeps manifests
 * honest without encoding auth/rbac specifics in TypeScript.
 */

import path from "node:path";

import fs from "fs-extra";

import type { LoadedModule, ModuleManifest } from "./types.js";

export class ModuleLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModuleLoadError";
  }
}

export interface ModuleLoaderOptions {
  /** Absolute path to `templates/modules`. */
  readonly modulesRoot: string;
}

export class ModuleLoader {
  private readonly modulesRoot: string;

  constructor(options: ModuleLoaderOptions) {
    this.modulesRoot = options.modulesRoot;
  }

  getRoot(): string {
    return this.modulesRoot;
  }

  /** Load every module that has a valid module.json. */
  async loadAll(): Promise<LoadedModule[]> {
    if (!(await fs.pathExists(this.modulesRoot))) {
      return [];
    }

    const entries = await fs.readdir(this.modulesRoot);
    const loaded: LoadedModule[] = [];

    for (const entry of entries) {
      if (entry.startsWith(".")) {
        continue;
      }
      const rootDir = path.join(this.modulesRoot, entry);
      const stats = await fs.stat(rootDir);
      if (!stats.isDirectory()) {
        continue;
      }

      const manifestPath = path.join(rootDir, "module.json");
      if (!(await fs.pathExists(manifestPath))) {
        continue;
      }

      loaded.push(await this.loadFromDirectory(rootDir));
    }

    return loaded.sort((a, b) =>
      a.manifest.name.localeCompare(b.manifest.name),
    );
  }

  /** Load one module by folder / manifest name. */
  async loadByName(name: string): Promise<LoadedModule> {
    const byFolder = path.join(this.modulesRoot, name);
    if (await fs.pathExists(path.join(byFolder, "module.json"))) {
      return this.loadFromDirectory(byFolder);
    }

    const all = await this.loadAll();
    const match = all.find((m) => m.manifest.name === name);
    if (!match) {
      throw new ModuleLoadError(
        `Module "${name}" was not found under ${this.modulesRoot}.`,
      );
    }
    return match;
  }

  async loadFromDirectory(rootDir: string): Promise<LoadedModule> {
    const manifestPath = path.join(rootDir, "module.json");
    if (!(await fs.pathExists(manifestPath))) {
      throw new ModuleLoadError(`Missing module.json in ${rootDir}`);
    }

    const raw = (await fs.readJson(manifestPath)) as unknown;
    const manifest = validateManifest(raw, manifestPath);
    return { manifest, rootDir };
  }
}

function validateManifest(raw: unknown, source: string): ModuleManifest {
  if (!raw || typeof raw !== "object") {
    throw new ModuleLoadError(`Invalid module.json at ${source}`);
  }

  const data = raw as Record<string, unknown>;

  if (typeof data.name !== "string" || !data.name.trim()) {
    throw new ModuleLoadError(`${source}: "name" must be a non-empty string`);
  }
  if (typeof data.description !== "string") {
    throw new ModuleLoadError(`${source}: "description" must be a string`);
  }
  if (!Array.isArray(data.dependencies)) {
    throw new ModuleLoadError(`${source}: "dependencies" must be an array`);
  }
  if (!data.npmPackages || typeof data.npmPackages !== "object") {
    throw new ModuleLoadError(`${source}: "npmPackages" must be an object`);
  }
  if (!Array.isArray(data.postInstallCommands)) {
    throw new ModuleLoadError(
      `${source}: "postInstallCommands" must be an array`,
    );
  }
  if (!data.templateFolders || typeof data.templateFolders !== "object") {
    throw new ModuleLoadError(`${source}: "templateFolders" must be an object`);
  }

  return data as unknown as ModuleManifest;
}
