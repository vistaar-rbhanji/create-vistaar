# 04 — Folder Structure

> Explains **why** each important folder exists and how it relates to the rest of the system — not a bare directory dump.

## Repository map

```
kickstack/                 # repo root (npm package create-vistaar)
├── src/                   # TypeScript CLI source → compiles to dist/
├── templates/             # Scaffold copy sources for TemplateEngine
├── modules/               # Local feature modules (Phase 10 catalog)
├── docs/                  # End-user static documentation website
├── project-docs/          # Internal engineering handbook (this folder)
├── phases/                # Internal phase briefs (*.ini); often gitignored
├── scripts/               # Contributor / one-off maintenance scripts
├── dist/                  # tsc output (published bin targets)
├── package.json           # bins, files whitelist, scripts
├── MODULES.md             # Authoring guide for local modules
└── README.md              # Public overview + phase history
```

## `src/` — CLI application code

| Subfolder | Why it exists | Relates to |
| --- | --- | --- |
| `cli/` | Thin Commander adapters so command logic stays portable | Entry bins; must not leak into generators |
| `commands/` | One folder per CLI verb with `execute(context)` | Future standalone `vistaar` package can reuse these |
| `commands/shared/` | Shared coming-soon helpers and future module id lists | Management placeholders |
| `prompts/` | Question registry + collector | Only create flow today |
| `types/` | Shared `ProjectConfig` and prompt types | Cross-cutting contract |
| `generators/` | File-creation pipeline pieces | `templates/`, optional `module-system` |
| `template-engine/` | Pure-ish copy + substitution | Used by generators and modules |
| `module-system/` | Discover / resolve / install local modules | `modules/` on disk |
| `modules/` | Compatibility re-exports of `module-system` | Legacy import paths |
| `installers/` | Process-spawning post steps | Runs **after** generation |
| `utils/` | Logging and presentation helpers | Commands/generators |

**Relationship:** entry → cli → commands → (prompts | generators | installers). Generators sit above the template engine; installers sit beside generators, not inside them.

## `templates/` — scaffold raw material

Purpose: versioned trees that become project files after copy + `{{VAR}}` replacement.

| Area | Role |
| --- | --- |
| `frontend/react-ts`, `react-js` | Base Vite React apps (welcome/setup UI included) |
| `ui/shadcn`, `bootstrap`, `material-ui` | Overlay into frontend |
| `backend/express`, `fastapi` | API apps + health/setup routes (Express) |
| `database/postgres`, `mongodb` | DB-oriented extras |
| `orm/prisma`, `drizzle`, `mongoose` | Merged into backend when applicable |
| `project-root/` | Root `package.json` helpers, `scripts/` (doctor, setup, …) |
| `docker/default/` | Legacy/alternate Docker templates (`DockerGenerator`) |
| `modules/` | **Legacy** pointer — live modules live in repo-root `modules/` |

**Why separate from `modules/`:** stack baselines (always/mostly needed) vs optional features selected by config or future `vistaar add`.

## `modules/` — local feature catalog

Purpose: self-contained features with `module.json` + `install.js`, discovered by `ModuleRegistry`.

| Module | Role today |
| --- | --- |
| `auth` | Auto when `authentication === "base-auth"`; installs from `modules/base-auth` |
| `base-auth` | Source-of-truth auth product (not discovered as a module) |
| `docker` | Auto when `docker`; Compose/Dockerfiles |
| `rbac`, `aws-s3`, `email`, `swagger`, `redis` | Stubs (warn, skip real install) |
| `shared/` | Skipped by discovery — helpers/docs only |

**Why at repo root (not under `templates/`):** modules are first-class publishable units (`package.json` `files` includes `modules`), with a stable `install(context)` API intended to survive packaging later.

## `docs/` — end-user site

Static HTML/CSS/vanilla JS (Phase 11). No React/Next/build step. Open `docs/index.html`. Complements — does not replace — this internal handbook.

## `project-docs/` — engineering handbook

Internal docs for contributors and AI. Not listed as a user-facing product surface; kept in-repo for maintainers.

## `phases/`

Authoring briefs (`phaseN.ini`) that drove incremental delivery. Useful archaeology; **not** runtime. Often ignored by git.

## `scripts/`

Maintainer utilities (e.g. template writing helpers). Not the same as **generated** project `scripts/` copied from `templates/project-root`.

## `dist/`

Compiled JS + declarations consumed by `bin` entries. Produced by `npm run build` (`tsc`). Required for published installs; gitignored locally.

## What deliberately does **not** live where

| Temptation | Actual placement | Reason |
| --- | --- | --- |
| Hardcoded `if (auth)` in generator | `modules/auth` + `enabledWhen` | Open/closed; future `vistaar add` |
| Commander inside commands | `src/cli/register.ts` only | Reusable execute API |
| npm install inside generators | `src/installers/` | Fail-soft side effects |
| End-user marketing docs in `project-docs/` | `docs/` | Audience split |
