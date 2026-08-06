/**
 * Prompt collector — interprets QuestionDefinition data via @inquirer/prompts.
 *
 * Architectural decision (Single Responsibility + Dependency Inversion):
 * This module only knows how to ask questions and assemble a ProjectConfig.
 * It does not know about templates, file systems, or package managers.
 * That separation lets Phase 2+ swap the UI (flags, TUI, CI non-interactive)
 * without rewriting generation logic.
 */

import { confirm, input, select } from "@inquirer/prompts";

import type { ProjectConfig, QuestionDefinition } from "../types/index.js";
import { CREATE_QUESTIONS } from "./questions.js";

type AnswerBag = Record<string, unknown>;

async function askQuestion(
  question: QuestionDefinition,
  answers: AnswerBag,
): Promise<unknown> {
  switch (question.type) {
    case "input": {
      // Build config without `undefined` optional props — exactOptionalPropertyTypes.
      return input({
        message: question.message,
        ...(question.defaultValue !== undefined
          ? { default: question.defaultValue }
          : {}),
        ...(question.validate !== undefined
          ? { validate: question.validate }
          : {}),
      });
    }
    case "select": {
      return select({
        message: question.message,
        choices: [...question.choices],
      });
    }
    case "confirm": {
      return confirm({
        message: question.message,
        default: question.defaultValue ?? false,
      });
    }
    case "conditional-select": {
      const choices = question.resolveChoices(answers);
      if (choices === null) {
        // Explicit skip — callers store `null` so config stays fully typed.
        return null;
      }
      return select({
        message: question.message,
        choices: [...choices],
      });
    }
    default: {
      // Exhaustiveness guard — TypeScript errors if a new kind is unhandled.
      const _exhaustive: never = question;
      throw new Error(`Unhandled question type: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

/**
 * Runs the create-vistaar prompt sequence and returns a complete config.
 *
 * @param questions - Override for tests or plugin-injected question sets.
 */
export async function collectProjectConfig(
  questions: readonly QuestionDefinition[] = CREATE_QUESTIONS,
): Promise<ProjectConfig> {
  const answers: AnswerBag = {};

  for (const question of questions) {
    answers[question.field] = await askQuestion(question, answers);
  }

  // Narrow once at the boundary. Generators receive ProjectConfig only.
  return answers as unknown as ProjectConfig;
}
