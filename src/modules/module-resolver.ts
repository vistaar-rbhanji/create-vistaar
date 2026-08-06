/**
 * Selects which loaded modules apply to a ProjectConfig.
 *
 * Architectural decision:
 * Enablement is data-driven via `module.json` → `enabledWhen`. The CLI maps
 * prompts like Authentication to config fields only; it never names "auth".
 */

import type { ProjectConfig } from "../types/index.js";
import type { LoadedModule } from "./types.js";
import { ModuleLoadError } from "./module-loader.js";

/**
 * Return modules whose `enabledWhen` matches the config, plus their
 * declared dependencies (resolved from the full catalog), in dependency order.
 */
export function resolveModulesForConfig(
  config: ProjectConfig,
  catalog: readonly LoadedModule[],
): LoadedModule[] {
  const byName = new Map(catalog.map((m) => [m.manifest.name, m]));
  const selected = new Map<string, LoadedModule>();

  for (const mod of catalog) {
    if (isEnabled(mod, config)) {
      selected.set(mod.manifest.name, mod);
    }
  }

  // Pull in declared dependencies recursively.
  const queue = [...selected.keys()];
  while (queue.length > 0) {
    const name = queue.pop()!;
    const mod = selected.get(name);
    if (!mod) {
      continue;
    }
    for (const depName of mod.manifest.dependencies) {
      if (selected.has(depName)) {
        continue;
      }
      const dep = byName.get(depName);
      if (!dep) {
        throw new ModuleLoadError(
          `Module "${name}" depends on "${depName}", which is not installed under templates/modules.`,
        );
      }
      selected.set(depName, dep);
      queue.push(depName);
    }
  }

  return topologicalSort([...selected.values()]);
}

function isEnabled(mod: LoadedModule, config: ProjectConfig): boolean {
  const rule = mod.manifest.enabledWhen;
  if (!rule) {
    return false;
  }

  const actual = (config as unknown as Record<string, unknown>)[rule.field];
  return actual === rule.equals;
}

/** Kahn-style sort so dependencies apply before dependents. */
function topologicalSort(modules: LoadedModule[]): LoadedModule[] {
  const names = new Set(modules.map((m) => m.manifest.name));
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const mod of modules) {
    inDegree.set(mod.manifest.name, 0);
    dependents.set(mod.manifest.name, []);
  }

  for (const mod of modules) {
    for (const dep of mod.manifest.dependencies) {
      if (!names.has(dep)) {
        continue;
      }
      inDegree.set(
        mod.manifest.name,
        (inDegree.get(mod.manifest.name) ?? 0) + 1,
      );
      dependents.get(dep)!.push(mod.manifest.name);
    }
  }

  const queue = [...inDegree.entries()]
    .filter(([, deg]) => deg === 0)
    .map(([name]) => name)
    .sort();

  const ordered: LoadedModule[] = [];
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
    throw new ModuleLoadError(
      "Circular dependency detected among selected modules.",
    );
  }

  return ordered;
}
