/**
 * Core configuration types for create-vistaar.
 *
 * Architectural decision:
 * All user choices are modeled as discriminated unions / literal types rather
 * than free-form strings. This gives us compile-time exhaustiveness checking
 * when generators and installers are added in later phases, and keeps the
 * system configuration-driven instead of sprinkled with magic strings.
 */

/** Supported frontend frameworks. Extensible — add values here, then wire a template. */
export type FrontendFramework = "react";

/** Project language for generated source. */
export type ProjectLanguage = "typescript" | "javascript";

/** UI component libraries available for the frontend. */
export type UiFramework = "shadcn" | "bootstrap" | "material-ui";

/**
 * Backend runtime options.
 * `none` is an explicit choice so generators can short-circuit cleanly
 * instead of treating an undefined backend as an error.
 */
export type BackendFramework = "express" | "fastapi" | "none";

/** Database engine options. `none` skips DB / ORM scaffolding. */
export type DatabaseEngine = "postgresql" | "mongodb" | "none";

/**
 * ORM / ODM choices.
 * Not every ORM is valid for every database (e.g. Mongoose → MongoDB).
 * Compatibility is enforced by the prompt layer via a registry map —
 * this type remains the full set of supported adapters for type safety.
 */
export type OrmAdapter = "prisma" | "drizzle" | "mongoose";

/**
 * Authentication provider selected at create time.
 * `none` — do not install auth files, deps, env, or routes.
 * `base-auth` — install from modules/base-auth (Express + PostgreSQL email OTP).
 */
export type AuthProvider = "none" | "base-auth";

/**
 * Initial Super Admin collected at create time when Base Auth is enabled.
 * Password is validated during prompts but never stored on disk (OTP login).
 */
export interface InitialAdminConfig {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
}

/**
 * The complete project configuration collected from interactive prompts.
 *
 * This object is the single source of truth passed to generators, template
 * engines, and installers in future phases. Keeping it immutable (readonly)
 * prevents accidental mutation as it flows through the pipeline.
 *
 * Extension point: future phases can widen this interface with optional
 * `modules` / `plugins` fields without breaking existing consumers.
 */
export interface ProjectConfig {
  /** Directory / package name for the generated project. */
  readonly projectName: string;

  readonly frontend: FrontendFramework;
  readonly language: ProjectLanguage;
  readonly uiFramework: UiFramework;
  readonly backend: BackendFramework;
  readonly database: DatabaseEngine;

  /**
   * Selected ORM, or `null` when no database was chosen.
   * Using `null` (not optional) makes the "skipped" state explicit in types.
   */
  readonly orm: OrmAdapter | null;

  readonly authentication: AuthProvider;

  /**
   * Pending Super Admin for seed after the database is available.
   * `null` when authentication is none or the user skipped collection.
   */
  readonly initialAdmin: InitialAdminConfig | null;

  readonly docker: boolean;
  readonly git: boolean;
  readonly husky: boolean;
  readonly eslintPrettier: boolean;
}

/**
 * Partial config used while prompts are still running.
 * Generators must never receive this — only a fully resolved ProjectConfig.
 */
export type PartialProjectConfig = Partial<ProjectConfig>;
