/**
 * Collect initial Super Admin details when Base Auth is selected.
 *
 * Base Auth uses email OTP — a password is collected only to satisfy a
 * strong-credential habit check and is never written to disk or logged.
 */

import { input, password } from "@inquirer/prompts";
import chalk from "chalk";

import type { InitialAdminConfig, ProjectConfig } from "../types/index.js";
import { logger } from "../utils/index.js";

function validateName(value: string): true | string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Required.";
  }
  if (trimmed.length < 2) {
    return "Use at least 2 characters.";
  }
  return true;
}

function validateEmail(value: string): true | string {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return "Email is required.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Enter a valid email address.";
  }
  return true;
}

function validatePassword(value: string): true | string {
  if (!value || value.length < 10) {
    return "Use at least 10 characters.";
  }
  if (!/[A-Z]/.test(value)) {
    return "Include at least one uppercase letter.";
  }
  if (!/[a-z]/.test(value)) {
    return "Include at least one lowercase letter.";
  }
  if (!/[0-9]/.test(value)) {
    return "Include at least one number.";
  }
  return true;
}

export async function collectInitialAdmin(): Promise<InitialAdminConfig> {
  logger.blank();
  console.log(chalk.bold("  Create initial administrator"));
  console.log(
    chalk.dim(
      "  This user receives the Super Admin role after the database is connected.",
    ),
  );
  console.log(
    chalk.dim(
      "  Base Auth signs in with email OTP — the password below is not stored.",
    ),
  );
  logger.blank();

  const firstName = (
    await input({
      message: "First name:",
      validate: validateName,
    })
  ).trim();

  const lastName = (
    await input({
      message: "Last name:",
      validate: validateName,
    })
  ).trim();

  const email = (
    await input({
      message: "Email:",
      validate: validateEmail,
    })
  )
    .trim()
    .toLowerCase();

  // Validated then discarded — never attach to config or write to disk.
  await password({
    message: "Password (not stored — OTP login):",
    validate: validatePassword,
    mask: "*",
  });

  return { firstName, lastName, email };
}

/** Attach initialAdmin onto a resolved create config. */
export async function withInitialAdmin(
  config: ProjectConfig,
): Promise<ProjectConfig> {
  if (config.authentication !== "base-auth") {
    return { ...config, initialAdmin: null };
  }
  const initialAdmin = await collectInitialAdmin();
  return { ...config, initialAdmin };
}
