# create-vistaar

Interactive CLI that bootstraps full-stack projects from reusable templates.

> **Phase 1:** prompts collect a typed `ProjectConfig` and print it.
> **Phase 2:** `TemplateEngine` finds, validates, copies templates and replaces `{{VARS}}`.
> **Phase 3:** `ProjectGenerator` scaffolds `<projectName>/` via independent generators.
> **Phase 4:** `ProjectInstaller` runs selected post-steps (`npm install`, git, husky, ESLint/Prettier).
> **Phase 5:** Data-driven `templates/modules/*` via `ModuleLoader` (`enabledWhen` from `module.json`).
> **Phase 6:** First company module `auth` — variants for TS/JS + Express/FastAPI; feature summary from `module.json`.
> **Phase 7:** Welcome Dashboard — live `GET /api/app-info` + `GET /api/health` (FE → API → DB/seed).
> **Phase 8:** Setup Wizard — `GET /api/setup-status`, doctor/scripts, stack-specific README; wizard until setup completes.
> **Phase 9:** Dual CLI architecture — `create-vistaar` (scaffold) + `vistaar` (manage); reusable `execute()` commands.
> **Phase 10:** Local module system — `modules/*` + `ModuleRegistry` + stable `install(context)` (see MODULES.md).

## Requirements

- Node.js 18+

## Install / run

```bash
# Development
npm install
npm run dev              # create-vistaar
npm run dev:vistaar      # vistaar management CLI

# After build
npm run build
node dist/index.js
node dist/vistaar.js

# Linked globally
npm link
create-vistaar
vistaar doctor
vistaar add auth         # coming soon
```

## CLI architecture (Phase 9)

| Binary | Responsibility |
| --- | --- |
| `create-vistaar` | Project **creation** only (Version 1) |
| `vistaar` | Project **management** (doctor today; add/generate/update coming soon) |

Commands live under `src/commands/<name>/` and export `execute(context)` with **no Commander dependency**. Entry points only register commands — so the same modules can later ship in a standalone `vistaar` package.

```
src/commands/
  create/      scaffold
  doctor/      diagnose generated projects
  add/         coming soon (module marketplace)
  generate/    coming soon (crud, etc.)
  update/      coming soon
  shared/      coming-soon helpers, future module ids
src/cli/       Commander registration only
```

## Prompts

| Prompt | Options |
| --- | --- |
| Project name | free text |
| Frontend | React |
| Language | TypeScript, JavaScript |
| UI framework | ShadCN, Bootstrap, Material UI |
| Backend | Express, FastAPI, None |
| Database | PostgreSQL, MongoDB, None |
| ORM | Prisma / Drizzle (PostgreSQL), Mongoose (MongoDB); skipped if no DB |
| Authentication | Yes / No |
| Docker | Yes / No |
| Git | Yes / No |
| Husky | Yes / No |
| ESLint + Prettier | Yes / No |

## Templates

```
templates/
  frontend/react-ts
  frontend/react-js
  backend/express
  backend/fastapi
  database/postgres
  database/mongodb
  ui/shadcn
  ui/bootstrap
  ui/material-ui
  orm/prisma|drizzle|mongoose
  docker/default
  modules/auth|rbac|dashboard
```

Supported placeholders include `{{PROJECT_NAME}}`, `{{PACKAGE_NAME}}`, `{{DB_NAME}}`, stack labels (`{{FRONTEND}}`, `{{BACKEND}}`, …), and `{{DB_DRIVER}}`.

## First-run Welcome Dashboard

Generated apps no longer show a blank Vite landing page. The frontend Welcome Dashboard loads **live** data:

`Frontend → GET /api/app-info & /api/health → Backend → Database (seeded AppInfo)`

- AppInfo is seeded from your CLI answers (never hardcoded in the dashboard).
- Health actually checks the persistence driver (Prisma / Drizzle / Mongoose / file / SQLAlchemy / Motor).
- Architecture: `services/` · `hooks/` · `types/` · `components/welcome/`.
- After generate: `cd backend && npm run dev` and `cd frontend && npm run dev`.

When a database + ORM is selected, run `cd backend && npm run db:setup` (or rely on auto-seed on API boot once the DB is reachable).

## Setup Wizard (first run)

On first load the frontend calls `GET /api/setup-status`. If setup is incomplete it shows the **Setup Wizard** (progress, DB help, copyable commands, auto-refresh). When complete it switches to the Welcome Dashboard.

From the project root:

```bash
npm run setup      # guidance + doctor
npm run doctor     # environment checklist
npm run migrate    # schema push / migrations
npm run seed       # AppInfo seed
npm run dev:backend
npm run dev:frontend
```

## Modules

Company features live under `templates/modules/<name>/` with a `module.json`:

- `enabledWhen` — auto-select from prompts (auth uses `authentication: true`)
- `templateFolders` + `variants` — adapt to language/backend without CLI hardcoding
- `npmPackages` — merged into app `package.json` before `npm install`
- `envExample` — appended to `.env.example`
- `features` / `summaryTitle` — printed after apply and in the success banner

The first module is **auth** (stubs only — no real authentication logic). The same mechanism is ready for RBAC, uploads, S3, email, notifications, etc.

## Architecture

```
src/
  cli/              Commander registration (create-vistaar / vistaar)
  commands/         Reusable execute() modules (create, doctor, add, …)
  module-system/    ModuleRegistry, standardInstall, stable install(context) API
  generators/       Frontend / UI / Backend / Database / ORM / Modules
  template-engine/  find / validate / copy / {{var}} substitution
  installers/       npm / git / husky / ESLint+Prettier / db setup / module post-install
  prompts/          Question registry + collector
  types/            Strongly typed ProjectConfig
  utils/            Logging and config printing
modules/            Local self-contained modules (auth, docker, stubs, …)
```

See [MODULES.md](./MODULES.md) for how to author and register modules.

## Documentation

Open the static docs site (HTML/CSS/vanilla JS — no build step):

- [docs/index.html](./docs/index.html) — Getting Started, Installation, CLI, Roadmap, FAQ
`TemplateEngine` depends on a `FileSystemPort` (default: fs-extra adapter) so tests and alternate roots inject cleanly.

## License

MIT
