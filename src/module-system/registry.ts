/**
 * ModuleRegistry — discovers local modules/<name>/module.json and install().
 *
 * Architectural decision:
 * Generators never branch on module names. They ask the registry which modules
 * match the ProjectConfig. Discovery is filesystem-based so new folders appear
 * automatically; the same registry later can resolve @vistaar scoped packages.
 */

import path from "node:path";
import { pathToFileURL } from "node:url";

import fs from "fs-extra";

import { isModuleCompatible } from "./plan.js";
import { standardInstall } from "./apply.js";
import type {
  ModuleInstallFn,
  ModuleManifest,
  RegisteredModule,
} from "./types.js";
import type { ProjectConfig } from "../types/index.js";

export class ModuleRegistryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModuleRegistryError";
  }
}

export interface ModuleRegistryOptions {
  /** Absolute path to the local modules/ catalog. */
  readonly modulesRoot: string;
  /**
   * Absolute path to compiled install.js files (dist/modules).
   * Defaults to modulesRoot when install.ts is loaded via tsx from source.
   */
  readonly installRoot?: string;
}

export class ModuleRegistry {
  private readonly modulesRoot: string;
  private readonly installRoot: string;
  private cache: RegisteredModule[] | null = null;

  constructor(options: ModuleRegistryOptions) {
    this.modulesRoot = options.modulesRoot;
    this.installRoot = options.installRoot ?? options.modulesRoot;
  }

  getRoot(): string {
    return this.modulesRoot;
  }

  /** Discover every module with a valid module.json. */
  async discover(): Promise<RegisteredModule[]> {
    if (this.cache) {
      return this.cache;
    }

    if (!(await fs.pathExists(this.modulesRoot))) {
      this.cache = [];
      return this.cache;
    }

    const entries = await fs.readdir(this.modulesRoot);
    const loaded: RegisteredModule[] = [];

    for (const entry of entries) {
      if (entry.startsWith(".") || entry === "shared") {
        // shared/ holds helpers/docs, not an installable module by default.
        continue;
      }
      const rootDir = path.join(this.modulesRoot, entry);
      if (!(await fs.stat(rootDir)).isDirectory()) {
        continue;
      }
      const manifestPath = path.join(rootDir, "module.json");
      if (!(await fs.pathExists(manifestPath))) {
        continue;
      }

      const manifest = validateManifest(
        await fs.readJson(manifestPath),
        manifestPath,
      );
      const install = await this.resolveInstallFn(manifest.name, rootDir);
      loaded.push({ manifest, rootDir, install });
    }

    this.cache = loaded.sort((a, b) =>
      a.manifest.name.localeCompare(b.manifest.name),
    );
    return this.cache;
  }

  async get(name: string): Promise<RegisteredModule> {
    const all = await this.discover();
    const match = all.find((m) => m.manifest.name === name);
    if (!match) {
      throw new ModuleRegistryError(
        `Module "${name}" was not found under ${this.modulesRoot}.`,
      );
    }
    return match;
  }

  /**
   * Modules selected for this config via enabledWhen + dependency order.
   * Never hardcodes module names.
   */
  async resolveForConfig(config: ProjectConfig): Promise<RegisteredModule[]> {
    const catalog = await this.discover();
    const byName = new Map(catalog.map((m) => [m.manifest.name, m]));
    const selected = new Map<string, RegisteredModule>();

    for (const mod of catalog) {
      if (!isModuleCompatible(mod.manifest, config)) {
        continue;
      }
      if (isEnabled(mod.manifest, config)) {
        selected.set(mod.manifest.name, mod);
      }
    }

    const queue = [...selected.keys()];
    while (queue.length > 0) {
      const name = queue.pop()!;
      const mod = selected.get(name);
      if (!mod) continue;
      for (const depName of mod.manifest.dependencies) {
        if (selected.has(depName)) continue;
        const dep = byName.get(depName);
        if (!dep) {
          throw new ModuleRegistryError(
            `Module "${name}" depends on "${depName}", which is not in the local registry.`,
          );
        }
        selected.set(depName, dep);
        queue.push(depName);
      }
    }

    return topologicalSort([...selected.values()]);
  }

  private async resolveInstallFn(
    name: string,
    rootDir: string,
  ): Promise<ModuleInstallFn> {
    const candidates = [
      path.join(this.installRoot, name, "install.js"),
      path.join(rootDir, "install.js"),
      path.join(rootDir, "install.ts"),
    ];

    for (const candidate of candidates) {
      if (!(await fs.pathExists(candidate))) {
        continue;
      }
      try {
        const mod = (await import(pathToFileURL(candidate).href)) as {
          install?: ModuleInstallFn;
          default?: ModuleInstallFn | { install: ModuleInstallFn };
        };
        if (typeof mod.install === "function") {
          return mod.install;
        }
        if (typeof mod.default === "function") {
          return mod.default;
        }
        if (
          mod.default &&
          typeof mod.default === "object" &&
          typeof mod.default.install === "function"
        ) {
          return mod.default.install;
        }
      } catch (error) {
        // Fall through to standardInstall when dynamic import fails in odd envs.
        const message = error instanceof Error ? error.message : String(error);
        console.warn(
          `[module-registry] Could not load install for "${name}" from ${candidate}: ${message}`,
        );
      }
    }

    // Manifest-only modules still work via the shared lifecycle.
    return standardInstall;
  }
}

function isEnabled(manifest: ModuleManifest, config: ProjectConfig): boolean {
  const rule = manifest.enabledWhen;
  if (!rule) {
    return false;
  }
  const actual = (config as unknown as Record<string, unknown>)[rule.field];
  return actual === rule.equals;
}

function topologicalSort(modules: RegisteredModule[]): RegisteredModule[] {
  const names = new Set(modules.map((m) => m.manifest.name));
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const mod of modules) {
    inDegree.set(mod.manifest.name, 0);
    dependents.set(mod.manifest.name, []);
  }

  for (const mod of modules) {
    for (const dep of mod.manifest.dependencies) {
      if (!names.has(dep)) continue;
      inDegree.set(mod.manifest.name, (inDegree.get(mod.manifest.name) ?? 0) + 1);
      dependents.get(dep)!.push(mod.manifest.name);
    }
  }

  const queue = [...inDegree.entries()]
    .filter(([, deg]) => deg === 0)
    .map(([name]) => name)
    .sort();

  const ordered: RegisteredModule[] = [];
  const byName = new Map(modules.map((m) => [m.manifest.name, m]));

  while (queue.length > 0) {
    const name = queue.shift()!;
    ordered.push(byName.get(name)!);
    for (const next of dependents.get(name) ?? []) {
      const nextDeg = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, nextDeg);
      if (nextDeg === 0) {
        queue.push(next);
        queue.sort();
      }
    }
  }

  if (ordered.length !== modules.length) {
    throw new ModuleRegistryError(
      "Circular dependency detected among selected modules.",
    );
  }

  return ordered;
}

function validateManifest(raw: unknown, source: string): ModuleManifest {
  if (!raw || typeof raw !== "object") {
    throw new ModuleRegistryError(`Invalid module.json at ${source}`);
  }
  const data = raw as Record<string, unknown>;
  if (typeof data.name !== "string" || !data.name.trim()) {
    throw new ModuleRegistryError(`${source}: "name" is required`);
  }
  if (typeof data.version !== "string") {
    throw new ModuleRegistryError(`${source}: "version" is required`);
  }
  if (typeof data.description !== "string") {
    throw new ModuleRegistryError(`${source}: "description" is required`);
  }
  if (!Array.isArray(data.dependencies)) {
    throw new ModuleRegistryError(`${source}: "dependencies" must be an array`);
  }
  return data as unknown as ModuleManifest;
}
