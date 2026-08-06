/**
 * EslintPrettierInstaller — adds ESLint + Prettier when the user opted in.
 *
 * Applies to every generated Node package (frontend, Express backend).
 * Writes minimal flat-ish config files and merges npm scripts.
 * Does not run interactive `eslint --init`.
 */

import path from "node:path";

import fs from "fs-extra";

import type { PackageJsonLike } from "../generators/index.js";
import type { ProjectConfig } from "../types/index.js";
import { logger } from "../utils/index.js";
import { findNpmProjectDirs } from "./npm-targets.js";
import { runCommand } from "./run-command.js";
import type { Installer, InstallerContext } from "./types.js";

const ESLINT_PRETTIER_DEV_DEPS = [
  "eslint",
  "prettier",
  "@eslint/js",
  "eslint-config-prettier",
] as const;

export class EslintPrettierInstaller implements Installer {
  readonly id = "eslint-prettier";
  readonly label = "ESLint + Prettier";

  supports(config: ProjectConfig): boolean {
    return config.eslintPrettier;
  }

  async install(context: InstallerContext): Promise<void> {
    const targets = await findNpmProjectDirs(context.paths);

    if (targets.length === 0) {
      logger.warn("  No Node packages found — skipping ESLint + Prettier.");
      return;
    }

    for (const cwd of targets) {
      await installForPackage(cwd, context.config.language);
    }
  }
}

async function installForPackage(
  cwd: string,
  language: ProjectConfig["language"],
): Promise<void> {
  logger.info(`  Configuring ESLint + Prettier in ${path.basename(cwd)}…`);

  const extras =
    language === "typescript"
      ? (["typescript-eslint", "@types/node"] as const)
      : [];

  await runCommand(
    "npm",
    ["install", "--save-dev", ...ESLINT_PRETTIER_DEV_DEPS, ...extras],
    { cwd },
  );

  await writeEslintConfig(cwd, language);
  await writePrettierConfig(cwd);
  await mergeLintScripts(cwd);

  logger.success(`  ESLint + Prettier ready in ${cwd}`);
}

async function writeEslintConfig(
  cwd: string,
  language: ProjectConfig["language"],
): Promise<void> {
  if (language === "typescript") {
    const contents = `import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: ["dist/**", "node_modules/**"],
  },
);
`;
    await fs.writeFile(path.join(cwd, "eslint.config.js"), contents, "utf8");
    return;
  }

  const contents = `import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  eslint.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
`;
  await fs.writeFile(path.join(cwd, "eslint.config.js"), contents, "utf8");
}

async function writePrettierConfig(cwd: string): Promise<void> {
  await fs.writeJson(
    path.join(cwd, ".prettierrc"),
    {
      semi: true,
      singleQuote: false,
      trailingComma: "all",
      printWidth: 80,
    },
    { spaces: 2 },
  );

  await fs.writeFile(
    path.join(cwd, ".prettierignore"),
    ["node_modules", "dist", "coverage", "package-lock.json"].join("\n") + "\n",
    "utf8",
  );
}

async function mergeLintScripts(cwd: string): Promise<void> {
  const pkgPath = path.join(cwd, "package.json");
  const pkg = (await fs.readJson(pkgPath)) as PackageJsonLike;
  pkg.scripts = {
    ...pkg.scripts,
    lint: "eslint .",
    format: 'prettier --write "**/*.{js,jsx,ts,tsx,json,css,md}"',
    "format:check": 'prettier --check "**/*.{js,jsx,ts,tsx,json,css,md}"',
  };
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });
}
