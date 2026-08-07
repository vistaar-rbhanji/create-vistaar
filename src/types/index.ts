/**
 * Public type barrel.
 * Consumers import from `../types/index.js` so internal file splits
 * can change without cascading import updates.
 */

export type {
  AuthProvider,
  BackendFramework,
  DatabaseEngine,
  FrontendFramework,
  InitialAdminConfig,
  OrmAdapter,
  PartialProjectConfig,
  ProjectConfig,
  ProjectLanguage,
  UiFramework,
} from "./config.js";

export type {
  AuthChoice,
  BackendChoice,
  ConfirmQuestion,
  ConditionalSelectQuestion,
  DatabaseChoice,
  FrontendChoice,
  InputQuestion,
  LanguageChoice,
  OrmChoice,
  PromptChoice,
  PromptField,
  QuestionDefinition,
  SelectQuestion,
  UiChoice,
} from "./prompts.js";
