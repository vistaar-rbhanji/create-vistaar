/**
 * ProjectGenerator — orchestrates independent stack generators.
 *
 * Architectural decisions:
 * 1. Single Responsibility: create the project root, run generators in order,
 *    surface progress. It does not copy templates itself.
 * 2. Dependency Inversion: TemplateEngine + Generator[] are injected so tests
 *    can substitute fakes and modules can append generators.
 * 3. Open/Closed: add a new Generator implementation and pass it in — no edits
 *    to FrontendGenerator / BackendGenerator / etc.
 * 4. No npm install here — installers own side-effectful package manager calls.
 * 5. Modules run last so they overlay frontend/backend scaffolds.
 */

import path from "node:path";

import fs from "fs-extra";
import ora, { type Ora } from "ora";

import type { LoadedModule } from "../module-system/index.js";
import {
  createTemplateVariables,
  TemplateEngine,
} from "../template-engine/index.js";
import type { ProjectConfig } from "../types/index.js";
import { logger } from "../utils/index.js";
import { BackendGenerator } from "./backend-generator.js";
import { DatabaseGenerator } from "./database-generator.js";
import { FrontendGenerator } from "./frontend-generator.js";
import { ModuleGenerator } from "./module-generator.js";
import { OrmGenerator } from "./orm-generator.js";
import { ReadmeGenerator } from "./readme-generator.js";
import { resolveProjectPaths } from "./project-paths.js";
import { RootExtrasGenerator } from "./root-extras-generator.js";
import type {
  GenerationResult,
  Generator,
  GeneratorContext,
} from "./types.js";
import { UIGenerator } from "./ui-generator.js";

export interface ProjectGeneratorOptions {
  readonly engine: TemplateEngine;
  /**
   * Ordered generators. Defaults to
   * frontend → ui → backend → database → orm → project-root → readme → modules.
   * Docker is installed as a module (modules/docker), not a dedicated generator.
   */
  readonly generators?: readonly Generator[];
  readonly cwd?: string;
  readonly moduleGenerator?: ModuleGenerator;
}

export class ProjectGenerator {
  private readonly engine: TemplateEngine;
  private readonly generators: readonly Generator[];
  private readonly cwd: string;

  constructor(options: ProjectGeneratorOptions) {
    this.engine = options.engine;
    this.cwd = options.cwd ?? process.cwd();

    if (options.generators) {
      this.generators = options.generators;
    } else {
      const base: Generator[] = [
        new FrontendGenerator(),
        new UIGenerator(),
        new BackendGenerator(),
        new DatabaseGenerator(),
        new OrmGenerator(),
        new RootExtrasGenerator(),
        new ReadmeGenerator(),
      ];
      if (options.moduleGenerator) {
        base.push(options.moduleGenerator);
      }
      this.generators = base;
    }
  }

  /**
   * Scaffold a project from `config`.
   * Creates `<cwd>/<projectName>/` and runs supporting generators.
   */
  async generate(config: ProjectConfig): Promise<GenerationResult> {
    const projectRoot = path.join(this.cwd, config.projectName);
    await this.assertProjectRootAvailable(projectRoot);

    const paths = resolveProjectPaths(projectRoot, config);
    const variables = createTemplateVariables(config);
    const appliedModules: LoadedModule[] = [];
    const context: GeneratorContext = {
      config,
      paths,
      variables,
      engine: this.engine,
      appliedModules,
    };

    await fs.ensureDir(projectRoot);
    logger.success(`Created project folder ${projectRoot}`);

    const active = this.generators.filter((g) => g.supports(config));
    const completed: string[] = [];
    const spinner = ora({ text: "Scaffolding project…", color: "cyan" }).start();

    try {
      for (const generator of active) {
        spinner.text = `Generating ${generator.label}…`;
        await generator.generate(context);
        completed.push(generator.id);
        spinner.stopAndPersist({
          symbol: "✔",
          text: `${generator.label} ready`,
        });
        spinner.start("Scaffolding project…");
      }

      spinner.succeed("Project scaffolded successfully");
    } catch (error) {
      spinner.fail("Project generation failed");
      throw error;
    }

    this.printSummary(paths, completed, appliedModules);
    return {
      paths,
      config,
      completedGenerators: completed,
      appliedModules: [...appliedModules],
    };
  }

  private async assertProjectRootAvailable(projectRoot: string): Promise<void> {
    if (!(await fs.pathExists(projectRoot))) {
      return;
    }

    const entries = await fs.readdir(projectRoot);
    if (entries.length > 0) {
      throw new Error(
        `Destination "${projectRoot}" already exists and is not empty.`,
      );
    }
  }

  private printSummary(
    paths: GeneratorContext["paths"],
    completed: readonly string[],
    appliedModules: readonly LoadedModule[],
  ): void {
    logger.blank();
    logger.title("Generation summary");
    logger.info(`  Root       ${paths.root}`);
    logger.info(`  Frontend   ${paths.frontend}`);
    if (paths.backend) {
      logger.info(`  Backend    ${paths.backend}`);
    }
    if (paths.database) {
      logger.info(`  Database   ${paths.database}`);
    }
    logger.info(`  Generators ${completed.join(", ")}`);
    if (appliedModules.length > 0) {
      logger.info(
        `  Modules    ${appliedModules.map((m) => m.manifest.name).join(", ")}`,
      );
    }
    logger.blank();
  }
}

/** Narrow re-export so callers can type spinner hooks in tests if needed. */
export type { Ora };
