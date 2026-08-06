/**
 * Merge a rendered template directory into an existing destination.
 *
 * Used when overlaying UI (or future modules) onto a frontend/backend tree
 * without clobbering the destination package.json.
 */

import os from "node:os";
import path from "node:path";

import fs from "fs-extra";

import type {
  TemplateEngine,
  TemplateId,
  TemplateVariables,
} from "../template-engine/index.js";
import { mergePackageJson, type PackageJsonLike } from "./package-json.js";

async function readPackageJson(
  filePath: string,
): Promise<PackageJsonLike | null> {
  if (!(await fs.pathExists(filePath))) {
    return null;
  }
  return (await fs.readJson(filePath)) as PackageJsonLike;
}

async function mergeRenderedTreeInto(
  tmpRoot: string,
  destination: string,
): Promise<{ mergedPackageJson: boolean }> {
  const destPkgPath = path.join(destination, "package.json");
  const srcPkgPath = path.join(tmpRoot, "package.json");
  const basePkg = await readPackageJson(destPkgPath);
  const overlayPkg = await readPackageJson(srcPkgPath);

  // Remove overlay package.json before copy so we can merge it explicitly.
  // (Avoids fs-extra filter + temp-dir edge cases on Windows.)
  if (await fs.pathExists(srcPkgPath)) {
    await fs.remove(srcPkgPath);
  }

  await fs.copy(tmpRoot, destination, { overwrite: true });

  if (basePkg && overlayPkg) {
    const merged = mergePackageJson(basePkg, overlayPkg);
    await fs.writeJson(destPkgPath, merged, { spaces: 2 });
    return { mergedPackageJson: true };
  }

  if (!basePkg && overlayPkg) {
    await fs.writeJson(destPkgPath, overlayPkg, { spaces: 2 });
    return { mergedPackageJson: false };
  }

  return { mergedPackageJson: false };
}

/**
 * Render `templateId` into a temp folder, then merge into `destination`.
 * `package.json` files are merged; every other path overwrites.
 */
export async function mergeTemplateInto(
  engine: TemplateEngine,
  templateId: TemplateId,
  destination: string,
  variables: TemplateVariables,
): Promise<{ mergedPackageJson: boolean }> {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "kickstack-"));

  try {
    await engine.copy(templateId, {
      destination: tmpRoot,
      variables,
      overwrite: true,
    });
    return await mergeRenderedTreeInto(tmpRoot, destination);
  } finally {
    await fs.remove(tmpRoot);
  }
}

/**
 * Render an absolute template directory, then merge into `destination`.
 * Used by modules whose paths come from module.json, not the id registry.
 */
export async function mergeDirectoryInto(
  engine: TemplateEngine,
  sourceDir: string,
  destination: string,
  variables: TemplateVariables,
): Promise<{ mergedPackageJson: boolean }> {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "kickstack-"));

  try {
    await engine.copyDirectory(sourceDir, {
      destination: tmpRoot,
      variables,
      overwrite: true,
    });
    return await mergeRenderedTreeInto(tmpRoot, destination);
  } finally {
    await fs.remove(tmpRoot);
  }
}
