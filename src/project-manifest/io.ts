/**
 * Read / write / detect vistaar.json for an existing project.
 */

import path from "node:path";

import fs from "fs-extra";

import type { ProjectConfig } from "../types/index.js";
import {
  VISTAAR_MANIFEST_VERSION,
  type VistaarProjectManifest,
} from "./types.js";

export const MANIFEST_FILENAME = "vistaar.json";

export function manifestPath(projectRoot: string): string {
  return path.join(projectRoot, MANIFEST_FILENAME);
}

export async function hasVistaarManifest(
  projectRoot: string,
): Promise<boolean> {
  return fs.pathExists(manifestPath(projectRoot));
}

/**
 * A directory is a Vistaar project when vistaar.json exists,
 * or (legacy fallback) frontend/ + root package.json are present.
 */
export async function isVistaarProject(projectRoot: string): Promise<boolean> {
  if (await hasVistaarManifest(projectRoot)) {
    return true;
  }
  const frontend = path.join(projectRoot, "frontend");
  const pkg = path.join(projectRoot, "package.json");
  return (await fs.pathExists(frontend)) && (await fs.pathExists(pkg));
}

export async function readVistaarManifest(
  projectRoot: string,
): Promise<VistaarProjectManifest | null> {
  const file = manifestPath(projectRoot);
  if (!(await fs.pathExists(file))) {
    return null;
  }
  const raw = (await fs.readJson(file)) as VistaarProjectManifest;
  return raw;
}

export async function writeVistaarManifest(
  projectRoot: string,
  manifest: VistaarProjectManifest,
): Promise<void> {
  await fs.writeJson(manifestPath(projectRoot), manifest, { spaces: 2 });
}

/** Build a manifest snapshot from a resolved ProjectConfig. */
export function manifestFromProjectConfig(
  config: ProjectConfig,
  modules: Record<string, { name: string; version: string }> = {},
): VistaarProjectManifest {
  return {
    version: VISTAAR_MANIFEST_VERSION,
    project: { name: config.projectName },
    frontend: {
      framework: config.frontend,
      language: config.language,
      ui: config.uiFramework,
    },
    backend:
      config.backend === "none" ? null : { framework: config.backend },
    database:
      config.database === "none" ? null : { type: config.database },
    orm: config.orm ? { name: config.orm } : null,
    modules: {
      ...modules,
      ...(config.authentication === "base-auth"
        ? {
            auth: {
              name: "base-auth",
              version: "2.0.0",
            },
          }
        : {}),
    },
  };
}

/** Map manifest (+ optional overrides) into a full ProjectConfig. */
export function projectConfigFromManifest(
  manifest: VistaarProjectManifest,
  overrides: Partial<ProjectConfig> = {},
): ProjectConfig {
  const authentication =
    overrides.authentication ??
    (manifest.modules.auth ? "base-auth" : "none");

  return {
    projectName: overrides.projectName ?? manifest.project.name,
    frontend: overrides.frontend ?? manifest.frontend.framework,
    language: overrides.language ?? manifest.frontend.language,
    uiFramework: overrides.uiFramework ?? manifest.frontend.ui,
    backend:
      overrides.backend ??
      (manifest.backend ? manifest.backend.framework : "none"),
    database:
      overrides.database ??
      (manifest.database ? manifest.database.type : "none"),
    orm:
      overrides.orm !== undefined
        ? overrides.orm
        : manifest.orm
          ? manifest.orm.name
          : null,
    authentication,
    docker: overrides.docker ?? false,
    git: overrides.git ?? false,
    husky: overrides.husky ?? false,
    eslintPrettier: overrides.eslintPrettier ?? false,
  };
}

/**
 * Infer a manifest for legacy projects that predate vistaar.json.
 * Conservative: only marks what clearly exists on disk.
 */
export async function inferVistaarManifest(
  projectRoot: string,
): Promise<VistaarProjectManifest> {
  const rootPkg = (await fs.readJson(
    path.join(projectRoot, "package.json"),
  )) as { name?: string };
  const frontendPkgPath = path.join(projectRoot, "frontend", "package.json");
  const frontendPkg = (await fs.readJson(frontendPkgPath)) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  const deps = {
    ...(frontendPkg.dependencies ?? {}),
    ...(frontendPkg.devDependencies ?? {}),
  };

  let ui: VistaarProjectManifest["frontend"]["ui"] = "shadcn";
  if (deps.bootstrap) {
    ui = "bootstrap";
  } else if (deps["@mui/material"]) {
    ui = "material-ui";
  }

  const hasTsconfig = await fs.pathExists(
    path.join(projectRoot, "frontend", "tsconfig.json"),
  );
  const language = hasTsconfig ? "typescript" : "javascript";

  const hasBackend = await fs.pathExists(path.join(projectRoot, "backend"));
  let backend: VistaarProjectManifest["backend"] = null;
  if (hasBackend) {
    if (
      await fs.pathExists(path.join(projectRoot, "backend", "app", "main.py"))
    ) {
      backend = { framework: "fastapi" };
    } else {
      backend = { framework: "express" };
    }
  }

  let database: VistaarProjectManifest["database"] = null;
  let orm: VistaarProjectManifest["orm"] = null;
  if (await fs.pathExists(path.join(projectRoot, "database"))) {
    database = { type: "postgresql" };
  }
  if (hasBackend) {
    if (await fs.pathExists(path.join(projectRoot, "backend", "prisma"))) {
      database = database ?? { type: "postgresql" };
      orm = { name: "prisma" };
    } else if (
      await fs.pathExists(path.join(projectRoot, "backend", "drizzle"))
    ) {
      database = database ?? { type: "postgresql" };
      orm = { name: "drizzle" };
    } else if (
      await fs.pathExists(
        path.join(projectRoot, "backend", "src", "db-mongoose.js"),
      )
    ) {
      database = { type: "mongodb" };
      orm = { name: "mongoose" };
    }
  }

  const modules: VistaarProjectManifest["modules"] = {};
  const hasAuth =
    (await fs.pathExists(path.join(projectRoot, "auth-api"))) ||
    (await fs.pathExists(path.join(projectRoot, "frontend", "src", "auth")));
  if (hasAuth) {
    modules.auth = { name: "base-auth", version: "2.0.0" };
  }

  const name =
    rootPkg.name?.replace(/-root$/i, "") ||
    path.basename(projectRoot) ||
    "vistaar-app";

  return {
    version: VISTAAR_MANIFEST_VERSION,
    project: { name },
    frontend: { framework: "react", language, ui },
    backend,
    database,
    orm,
    modules,
  };
}

export async function loadOrInferManifest(
  projectRoot: string,
): Promise<VistaarProjectManifest> {
  const existing = await readVistaarManifest(projectRoot);
  if (existing) {
    return existing;
  }
  return inferVistaarManifest(projectRoot);
}
