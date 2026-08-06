/**
 * Resolves on-disk paths for a generated project from ProjectConfig.
 */

import path from "node:path";

import type { ProjectConfig } from "../types/index.js";
import type { ProjectPaths } from "./types.js";

export function resolveProjectPaths(
  projectRoot: string,
  config: ProjectConfig,
): ProjectPaths {
  const root = path.resolve(projectRoot);

  return {
    root,
    frontend: path.join(root, "frontend"),
    backend: config.backend === "none" ? null : path.join(root, "backend"),
    database: config.database === "none" ? null : path.join(root, "database"),
  };
}
