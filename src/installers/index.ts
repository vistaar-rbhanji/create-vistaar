/**
 * Installers public API.
 *
 * Package-manager detection, dependency installation (execa), Git init,
 * Husky, and ESLint/Prettier setup are side-effectful and live here —
 * outside generators — so scaffolding stays testable without network I/O.
 */

export { DatabaseSetupInstaller } from "./database-setup-installer.js";
export { EnvInstaller } from "./env-installer.js";
export { EslintPrettierInstaller } from "./eslint-prettier-installer.js";
export { GitInstaller } from "./git-installer.js";
export { HuskyInstaller } from "./husky-installer.js";
export { ModulePostInstallInstaller } from "./module-post-install-installer.js";
export { NpmInstaller } from "./npm-installer.js";
export { findNpmProjectDirs } from "./npm-targets.js";
export { ProjectInstaller } from "./project-installer.js";
export type { ProjectInstallerOptions } from "./project-installer.js";
export { runCommand } from "./run-command.js";
export type { CommandResult, RunCommandOptions } from "./run-command.js";
export { printSuccessMessage } from "./success-message.js";
export type {
  InstallationResult,
  Installer,
  InstallerContext,
  InstallerOutcome,
  InstallerStatus,
} from "./types.js";
