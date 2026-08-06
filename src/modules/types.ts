/**
 * Module manifest contracts — fully driven by `module.json` on disk.
 *
 * Architectural decision:
 * The CLI never hardcodes module names, npm packages, or features. Selection
 * uses `enabledWhen` against ProjectConfig; content comes from each module's
 * folder + manifest. Variants let one module adapt to language/backend without
 * TypeScript branches. Adding RBAC / S3 / email is drop-a-folder only.
 */

/** When this predicate matches ProjectConfig, the module is auto-applied. */
export interface ModuleEnabledWhen {
  /**
   * Key on ProjectConfig (e.g. "authentication").
   * Compared with loose equality against `equals`.
   */
  readonly field: string;
  readonly equals: boolean | string | number | null;
}

export interface ModuleNpmPackageSet {
  readonly dependencies?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
}

/**
 * Declares which subfolders inside the module map onto project targets.
 * Values are relative paths under the module root.
 * Use `null` in a variant to skip a target (e.g. backend when backend is none).
 */
export interface ModuleTemplateFolders {
  readonly frontend?: string | null;
  readonly backend?: string | null;
  readonly [target: string]: string | null | undefined;
}

export interface ModulePostInstallCommand {
  /** Relative to project root, or "frontend" / "backend" / "." */
  readonly cwd: string;
  readonly command: string;
  readonly args?: readonly string[];
}

export interface ModuleEnvExample {
  readonly frontend?: readonly string[];
  readonly backend?: readonly string[];
  readonly root?: readonly string[];
}

/**
 * Conditional overrides merged when every `when` entry matches ProjectConfig.
 * Enables one module (auth, rbac, …) to ship TS/JS or Express/FastAPI trees
 * without hardcoding those choices in the CLI.
 */
export interface ModuleVariant {
  readonly when: Readonly<Record<string, unknown>>;
  readonly templateFolders?: ModuleTemplateFolders;
  readonly npmPackages?: {
    readonly frontend?: ModuleNpmPackageSet;
    readonly backend?: ModuleNpmPackageSet;
  };
  readonly envExample?: ModuleEnvExample;
  readonly features?: readonly string[];
  readonly postInstallCommands?: readonly ModulePostInstallCommand[];
}

/**
 * Shape of templates/modules/<id>/module.json
 */
export interface ModuleManifest {
  readonly name: string;
  readonly description: string;
  /** Other module names that must also be selected. */
  readonly dependencies: readonly string[];
  readonly npmPackages: {
    readonly frontend?: ModuleNpmPackageSet;
    readonly backend?: ModuleNpmPackageSet;
  };
  readonly postInstallCommands: readonly ModulePostInstallCommand[];
  readonly templateFolders: ModuleTemplateFolders;
  /** Optional auto-enable rule — omit for manual/future modules. */
  readonly enabledWhen?: ModuleEnabledWhen;
  /** Lines appended to .env.example files. */
  readonly envExample?: ModuleEnvExample;
  /** Human-readable feature list printed after apply (no hardcoded copy). */
  readonly features?: readonly string[];
  /** Banner title for the feature summary (defaults to Module "<name>" features). */
  readonly summaryTitle?: string;
  /** Stack-specific overrides — all matching variants are deep-merged in order. */
  readonly variants?: readonly ModuleVariant[];
}

/** A manifest plus its absolute directory on disk. */
export interface LoadedModule {
  readonly manifest: ModuleManifest;
  readonly rootDir: string;
}

/** Manifest fields after variants are applied for a concrete ProjectConfig. */
export interface ResolvedModulePlan {
  readonly templateFolders: ModuleTemplateFolders;
  readonly npmPackages: ModuleManifest["npmPackages"];
  readonly envExample?: ModuleEnvExample;
  readonly features: readonly string[];
  readonly postInstallCommands: readonly ModulePostInstallCommand[];
  readonly summaryTitle: string;
}
