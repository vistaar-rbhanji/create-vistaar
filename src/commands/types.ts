/**
 * Shared CLI command contracts.
 *
 * Architectural decision (Phase 9):
 * Every command exposes `execute(ctx)` with no dependency on Commander.
 * Entry points (create-vistaar / vistaar) only register commands. The same
 * execute modules can later move into a standalone `vistaar` package unchanged.
 */

export type CommandCategory = "creation" | "management";

/** Runtime context passed into command execute() functions. */
export interface CommandContext {
  /** Working directory for project-management commands. */
  readonly cwd: string;
  /** Positional args after the command name. */
  readonly args: readonly string[];
  /** Parsed flags (Commander options), kept opaque for reuse. */
  readonly options: Readonly<Record<string, unknown>>;
}

/**
 * Reusable command module.
 * Implementations live under commands/<name>/ and must not import Commander.
 */
export interface CliCommand {
  readonly name: string;
  readonly description: string;
  readonly category: CommandCategory;
  execute(context: CommandContext): Promise<void>;
}

export function createContext(
  partial: Partial<CommandContext> = {},
): CommandContext {
  return {
    cwd: partial.cwd ?? process.cwd(),
    args: partial.args ?? [],
    options: partial.options ?? {},
  };
}
