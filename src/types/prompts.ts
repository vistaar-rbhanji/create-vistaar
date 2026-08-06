/**
 * Prompt-system types.
 *
 * Architectural decision:
 * Questions are declared as data (QuestionDefinition), not hardcoded call
 * sites. A collector interprets the definitions. This follows Open/Closed:
 * new prompts are added by extending the registry, not editing the runner.
 */

import type {
  BackendFramework,
  DatabaseEngine,
  FrontendFramework,
  OrmAdapter,
  ProjectLanguage,
  UiFramework,
} from "./config.js";

/** Keys on ProjectConfig that prompts may populate. */
export type PromptField =
  | "projectName"
  | "frontend"
  | "language"
  | "uiFramework"
  | "backend"
  | "database"
  | "orm"
  | "authentication"
  | "docker"
  | "git"
  | "husky"
  | "eslintPrettier";

/** A selectable option shown in a list / select prompt. */
export interface PromptChoice<T extends string = string> {
  readonly name: string;
  readonly value: T;
}

/**
 * Discriminated union of supported prompt kinds.
 * Adding a new kind requires a matching handler in the collector —
 * TypeScript will flag incomplete switches (exhaustiveness).
 */
export type QuestionDefinition =
  | InputQuestion
  | SelectQuestion
  | ConfirmQuestion
  | ConditionalSelectQuestion;

interface BaseQuestion {
  readonly field: PromptField;
  readonly message: string;
}

export interface InputQuestion extends BaseQuestion {
  readonly type: "input";
  readonly defaultValue?: string;
  readonly validate?: (value: string) => true | string;
}

export interface SelectQuestion extends BaseQuestion {
  readonly type: "select";
  readonly choices: readonly PromptChoice[];
}

export interface ConfirmQuestion extends BaseQuestion {
  readonly type: "confirm";
  readonly defaultValue?: boolean;
}

/**
 * Select whose choices depend on earlier answers.
 * Used for ORM options that vary by database selection.
 */
export interface ConditionalSelectQuestion extends BaseQuestion {
  readonly type: "conditional-select";
  /**
   * Return choices for the current answers, or `null` to skip the question
   * and write `null` into the config field (e.g. database === "none").
   */
  readonly resolveChoices: (
    answers: Record<string, unknown>,
  ) => readonly PromptChoice[] | null;
}

/** Convenience aliases for typed choice arrays used in the question registry. */
export type FrontendChoice = PromptChoice<FrontendFramework>;
export type LanguageChoice = PromptChoice<ProjectLanguage>;
export type UiChoice = PromptChoice<UiFramework>;
export type BackendChoice = PromptChoice<BackendFramework>;
export type DatabaseChoice = PromptChoice<DatabaseEngine>;
export type OrmChoice = PromptChoice<OrmAdapter>;
