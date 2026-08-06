# {{PROJECT_NAME}}

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
