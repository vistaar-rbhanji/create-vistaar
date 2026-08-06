/**
 * Stable module installer API (Phase 10).
 *
 * Architectural decision:
 * This contract must remain unchanged when local modules/auth later becomes
 * @vistaar/auth — only the discovery source changes, never install(context).
 */

import type { ProjectPaths } from "../generators/types.js";
import type {
  TemplateEngine,
  TemplateVariables,
} from "../template-engine/index.js";
import type { ProjectConfig } from "../types/index.js";

/** When this predicate matches ProjectConfig, the module is auto-installed. */
export interface ModuleEnabledWhen {
  readonly field: string;
  readonly equals: boolean | string | number | null;
}

export interface ModuleNpmPackageSet {
  readonly dependencies?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
}

export interface ModuleTemplateFolders {
  readonly frontend?: string | null;
  readonly backend?: string | null;
  readonly root?: string | null;
  readonly [target: string]: string | null | undefined;
}

export interface ModulePostInstallCommand {
  readonly cwd: string;
  readonly command: string;
  readonly args?: readonly string[];
}

export interface ModuleEnvExample {
  readonly frontend?: readonly string[];
  readonly backend?: readonly string[];
  readonly root?: readonly string[];
}

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
 * module.json — single source of truth for module metadata.
 * Never hardcode module names/versions in the CLI.
 */
export interface ModuleManifest {
  readonly name: string;
  readonly displayName?: string;
  readonly version: string;
  readonly description: string;
  /** Backend ids this module supports (e.g. express, fastapi). */
  readonly compatibleWith?: readonly string[];
  readonly dependencies: readonly string[];
  readonly npmPackages?: {
    readonly frontend?: ModuleNpmPackageSet;
    readonly backend?: ModuleNpmPackageSet;
  };
  readonly postInstallCommands?: readonly ModulePostInstallCommand[];
  readonly templateFolders?: ModuleTemplateFolders;
  readonly enabledWhen?: ModuleEnabledWhen;
  readonly envExample?: ModuleEnvExample;
  readonly features?: readonly string[];
  readonly summaryTitle?: string;
  readonly variants?: readonly ModuleVariant[];
}

/**
 * Context passed to every module's install().
 * Same shape whether invoked from create-vistaar generate or future vistaar add.
 */
export interface ModuleContext {
  readonly projectPath: string;
  readonly paths: ProjectPaths;
  readonly config: ProjectConfig;
  readonly stack: {
    readonly frontend: ProjectConfig["frontend"];
    readonly backend: ProjectConfig["backend"];
    readonly language: ProjectConfig["language"];
    readonly database: ProjectConfig["database"];
    readonly orm: ProjectConfig["orm"];
    readonly uiFramework: ProjectConfig["uiFramework"];
  };
  readonly variables: TemplateVariables;
  readonly engine: TemplateEngine;
  /** Absolute path to this module's root (module.json + templates/). */
  readonly moduleRoot: string;
  readonly manifest: ModuleManifest;
  /**
   * Shared helpers injected by the registry/generator so module install.js
   * files do not import package internals (stable for future @vistaar/*).
   */
  readonly helpers: {
    readonly standardInstall: (context: ModuleContext) => Promise<void>;
  };
}

export type ModuleInstallFn = (context: ModuleContext) => Promise<void>;

export interface ModuleInstaller {
  install(context: ModuleContext): Promise<void>;
}

/** A discovered module ready for install. */
export interface RegisteredModule {
  readonly manifest: ModuleManifest;
  readonly rootDir: string;
  readonly install: ModuleInstallFn;
}

/**
 * @deprecated Alias for RegisteredModule — kept so generators/installers
 * that still reference LoadedModule keep compiling during the migration.
 */
export type LoadedModule = RegisteredModule;
