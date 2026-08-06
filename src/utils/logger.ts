/**
 * Terminal logging helpers.
 *
 * Architectural decision:
 * Centralize chalk usage so commands stay free of presentation details.
 * When a --json or quiet mode is added later, only this module needs changes.
 */

import chalk from "chalk";

export const logger = {
  info(message: string): void {
    console.log(chalk.cyan(message));
  },
  success(message: string): void {
    console.log(chalk.green(message));
  },
  warn(message: string): void {
    console.log(chalk.yellow(message));
  },
  error(message: string): void {
    console.error(chalk.red(message));
  },
  title(message: string): void {
    console.log(chalk.bold.magenta(message));
  },
  blank(): void {
    console.log();
  },
};
