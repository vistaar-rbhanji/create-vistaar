/**
 * Installer contracts.
 *
 * Architectural decision:
 * Installers are side-effectful (network, git, process spawn) and stay outside
 * generators so scaffolding remains testable without I/O. Each installer is
 * independently `supports()`-gated from ProjectConfig — never run unsolicited.
 */

import type { GenerationResult, ProjectPaths } from "../generators/index.js";
import type { LoadedModule } from "../modules/index.js";
import type { ProjectConfig } from "../types/index.js";

export interface InstallerContext {
  readonly config: ProjectConfig;
  readonly paths: ProjectPaths;
  /** Generators that completed — useful for deciding npm targets. */
  readonly completedGenerators: readonly string[];
  /** Modules applied during generation (for post-install commands). */
  readonly appliedModules: readonly LoadedModule[];
}

export type InstallerStatus = "success" | "skipped" | "failed";

export interface InstallerOutcome {
  readonly id: string;
  readonly label: string;
  readonly status: InstallerStatus;
  readonly detail?: string;
}

export interface Installer {
  readonly id: string;
  readonly label: string;
  /**
   * @param context - Available when deciding at install-time (e.g. modules).
   * Older installers may ignore it and key only off config.
   */
  supports(config: ProjectConfig, context?: InstallerContext): boolean;
  install(context: InstallerContext): Promise<void>;
}

export interface InstallationResult {
  readonly outcomes: readonly InstallerOutcome[];
  readonly generation: GenerationResult;
}
