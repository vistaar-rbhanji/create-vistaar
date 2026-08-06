// Phase 7 template writer.
//
// Generates/overwrites every template file needed for the Welcome Dashboard
// feature (frontend + backend + ORM + docker templates) under templates/.
// Run with: node scripts/write-phase7-templates.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_ROOT = path.resolve(HERE, "..", "templates");

/** relPath (posix-style, forward slashes) -> file content */
const FILES = {};

function write(relPath, content) {
  FILES[relPath] = content;
}

/* =========================================================================
 * A) frontend/react-ts
 * ========================================================================= */

write(
  "frontend/react-ts/package.json",
  `{
  "name": "{{PACKAGE_NAME}}",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "echo No linter configured yet",
    "test": "echo No tests configured yet"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.2",
    "vite": "^6.0.5"
  }
}
`,
);

write(
  "frontend/react-ts/index.html",
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{PROJECT_NAME}}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
);

write(
  "frontend/react-ts/vite.config.ts",
  `import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:{{BACKEND_PORT}}",
        changeOrigin: true,
      },
    },
  },
});
`,
);

write(
  "frontend/react-ts/tsconfig.json",
  `{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "allowJs": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
`,
);

write(
  "frontend/react-ts/src/vite-env.d.ts",
  `/// <reference types="vite/client" />
`,
);

write(
  "frontend/react-ts/src/ui-theme.ts",
  `// UI overlay hook. Left empty by default; a selected UI framework overlay
// (see templates/ui/*) may overwrite this file to load global styles or
// register a theme provider without touching main.tsx.
export {};
`,
);

write(
  "frontend/react-ts/src/main.tsx",
  `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./index.css";
import "./ui-theme";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found.");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`,
);

write(
  "frontend/react-ts/src/App.tsx",
  `import { WelcomeDashboard } from "./components/welcome";

export default function App() {
  return <WelcomeDashboard />;
}
`,
);

write(
  "frontend/react-ts/src/index.css",
  `:root {
  color-scheme: light;
  --color-bg: #f4f7f7;
  --color-surface: #ffffff;
  --color-surface-alt: #eef3f3;
  --color-border: #dbe3e3;
  --color-text: #1f2933;
  --color-text-muted: #52606d;
  --color-primary: #0f766e;
  --color-primary-dark: #0b5b54;
  --color-primary-soft: #e6f4f2;
  --color-accent: #334155;
  --color-success: #16a34a;
  --color-success-soft: #e7f7ec;
  --color-warning: #d97706;
  --color-warning-soft: #fef3e2;
  --color-danger: #dc2626;
  --color-danger-soft: #fdecec;
  --radius-md: 10px;
  --radius-lg: 16px;
  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.06);
  --shadow-md: 0 8px 24px rgba(15, 23, 42, 0.08);
  --font-sans: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-sans);
  background: var(--color-bg);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
}

#root {
  min-height: 100vh;
}

h1,
h2,
h3,
p,
dl,
dd,
ul {
  margin: 0;
}

a {
  color: var(--color-primary);
}

code {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  background: var(--color-surface-alt);
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
  font-size: 0.85em;
  color: var(--color-primary-dark);
}
`,
);

write(
  "frontend/react-ts/src/types/app.ts",
  `export interface AppInfo {
  id: string;
  projectName: string;
  frontend: string;
  backend: string;
  database: string;
  orm: string;
  uiFramework: string;
  authentication: string;
  docker: string;
  createdAt: string;
}

export type ServiceState = "connected" | "disconnected" | "not_configured";
export type HealthStatus = "healthy" | "degraded";

export interface HealthInfo {
  server: "running" | "stopped";
  database: ServiceState;
  status: HealthStatus;
  api: "working" | "down";
}
`,
);

write(
  "frontend/react-ts/src/services/config.ts",
  `export const API_BASE_URL = "/api";
export const BACKEND_ORIGIN = "{{API_URL}}";
export const FRONTEND_ORIGIN = "{{FRONTEND_URL}}";
export const BACKEND_NAME: string = "{{BACKEND}}";
`,
);

write(
  "frontend/react-ts/src/services/api.ts",
  `import { API_BASE_URL } from "./config";

export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(API_BASE_URL + path);
  } catch {
    throw new ApiError("Cannot connect to backend.");
  }

  if (!response.ok) {
    throw new ApiError(
      "Request to " + path + " failed with status " + response.status + ".",
      response.status,
    );
  }

  return (await response.json()) as T;
}
`,
);

write(
  "frontend/react-ts/src/services/appInfoService.ts",
  `import type { AppInfo } from "../types/app";
import { apiGet } from "./api";

export function fetchAppInfo(): Promise<AppInfo> {
  return apiGet<AppInfo>("/app-info");
}
`,
);

write(
  "frontend/react-ts/src/services/healthService.ts",
  `import type { HealthInfo } from "../types/app";
import { apiGet } from "./api";

export function fetchHealth(): Promise<HealthInfo> {
  return apiGet<HealthInfo>("/health");
}
`,
);

write(
  "frontend/react-ts/src/hooks/useAppInfo.ts",
  `import { useEffect, useState } from "react";

import { fetchAppInfo } from "../services/appInfoService";
import type { AppInfo } from "../types/app";

interface UseAppInfoResult {
  appInfo: AppInfo | null;
  loading: boolean;
  error: string | null;
}

export function useAppInfo(): UseAppInfoResult {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchAppInfo()
      .then((data) => {
        if (!cancelled) {
          setAppInfo(data);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { appInfo, loading, error };
}
`,
);

write(
  "frontend/react-ts/src/hooks/useHealth.ts",
  `import { useEffect, useState } from "react";

import { fetchHealth } from "../services/healthService";
import type { HealthInfo } from "../types/app";

interface UseHealthResult {
  health: HealthInfo | null;
  loading: boolean;
  error: string | null;
}

const POLL_INTERVAL_MS = 15000;

export function useHealth(): UseHealthResult {
  const [health, setHealth] = useState<HealthInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetchHealth()
        .then((data) => {
          if (!cancelled) {
            setHealth(data);
            setError(null);
          }
        })
        .catch((err: Error) => {
          if (!cancelled) {
            setError(err.message);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    };

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { health, loading, error };
}
`,
);

write(
  "frontend/react-ts/src/components/welcome/StatusBadge.tsx",
  `export type StatusBadgeState = "ok" | "warn" | "error" | "neutral";

interface StatusBadgeProps {
  label: string;
  state: StatusBadgeState;
}

const DOT: Record<StatusBadgeState, string> = {
  ok: "🟢",
  warn: "🟡",
  error: "🔴",
  neutral: "⚪",
};

export function StatusBadge({ label, state }: StatusBadgeProps) {
  return (
    <span className={"status-badge status-badge--" + state}>
      <span className="status-badge__dot" aria-hidden="true">
        {DOT[state]}
      </span>
      {label}
    </span>
  );
}
`,
);

write(
  "frontend/react-ts/src/components/welcome/ErrorCard.tsx",
  `interface ErrorCardProps {
  title: string;
  message: string;
}

export function ErrorCard({ title, message }: ErrorCardProps) {
  return (
    <div className="error-card" role="alert">
      <div className="error-card__icon" aria-hidden="true">
        ⚠️
      </div>
      <div>
        <p className="error-card__title">{title}</p>
        <p className="error-card__message">{message}</p>
      </div>
    </div>
  );
}
`,
);

write(
  "frontend/react-ts/src/components/welcome/WelcomeDashboard.tsx",
  `import { useAppInfo } from "../../hooks/useAppInfo";
import { useHealth } from "../../hooks/useHealth";
import { BACKEND_NAME, BACKEND_ORIGIN, FRONTEND_ORIGIN } from "../../services/config";
import type { ServiceState } from "../../types/app";
import { ErrorCard } from "./ErrorCard";
import { StatusBadge, type StatusBadgeState } from "./StatusBadge";
import "./welcome.css";

export function WelcomeDashboard() {
  const { appInfo, loading: appInfoLoading, error: appInfoError } = useAppInfo();
  const { health, loading: healthLoading, error: healthError } = useHealth();

  const projectName = appInfo ? appInfo.projectName : "your project";

  return (
    <div className="welcome">
      <header className="welcome__hero">
        <p className="welcome__eyebrow">Congratulations!</p>
        <h1 className="welcome__title">
          Your project "<span>{projectName}</span>" has been successfully created.
        </h1>
        <p className="welcome__subtitle">
          This dashboard proves your frontend, backend, and database are talking to each other.
        </p>
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
              label={"Authentication " + (appInfo ? appInfo.authentication : "Unknown")}
              state={appInfo && appInfo.authentication === "Enabled" ? "ok" : "neutral"}
            />
            <StatusBadge
              label={"Docker " + (appInfo ? appInfo.docker : "Unknown")}
              state={appInfo && appInfo.docker === "Enabled" ? "ok" : "neutral"}
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function databaseLabel(state: ServiceState): string {
  if (state === "connected") return "Database Connected";
  if (state === "disconnected") return "Database Disconnected";
  return "Database Not Configured";
}

function databaseState(state: ServiceState): StatusBadgeState {
  if (state === "connected") return "ok";
  if (state === "disconnected") return "error";
  return "neutral";
}
`,
);

write(
  "frontend/react-ts/src/components/welcome/welcome.css",
  `.welcome {
  max-width: 1080px;
  margin: 0 auto;
  padding: 3rem 1.5rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.welcome__hero {
  text-align: center;
  padding: 2.5rem 1.5rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: #f0fdfa;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.welcome__eyebrow {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  opacity: 0.9;
}

.welcome__title {
  margin-top: 0.5rem;
  font-size: clamp(1.5rem, 2.4vw, 2.1rem);
  font-weight: 700;
  line-height: 1.3;
}

.welcome__title span {
  text-decoration: underline;
  text-decoration-color: rgba(240, 253, 250, 0.5);
  text-underline-offset: 4px;
}

.welcome__subtitle {
  margin-top: 0.75rem;
  font-size: 0.98rem;
  opacity: 0.85;
}

.welcome__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card__title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-accent);
}

.card__hint {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.info-list {
  display: grid;
  gap: 0.6rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed var(--color-border);
  font-size: 0.92rem;
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-row dt {
  color: var(--color-text-muted);
}

.info-row dd {
  font-weight: 600;
  color: var(--color-text);
  text-align: right;
}

.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.badge-row--stacked {
  flex-direction: column;
  align-items: flex-start;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  background: var(--color-surface-alt);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.status-badge--ok {
  background: var(--color-success-soft);
  color: #14532d;
  border-color: rgba(22, 163, 74, 0.25);
}

.status-badge--warn {
  background: var(--color-warning-soft);
  color: #7c2d12;
  border-color: rgba(217, 119, 6, 0.25);
}

.status-badge--error {
  background: var(--color-danger-soft);
  color: #7f1d1d;
  border-color: rgba(220, 38, 38, 0.25);
}

.status-badge--neutral {
  background: var(--color-surface-alt);
  color: var(--color-text-muted);
}

.status-badge__dot {
  font-size: 0.7rem;
}

.overall-status {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.overall-status--healthy strong {
  color: var(--color-success);
}

.overall-status--degraded strong {
  color: var(--color-danger);
}

.error-card {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  background: var(--color-danger-soft);
  border: 1px solid rgba(220, 38, 38, 0.25);
  border-radius: var(--radius-md);
  padding: 1rem 1.1rem;
}

.error-card__icon {
  font-size: 1.2rem;
}

.error-card__title {
  font-weight: 700;
  color: #7f1d1d;
}

.error-card__message {
  margin-top: 0.2rem;
  font-size: 0.88rem;
  color: #7f1d1d;
  opacity: 0.85;
}

.command-list,
.link-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.command-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-size: 0.88rem;
  color: var(--color-text-muted);
  flex-wrap: wrap;
}

.link-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  flex-wrap: wrap;
}

.link-list a {
  font-weight: 600;
  word-break: break-all;
}

@media (max-width: 760px) {
  .welcome__grid {
    grid-template-columns: 1fr;
  }

  .welcome__hero {
    padding: 2rem 1.25rem;
  }

  .info-row,
  .link-list li {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
  }

  .info-row dd {
    text-align: left;
  }
}
`,
);

write(
  "frontend/react-ts/src/components/welcome/index.ts",
  `export { WelcomeDashboard } from "./WelcomeDashboard";
export { StatusBadge } from "./StatusBadge";
export { ErrorCard } from "./ErrorCard";
`,
);

write(
  "frontend/react-ts/README.md",
  `# {{PROJECT_NAME}}

React + TypeScript frontend scaffolded by create-vistaar.

On startup this app renders a Welcome Dashboard that fetches live data from
the backend (GET /api/app-info and GET /api/health) to prove the full stack —
frontend, backend, and database — is wired up correctly. Nothing on the page
is hardcoded except static labels.

Scripts:

- npm run dev - start the Vite dev server (proxies /api to the backend).
- npm run build - type-check and build for production.
- npm run preview - preview the production build.

Architecture:

- src/services - API clients (no UI, no state).
- src/hooks - data-fetching hooks used by components.
- src/types - shared TypeScript types.
- src/components/welcome - the Welcome Dashboard UI.
`,
);

/* =========================================================================
 * B) frontend/react-js
 * ========================================================================= */

write(
  "frontend/react-js/package.json",
  `{
  "name": "{{PACKAGE_NAME}}",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "echo No linter configured yet",
    "test": "echo No tests configured yet"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.5"
  }
}
`,
);

write(
  "frontend/react-js/index.html",
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{PROJECT_NAME}}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
);

write(
  "frontend/react-js/vite.config.js",
  `import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:{{BACKEND_PORT}}",
        changeOrigin: true,
      },
    },
  },
});
`,
);

write(
  "frontend/react-js/src/ui-theme.js",
  `// UI overlay hook. Left empty by default; a selected UI framework overlay
// (see templates/ui/*) may overwrite this file to load global styles or
// register a theme provider without touching main.jsx.
export {};
`,
);

write(
  "frontend/react-js/src/main.jsx",
  `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./index.css";
import "./ui-theme";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found.");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`,
);

write(
  "frontend/react-js/src/App.jsx",
  `import { WelcomeDashboard } from "./components/welcome";

export default function App() {
  return <WelcomeDashboard />;
}
`,
);

write("frontend/react-js/src/index.css", FILES["frontend/react-ts/src/index.css"]);

write(
  "frontend/react-js/src/types/app.js",
  `/**
 * @typedef {Object} AppInfo
 * @property {string} id
 * @property {string} projectName
 * @property {string} frontend
 * @property {string} backend
 * @property {string} database
 * @property {string} orm
 * @property {string} uiFramework
 * @property {string} authentication
 * @property {string} docker
 * @property {string} createdAt
 */

/**
 * @typedef {Object} HealthInfo
 * @property {"running"|"stopped"} server
 * @property {"connected"|"disconnected"|"not_configured"} database
 * @property {"healthy"|"degraded"} status
 * @property {"working"|"down"} api
 */

export {};
`,
);

write(
  "frontend/react-js/src/services/config.js",
  `export const API_BASE_URL = "/api";
export const BACKEND_ORIGIN = "{{API_URL}}";
export const FRONTEND_ORIGIN = "{{FRONTEND_URL}}";
export const BACKEND_NAME = "{{BACKEND}}";
`,
);

write(
  "frontend/react-js/src/services/api.js",
  `import { API_BASE_URL } from "./config";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiGet(path) {
  let response;

  try {
    response = await fetch(API_BASE_URL + path);
  } catch {
    throw new ApiError("Cannot connect to backend.");
  }

  if (!response.ok) {
    throw new ApiError(
      "Request to " + path + " failed with status " + response.status + ".",
      response.status,
    );
  }

  return response.json();
}
`,
);

write(
  "frontend/react-js/src/services/appInfoService.js",
  `import { apiGet } from "./api";

export function fetchAppInfo() {
  return apiGet("/app-info");
}
`,
);

write(
  "frontend/react-js/src/services/healthService.js",
  `import { apiGet } from "./api";

export function fetchHealth() {
  return apiGet("/health");
}
`,
);

write(
  "frontend/react-js/src/hooks/useAppInfo.js",
  `import { useEffect, useState } from "react";

import { fetchAppInfo } from "../services/appInfoService";

export function useAppInfo() {
  const [appInfo, setAppInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchAppInfo()
      .then((data) => {
        if (!cancelled) {
          setAppInfo(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { appInfo, loading, error };
}
`,
);

write(
  "frontend/react-js/src/hooks/useHealth.js",
  `import { useEffect, useState } from "react";

import { fetchHealth } from "../services/healthService";

const POLL_INTERVAL_MS = 15000;

export function useHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetchHealth()
        .then((data) => {
          if (!cancelled) {
            setHealth(data);
            setError(null);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err.message);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    };

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { health, loading, error };
}
`,
);

write(
  "frontend/react-js/src/components/welcome/StatusBadge.jsx",
  `const DOT = {
  ok: "🟢",
  warn: "🟡",
  error: "🔴",
  neutral: "⚪",
};

export function StatusBadge({ label, state }) {
  return (
    <span className={"status-badge status-badge--" + state}>
      <span className="status-badge__dot" aria-hidden="true">
        {DOT[state]}
      </span>
      {label}
    </span>
  );
}
`,
);

write(
  "frontend/react-js/src/components/welcome/ErrorCard.jsx",
  `export function ErrorCard({ title, message }) {
  return (
    <div className="error-card" role="alert">
      <div className="error-card__icon" aria-hidden="true">
        ⚠️
      </div>
      <div>
        <p className="error-card__title">{title}</p>
        <p className="error-card__message">{message}</p>
      </div>
    </div>
  );
}
`,
);

write(
  "frontend/react-js/src/components/welcome/WelcomeDashboard.jsx",
  `import { useAppInfo } from "../../hooks/useAppInfo";
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
        <p className="welcome__eyebrow">Congratulations!</p>
        <h1 className="welcome__title">
          Your project "<span>{projectName}</span>" has been successfully created.
        </h1>
        <p className="welcome__subtitle">
          This dashboard proves your frontend, backend, and database are talking to each other.
        </p>
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
              label={"Authentication " + (appInfo ? appInfo.authentication : "Unknown")}
              state={appInfo && appInfo.authentication === "Enabled" ? "ok" : "neutral"}
            />
            <StatusBadge
              label={"Docker " + (appInfo ? appInfo.docker : "Unknown")}
              state={appInfo && appInfo.docker === "Enabled" ? "ok" : "neutral"}
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
`,
);

write("frontend/react-js/src/components/welcome/welcome.css", FILES["frontend/react-ts/src/components/welcome/welcome.css"]);

write(
  "frontend/react-js/src/components/welcome/index.js",
  `export { WelcomeDashboard } from "./WelcomeDashboard";
export { StatusBadge } from "./StatusBadge";
export { ErrorCard } from "./ErrorCard";
`,
);

write(
  "frontend/react-js/README.md",
  `# {{PROJECT_NAME}}

React + JavaScript frontend scaffolded by create-vistaar.

On startup this app renders a Welcome Dashboard that fetches live data from
the backend (GET /api/app-info and GET /api/health) to prove the full stack —
frontend, backend, and database — is wired up correctly. Nothing on the page
is hardcoded except static labels.

Scripts:

- npm run dev - start the Vite dev server (proxies /api to the backend).
- npm run build - build for production.
- npm run preview - preview the production build.

Architecture:

- src/services - API clients (no UI, no state).
- src/hooks - data-fetching hooks used by components.
- src/components/welcome - the Welcome Dashboard UI.
`,
);

/* =========================================================================
 * C) backend/express
 * ========================================================================= */

write(
  "backend/express/package.json",
  `{
  "name": "{{PACKAGE_NAME}}-api",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js",
    "db:migrate": "echo No migrations needed for the file-based store",
    "db:seed": "echo Seeding happens automatically on server start",
    "db:setup": "npm run db:migrate && npm run db:seed"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2"
  }
}
`,
);

write(
  "backend/express/src/db.js",
  `import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRIVER = process.env.DB_DRIVER || "{{DB_DRIVER}}";
const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "app-info.json");

let driverPromise = null;

function loadDriver() {
  if (DRIVER === "file") {
    return Promise.resolve(null);
  }
  if (!driverPromise) {
    driverPromise = import("./db-" + DRIVER + ".js").catch((error) => {
      console.error('[db] Failed to load driver "' + DRIVER + '": ' + error.message);
      return null;
    });
  }
  return driverPromise;
}

async function ensureFileStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(null), "utf8");
  }
}

export function getDriverName() {
  return DRIVER;
}

export async function connect() {
  if (DRIVER === "file") {
    await ensureFileStore();
    return;
  }
  const driver = await loadDriver();
  if (driver && driver.connect) {
    await driver.connect();
  }
}

export async function checkDatabase() {
  if (DRIVER === "file") {
    try {
      await ensureFileStore();
      return true;
    } catch {
      return false;
    }
  }
  const driver = await loadDriver();
  if (!driver) {
    return false;
  }
  try {
    return await driver.checkDatabase();
  } catch {
    return false;
  }
}

export async function getAppInfo() {
  if (DRIVER === "file") {
    await ensureFileStore();
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  }
  const driver = await loadDriver();
  if (!driver) {
    return null;
  }
  return driver.getAppInfo();
}

export async function seedIfEmpty(seedData) {
  if (DRIVER === "file") {
    await ensureFileStore();
    const existing = await getAppInfo();
    if (existing) {
      return existing;
    }
    const record = Object.assign({ id: "seed-1" }, seedData);
    await fs.writeFile(DATA_FILE, JSON.stringify(record, null, 2), "utf8");
    return record;
  }
  const driver = await loadDriver();
  if (!driver) {
    return null;
  }
  return driver.seedIfEmpty(seedData);
}
`,
);

write(
  "backend/express/src/seed-data.json",
  `{
  "projectName": "{{PROJECT_NAME}}",
  "frontend": "{{FRONTEND}}",
  "backend": "{{BACKEND}}",
  "database": "{{DATABASE}}",
  "orm": "{{ORM}}",
  "uiFramework": "{{UI_FRAMEWORK}}",
  "authentication": "{{AUTHENTICATION}}",
  "docker": "{{DOCKER}}",
  "createdAt": "{{CREATED_AT}}"
}
`,
);

write(
  "backend/express/src/routes/app-info.js",
  `import { Router } from "express";

import { getAppInfo } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const appInfo = await getAppInfo();
    if (!appInfo) {
      res.status(404).json({ error: "AppInfo has not been seeded yet." });
      return;
    }
    res.json(appInfo);
  } catch (error) {
    res.status(500).json({ error: "Failed to load app info.", message: error.message });
  }
});

export default router;
`,
);

write(
  "backend/express/src/routes/health.js",
  `import { Router } from "express";

import { checkDatabase, getDriverName } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  const driver = getDriverName();
  let database = "not_configured";

  if (driver !== "file") {
    const connected = await checkDatabase();
    database = connected ? "connected" : "disconnected";
  }

  const healthy = database === "connected" || database === "not_configured";

  res.json({
    server: "running",
    database,
    status: healthy ? "healthy" : "degraded",
    api: "working",
  });
});

export default router;
`,
);

write(
  "backend/express/src/index.js",
  `import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import cors from "cors";
import express from "express";

import { connect, seedIfEmpty } from "./db.js";
import appInfoRoutes from "./routes/app-info.js";
import healthRoutes from "./routes/health.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectName = "{{PROJECT_NAME}}";
const seedData = JSON.parse(fs.readFileSync(path.join(__dirname, "seed-data.json"), "utf8"));

const app = express();
const port = process.env.PORT || {{BACKEND_PORT}};

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.use("/api/app-info", appInfoRoutes);
app.use("/api/health", healthRoutes);

app.listen(port, async () => {
  console.log(projectName + " API listening on port " + port);
  try {
    await connect();
    await seedIfEmpty(seedData);
    console.log("[db] ready");
  } catch (error) {
    console.error("[db] startup error:", error.message);
  }
});

export default app;
`,
);

write(
  "backend/express/.env.example",
  `PORT={{BACKEND_PORT}}
DB_DRIVER={{DB_DRIVER}}
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/{{DB_NAME}}
MONGODB_URI=mongodb://localhost:27017/{{DB_NAME}}
CORS_ORIGIN={{FRONTEND_URL}}
`,
);

write(
  "backend/express/README.md",
  `# {{PROJECT_NAME}} API (Express)

Express backend generated by create-vistaar. Serves the Welcome Dashboard
data consumed by the frontend and verifies the database connection on every
health check.

## Endpoints

- GET /api/app-info - returns the seeded AppInfo record from the database.
- GET /api/health - reports server, database, and API status.

## Scripts

- npm run dev - start the API with file watching.
- npm run start - start the API.
- npm run db:migrate - apply database migrations (driver-specific).
- npm run db:seed - seed the AppInfo record.
- npm run db:setup - run migrate then seed.

## Configuration

Copy .env.example to .env and adjust PORT, DB_DRIVER, DATABASE_URL /
MONGODB_URI, and CORS_ORIGIN for your environment.

Persistence driver: {{DB_DRIVER}}.
`,
);

/* =========================================================================
 * D) ORM templates
 * ========================================================================= */

// --- prisma ---
write(
  "orm/prisma/package.json",
  `{
  "scripts": {
    "postinstall": "prisma generate",
    "db:migrate": "prisma db push",
    "db:seed": "node src/seed.js",
    "db:setup": "npm run db:migrate && npm run db:seed"
  },
  "dependencies": {
    "@prisma/client": "^6.1.0"
  },
  "devDependencies": {
    "prisma": "^6.1.0"
  }
}
`,
);

write(
  "orm/prisma/prisma/schema.prisma",
  `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model AppInfo {
  id             String   @id @default(cuid())
  projectName    String
  frontend       String
  backend        String
  database       String
  orm            String
  uiFramework    String
  authentication String
  docker         String
  createdAt      DateTime @default(now())
}
`,
);

write(
  "orm/prisma/src/db-prisma.js",
  `import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function connect() {
  await prisma.$connect();
}

export async function checkDatabase() {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

export async function getAppInfo() {
  return prisma.appInfo.findFirst({ orderBy: { createdAt: "asc" } });
}

export async function seedIfEmpty(seedData) {
  const existing = await getAppInfo();
  if (existing) {
    return existing;
  }
  return prisma.appInfo.create({ data: seedData });
}
`,
);

write(
  "orm/prisma/src/seed.js",
  `import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { connect, seedIfEmpty } from "./db-prisma.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedData = JSON.parse(fs.readFileSync(path.join(__dirname, "seed-data.json"), "utf8"));

async function main() {
  await connect();
  const record = await seedIfEmpty(
    Object.assign({}, seedData, { createdAt: new Date(seedData.createdAt) }),
  );
  console.log("[seed] AppInfo ready:", record);
}

main().catch((error) => {
  console.error("[seed] failed:", error);
  process.exit(1);
});
`,
);

// --- drizzle ---
write(
  "orm/drizzle/package.json",
  `{
  "scripts": {
    "db:migrate": "drizzle-kit push",
    "db:seed": "node src/seed.js",
    "db:setup": "npm run db:migrate && npm run db:seed"
  },
  "dependencies": {
    "drizzle-orm": "^0.38.2",
    "postgres": "^3.4.5"
  },
  "devDependencies": {
    "drizzle-kit": "^0.30.1"
  }
}
`,
);

write(
  "orm/drizzle/drizzle/schema.js",
  `import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const appInfo = pgTable("app_info", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  projectName: text("project_name").notNull(),
  frontend: text("frontend").notNull(),
  backend: text("backend").notNull(),
  database: text("database").notNull(),
  orm: text("orm").notNull(),
  uiFramework: text("ui_framework").notNull(),
  authentication: text("authentication").notNull(),
  docker: text("docker").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
`,
);

write(
  "orm/drizzle/drizzle.config.js",
  `import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.js",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
`,
);

write(
  "orm/drizzle/src/db-drizzle.js",
  `import { asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { appInfo } from "../drizzle/schema.js";

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client);

export async function connect() {
  await client.unsafe("SELECT 1");
}

export async function checkDatabase() {
  try {
    await client.unsafe("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

export async function getAppInfo() {
  const rows = await db.select().from(appInfo).orderBy(asc(appInfo.createdAt)).limit(1);
  return rows[0] || null;
}

export async function seedIfEmpty(seedData) {
  const existing = await getAppInfo();
  if (existing) {
    return existing;
  }
  const inserted = await db.insert(appInfo).values(seedData).returning();
  return inserted[0];
}
`,
);

write(
  "orm/drizzle/src/seed.js",
  `import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { connect, seedIfEmpty } from "./db-drizzle.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedData = JSON.parse(fs.readFileSync(path.join(__dirname, "seed-data.json"), "utf8"));

async function main() {
  await connect();
  const record = await seedIfEmpty(seedData);
  console.log("[seed] AppInfo ready:", record);
}

main().catch((error) => {
  console.error("[seed] failed:", error);
  process.exit(1);
});
`,
);

// --- mongoose ---
write(
  "orm/mongoose/package.json",
  `{
  "scripts": {
    "db:migrate": "echo MongoDB does not require migrations",
    "db:seed": "node src/seed.js",
    "db:setup": "npm run db:seed"
  },
  "dependencies": {
    "mongoose": "^8.9.0"
  }
}
`,
);

write(
  "orm/mongoose/src/models/AppInfo.js",
  `import mongoose from "mongoose";

const appInfoSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  frontend: { type: String, required: true },
  backend: { type: String, required: true },
  database: { type: String, required: true },
  orm: { type: String, required: true },
  uiFramework: { type: String, required: true },
  authentication: { type: String, required: true },
  docker: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const AppInfo = mongoose.models.AppInfo || mongoose.model("AppInfo", appInfoSchema);
`,
);

write(
  "orm/mongoose/src/db-mongoose.js",
  `import mongoose from "mongoose";

import { AppInfo } from "./models/AppInfo.js";

export async function connect() {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  await mongoose.connect(process.env.MONGODB_URI);
}

export async function checkDatabase() {
  try {
    await connect();
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
}

function toPlainAppInfo(doc) {
  const plain = doc.toObject ? doc.toObject() : doc;
  plain.id = String(plain._id);
  delete plain._id;
  delete plain.__v;
  return plain;
}

export async function getAppInfo() {
  await connect();
  const doc = await AppInfo.findOne().sort({ createdAt: 1 });
  return doc ? toPlainAppInfo(doc) : null;
}

export async function seedIfEmpty(seedData) {
  await connect();
  const existing = await getAppInfo();
  if (existing) {
    return existing;
  }
  const record = await AppInfo.create(
    Object.assign({}, seedData, { createdAt: new Date(seedData.createdAt) }),
  );
  return toPlainAppInfo(record);
}
`,
);

write(
  "orm/mongoose/src/seed.js",
  `import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { connect, seedIfEmpty } from "./db-mongoose.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedData = JSON.parse(fs.readFileSync(path.join(__dirname, "seed-data.json"), "utf8"));

async function main() {
  await connect();
  const record = await seedIfEmpty(seedData);
  console.log("[seed] AppInfo ready:", record);
  process.exit(0);
}

main().catch((error) => {
  console.error("[seed] failed:", error);
  process.exit(1);
});
`,
);

/* =========================================================================
 * E) backend/fastapi
 * ========================================================================= */

write(
  "backend/fastapi/main.py",
  `import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import connect, seed_if_empty
from app.routes import app_info, health
from app.seed_data import get_seed_data

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await connect()
        await seed_if_empty(get_seed_data())
        print("[db] ready")
    except Exception as error:
        print("[db] startup error: " + str(error))
    yield


app = FastAPI(title="{{PROJECT_NAME}}", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGIN", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(app_info.router, prefix="/api/app-info", tags=["app-info"])
app.include_router(health.router, prefix="/api/health", tags=["health"])
`,
);

write(
  "backend/fastapi/requirements.txt",
  `fastapi>=0.115.0
uvicorn[standard]>=0.32.0
python-dotenv>=1.0.1
sqlalchemy>=2.0.36
psycopg2-binary>=2.9.10
motor>=3.6.0
pydantic>=2.10.3
`,
);

write("backend/fastapi/app/__init__.py", "");
write("backend/fastapi/app/routes/__init__.py", "");

write(
  "backend/fastapi/app/models.py",
  `from sqlalchemy import Column, DateTime, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class AppInfo(Base):
    __tablename__ = "app_info"

    id = Column(String, primary_key=True)
    projectName = Column("project_name", String, nullable=False)
    frontend = Column(String, nullable=False)
    backend = Column(String, nullable=False)
    database = Column(String, nullable=False)
    orm = Column(String, nullable=False)
    uiFramework = Column("ui_framework", String, nullable=False)
    authentication = Column(String, nullable=False)
    docker = Column(String, nullable=False)
    createdAt = Column("created_at", DateTime, nullable=False)
`,
);

write(
  "backend/fastapi/app/db.py",
  `"""Database driver abstraction, selected via DB_DRIVER at runtime."""

import json
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

DB_DRIVER = os.getenv("DB_DRIVER", "{{DB_DRIVER}}")

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_FILE = DATA_DIR / "app-info.json"

_sa_engine = None
_sa_session_factory = None
_sa_model = None

_motor_client = None
_motor_db = None


def _ensure_file_store() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not DATA_FILE.exists():
        DATA_FILE.write_text("null", encoding="utf-8")


def _parse_created_at(value: str) -> datetime:
    if value.endswith("Z"):
        value = value[:-1] + "+00:00"
    return datetime.fromisoformat(value)


def _init_sqlalchemy() -> None:
    global _sa_engine, _sa_session_factory, _sa_model
    if _sa_engine is not None:
        return

    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    from app.models import AppInfo, Base

    database_url = os.getenv("DATABASE_URL", "")
    _sa_engine = create_engine(database_url, pool_pre_ping=True)
    Base.metadata.create_all(_sa_engine)
    _sa_session_factory = sessionmaker(bind=_sa_engine)
    _sa_model = AppInfo


def _init_motor() -> None:
    global _motor_client, _motor_db
    if _motor_client is not None:
        return

    from motor.motor_asyncio import AsyncIOMotorClient

    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/{{DB_NAME}}")
    _motor_client = AsyncIOMotorClient(mongo_uri)
    _motor_db = _motor_client.get_default_database()


async def connect() -> None:
    if DB_DRIVER == "sqlalchemy":
        _init_sqlalchemy()
    elif DB_DRIVER == "motor":
        _init_motor()
    else:
        _ensure_file_store()


async def check_database() -> bool:
    try:
        if DB_DRIVER == "sqlalchemy":
            _init_sqlalchemy()
            from sqlalchemy import text

            with _sa_engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return True

        if DB_DRIVER == "motor":
            _init_motor()
            await _motor_db.command("ping")
            return True

        _ensure_file_store()
        return True
    except Exception:
        return False


def _row_to_dict(row: Any) -> dict:
    return {
        "id": row.id,
        "projectName": row.projectName,
        "frontend": row.frontend,
        "backend": row.backend,
        "database": row.database,
        "orm": row.orm,
        "uiFramework": row.uiFramework,
        "authentication": row.authentication,
        "docker": row.docker,
        "createdAt": row.createdAt.isoformat() if row.createdAt else None,
    }


async def get_app_info() -> Optional[dict]:
    if DB_DRIVER == "sqlalchemy":
        _init_sqlalchemy()
        with _sa_session_factory() as session:
            row = session.query(_sa_model).order_by(_sa_model.createdAt.asc()).first()
            return _row_to_dict(row) if row else None

    if DB_DRIVER == "motor":
        _init_motor()
        doc = await _motor_db.app_info.find_one(sort=[("createdAt", 1)])
        if not doc:
            return None
        doc["id"] = str(doc.pop("_id"))
        return doc

    _ensure_file_store()
    raw = DATA_FILE.read_text(encoding="utf-8")
    return json.loads(raw)


async def seed_if_empty(seed_data: dict) -> Optional[dict]:
    existing = await get_app_info()
    if existing:
        return existing

    if DB_DRIVER == "sqlalchemy":
        _init_sqlalchemy()
        with _sa_session_factory() as session:
            row = _sa_model(
                id=str(uuid.uuid4()),
                projectName=seed_data["projectName"],
                frontend=seed_data["frontend"],
                backend=seed_data["backend"],
                database=seed_data["database"],
                orm=seed_data["orm"],
                uiFramework=seed_data["uiFramework"],
                authentication=seed_data["authentication"],
                docker=seed_data["docker"],
                createdAt=_parse_created_at(seed_data["createdAt"]),
            )
            session.add(row)
            session.commit()
            session.refresh(row)
            return _row_to_dict(row)

    if DB_DRIVER == "motor":
        _init_motor()
        doc = dict(seed_data)
        result = await _motor_db.app_info.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        return doc

    _ensure_file_store()
    record = {"id": "seed-1"}
    record.update(seed_data)
    DATA_FILE.write_text(json.dumps(record, indent=2), encoding="utf-8")
    return record
`,
);

write(
  "backend/fastapi/app/seed_data.py",
  `import json
from pathlib import Path

SEED_DATA_PATH = Path(__file__).resolve().parent / "seed_data.json"


def get_seed_data() -> dict:
    return json.loads(SEED_DATA_PATH.read_text(encoding="utf-8"))
`,
);

write(
  "backend/fastapi/app/seed_data.json",
  `{
  "projectName": "{{PROJECT_NAME}}",
  "frontend": "{{FRONTEND}}",
  "backend": "{{BACKEND}}",
  "database": "{{DATABASE}}",
  "orm": "{{ORM}}",
  "uiFramework": "{{UI_FRAMEWORK}}",
  "authentication": "{{AUTHENTICATION}}",
  "docker": "{{DOCKER}}",
  "createdAt": "{{CREATED_AT}}"
}
`,
);

write(
  "backend/fastapi/app/routes/app_info.py",
  `from fastapi import APIRouter, HTTPException

from app.db import get_app_info

router = APIRouter()


@router.get("")
async def read_app_info():
    app_info = await get_app_info()
    if not app_info:
        raise HTTPException(status_code=404, detail="AppInfo has not been seeded yet.")
    return app_info
`,
);

write(
  "backend/fastapi/app/routes/health.py",
  `from fastapi import APIRouter

from app.db import DB_DRIVER, check_database

router = APIRouter()


@router.get("")
async def read_health():
    database = "not_configured"

    if DB_DRIVER != "file":
        database = "connected" if await check_database() else "disconnected"

    healthy = database in ("connected", "not_configured")

    return {
        "server": "running",
        "database": database,
        "status": "healthy" if healthy else "degraded",
        "api": "working",
    }
`,
);

write(
  "backend/fastapi/.env.example",
  `PORT={{BACKEND_PORT}}
DB_DRIVER={{DB_DRIVER}}
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/{{DB_NAME}}
MONGODB_URI=mongodb://localhost:27017/{{DB_NAME}}
CORS_ORIGIN={{FRONTEND_URL}}
`,
);

write(
  "backend/fastapi/README.md",
  `# {{PROJECT_NAME}} API (FastAPI)

FastAPI backend generated by create-vistaar. Serves the Welcome Dashboard
data consumed by the frontend and verifies the database connection on every
health check.

## Run

Install dependencies with pip install -r requirements.txt, then start with
uvicorn main:app --reload --port {{BACKEND_PORT}}.

## Endpoints

- GET /api/app-info - returns the seeded AppInfo record from the database.
- GET /api/health - reports server, database, and API status.
- GET /docs - interactive Swagger documentation (built into FastAPI).

## Configuration

Copy .env.example to .env and adjust PORT, DB_DRIVER, DATABASE_URL /
MONGODB_URI, and CORS_ORIGIN for your environment.

Persistence driver: {{DB_DRIVER}}.
`,
);

/* =========================================================================
 * F) docker/default
 * ========================================================================= */

write(
  "docker/default/docker-compose.yml",
  `services:
  frontend:
    build:
      context: ./frontend
      dockerfile: ../docker/Dockerfile.frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: ../docker/Dockerfile.backend
    ports:
      - "{{BACKEND_PORT}}:{{BACKEND_PORT}}"
    environment:
      PORT: "{{BACKEND_PORT}}"
      DB_DRIVER: "{{DB_DRIVER}}"
      DATABASE_URL: postgresql://postgres:postgres@db:5432/{{DB_NAME}}
      MONGODB_URI: mongodb://db:27017/{{DB_NAME}}
      CORS_ORIGIN: http://localhost:5173
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: {{DB_NAME}}
    ports:
      - "5432:5432"
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
`,
);

write(
  "docker/default/docker/Dockerfile.frontend",
  `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
`,
);

write(
  "docker/default/docker/Dockerfile.backend",
  `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE {{BACKEND_PORT}}
CMD ["npm", "run", "dev"]
`,
);

write(
  "docker/default/.dockerignore",
  `node_modules
dist
.env
.git
*.log
`,
);

/* =========================================================================
 * G) UI overlay enhancements
 * ========================================================================= */

write(
  "ui/shadcn/package.json",
  `{
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.468.0",
    "tailwind-merge": "^2.5.5"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.17",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20"
  }
}
`,
);

write(
  "ui/shadcn/src/ui-theme.tsx",
  `// ShadCN overlay hook. Intentionally empty: shadcn components are used
// directly where needed and don't require a global provider. Tailwind and
// its dependencies are installed via this overlay's package.json.
export {};
`,
);

write(
  "ui/shadcn/README.md",
  `# {{PROJECT_NAME}} — ShadCN UI overlay

Copy these UI primitives into the frontend after scaffolding.

Note: the Welcome Dashboard ships with its own polished CSS (see
frontend/src/components/welcome/welcome.css) so it renders consistently
regardless of the selected UI framework. ShadCN, Tailwind, and their
dependencies are installed so you can build the rest of your app's UI with
them.
`,
);

write(
  "ui/bootstrap/src/ui-theme.js",
  `import "../styles.css";
`,
);

write(
  "ui/bootstrap/README.md",
  `# {{PROJECT_NAME}} — Bootstrap UI overlay

Note: the Welcome Dashboard ships with its own polished CSS (see
frontend/src/components/welcome/welcome.css) so it renders consistently
regardless of the selected UI framework. Bootstrap is installed and loaded
globally via frontend/src/ui-theme.js so you can use its components
elsewhere in your app.
`,
);

write(
  "ui/material-ui/src/ui-theme.tsx",
  `// Material UI overlay hook. Wrap your app with a ThemeProvider using the
// palette exported from theme.js if you want app-wide Material UI theming.
export {};
`,
);

write(
  "ui/material-ui/README.md",
  `# {{PROJECT_NAME}} — Material UI overlay

Note: the Welcome Dashboard ships with its own polished CSS (see
frontend/src/components/welcome/welcome.css) so it renders consistently
regardless of the selected UI framework. Material UI and its peer
dependencies are installed for use in the rest of your app; see theme.js for
a starting palette.
`,
);

/* =========================================================================
 * Write everything to disk
 * ========================================================================= */

const relPaths = Object.keys(FILES).sort();
let written = 0;

for (const relPath of relPaths) {
  const fullPath = path.join(TEMPLATES_ROOT, ...relPath.split("/"));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, FILES[relPath], "utf8");
  written += 1;
  console.log("wrote " + relPath);
}

// H) Delete templates/orm/.gitkeep now that orm/* folders exist.
const gitkeep = path.join(TEMPLATES_ROOT, "orm", ".gitkeep");
if (fs.existsSync(gitkeep)) {
  fs.rmSync(gitkeep, { force: true });
  console.log("removed orm/.gitkeep");
}

console.log("");
console.log("Done. Wrote " + written + " files under " + TEMPLATES_ROOT);
