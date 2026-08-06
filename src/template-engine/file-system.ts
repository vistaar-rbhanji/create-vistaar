/**
 * fs-extra adapter implementing FileSystemPort.
 *
 * Architectural decision (Dependency Inversion):
 * TemplateEngine depends on FileSystemPort, not on fs-extra directly.
 * Tests can inject an in-memory fake; production uses this adapter.
 */

import fs from "fs-extra";

import type { FileSystemPort } from "./types.js";

export class FsExtraFileSystem implements FileSystemPort {
  pathExists(target: string): Promise<boolean> {
    return fs.pathExists(target);
  }

  ensureDir(target: string): Promise<void> {
    return fs.ensureDir(target);
  }

  copy(src: string, dest: string): Promise<void> {
    return fs.copy(src, dest);
  }

  readdir(target: string): Promise<string[]> {
    return fs.readdir(target);
  }

  async stat(
    target: string,
  ): Promise<{ isDirectory(): boolean; isFile(): boolean }> {
    return fs.stat(target);
  }

  readFile(target: string, encoding: "utf8"): Promise<string> {
    return fs.readFile(target, encoding);
  }

  writeFile(target: string, contents: string): Promise<void> {
    return fs.writeFile(target, contents, "utf8");
  }

  remove(target: string): Promise<void> {
    return fs.remove(target);
  }

  emptyDir(target: string): Promise<void> {
    return fs.emptyDir(target);
  }
}
