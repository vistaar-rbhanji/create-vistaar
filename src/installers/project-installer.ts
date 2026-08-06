/**
 * ProjectInstaller — runs selected installers after generation.
 *
 * Architectural decisions:
 * 1. Failures are caught per installer (graceful degradation). Scaffolding
 *    already succeeded; a failed husky setup must not erase that work.
 * 2. Dependency injection of Installer[] keeps Open/Closed — Phase 5 modules
 *    can append post-install steps without editing this class.
 * 3. Order is intentional: npm → git → eslint/prettier → husky → db setup → module post-install.
 */

import type { GenerationResult } from "../generators/index.js";
import { logger } from "../utils/index.js";
import { DatabaseSetupInstaller } from "./database-setup-installer.js";
import { EslintPrettierInstaller } from "./eslint-prettier-installer.js";
import { GitInstaller } from "./git-installer.js";
import { HuskyInstaller } from "./husky-installer.js";
import { ModulePostInstallInstaller } from "./module-post-install-installer.js";
import { NpmInstaller } from "./npm-installer.js";
import { printSuccessMessage } from "./success-message.js";
import type {
  InstallationResult,
  Installer,
  InstallerContext,
  InstallerOutcome,
} from "./types.js";

export interface ProjectInstallerOptions {
  readonly installers?: readonly Installer[];
  /** When false, skip the final success banner (useful in tests). */
  readonly printSuccess?: boolean;
}

export class ProjectInstaller {
  private readonly installers: readonly Installer[];
  private readonly printSuccess: boolean;

  constructor(options: ProjectInstallerOptions = {}) {
    this.printSuccess = options.printSuccess ?? true;
    this.installers =
      options.installers ??
      [
        new NpmInstaller(),
        new GitInstaller(),
        new EslintPrettierInstaller(),
        new HuskyInstaller(),
        new DatabaseSetupInstaller(),
        new ModulePostInstallInstaller(),
      ];
  }

  async install(generation: GenerationResult): Promise<InstallationResult> {
    const context: InstallerContext = {
      config: generation.config,
      paths: generation.paths,
      completedGenerators: generation.completedGenerators,
      appliedModules: generation.appliedModules,
    };

    logger.blank();
    logger.title("Running installers");
    logger.blank();

    const outcomes: InstallerOutcome[] = [];

    for (const installer of this.installers) {
      if (!installer.supports(context.config, context)) {
        outcomes.push({
          id: installer.id,
          label: installer.label,
          status: "skipped",
          detail: "not selected",
        });
        logger.info(`  – Skipping ${installer.label} (not selected)`);
        continue;
      }

      logger.info(`→ ${installer.label}`);
      try {
        await installer.install(context);
        outcomes.push({
          id: installer.id,
          label: installer.label,
          status: "success",
        });
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        logger.error(`  ✖ ${installer.label} failed`);
        logger.error(`    ${detail}`);
        outcomes.push({
          id: installer.id,
          label: installer.label,
          status: "failed",
          detail: summarize(detail),
        });
      }
    }

    if (this.printSuccess) {
      printSuccessMessage(generation, outcomes);
    }

    return { outcomes, generation };
  }
}

function summarize(detail: string): string {
  const firstLine = detail.split("\n")[0] ?? detail;
  return firstLine.length > 120 ? `${firstLine.slice(0, 117)}…` : firstLine;
}
