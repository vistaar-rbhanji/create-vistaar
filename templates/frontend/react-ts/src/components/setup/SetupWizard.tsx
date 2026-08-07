import type { SetupStatus } from "../../types/app";
import { CommandBlock } from "./CommandBlock";
import { DatabaseHelp } from "./DatabaseHelp";
import { SetupProgress } from "./SetupProgress";
import { SetupStep, type SetupStepState } from "./SetupStep";
import "./setup.css";

interface SetupWizardProps {
  status: SetupStatus | null;
  error: string | null;
  onRefresh: () => void;
}

interface StepDefinition {
  label: string;
  state: SetupStepState;
  detail?: string;
}

function buildSteps(status: SetupStatus): StepDefinition[] {
  const steps: StepDefinition[] = [
    { label: "Project generated", state: status.projectGenerated ? "complete" : "pending" },
    { label: "Dependencies installed", state: "complete" },
  ];

  if (status.databaseRequired) {
    const databaseReady = status.databaseConfigured && status.databaseConnected;
    steps.push({
      label: "Connect database",
      state: databaseReady ? "complete" : "pending",
      detail: !status.databaseConfigured
        ? `Set ${status.requiredEnvVar || "DATABASE_URL"} in .env`
        : !status.databaseConnected
          ? "Database configured but not reachable yet"
          : undefined,
    });
    steps.push({
      label: "Run migrations",
      state: status.migrationCompleted || status.authMigrationCompleted ? "complete" : "pending",
    });
  }

  if (status.authenticationInstalled) {
    steps.push({
      label: "Authentication",
      state: "complete",
      detail: status.authentication || "Base Auth installed",
    });
    steps.push({
      label: "Create Super Admin",
      state: status.initialAdminCreated ? "complete" : "pending",
      detail: status.initialAdminPending
        ? "Run npm run seed after the database is connected"
        : undefined,
    });
  } else if (status.databaseRequired) {
    steps.push({
      label: "Seed project data",
      state: status.seedCompleted ? "complete" : "pending",
    });
  }

  steps.push({ label: "Backend", state: status.backendRunning ? "complete" : "pending" });
  steps.push({ label: "Frontend", state: status.frontendRunning ? "complete" : "pending" });

  return steps;
}

function nextStepMessage(status: SetupStatus): string {
  if (status.databaseRequired && !(status.databaseConfigured && status.databaseConnected)) {
    return `Create your ${status.databaseEngine} database and update ${status.requiredEnvVar || ".env"}.`;
  }
  if (status.databaseRequired && !status.migrationCompleted && !status.authMigrationCompleted) {
    return "Run migrations to create tables and default roles.";
  }
  if (status.authenticationInstalled && !status.initialAdminCreated) {
    return "Create the Super Admin account (npm run seed).";
  }
  if (!status.seedCompleted) {
    return "Seed the initial project data.";
  }
  return "Your application is almost ready.";
}

export function SetupWizard({ status, error, onRefresh }: SetupWizardProps) {
  const projectName = status?.projectName || "your project";
  const backendDown = Boolean(error) || !status;
  const steps = status ? buildSteps(status) : [];
  const completed = steps.filter((step) => step.state === "complete").length;
  const percent = steps.length ? (completed / steps.length) * 100 : 0;

  return (
    <div className="setup-wizard">
      <header className="setup-wizard__hero">
        <p className="setup-wizard__eyebrow">Welcome to {projectName}</p>
        <h1 className="setup-wizard__title">Finish setup</h1>
        <p className="setup-wizard__subtitle">
          Follow the checklist — everything environment-independent is already done.
        </p>
      </header>

      {backendDown && (
        <div className="setup-wizard__banner" role="alert">
          <strong>Cannot reach the backend API.</strong>
          <p>
            Start it with <code>npm run dev:backend</code>, then this page refreshes
            automatically.
          </p>
          <details className="database-help__tech">
            <summary>Show technical details</summary>
            <pre>{error || "Backend /api/setup-status did not respond."}</pre>
          </details>
        </div>
      )}

      {status && (
        <>
          <section className="setup-card">
            <h2 className="setup-card__title">Stack</h2>
            <ul className="setup-ready-list">
              <li>✓ {status.frontend || "React"}</li>
              <li>✓ {status.backend || "Backend"}</li>
              <li>
                {status.databaseConfigured && status.databaseConnected ? "✓" : "⚠"}{" "}
                {status.databaseEngine}
                {status.databaseConfigured && status.databaseConnected
                  ? " connected"
                  : " not connected"}
              </li>
              {status.authenticationInstalled && (
                <li>✓ {status.authentication || "Base Auth"} installed</li>
              )}
            </ul>
          </section>

          <section className="setup-card">
            <SetupProgress percent={percent} />
          </section>

          <section className="setup-card">
            <h2 className="setup-card__title">Setup progress</h2>
            <div className="setup-step-list">
              {steps.map((step) => (
                <SetupStep key={step.label} label={step.label} state={step.state} detail={step.detail} />
              ))}
            </div>
          </section>

          <section className="setup-card">
            <h2 className="setup-card__title">Database</h2>
            <DatabaseHelp status={status} />
          </section>

          <section className="setup-card">
            <h2 className="setup-card__title">Next step</h2>
            <p className="database-help__text">{nextStepMessage(status)}</p>
            {status.databaseRequired &&
              status.databaseConfigured &&
              status.databaseConnected &&
              !status.migrationCompleted &&
              !status.authMigrationCompleted && (
                <CommandBlock command={status.commands.migrate} description="Applies schema + default roles" />
              )}
            {status.authenticationInstalled &&
              status.databaseConnected &&
              !status.initialAdminCreated && (
                <CommandBlock command={status.commands.seed} description="Creates the Super Admin from setup" />
              )}
            {!status.authenticationInstalled &&
              status.databaseRequired &&
              !status.seedCompleted && (
                <CommandBlock command={status.commands.seed} description="Populates the initial project data" />
              )}
          </section>

          {status.dockerEnabled && (
            <section className="setup-card">
              <h2 className="setup-card__title">Docker</h2>
              <CommandBlock command={status.commands.docker} description="Starts the full stack with Docker Compose" />
            </section>
          )}

          <section className="setup-card setup-card--muted">
            <h2 className="setup-card__title">Need a full environment report?</h2>
            <CommandBlock command={status.commands.doctor} description="Checks Node, dependencies, database, and more" />
          </section>
        </>
      )}

      <button type="button" className="setup-wizard__refresh" onClick={onRefresh}>
        Refresh status
      </button>
    </div>
  );
}
