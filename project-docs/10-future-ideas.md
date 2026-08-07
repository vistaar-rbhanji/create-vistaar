# 10 — Future Ideas

> Collection of **placeholders, TODOs, and deferred ideas**. Do **not** treat this file as a commitment to implement. Do not implement from this list unless a phase/issue explicitly asks.

## Coming soon commands

| Command | File | Intended direction (from copy/comments) |
| --- | --- | --- |
| `vistaar add` | `src/commands/add/index.ts` | Install modules into existing projects via same `install(context)` |
| `vistaar generate` | `src/commands/generate/index.ts` | CRUD / resource generation |
| `vistaar update` | `src/commands/update/index.ts` | Upgrade templates/tooling in existing apps |

Shared helper: `printComingSoon` in `src/commands/shared/coming-soon.ts`.

## Future module ids (messaging only)

From `FUTURE_ADD_MODULES`:

| Id | Folder under `modules/` today? |
| --- | --- |
| `auth` | Yes (scaffold) |
| `rbac` | Yes (stub) |
| `aws-s3` | Yes (stub) |
| `email` | Yes (stub) |
| `swagger` | Yes (stub) |
| `redis` | Yes (stub) |
| `payments` | **No** |
| `notifications` | **No** |
| `file-uploads` | **No** |
| `caching` | **No** |

## Stub / incomplete modules

| Module | Current behavior |
| --- | --- |
| `auth` | Installs scaffolds; **no** production auth product |
| `rbac`, `aws-s3`, `email`, `swagger`, `redis` | Warn; skip real install |

## Architecture ideas (deferred)

From `MODULES.md` and docs roadmap — **out of scope today**:

- Remote module downloads
- Module marketplace
- `@vistaar/*` published packages as the primary distribution
- Standalone `vistaar` npm package separate from `create-vistaar`
- Additional frontend frameworks beyond React
- Broader cloud deploy generators

## Template / generator cleanup ideas

| Idea | Context |
| --- | --- |
| Remove or formally deprecate `DockerGenerator` | Create path uses `modules/docker` |
| Collapse duplicate auth trees | Prefer `modules/auth/templates/` only |
| Retire `templates/modules/` fully | Already pointer README |
| Strict unknown `{{VAR}}` errors | Today unknowns are left as-is |
| Conditional template syntax | Not supported |

## CLI / product polish ideas

| Idea | Context |
| --- | --- |
| Sync `--version` with `package.json` | Currently can diverge |
| `--json` / quiet logging | Anticipated in `logger.ts` comments |
| Ensure `LICENSE` on disk matches `files` | Publish hygiene |
| Automated tests + CI | Not present now |
| Richer `vistaar doctor` without project scripts | Today mostly delegates |

## Explicit non-goals to keep deferred

- Rewriting the CLI in another language/framework
- Replacing static `docs/` with Docusaurus/Next unless a phase says so
- Inventing marketplace APIs before local `vistaar add` works
- Shipping “real auth” silently inside scaffolds without a dedicated design

When promoting an item from this file into active work, move it to [02-roadmap.md](./02-roadmap.md) current priorities and update [11-ai-context.md](./11-ai-context.md).
