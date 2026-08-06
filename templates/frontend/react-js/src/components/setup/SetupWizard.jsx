import { CommandBlock } from "./CommandBlock";
import { DatabaseHelp } from "./DatabaseHelp";
import { SetupProgress } from "./SetupProgress";
import { SetupStep } from "./SetupStep";
import "./setup.css";

function buildSteps(status) {
  const steps = [
    { label: "Project Generated", state: status.projectGenerated ? "complete" : "pending" },
  ];

  if (status.databaseRequired) {
    const databaseReady = status.databaseConfigured && status.databaseConnected;
    steps.push({
      label: "Database Created / Configured",
      state: databaseReady ? "complete" : "pending",
      detail: !status.databaseConfigured
        ? "Add DATABASE_URL / MONGODB_URI to backend/.env."
        : !status.databaseConnected
          ? "Configured, but not reachable yet. Confirm the database is running."
          : undefined,
    });
    steps.push({ label: "Migration", state: status.migrationCompleted ? "complete" : "pending" });
    steps.push({ label: "Seeder", state: status.seedCompleted ? "complete" : "pending" });
  }

  steps.push({ label: "Backend", state: status.backendRunning ? "complete" : "pending" });
  steps.push({ label: "Frontend", state: status.frontendRunning ? "complete" : "pending" });

  return steps;
}

export function SetupWizard({ status, error, onRefresh }) {
  const projectName = status?.projectName || "your project";
  const backendDown = Boolean(error) || !status;
  const steps = status ? buildSteps(status) : [];
  const completed = steps.filter((step) => step.state === "complete").length;
  const percent = steps.length ? (completed / steps.length) * 100 : 0;

  return (
    <div className="setup-wizard">
      <header className="setup-wizard__hero">
        <p className="setup-wizard__eyebrow">🚀 Welcome to {projectName}</p>
        <h1 className="setup-wizard__title">Let's finish setting up your project.</h1>
        <p className="setup-wizard__subtitle">
          This wizard checks your setup automatically — follow the steps below and
          you'll be up and running in minutes.
        </p>
      </header>

      {backendDown && (
        <div className="setup-wizard__banner" role="alert">
          <strong>Cannot reach the backend API.</strong>
          <p>
            Start it with <code>npm run dev:backend</code>, then this page refreshes
            automatically.
          </p>
        </div>
      )}

      {status && (
        <>
          <section className="setup-card">
            <SetupProgress percent={percent} />
          </section>

          <section className="setup-card">
            <h2 className="setup-card__title">Setup Steps</h2>
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

          {status.databaseRequired && !status.migrationCompleted && (
            <section className="setup-card">
              <h2 className="setup-card__title">Run Migration</h2>
              <CommandBlock command={status.commands.migrate} description="Applies the database schema" />
            </section>
          )}

          {status.databaseRequired && !status.seedCompleted && (
            <section className="setup-card">
              <h2 className="setup-card__title">Run Seeder</h2>
              <CommandBlock command={status.commands.seed} description="Populates the initial project data" />
            </section>
          )}

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
