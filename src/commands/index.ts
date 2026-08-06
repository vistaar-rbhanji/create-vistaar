/**
 * Command registry — pure data, no Commander.
 *
 * Creation and management catalogs stay separate so create-vistaar and vistaar
 * can import only what they need (and later split into two packages cleanly).
 */

import { addCommand } from "./add/index.js";
import { createCommand } from "./create/index.js";
import { doctorCommand } from "./doctor/index.js";
import { generateCommand } from "./generate/index.js";
import { updateCommand } from "./update/index.js";
import type { CliCommand } from "./types.js";

export type {
  CliCommand,
  CommandCategory,
  CommandContext,
} from "./types.js";
export { createContext } from "./types.js";

export { createCommand, execute as executeCreate } from "./create/index.js";
export { doctorCommand, execute as executeDoctor } from "./doctor/index.js";
export { addCommand, execute as executeAdd } from "./add/index.js";
export {
  generateCommand,
  execute as executeGenerate,
} from "./generate/index.js";
export { updateCommand, execute as executeUpdate } from "./update/index.js";
export { FUTURE_ADD_MODULES, printComingSoon } from "./shared/index.js";

/** Project creation commands (Version 1 — create-vistaar). */
export const creationCommands: readonly CliCommand[] = [createCommand];

/** Project management commands (Version 2+ — vistaar). */
export const managementCommands: readonly CliCommand[] = [
  doctorCommand,
  addCommand,
  generateCommand,
  updateCommand,
];

/** Full catalog for tooling / docs. */
export const allCommands: readonly CliCommand[] = [
  ...creationCommands,
  ...managementCommands,
];

/** @deprecated Use executeCreate — kept briefly for older imports. */
export { execute as runCreateCommand } from "./create/index.js";
