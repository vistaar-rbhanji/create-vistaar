# 02 — Roadmap

> Derived from README phase history, `docs/roadmap.html`, `MODULES.md`, and command/module stubs. Separates **done**, **current**, and **future**.

## Completed milestones (Phases 1–11)

| Phase | Outcome | Primary locations |
| --- | --- | --- |
| 1 | Interactive prompts → typed `ProjectConfig` | `src/prompts/`, `src/types/config.ts` |
| 2 | `TemplateEngine` find/validate/copy/`{{VAR}}` | `src/template-engine/` |
| 3 | Stack generators → `<project>/` | `src/generators/` |
| 4 | Post-scaffold installers + success banner | `src/installers/` |
| 5–6 | Data-driven modules; auth first module | Originally `templates/modules/`; now `modules/` |
| 7 | Welcome dashboard (app-info + health) | Generated FE/BE templates |
| 8 | Setup wizard + doctor/scripts + README gen | `ReadmeGenerator`, `templates/project-root/` |
| 9 | Dual CLI: `create-vistaar` + `vistaar` | `src/cli/`, `src/commands/` |
| 10 | Local `modules/*` + `ModuleRegistry` + `install(context)` | `src/module-system/`, `modules/` |
| 13 | Base Auth from `modules/base-auth` via `modules/auth` | `authentication: "none" \| "base-auth"` |

Package version at handbook time: **`0.2.0`** (`package.json`).

## Current priorities

Work that matches the **existing architecture** and unfinished surfaces:

1. Finish management CLI behaviors on top of `install(context)` — especially `vistaar add`.
2. Replace stub modules (`rbac`, `aws-s3`, `email`, `swagger`, `redis`) with real `standardInstall` templates when ready.
3. Keep auth as scaffolds until a deliberate auth implementation lands.
4. Align Commander `.version("0.1.0")` with `package.json` version.
5. Ensure published `files` list matches reality (e.g. `LICENSE` is listed but may be missing on disk).

## Version-oriented roadmap

| Version band | Intent | Notes |
| --- | --- | --- |
| **0.2.x (current)** | Stable create + local modules + dual CLI shell | Management cmds mostly placeholders |
| **0.3.x (likely next)** | Working `vistaar add <module>` using existing registry | Same `ModuleContext` / `standardInstall` |
| **Later 0.x** | `generate` (CRUD etc.), `update`, richer catalog | Still local modules unless policy changes |
| **1.x aspirational** | Marketplace / packageable modules | Explicitly out of scope in `MODULES.md` today |

## Future roadmap (documented intent, not implemented)

From `docs/roadmap.html` and `MODULES.md`:

| Theme | Description |
| --- | --- |
| `vistaar add` | Install catalog modules into an **existing** project |
| `vistaar generate` | CRUD / resource generators |
| `vistaar update` | Guided template/tooling upgrades |
| Richer module catalog | Real implementations beyond stubs |
| Module marketplace | Remote discovery / `@vistaar/*` packages |
| Standalone `vistaar` package | Management CLI installable separately from create |
| More stacks | Additional frontends/backends/deploy targets |

## Backlog (concrete placeholders already in repo)

| Item | Where |
| --- | --- |
| Coming-soon commands | `src/commands/add`, `generate`, `update` |
| Future add module ids | `FUTURE_ADD_MODULES` in `src/commands/shared/coming-soon.ts` |
| Stub modules | `modules/rbac`, `aws-s3`, `email`, `swagger`, `redis` |
| Auth “no real logic yet” | `modules/auth/module.json` / README |
| Unused default Docker generator path | `DockerGenerator` exists; create pipeline uses `modules/docker` |
| Legacy `templates/modules/` | Pointer README; live catalog is `modules/` |

### `FUTURE_ADD_MODULES` (ids listed for messaging)

`auth`, `rbac`, `aws-s3`, `email`, `payments`, `notifications`, `file-uploads`, `swagger`, `redis`, `caching`

**Note:** `payments`, `notifications`, `file-uploads`, and `caching` have **no** folders under `modules/` yet — only mentioned for future `vistaar add` UX copy.

## Deferred ideas

Do not treat these as near-term commitments:

- Remote module downloads and registry servers
- Guaranteeing production auth/security out of the box
- Expanding beyond React without a deliberate `ProjectConfig` change
- Automated multi-cloud deploy from the CLI
- Rewriting the template engine into a new DSL (current `{{VAR}}` system is intentional)

See also: [10-future-ideas.md](./10-future-ideas.md).
