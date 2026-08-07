/**
 * Maps ProjectConfig choices → template ids under `templates/`.
 *
 * Architectural decision (Open/Closed):
 * Path conventions live in one registry. Adding `frontend/vue-ts` means
 * extending this map (and dropping a folder under templates/), not editing
 * TemplateEngine. Generators call these helpers; the engine only knows ids.
 */

import type { ProjectConfig } from "../types/index.js";
import type { TemplateId } from "./types.js";

export function resolveFrontendTemplateId(
  config: Pick<ProjectConfig, "frontend" | "language">,
): TemplateId {
  const langSuffix = config.language === "typescript" ? "ts" : "js";
  return `frontend/${config.frontend}-${langSuffix}`;
}

export function resolveBackendTemplateId(
  config: Pick<ProjectConfig, "backend">,
): TemplateId | null {
  if (config.backend === "none") {
    return null;
  }
  return `backend/${config.backend}`;
}

/**
 * Database template folder uses `postgres` while the config value is
 * `postgresql` — keep that translation here, not in the engine.
 */
export function resolveDatabaseTemplateId(
  config: Pick<ProjectConfig, "database">,
): TemplateId | null {
  switch (config.database) {
    case "postgresql":
      return "database/postgres";
    case "mongodb":
      return "database/mongodb";
    case "none":
      return null;
    default: {
      const _exhaustive: never = config.database;
      return _exhaustive;
    }
  }
}

export function resolveUiTemplateId(
  config: Pick<ProjectConfig, "uiFramework">,
): TemplateId {
  return `ui/${config.uiFramework}`;
}

/**
 * ORM template id, or null when no ORM was selected / not applicable.
 * Express + orm prisma|drizzle|mongoose → templates/orm/*.
 * Native drivers (orm null) are handled by NativeDriverGenerator.
 */
export function resolveOrmTemplateId(
  config: Pick<ProjectConfig, "backend" | "database" | "orm">,
): TemplateId | null {
  if (config.backend !== "express") {
    return null;
  }
  if (config.database === "none" || config.orm === null) {
    return null;
  }
  if (config.orm === "mongoose" || config.database === "mongodb") {
    return "orm/mongoose";
  }
  if (config.orm === "drizzle") {
    return "orm/drizzle";
  }
  if (config.orm === "prisma") {
    return "orm/prisma";
  }
  return null;
}

/**
 * All template ids implied by a config, in a stable order.
 * `null` entries (skipped stacks) are omitted.
 */
export function resolveTemplateIds(config: ProjectConfig): TemplateId[] {
  const ids: Array<TemplateId | null> = [
    resolveFrontendTemplateId(config),
    resolveUiTemplateId(config),
    resolveBackendTemplateId(config),
    resolveDatabaseTemplateId(config),
    resolveOrmTemplateId(config),
  ];

  return ids.filter((id): id is TemplateId => id !== null);
}
