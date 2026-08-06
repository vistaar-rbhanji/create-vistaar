/**
 * Resolves module.json (+ variants) into a concrete install plan.
 */

import type { ProjectConfig } from "../types/index.js";
import type {
  ModuleEnvExample,
  ModuleManifest,
  ModuleNpmPackageSet,
  ModulePostInstallCommand,
  ModuleTemplateFolders,
  ModuleVariant,
} from "./types.js";

export interface ResolvedModulePlan {
  readonly templateFolders: ModuleTemplateFolders;
  readonly npmPackages: {
    readonly frontend?: ModuleNpmPackageSet;
    readonly backend?: ModuleNpmPackageSet;
  };
  readonly envExample?: ModuleEnvExample;
  readonly features: readonly string[];
  readonly postInstallCommands: readonly ModulePostInstallCommand[];
  readonly summaryTitle: string;
}

export function resolveModulePlan(
  manifest: ModuleManifest,
  config: ProjectConfig,
): ResolvedModulePlan {
  let templateFolders: ModuleTemplateFolders = {
    ...(manifest.templateFolders ?? {}),
  };
  let npmPackages = {
    frontend: { ...manifest.npmPackages?.frontend },
    backend: { ...manifest.npmPackages?.backend },
  };
  let envExample: ModuleEnvExample | undefined = manifest.envExample
    ? { ...manifest.envExample }
    : undefined;
  let features: readonly string[] = [...(manifest.features ?? [])];
  let postInstallCommands: readonly ModulePostInstallCommand[] = [
    ...(manifest.postInstallCommands ?? []),
  ];

  for (const variant of manifest.variants ?? []) {
    if (!variantMatches(variant, config)) {
      continue;
    }
    if (variant.templateFolders) {
      templateFolders = { ...templateFolders, ...variant.templateFolders };
    }
    if (variant.npmPackages?.frontend) {
      npmPackages = {
        ...npmPackages,
        frontend: mergePackageSet(
          npmPackages.frontend,
          variant.npmPackages.frontend,
        ),
      };
    }
    if (variant.npmPackages?.backend) {
      npmPackages = {
        ...npmPackages,
        backend: mergePackageSet(
          npmPackages.backend,
          variant.npmPackages.backend,
        ),
      };
    }
    if (variant.envExample) {
      envExample = mergeEnvExample(envExample, variant.envExample);
    }
    if (variant.features) {
      features = [...features, ...variant.features];
    }
    if (variant.postInstallCommands) {
      postInstallCommands = [
        ...postInstallCommands,
        ...variant.postInstallCommands,
      ];
    }
  }

  const cleanedFolders: Record<string, string> = {};
  for (const [key, value] of Object.entries(templateFolders)) {
    if (typeof value === "string" && value.length > 0) {
      cleanedFolders[key] = value;
    }
  }

  return {
    templateFolders: cleanedFolders,
    npmPackages,
    ...(envExample ? { envExample } : {}),
    features,
    postInstallCommands,
    summaryTitle:
      manifest.summaryTitle ??
      `${manifest.displayName ?? manifest.name} features`,
  };
}

export function isModuleCompatible(
  manifest: ModuleManifest,
  config: ProjectConfig,
): boolean {
  const compatible = manifest.compatibleWith;
  if (!compatible || compatible.length === 0) {
    return true;
  }
  if (config.backend === "none") {
    // Frontend-only modules may still apply; allow if "none" listed or no backend templates.
    return compatible.includes("none") || !manifest.templateFolders?.backend;
  }
  return compatible.includes(config.backend);
}

function variantMatches(
  variant: ModuleVariant,
  config: ProjectConfig,
): boolean {
  const cfg = config as unknown as Record<string, unknown>;
  return Object.entries(variant.when).every(
    ([field, expected]) => cfg[field] === expected,
  );
}

function mergePackageSet(
  base: ModuleNpmPackageSet | undefined,
  overlay: ModuleNpmPackageSet,
): ModuleNpmPackageSet {
  const hasDeps = overlay.dependencies !== undefined;
  const hasDev = overlay.devDependencies !== undefined;
  if (!hasDeps && !hasDev && Object.keys(overlay).length === 0) {
    return {};
  }
  return {
    dependencies: { ...base?.dependencies, ...overlay.dependencies },
    devDependencies: { ...base?.devDependencies, ...overlay.devDependencies },
  };
}

function mergeEnvExample(
  base: ModuleEnvExample | undefined,
  overlay: ModuleEnvExample,
): ModuleEnvExample {
  return {
    frontend: [...(base?.frontend ?? []), ...(overlay.frontend ?? [])],
    backend: [...(base?.backend ?? []), ...(overlay.backend ?? [])],
    root: [...(base?.root ?? []), ...(overlay.root ?? [])],
  };
}
