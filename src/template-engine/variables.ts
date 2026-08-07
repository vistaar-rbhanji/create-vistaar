/**
 * Template variable helpers.
 *
 * Architectural decision:
 * Delimiter syntax (`{{KEY}}`) is centralized here so every copy path —
 * file bodies and renamed files — stays consistent. Generators build the
 * variable map from ProjectConfig; they never splice strings by hand.
 *
 * Phase 7 expands the map with stack metadata so AppInfo seeds and the
 * Welcome Dashboard never hardcode CLI answers in application source.
 */

import type { ProjectConfig } from "../types/index.js";
import type { TemplateVariables } from "./types.js";

/** Matches `{{TOKEN}}` with optional inner whitespace. */
const VARIABLE_PATTERN = /\{\{\s*([A-Z0-9_]+)\s*\}\}/g;

/**
 * Replace all `{{KEY}}` tokens in `source` using `variables`.
 * Unknown keys are left unchanged so incomplete maps fail visibly in output.
 */
export function replaceTemplateVariables(
  source: string,
  variables: TemplateVariables | Record<string, string>,
): string {
  return source.replace(VARIABLE_PATTERN, (match, key: string) => {
    if (Object.prototype.hasOwnProperty.call(variables, key)) {
      return variables[key] ?? match;
    }
    return match;
  });
}

/** NPM-safe package name derived from the user-facing project name. */
export function toPackageName(projectName: string): string {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Database / schema name derived from the project name. */
export function toDbName(projectName: string): string {
  return toPackageName(projectName).replace(/[.-]/g, "_");
}

function labelFrontend(_config: ProjectConfig): string {
  return "React";
}

function labelBackend(config: ProjectConfig): string {
  switch (config.backend) {
    case "express":
      return "Express";
    case "fastapi":
      return "FastAPI";
    case "none":
      return "None";
    default: {
      const _exhaustive: never = config.backend;
      return _exhaustive;
    }
  }
}

function labelDatabase(config: ProjectConfig): string {
  switch (config.database) {
    case "postgresql":
      return "PostgreSQL";
    case "mongodb":
      return "MongoDB";
    case "none":
      return "None";
    default: {
      const _exhaustive: never = config.database;
      return _exhaustive;
    }
  }
}

function labelOrm(config: ProjectConfig): string {
  if (!config.orm) {
    return "None";
  }
  switch (config.orm) {
    case "prisma":
      return "Prisma";
    case "drizzle":
      return "Drizzle";
    case "mongoose":
      return "Mongoose";
    default: {
      const _exhaustive: never = config.orm;
      return _exhaustive;
    }
  }
}

function labelUi(config: ProjectConfig): string {
  switch (config.uiFramework) {
    case "shadcn":
      return "ShadCN";
    case "bootstrap":
      return "Bootstrap";
    case "material-ui":
      return "Material UI";
    default: {
      const _exhaustive: never = config.uiFramework;
      return _exhaustive;
    }
  }
}

/**
 * Concrete persistence driver embedded in backend templates.
 * Keeps FastAPI on Python clients while Express uses ORM or native drivers.
 */
export function resolveDbDriver(config: ProjectConfig): string {
  if (config.database === "none" || config.backend === "none") {
    return "file";
  }

  if (config.backend === "fastapi") {
    return config.database === "mongodb" ? "motor" : "sqlalchemy";
  }

  // Express — prefer explicit ORM, else native drivers
  if (config.orm === "prisma") {
    return "prisma";
  }
  if (config.orm === "drizzle") {
    return "drizzle";
  }
  if (config.orm === "mongoose") {
    return "mongoose";
  }

  // No ORM
  if (config.database === "mongodb") {
    return "mongodb";
  }
  if (config.database === "postgresql") {
    return "pg";
  }

  return "file";
}

/** Build the standard variable map from a resolved ProjectConfig. */
export function createTemplateVariables(
  config: ProjectConfig,
): TemplateVariables {
  const packageName = toPackageName(config.projectName);
  const createdAt = new Date().toISOString();
  const dbDriver = resolveDbDriver(config);

  return {
    PROJECT_NAME: config.projectName.trim(),
    PACKAGE_NAME: packageName,
    DB_NAME: toDbName(config.projectName),

    FRONTEND: labelFrontend(config),
    BACKEND: labelBackend(config),
    DATABASE: labelDatabase(config),
    ORM: labelOrm(config),
    UI_FRAMEWORK: labelUi(config),
    UI_FRAMEWORK_SLUG: config.uiFramework,
    AUTHENTICATION:
      config.authentication === "none" ? "Disabled" : "Base Auth",
    AUTHENTICATION_PROVIDER: config.authentication,
    DOCKER: config.docker ? "Enabled" : "Disabled",
    AUTHENTICATION_BOOL:
      config.authentication === "none" ? "false" : "true",
    DOCKER_BOOL: config.docker ? "true" : "false",
    AUTH_API_URL: "http://localhost:5000",
    AUTH_API_PORT: "5000",
    CREATED_AT: createdAt,

    LANGUAGE: config.language,
    DB_DRIVER: dbDriver,
    API_URL: "http://localhost:3000",
    FRONTEND_URL: "http://localhost:5173",
    BACKEND_PORT: "3000",
  };
}
