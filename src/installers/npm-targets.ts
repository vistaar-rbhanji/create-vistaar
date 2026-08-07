/**
 * Discovers package.json directories that should receive `npm install`.
 */

import path from "node:path";

import fs from "fs-extra";

import type { ProjectPaths } from "../generators/index.js";

export async function findNpmProjectDirs(
  paths: ProjectPaths,
): Promise<string[]> {
  const candidates = [
    paths.frontend,
    paths.backend,
    // Base Auth ships as a sibling Express app; include when present.
    path.join(paths.root, "auth-api"),
  ].filter((dir): dir is string => dir !== null);

  const dirs: string[] = [];
  for (const dir of candidates) {
    const pkg = path.join(dir, "package.json");
    if (await fs.pathExists(pkg)) {
      dirs.push(dir);
    }
  }

  return dirs;
}
