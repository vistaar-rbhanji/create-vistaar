/**
 * Regenerates `scripts/lib/stack.js` from the current ProjectConfig.
 *
 * Source of truth: vistaar.json / ProjectConfig (not CLI history, not folder sniffing).
 * Used by create and management commands (`add auth`, future remove/add) so root
 * scripts always see the live stack.
 */

import path from "node:path";

import fs from "fs-extra";

import type { ProjectConfig } from "../types/index.js";
import { createTemplateVariables } from "../template-engine/index.js";

export const STACK_FILE_RELATIVE = path.join("scripts", "lib", "stack.js");

/** Absolute path to stack.js inside a generated project. */
export function stackFilePath(projectRoot: string): string {
  return path.join(projectRoot, STACK_FILE_RELATIVE);
}

/**
 * Render the full `stack.js` source for the given config.
 * Formatting matches templates/project-root/scripts/lib/stack.js.
 */
export function renderStackJs(config: ProjectConfig): string {
  const v = createTemplateVariables(config);

  return `// Regenerated from project configuration (vistaar.json / ProjectConfig).
// Root scripts use this file as the live stack snapshot — do not edit by hand
// unless you know the next create-vistaar add/remove will overwrite it.
export const PROJECT_NAME = ${jsString(v.PROJECT_NAME)};
export const BACKEND = ${jsString(v.BACKEND)};
export const DATABASE = ${jsString(v.DATABASE)};
export const DB_DRIVER = ${jsString(v.DB_DRIVER)};
export const ORM = ${jsString(v.ORM)};
export const DB_NAME = ${jsString(v.DB_NAME)};
export const BACKEND_PORT = ${jsString(v.BACKEND_PORT)};
export const API_URL = ${jsString(v.API_URL)};
export const FRONTEND_URL = ${jsString(v.FRONTEND_URL)};
export const DOCKER_ENABLED = ${jsString(v.DOCKER_BOOL)} === "true";
export const AUTHENTICATION_ENABLED = ${jsString(v.AUTHENTICATION_BOOL)} === "true";

export const isNodeBackend = BACKEND === "Express";
export const isPythonBackend = BACKEND === "FastAPI";
export const databaseRequired = DATABASE !== "None";
`;
}

/**
 * Write (overwrite) `scripts/lib/stack.js` from ProjectConfig.
 * Creates `scripts/lib` when missing (e.g. incomplete legacy projects).
 *
 * @returns Absolute path written
 */
export async function writeStackFile(
  projectRoot: string,
  config: ProjectConfig,
): Promise<string> {
  const filePath = stackFilePath(projectRoot);
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, renderStackJs(config), "utf8");
  return filePath;
}

function jsString(value: string): string {
  return JSON.stringify(value ?? "");
}
