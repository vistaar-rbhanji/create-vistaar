/**
 * Question registry — the configuration surface for interactive prompts.
 *
 * Architectural decision (Open/Closed + Dependency Inversion):
 * Prompt content lives here as data. The collector depends on QuestionDefinition
 * abstractions, not on concrete inquirer calls scattered across the codebase.
 * Future phases can load additional questions from plugins by appending to
 * (or filtering) this registry without touching the runner.
 */

import type {
  AuthChoice,
  BackendChoice,
  DatabaseChoice,
  FrontendChoice,
  LanguageChoice,
  OrmChoice,
  QuestionDefinition,
  UiChoice,
} from "../types/index.js";
import type {
  AuthProvider,
  BackendFramework,
  DatabaseEngine,
  OrmAdapter,
} from "../types/index.js";

const FRONTEND_CHOICES: readonly FrontendChoice[] = [
  { name: "React", value: "react" },
];

const LANGUAGE_CHOICES: readonly LanguageChoice[] = [
  { name: "TypeScript", value: "typescript" },
  { name: "JavaScript", value: "javascript" },
];

const UI_CHOICES: readonly UiChoice[] = [
  { name: "ShadCN", value: "shadcn" },
  { name: "Bootstrap", value: "bootstrap" },
  { name: "Material UI", value: "material-ui" },
];

const BACKEND_CHOICES: readonly BackendChoice[] = [
  { name: "Express", value: "express" },
  { name: "FastAPI", value: "fastapi" },
  { name: "None", value: "none" },
];

const DATABASE_CHOICES: readonly DatabaseChoice[] = [
  { name: "PostgreSQL", value: "postgresql" },
  { name: "MongoDB", value: "mongodb" },
  { name: "None", value: "none" },
];

/**
 * Maps database engines to compatible ORMs.
 * Generators in later phases should consult the same compatibility rules
 * (or derive template paths from the resolved config) rather than re-encoding
 * this knowledge.
 */
const ORM_BY_DATABASE: Readonly<
  Record<Exclude<DatabaseEngine, "none">, readonly OrmChoice[]>
> = {
  postgresql: [
    { name: "Prisma", value: "prisma" },
    { name: "Drizzle", value: "drizzle" },
    { name: "No ORM", value: "none" },
  ],
  mongodb: [
    { name: "Mongoose", value: "mongoose" },
    { name: "No ORM", value: "none" },
  ],
};

/** Valid NPM-style project name (lowercase, optional scopes not required for v1). */
function validateProjectName(value: string): true | string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Project name is required.";
  }
  if (!/^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/i.test(trimmed)) {
    return "Use letters, numbers, dots, underscores, or hyphens (no spaces).";
  }
  return true;
}

function resolveOrmChoices(
  answers: Record<string, unknown>,
): readonly OrmChoice[] | null {
  const database = answers.database as DatabaseEngine | undefined;
  if (!database || database === "none") {
    return null;
  }
  return ORM_BY_DATABASE[database];
}

/**
 * Base Auth requires Express + PostgreSQL (raw `pg` + Redis + mail in base-auth).
 * Unsupported stacks only see "None" so we never scaffold a broken auth setup.
 */
export function isBaseAuthCompatible(answers: {
  backend?: BackendFramework | undefined;
  database?: DatabaseEngine | undefined;
}): boolean {
  return answers.backend === "express" && answers.database === "postgresql";
}

function resolveAuthChoices(
  answers: Record<string, unknown>,
): readonly AuthChoice[] {
  const none: AuthChoice = { name: "None", value: "none" };
  if (
    !isBaseAuthCompatible({
      backend: answers.backend as BackendFramework | undefined,
      database: answers.database as DatabaseEngine | undefined,
    })
  ) {
    return [
      {
        name: "None (Base Auth needs Express + PostgreSQL)",
        value: "none",
      },
    ];
  }
  return [
    none,
    {
      name: "Base Auth (email OTP)",
      value: "base-auth",
    },
  ];
}

/** Runtime check used by the auth module installer (same rules as prompts). */
export function assertBaseAuthCompatible(config: {
  backend: BackendFramework;
  database: DatabaseEngine;
  authentication: AuthProvider;
}): void {
  if (config.authentication !== "base-auth") {
    return;
  }
  if (!isBaseAuthCompatible(config)) {
    throw new Error(
      "Authentication could not be installed.\n" +
        "Reason: Base Auth is not compatible with " +
        `${config.backend} + ${config.database}.\n` +
        "Base Auth requires Express + PostgreSQL.",
    );
  }
}

/**
 * Ordered list of prompts shown by `npx create-vistaar`.
 * Order matters: conditional questions read earlier answers.
 */
export const CREATE_QUESTIONS: readonly QuestionDefinition[] = [
  {
    type: "input",
    field: "projectName",
    message: "Project name:",
    defaultValue: "my-kickstack-app",
    validate: validateProjectName,
  },
  {
    type: "select",
    field: "frontend",
    message: "Frontend framework:",
    choices: FRONTEND_CHOICES,
  },
  {
    type: "select",
    field: "language",
    message: "Language:",
    choices: LANGUAGE_CHOICES,
  },
  {
    type: "select",
    field: "uiFramework",
    message: "UI framework:",
    choices: UI_CHOICES,
  },
  {
    type: "select",
    field: "backend",
    message: "Backend:",
    choices: BACKEND_CHOICES,
  },
  {
    type: "select",
    field: "database",
    message: "Database:",
    choices: DATABASE_CHOICES,
  },
  {
    type: "conditional-select",
    field: "orm",
    message: "ORM:",
    resolveChoices: resolveOrmChoices,
  },
  {
    type: "conditional-select",
    field: "authentication",
    message: "Authentication:",
    resolveChoices: resolveAuthChoices,
  },
  {
    type: "confirm",
    field: "docker",
    message: "Include Docker?",
    defaultValue: false,
  },
  {
    type: "confirm",
    field: "git",
    message: "Initialize Git repository?",
    defaultValue: true,
  },
  {
    type: "confirm",
    field: "husky",
    message: "Set up Husky?",
    defaultValue: false,
  },
  {
    type: "confirm",
    field: "eslintPrettier",
    message: "Set up ESLint + Prettier?",
    defaultValue: true,
  },
];

/** Re-export for generators that need the compatibility table later. */
export function getCompatibleOrms(
  database: Exclude<DatabaseEngine, "none">,
): readonly OrmAdapter[] {
  return ORM_BY_DATABASE[database]
    .map((choice) => choice.value)
    .filter((value): value is OrmAdapter => value !== "none");
}
