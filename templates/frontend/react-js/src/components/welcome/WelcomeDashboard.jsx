import { useAppInfo } from "../../hooks/useAppInfo";
import { useHealth } from "../../hooks/useHealth";
import { BACKEND_NAME, BACKEND_ORIGIN, FRONTEND_ORIGIN } from "../../services/config";
import { ErrorCard } from "./ErrorCard";
import { StatusBadge } from "./StatusBadge";
import "./welcome.css";

export function WelcomeDashboard() {
  const { appInfo, loading: appInfoLoading, error: appInfoError } = useAppInfo();
  const { health, loading: healthLoading, error: healthError } = useHealth();

  const projectName = appInfo ? appInfo.projectName : "your project";

  return (
    <div className="welcome">
      <header className="welcome__hero">
        <p className="welcome__eyebrow">Your application is ready!</p>
        <h1 className="welcome__title">
          Welcome to <span>{projectName}</span>
        </h1>
        <p className="welcome__subtitle">
          Frontend, backend, and database are configured. Use the health panel below to confirm everything is healthy.
        </p>
        <p className="welcome__configured">Project setup complete.</p>
      </header>

      {appInfoError && (
        <ErrorCard
          title="Cannot connect to backend."
          message="Start the API server, then refresh this page."
        />
      )}

      <section className="welcome__grid">
        <div className="card">
          <h2 className="card__title">Project Information</h2>
          {appInfoLoading && !appInfo && <p className="card__hint">Loading project info...</p>}
          {appInfo && (
            <dl className="info-list">
              <InfoRow label="Project Name" value={appInfo.projectName} />
              <InfoRow label="Frontend" value={appInfo.frontend} />
              <InfoRow label="Backend" value={appInfo.backend} />
              <InfoRow label="Database" value={appInfo.database} />
              <InfoRow label="ORM" value={appInfo.orm} />
              <InfoRow label="UI Framework" value={appInfo.uiFramework} />
              <InfoRow label="Authentication" value={appInfo.authentication} />
              <InfoRow label="Created At" value={new Date(appInfo.createdAt).toLocaleString()} />
            </dl>
          )}
          <div className="badge-row">
            <StatusBadge
              label={"Authentication " + authenticationLabel(appInfo)}
              state={authenticationBadgeState(appInfo)}
            />
            <StatusBadge
              label={"Docker " + dockerLabel(appInfo)}
              state={dockerBadgeState(appInfo)}
            />
          </div>
        </div>

        <div className="card">
          <h2 className="card__title">System Health</h2>
          {healthError && !health && <ErrorCard title="Health check failed." message={healthError} />}
          {healthLoading && !health && <p className="card__hint">Checking system health...</p>}
          {health && (
            <>
              <div className="badge-row badge-row--stacked">
                <StatusBadge
                  label={"Server " + (health.server === "running" ? "Running" : "Stopped")}
                  state={health.server === "running" ? "ok" : "error"}
                />
                <StatusBadge label={databaseLabel(health.database)} state={databaseState(health.database)} />
                <StatusBadge label="API Working" state={health.api === "working" ? "ok" : "error"} />
              </div>
              {health.database === "disconnected" && (
                <ErrorCard
                  title="Database unavailable."
                  message="Check your database connection settings and confirm the database is running."
                />
              )}
              <p className={"overall-status overall-status--" + health.status}>
                Overall status: <strong>{health.status}</strong>
              </p>
            </>
          )}
        </div>
      </section>

      <section className="welcome__grid">
        <div className="card">
          <h2 className="card__title">Useful Commands</h2>
          <ul className="command-list">
            <li>
              <code>npm run dev</code>
              <span>Start the app in development mode</span>
            </li>
            <li>
              <code>npm run build</code>
              <span>Build for production</span>
            </li>
            <li>
              <code>npm run lint</code>
              <span>Lint the codebase</span>
            </li>
            <li>
              <code>npm run test</code>
              <span>Run tests</span>
            </li>
            <li>
              <code>npm run db:migrate</code>
              <span>Apply database migrations</span>
            </li>
            <li>
              <code>npm run db:seed</code>
              <span>Seed the database</span>
            </li>
          </ul>
        </div>

        <div className="card">
          <h2 className="card__title">Quick Links</h2>
          <ul className="link-list">
            <li>
              <span>Frontend URL</span>
              <a href={FRONTEND_ORIGIN} target="_blank" rel="noreferrer">
                {FRONTEND_ORIGIN}
              </a>
            </li>
            <li>
              <span>Backend URL</span>
              <a href={BACKEND_ORIGIN} target="_blank" rel="noreferrer">
                {BACKEND_ORIGIN}
              </a>
            </li>
            {BACKEND_NAME === "FastAPI" && (
              <li>
                <span>Swagger Docs</span>
                <a href={BACKEND_ORIGIN + "/docs"} target="_blank" rel="noreferrer">
                  {BACKEND_ORIGIN + "/docs"}
                </a>
              </li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function authenticationLabel(appInfo) {
  return appInfo?.authentication ?? "Unknown";
}

function authenticationBadgeState(appInfo) {
  if (!appInfo || appInfo.authentication === "Disabled") {
    return "neutral";
  }
  return "ok";
}

function dockerLabel(appInfo) {
  return appInfo?.docker ?? "Unknown";
}

function dockerBadgeState(appInfo) {
  if (!appInfo || appInfo.docker !== "Enabled") {
    return "neutral";
  }
  return "ok";
}

function databaseLabel(state) {
  if (state === "connected") return "Database Connected";
  if (state === "disconnected") return "Database Disconnected";
  return "Database Not Configured";
}

function databaseState(state) {
  if (state === "connected") return "ok";
  if (state === "disconnected") return "error";
  return "neutral";
}
