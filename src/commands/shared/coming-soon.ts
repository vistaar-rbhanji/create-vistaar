/**
 * Shared helpers for management commands that are not implemented yet.
 */

import chalk from "chalk";

import { logger } from "../../utils/index.js";

const COMING_SOON =
  "🚧 This feature will be available in an upcoming release.";

/**
 * Print a consistent "coming soon" banner for vistaar add|generate|update.
 * Keeps UX stable while Version 2 (project management) is built.
 */
export function printComingSoon(feature: string, hint?: string): void {
  logger.blank();
  console.log(chalk.yellow(`  ${feature}`));
  console.log(chalk.bold(`  ${COMING_SOON}`));
  if (hint) {
    logger.blank();
    logger.info(`  ${hint}`);
  }
  logger.blank();
  logger.info("  Roadmap: Project Generator → Project Management CLI → Module Marketplace");
  logger.blank();
}

/** Future module ids that `vistaar add <module>` will support. */
export const FUTURE_ADD_MODULES = [
  "auth",
  "rbac",
  "aws-s3",
  "email",
  "payments",
  "notifications",
  "file-uploads",
  "swagger",
  "redis",
  "caching",
] as const;

export type FutureAddModule = (typeof FUTURE_ADD_MODULES)[number];
