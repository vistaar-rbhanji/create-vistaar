/**
 * EnvInstaller — copy `.env.example` → `.env` (never overwrite) and
 * fill safe local-dev secrets where placeholders are obvious.
 */

import crypto from "node:crypto";
import path from "node:path";

import fs from "fs-extra";

import type { ProjectConfig } from "../types/index.js";
import { logger } from "../utils/index.js";
import type { Installer, InstallerContext } from "./types.js";

const SECRET_KEYS = new Set([
  "JWT_SECRET",
  "DB_MASTER_KEY",
  "DB_HASH_KEY",
  "SESSION_SECRET",
]);

const PLACEHOLDER_RE =
  /^(change-me|your_|generate|placeholder|todo|xxx|replace)/i;

export class EnvInstaller implements Installer {
  readonly id = "env-files";
  readonly label = "environment files (.env)";

  supports(_config: ProjectConfig): boolean {
    return true;
  }

  async install(context: InstallerContext): Promise<void> {
    const examples = await findEnvExamples(context.paths.root);
    if (examples.length === 0) {
      logger.info("  No .env.example files found — skipping.");
      return;
    }

    let created = 0;
    let preserved = 0;

    for (const examplePath of examples) {
      const envPath = path.join(path.dirname(examplePath), ".env");
      if (await fs.pathExists(envPath)) {
        preserved += 1;
        logger.info(`  ✓ Existing .env detected (${rel(context.paths.root, envPath)})`);
        continue;
      }

      let text = await fs.readFile(examplePath, "utf8");
      text = fillSafeSecrets(text);
      await fs.writeFile(envPath, text, "utf8");
      created += 1;
      logger.success(`  Created ${rel(context.paths.root, envPath)} from .env.example`);
    }

    if (created === 0 && preserved > 0) {
      logger.info("  All .env files already present — nothing overwritten.");
    }
  }
}

function fillSafeSecrets(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        return line;
      }
      const eq = trimmed.indexOf("=");
      if (eq === -1) {
        return line;
      }
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!SECRET_KEYS.has(key)) {
        return line;
      }
      if (value && !PLACEHOLDER_RE.test(value) && value.length >= 16) {
        return line;
      }
      const secret = crypto.randomBytes(32).toString("hex");
      return `${key}=${secret}`;
    })
    .join("\n");
}

async function findEnvExamples(root: string): Promise<string[]> {
  const found: string[] = [];
  const skip = new Set([
    "node_modules",
    "dist",
    ".git",
    ".kickstack",
    ".vistaar",
  ]);

  async function walk(dir: string, depth: number): Promise<void> {
    if (depth > 4) {
      return;
    }
    let entries: string[];
    try {
      entries = await fs.readdir(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      if (skip.has(entry)) {
        continue;
      }
      const full = path.join(dir, entry);
      let stat;
      try {
        stat = await fs.stat(full);
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        await walk(full, depth + 1);
      } else if (entry === ".env.example") {
        found.push(full);
      }
    }
  }

  await walk(root, 0);
  return found.sort();
}

function rel(root: string, file: string): string {
  return path.relative(root, file).replace(/\\/g, "/") || ".env";
}
