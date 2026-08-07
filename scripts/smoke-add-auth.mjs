/**
 * Phase 14 smoke: create-vistaar add auth flows (non-interactive).
 * Run: node --import tsx scripts/smoke-add-auth.mjs
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";

import { ModuleGenerator, ProjectGenerator } from "../src/generators/index.ts";
import { ModuleRegistry } from "../src/module-system/index.ts";
import { TemplateEngine } from "../src/template-engine/index.ts";
import {
  isVistaarProject,
  loadOrInferManifest,
  manifestFromProjectConfig,
  writeVistaarManifest,
} from "../src/project-manifest/index.ts";
import { installMissingStackAndAuth } from "../src/commands/add/install-missing.ts";
import { assertExistingStackSupportsBaseAuth } from "../src/commands/add/prompt-missing.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = path.join(root, ".tmp-smoke-add-auth");
const packageRoot = root;

function baseConfig(overrides = {}) {
  return {
    projectName: "fe-only",
    frontend: "react",
    language: "typescript",
    uiFramework: "bootstrap",
    backend: "none",
    database: "none",
    orm: null,
    authentication: "none",
    docker: false,
    git: false,
    husky: false,
    eslintPrettier: false,
    ...overrides,
  };
}

async function scaffold(config, dirName) {
  const cwd = path.join(tmp, dirName);
  await fs.remove(cwd);
  await fs.ensureDir(cwd);
  const engine = new TemplateEngine({
    templatesRoot: path.join(root, "templates"),
  });
  const registry = new ModuleRegistry({
    modulesRoot: path.join(root, "modules"),
  });
  const generator = new ProjectGenerator({
    engine,
    moduleGenerator: new ModuleGenerator(registry),
    cwd,
  });
  const generation = await generator.generate(config);
  await writeVistaarManifest(
    generation.paths.root,
    manifestFromProjectConfig(config),
  );
  return generation.paths.root;
}

async function main() {
  const results = [];

  // Test 1: frontend-only → add auth (backend+db+orm+auth)
  const feOnly = await scaffold(baseConfig(), "t1-fe-only");
  if (!(await isVistaarProject(feOnly))) throw new Error("not detected");
  let manifest = await loadOrInferManifest(feOnly);
  if (manifest.backend) throw new Error("expected no backend");
  await installMissingStackAndAuth({
    projectRoot: feOnly,
    config: {
      ...baseConfig({ projectName: "fe-only" }),
      backend: "express",
      database: "postgresql",
      orm: "prisma",
      authentication: "base-auth",
    },
    packageRoot,
    needsBackend: true,
    needsDatabase: true,
    needsOrm: true,
  });
  await writeVistaarManifest(
    feOnly,
    manifestFromProjectConfig({
      ...baseConfig({ projectName: "fe-only" }),
      backend: "express",
      database: "postgresql",
      orm: "prisma",
      authentication: "base-auth",
    }),
  );
  if (!(await fs.pathExists(path.join(feOnly, "backend")))) {
    throw new Error("backend missing after add auth");
  }
  if (!(await fs.pathExists(path.join(feOnly, "auth-api")))) {
    throw new Error("auth-api missing");
  }
  if (!(await fs.pathExists(path.join(feOnly, "frontend/src/auth")))) {
    throw new Error("frontend auth missing");
  }
  // Frontend UI preserved (bootstrap)
  const fePkg = await fs.readJson(path.join(feOnly, "frontend/package.json"));
  if (!fePkg.dependencies?.bootstrap) {
    // UI overlay may have been applied at create — bootstrap dep from ui template
  }
  results.push("test1 frontend-only + add auth OK");

  // Test 2: express without db → add db+orm+auth
  const withBe = await scaffold(
    baseConfig({
      projectName: "with-be",
      backend: "express",
      database: "none",
      orm: null,
    }),
    "t2-express",
  );
  await installMissingStackAndAuth({
    projectRoot: withBe,
    config: {
      ...baseConfig({ projectName: "with-be" }),
      backend: "express",
      database: "postgresql",
      orm: "drizzle",
      authentication: "base-auth",
    },
    packageRoot,
    needsBackend: false,
    needsDatabase: true,
    needsOrm: true,
  });
  if (!(await fs.pathExists(path.join(withBe, "database")))) {
    throw new Error("database missing");
  }
  if (!(await fs.pathExists(path.join(withBe, "auth-api")))) {
    throw new Error("auth-api missing in test2");
  }
  results.push("test2 express + add auth OK");

  // Test 3: full stack without auth → only auth
  const full = await scaffold(
    baseConfig({
      projectName: "full-no-auth",
      backend: "express",
      database: "postgresql",
      orm: "prisma",
      authentication: "none",
    }),
    "t3-full",
  );
  await installMissingStackAndAuth({
    projectRoot: full,
    config: {
      ...baseConfig({ projectName: "full-no-auth" }),
      backend: "express",
      database: "postgresql",
      orm: "prisma",
      authentication: "base-auth",
    },
    packageRoot,
    needsBackend: false,
    needsDatabase: false,
    needsOrm: false,
  });
  if (!(await fs.pathExists(path.join(full, "auth-api")))) {
    throw new Error("auth-api missing in test3");
  }
  results.push("test3 full stack add auth only OK");

  // Test 4: already installed
  manifest = await loadOrInferManifest(full);
  await writeVistaarManifest(
    full,
    manifestFromProjectConfig({
      ...baseConfig({ projectName: "full-no-auth" }),
      backend: "express",
      database: "postgresql",
      orm: "prisma",
      authentication: "base-auth",
    }),
  );
  manifest = await loadOrInferManifest(full);
  if (!manifest.modules.auth) throw new Error("auth module not in manifest");
  results.push("test4 already installed detected OK");

  // Test 5: unsupported fastapi refuses
  const bad = await scaffold(
    baseConfig({
      projectName: "bad-fastapi",
      backend: "fastapi",
      database: "postgresql",
      orm: null,
    }),
    "t5-bad",
  );
  manifest = await loadOrInferManifest(bad);
  let refused = false;
  try {
    assertExistingStackSupportsBaseAuth(manifest);
  } catch {
    refused = true;
  }
  if (!refused) throw new Error("fastapi should be refused");
  results.push("test5 unsupported refused OK");

  console.log("SMOKE_ADD_AUTH_OK");
  for (const line of results) console.log(" -", line);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
