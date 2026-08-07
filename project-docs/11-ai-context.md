# 11 — AI Context

> **Read this before changing the Vistaar / `create-vistaar` codebase.**  
> Optimized for AI assistants. Keep under 500 lines. Reflects the repo as of the engineering handbook (`project-docs/`), package version **0.2.0**.

## Project purpose

Interactive CLI that scaffolds full-stack apps from prompts + templates + local modules.

- npm package: **`create-vistaar`**
- Bins: **`create-vistaar`** (create only), **`vistaar`** (manage)

## Architecture summary

```
Entry (index.ts / vistaar.ts)
  → cli/ (Commander registration ONLY)
  → commands/*/execute(context)
      create: prompts → ProjectGenerator → ProjectInstaller
      doctor: run project doctor script if present
      add|generate|update: coming soon
  → generators/ (files only; no npm install)
  → template-engine/ (copy + {{VAR}})
  → module-system/ (ModuleRegistry + install(context) + standardInstall)
  → installers/ (npm/git/husky/eslint/db/module post — fail-soft)
```

**Create generator order:** frontend → ui → backend? → database? → orm? → project-root → readme → **modules last**.

**Docker:** module `modules/docker` when `config.docker`, not default `DockerGenerator`.

## Current priorities

1. Keep create pipeline stable.
2. Implement real management features **on top of** existing `install(context)` (especially `vistaar add`) when asked.
3. Flesh stub modules only with real templates + `standardInstall` — no fake “done” claims.
4. Keep docs honest: current vs future.

## Completed work (do not re-litigate)

Phases 1–15: prompts, template engine, generators, installers, modules (local), welcome/setup UX, dual CLI, static `docs/`, engineering handbook, **Base Auth** integration, **`add auth`**, optional **No ORM**, and **zero-friction setup** (auto `.env`, initial Super Admin prompt, simplified roles, Setup Wizard guidance).

## Base Auth (current)

- Config: `authentication: "none" | "base-auth"` (not a boolean)
- Optional `initialAdmin: { firstName, lastName, email } | null` (password never stored)
- Source of truth: `modules/base-auth` (do not recreate OTP/JWT/crypto logic)
- Installer: `modules/auth/install.js` via `install(context)`
- Supported: React + Express + PostgreSQL + UI adapters (bootstrap/shadcn/material-ui/native)
- Unsupported: FastAPI, MongoDB, backend none (at create time)
- Layout: main `backend/` (setup/welcome) + `auth-api/` (OTP API) + `frontend/src/auth/`
- Default roles: `super-admin`, `admin`, `user` (resolve by slug)
- Normal setup: `.env` auto-created → create DB → update URL → `migrate`/`seed` or Setup Wizard — not raw `auth:init-db`/`auth:create-admin`
- **Later add:** `create-vistaar add auth` uses `vistaar.json` + same `install(context)` — do not invent a second installer
- Manifest: always update `vistaar.json` after create / add auth (`src/project-manifest/`)

## Setup philosophy

> Vistaar should automate everything that is environment-independent and clearly guide the developer through anything that requires environment-specific configuration.
## Coding conventions (must follow)

- TypeScript strict + NodeNext; import with `.js` extensions.
- Commands: **no Commander imports**.
- Generators: **no** `npm install` / process side effects → use installers.
- Modules: data-driven `module.json`; prefer `context.helpers.standardInstall`.
- Do not hardcode `if (moduleName)` selection in `ProjectGenerator`.
- Match existing naming: kebab-case files, `*Generator` / `*Installer` classes.
- Use `logger` from `src/utils/logger.ts` for CLI output.

## Design philosophy

- **SOLID**, small interfaces (`CliCommand`, `Generator`, `Installer`).
- **Dependency injection** for engine/generators/FS port.
- **Fail-soft installers**; fail-hard generators.
- **Stable `install(context)`** so future packaging/`vistaar add` reuse it.
- Prefer extending registries over rewriting pipelines.

## Important constraints

| Constraint | Detail |
| --- | --- |
| Node | `>= 18` |
| Frontend choice | React only in `ProjectConfig` |
| Module distribution | Local `modules/` only — no marketplace code |
| Docs site | Static HTML/CSS/JS in `docs/` — no React/Next for that site unless explicitly required |
| Published files | `dist`, `templates`, `modules`, README, MODULES.md, LICENSE |

## Things AI should **never** change without approval

1. Dual-bin split (merging create + manage into one binary “for simplicity”).
2. Moving Commander into `src/commands/`.
3. Replacing `{{VAR}}` template contract without a migration plan.
4. Hardcoding module names into generator selection logic.
5. Inventing marketplace/remote install behavior.
6. Rewriting or replacing `modules/base-auth` auth logic when integrating — wire it; don't recreate it.
7. Adding Next/Docusaurus/Tailwind to `docs/` when the phase forbids it.
8. Broad refactors unrelated to the asked task (drive-by cleanups).
9. Committing, publishing, or force-pushing unless the user asks.
10. Deleting stub modules or legacy paths without an explicit migrate/remove task.
11. Shipping Base Auth for FastAPI/Mongo by pretending compatibility.

## Future vision (do not implement unless asked)

- Working `vistaar add` / `generate` / `update`
- Real module implementations beyond stubs
- Optional later: marketplace, `@vistaar/*` packages, standalone manage package, more stacks

Details: [10-future-ideas.md](./10-future-ideas.md), [02-roadmap.md](./02-roadmap.md).

## Where to look

| Need | Path |
| --- | --- |
| Product intent | `01-product-vision.md` |
| Architecture / diagrams | `03-architecture.md` |
| Folders | `04-folder-structure.md` |
| Modules | `05-module-system.md`, `MODULES.md` |
| Templates | `06-template-system.md` |
| CLI | `07-cli-flow.md` |
| Style | `08-coding-standards.md` |
| Release | `09-release-process.md` |

## Quick `ProjectConfig` fields

`projectName`, `frontend: "react"`, `language`, `uiFramework`, `backend`, `database`, `orm`, `authentication` (`"none" | "base-auth"`), `initialAdmin`, `docker`, `git`, `husky`, `eslintPrettier` — see `src/types/config.ts`.
