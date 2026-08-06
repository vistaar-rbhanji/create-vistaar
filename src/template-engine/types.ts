/**
 * Template-engine contracts.
 *
 * Architectural decision:
 * Variables are a plain string map keyed by the token body (e.g. PROJECT_NAME),
 * not by the full `{{...}}` form. That keeps callers free of delimiter noise
 * and lets the engine own the replacement syntax in one place.
 */

/** Known placeholders supported out of the box. Custom keys are allowed too. */
export interface TemplateVariables {
  readonly PROJECT_NAME: string;
  readonly PACKAGE_NAME: string;
  readonly DB_NAME: string;
  /** Escape hatch for future phases / plugins. */
  readonly [key: string]: string;
}

/**
 * Relative template id under the templates root.
 * Examples: `frontend/react-ts`, `backend/express`, `ui/shadcn`.
 */
export type TemplateId = string;

export interface CopyTemplateOptions {
  /**
   * Destination directory. Created if missing.
   * Contents of the template are copied *into* this folder.
   */
  readonly destination: string;

  /** Values substituted for `{{KEY}}` tokens in file contents and names. */
  readonly variables: TemplateVariables;

  /**
   * When true, fail if destination already exists and is non-empty.
   * Default: true — avoids silently merging into an existing project.
   */
  readonly overwrite?: boolean;
}

/** Portable filesystem surface used by TemplateEngine (Dependency Inversion). */
export interface FileSystemPort {
  pathExists(target: string): Promise<boolean>;
  ensureDir(target: string): Promise<void>;
  copy(src: string, dest: string): Promise<void>;
  readdir(target: string): Promise<string[]>;
  stat(target: string): Promise<{ isDirectory(): boolean; isFile(): boolean }>;
  readFile(target: string, encoding: "utf8"): Promise<string>;
  writeFile(target: string, contents: string): Promise<void>;
  remove(target: string): Promise<void>;
  emptyDir(target: string): Promise<void>;
}

export class TemplateNotFoundError extends Error {
  constructor(readonly templateId: TemplateId, readonly resolvedPath: string) {
    super(
      `Template "${templateId}" was not found at "${resolvedPath}".`,
    );
    this.name = "TemplateNotFoundError";
  }
}

export class TemplateDestinationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TemplateDestinationError";
  }
}
