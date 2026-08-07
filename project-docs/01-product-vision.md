# 01 — Product Vision

> Internal handbook. Describes Vistaar as it exists in this repository today (`create-vistaar` package, version `0.2.0` in `package.json`).

## What is Vistaar

Vistaar is an open-source **project scaffolding CLI**. The published npm package is named **`create-vistaar`**. It exposes two binaries:

| Binary | Entry | Responsibility |
| --- | --- | --- |
| `create-vistaar` | `src/index.ts` → `dist/index.js` | Interactive project **creation** |
| `vistaar` | `src/vistaar.ts` → `dist/vistaar.js` | Project **management** (doctor today; add/generate/update later) |

From a few prompts it generates a runnable workspace: React frontend (Vite), optional Express or FastAPI backend, optional PostgreSQL/MongoDB + ORM templates, Docker/auth as **local modules**, root scripts, README, and post-scaffold installers.

## Problem it solves

Teams repeatedly reinvent the same starter layout:

- Frontend + API + DB wiring
- Health/setup endpoints and a first-run UI
- Docker Compose, env examples, lint/git hooks
- Inconsistent folder conventions across projects

Vistaar replaces ad-hoc copy-paste with a **typed config → template copy → module overlay → installer** pipeline.

## Goals

| Goal | How it shows up in code |
| --- | --- |
| Fast, interactive scaffold | `collectProjectConfig` + `ProjectGenerator` |
| Reusable templates | `templates/` + `TemplateEngine` |
| Feature modules without hardcoding names | `modules/` + `ModuleRegistry` + `install(context)` |
| Separated create vs manage CLIs | Dual bins (Phase 9) |
| Runnable day-one experience | Welcome dashboard, setup wizard, doctor scripts in generated apps |
| Stable extension points | `Generator`, `Installer`, `CliCommand`, `ModuleContext` interfaces |

## Non-goals (today)

These are **out of scope** in the current implementation — not missing accidents:

| Non-goal | Evidence |
| --- | --- |
| Remote module marketplace / `@vistaar/*` packages | Explicit in `MODULES.md` |
| Real authentication product for every stack | Base Auth is Express + PostgreSQL only; other stacks get `None` |
| Working `vistaar add` / `generate` / `update` | `printComingSoon` in those commands |
| Multi-frontend frameworks beyond React | `ProjectConfig.frontend` is `"react"` only |
| Cloud deploy automation | Not present in generators/installers |
| Guaranteed production-hardened security | Generated auth/crypto are scaffolds |

## Target audience

| Audience | Use |
| --- | --- |
| Application developers | `npx create-vistaar` to start apps |
| Contributors | Extend templates, modules, generators |
| AI assistants | Follow `11-ai-context.md` before changing architecture |
| Future maintainers | This `project-docs/` handbook |

## Current maturity

| Area | Status |
| --- | --- |
| Interactive create flow | **Shipped** |
| Template engine + stack generators | **Shipped** |
| Installers (npm, git, husky, eslint, db setup) | **Shipped** (fail-soft) |
| Local module system (auth, docker real; others stubs) | **Shipped** |
| Dual CLI shell | **Shipped** |
| `vistaar doctor` | **Partial** (delegates to generated project scripts) |
| `vistaar add` / `generate` / `update` | **Placeholder** |
| End-user docs site | **Shipped** (`docs/`) |
| Internal engineering handbook | **This folder** (`project-docs/`) |
| Package version vs CLI `.version()` | `package.json` = `0.2.0`; Commander still reports `0.1.0` in `src/cli/*-program.ts` |

**Bottom line:** Vistaar is a stable **scaffolding product** with a deliberate dual-CLI and local module architecture. Management commands and a real module marketplace are planned, not implemented.
