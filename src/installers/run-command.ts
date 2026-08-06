/**
 * Thin execa wrapper with structured logging.
 *
 * Architectural decision:
 * One place owns command formatting, cwd, and error normalization so individual
 * installers stay declarative (`runCommand('npm', ['install'], { cwd })`).
 */

import { execa, ExecaError } from "execa";

import { logger } from "../utils/index.js";

export interface RunCommandOptions {
  readonly cwd: string;
  /** When true, stream child stdio to the terminal (default: false / piped). */
  readonly inherit?: boolean;
}

export interface CommandResult {
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number;
}

export async function runCommand(
  file: string,
  args: readonly string[],
  options: RunCommandOptions,
): Promise<CommandResult> {
  const pretty = `$ ${file} ${args.join(" ")}`;
  logger.info(`  ${pretty}`);
  logger.info(`    cwd: ${options.cwd}`);

  try {
    const result = await execa(file, args, {
      cwd: options.cwd,
      stdio: options.inherit ? "inherit" : "pipe",
      // Windows resolves npm.cmd / git.exe more reliably with shell for .cmd shims.
      shell: process.platform === "win32",
    });

    return {
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
      exitCode: result.exitCode ?? 0,
    };
  } catch (error) {
    const message = formatExecError(error);
    throw new Error(`${pretty}\n${message}`);
  }
}

function formatExecError(error: unknown): string {
  if (error instanceof ExecaError) {
    const stderr = (error.stderr as string | undefined)?.trim();
    const stdout = (error.stdout as string | undefined)?.trim();
    const parts = [
      `exit code ${error.exitCode ?? "unknown"}`,
      stderr ? `stderr: ${stderr}` : null,
      stdout ? `stdout: ${stdout}` : null,
      error.shortMessage,
    ].filter(Boolean);
    return parts.join("\n");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
