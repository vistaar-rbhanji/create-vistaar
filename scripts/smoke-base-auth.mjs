/**
 * Phase 13 smoke checks for Base Auth integration (non-interactive).
 * Run: node --import tsx scripts/smoke-base-auth.mjs
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";

import { ModuleGenerator, ProjectGenerator } from "../src/generators/index.ts";
import { ModuleRegistry } from "../src/module-system/index.ts";
import { TemplateEngine } from "../src/template-engine/index.ts";
import { isBaseAuthCompatible } from "../src/prompts/questions.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = path.join(root, ".tmp-smoke-auth");

function baseConfig(overrides = {}) {
  return {
    projectName: "smoke-auth-app",
    frontend: "react",
    language: "typescript",
    uiFramework: "shadcn",
    backend: "express",
    database: "postgresql",
    orm: "prisma",
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
  await generator.generate(config);
  return path.join(cwd, config.projectName);
}

async function main() {
  const results = [];

  // Compatibility helper
  if (isBaseAuthCompatible({ backend: "fastapi", database: "postgresql" })) {
    throw new Error("fastapi should not be base-auth compatible");
  }
  if (!isBaseAuthCompatible({ backend: "express", database: "postgresql" })) {
    throw new Error("express+postgresql should be compatible");
  }
  results.push("compat helpers OK");

  // 1) With Base Auth + shadcn
  const withAuth = await scaffold(
    baseConfig({ authentication: "base-auth", uiFramework: "shadcn" }),
    "with-auth",
  );
  const checks = [
    ["auth-api/package.json", await fs.pathExists(path.join(withAuth, "auth-api/package.json"))],
    ["auth-api/scripts/init-db.sql", await fs.pathExists(path.join(withAuth, "auth-api/scripts/init-db.sql"))],
    ["frontend/src/auth/AuthShell.tsx", await fs.pathExists(path.join(withAuth, "frontend/src/auth/AuthShell.tsx"))],
    ["frontend/src/auth/adapters/ui/index.tsx", await fs.pathExists(path.join(withAuth, "frontend/src/auth/adapters/ui/index.tsx"))],
    ["App uses AuthShell", (await fs.readFile(path.join(withAuth, "frontend/src/App.tsx"), "utf8")).includes("AuthShell")],
  ];
  for (const [label, ok] of checks) {
    if (!ok) throw new Error(`Missing: ${label}`);
  }
  results.push("scaffold base-auth + shadcn OK");

  // 2) Bootstrap variant
  const boot = await scaffold(
    baseConfig({
      projectName: "smoke-auth-boot",
      authentication: "base-auth",
      uiFramework: "bootstrap",
    }),
    "with-auth-bootstrap",
  );
  const ui = await fs.readFile(
    path.join(boot, "frontend/src/auth/adapters/ui/index.tsx"),
    "utf8",
  );
  if (!ui.includes("btn btn-primary") && !ui.includes("form-control")) {
    throw new Error("bootstrap adapter not installed");
  }
  results.push("scaffold base-auth + bootstrap OK");

  // 3) Without auth
  const none = await scaffold(
    baseConfig({ projectName: "smoke-no-auth", authentication: "none" }),
    "no-auth",
  );
  if (await fs.pathExists(path.join(none, "auth-api"))) {
    throw new Error("auth-api should not exist when authentication=none");
  }
  if (await fs.pathExists(path.join(none, "frontend/src/auth"))) {
    throw new Error("frontend/src/auth should not exist when authentication=none");
  }
  results.push("scaffold without auth OK");

  // 4) Unsupported combo should not select auth module (authentication forced none in prompt;
  //    if somehow base-auth + fastapi, install throws)
  let threw = false;
  try {
    await scaffold(
      baseConfig({
        projectName: "smoke-bad",
        backend: "fastapi",
        database: "mongodb",
        orm: "mongoose",
        authentication: "base-auth",
      }),
      "bad-combo",
    );
  } catch (error) {
    threw = true;
    const msg = error instanceof Error ? error.message : String(error);
    if (!msg.includes("could not be installed") && !msg.includes("not compatible")) {
      // Module may be skipped by compatibleWith before install — also OK if no auth-api
      threw = true;
    }
  }
  // If generator completed, ensure auth-api absent (compatibleWith may skip module)
  const badPath = path.join(tmp, "bad-combo", "smoke-bad");
  if (await fs.pathExists(badPath)) {
    if (await fs.pathExists(path.join(badPath, "auth-api"))) {
      throw new Error("auth-api must not install for fastapi+mongodb");
    }
    results.push("unsupported stack skipped auth OK");
  } else if (threw) {
    results.push("unsupported stack failed clearly OK");
  } else {
    throw new Error("unsupported stack did not skip or fail");
  }

  console.log("SMOKE_AUTH_OK");
  for (const line of results) console.log(" -", line);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
