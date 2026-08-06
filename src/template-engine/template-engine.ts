/**
 * TemplateEngine — find, validate, copy, and interpolate template trees.
 *
 * Architectural decisions:
 * 1. Single Responsibility: only filesystem template operations. Generators
 *    decide *which* templates and *where*; installers handle npm/git/docker.
 * 2. Dependency Inversion: FileSystemPort is injected so unit tests never
 *    touch disk and alternate roots (monorepo vs published package) are easy.
 * 3. Copy-then-transform: fs-extra copies the tree first, then we walk the
 *    destination to replace `{{VARS}}` in contents and file names. That keeps
 *    source templates pristine and avoids partial writes on failure mid-copy
 *    when overwrite is disabled (we validate destination before copying).
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import { FsExtraFileSystem } from "./file-system.js";
import type {
  CopyTemplateOptions,
  FileSystemPort,
  TemplateId,
  TemplateVariables,
} from "./types.js";
import {
  TemplateDestinationError,
  TemplateNotFoundError,
} from "./types.js";
import { replaceTemplateVariables } from "./variables.js";

export interface TemplateEngineOptions {
  /**
   * Absolute path to the `templates/` directory.
   * Defaults to the package `templates/` folder next to compiled `dist/`.
   */
  readonly templatesRoot?: string;

  /** Injected filesystem; defaults to fs-extra adapter. */
  readonly fs?: FileSystemPort;
}

/** Extensions treated as binary — skipped during content substitution. */
const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".pdf",
  ".zip",
  ".gz",
  ".7z",
  ".exe",
  ".dll",
  ".so",
  ".dylib",
]);

function defaultTemplatesRoot(): string {
  // dist/template-engine/template-engine.js → ../../templates
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, "../../templates");
}

export class TemplateEngine {
  private readonly templatesRoot: string;
  private readonly fs: FileSystemPort;

  constructor(options: TemplateEngineOptions = {}) {
    this.templatesRoot = options.templatesRoot ?? defaultTemplatesRoot();
    this.fs = options.fs ?? new FsExtraFileSystem();
  }

  /** Absolute path to the templates root this engine uses. */
  getRoot(): string {
    return this.templatesRoot;
  }

  /**
   * Resolve a template id (`frontend/react-ts`) to an absolute directory path.
   * Does not check existence — call `exists` / `validate` for that.
   */
  resolve(templateId: TemplateId): string {
    const normalized = templateId.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
    if (!normalized || normalized.includes("..")) {
      throw new TemplateNotFoundError(templateId, normalized);
    }
    return path.join(this.templatesRoot, ...normalized.split("/"));
  }

  /** Whether a template directory exists on disk. */
  async exists(templateId: TemplateId): Promise<boolean> {
    const resolved = this.resolve(templateId);
    if (!(await this.fs.pathExists(resolved))) {
      return false;
    }
    const stats = await this.fs.stat(resolved);
    return stats.isDirectory();
  }

  /**
   * Throw TemplateNotFoundError when the template is missing.
   * Prefer this at the start of a generation pipeline (fail fast).
   */
  async validate(templateId: TemplateId): Promise<void> {
    if (!(await this.exists(templateId))) {
      throw new TemplateNotFoundError(templateId, this.resolve(templateId));
    }
  }

  /** Validate many ids; throws on the first missing template. */
  async validateAll(templateIds: readonly TemplateId[]): Promise<void> {
    for (const id of templateIds) {
      await this.validate(id);
    }
  }

  /**
   * List immediate child template folders under a category
   * (e.g. `frontend` → `react-ts`, `react-js`).
   */
  async list(category?: string): Promise<string[]> {
    const dir = category
      ? path.join(this.templatesRoot, category)
      : this.templatesRoot;

    if (!(await this.fs.pathExists(dir))) {
      return [];
    }

    const entries = await this.fs.readdir(dir);
    const folders: string[] = [];

    for (const entry of entries) {
      if (entry.startsWith(".")) {
        continue;
      }
      const full = path.join(dir, entry);
      const stats = await this.fs.stat(full);
      if (stats.isDirectory()) {
        folders.push(entry);
      }
    }

    return folders.sort();
  }

  /**
   * Copy a template into `destination`, then replace `{{VARS}}` in place.
   * Does not install packages — that belongs to installers/ (later phase).
   */
  async copy(
    templateId: TemplateId,
    options: CopyTemplateOptions,
  ): Promise<void> {
    await this.validate(templateId);
    await this.copyDirectory(this.resolve(templateId), options);
  }

  /**
   * Copy an absolute directory (e.g. a module's `frontend/`) into destination,
   * then apply variable substitution. Used by the module system.
   */
  async copyDirectory(
    sourceDir: string,
    options: CopyTemplateOptions,
  ): Promise<void> {
    const source = path.resolve(sourceDir);
    if (!(await this.fs.pathExists(source))) {
      throw new TemplateNotFoundError(sourceDir, source);
    }
    const stats = await this.fs.stat(source);
    if (!stats.isDirectory()) {
      throw new TemplateNotFoundError(sourceDir, source);
    }

    const destination = path.resolve(options.destination);
    const overwrite = options.overwrite ?? false;

    await this.assertDestinationWritable(destination, overwrite);
    await this.fs.ensureDir(destination);
    await this.fs.copy(source, destination);
    await this.applyVariables(destination, options.variables);
  }

  private async assertDestinationWritable(
    destination: string,
    overwrite: boolean,
  ): Promise<void> {
    if (!(await this.fs.pathExists(destination))) {
      return;
    }

    const stats = await this.fs.stat(destination);
    if (!stats.isDirectory()) {
      throw new TemplateDestinationError(
        `Destination "${destination}" exists and is not a directory.`,
      );
    }

    if (overwrite) {
      return;
    }

    const entries = await this.fs.readdir(destination);
    const meaningful = entries.filter((e) => e !== ".git");
    if (meaningful.length > 0) {
      throw new TemplateDestinationError(
        `Destination "${destination}" is not empty. Pass overwrite: true to allow merging.`,
      );
    }
  }

  /**
   * Walk `root` depth-first: substitute file contents, then rename files/dirs
   * whose names contain `{{VARS}}`.
   */
  private async applyVariables(
    root: string,
    variables: TemplateVariables,
  ): Promise<void> {
    const entries = await this.fs.readdir(root);

    for (const entry of entries) {
      const currentPath = path.join(root, entry);
      const stats = await this.fs.stat(currentPath);

      if (stats.isDirectory()) {
        await this.applyVariables(currentPath, variables);
        await this.renameIfNeeded(root, entry, variables);
        continue;
      }

      if (stats.isFile()) {
        await this.replaceFileContents(currentPath, variables);
        await this.renameIfNeeded(root, entry, variables);
      }
    }
  }

  private async replaceFileContents(
    filePath: string,
    variables: TemplateVariables,
  ): Promise<void> {
    const ext = path.extname(filePath).toLowerCase();
    if (BINARY_EXTENSIONS.has(ext)) {
      return;
    }

    const original = await this.fs.readFile(filePath, "utf8");
    const updated = replaceTemplateVariables(original, variables);

    if (updated !== original) {
      await this.fs.writeFile(filePath, updated);
    }
  }

  private async renameIfNeeded(
    parentDir: string,
    entryName: string,
    variables: TemplateVariables,
  ): Promise<void> {
    const nextName = replaceTemplateVariables(entryName, variables);
    if (nextName === entryName) {
      return;
    }

    const from = path.join(parentDir, entryName);
    const to = path.join(parentDir, nextName);

    // copy+remove avoids relying on a rename API on the port.
    await this.fs.copy(from, to);
    await this.fs.remove(from);
  }
}
