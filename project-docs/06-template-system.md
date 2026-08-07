# 06 — Template System

> Reality of `src/template-engine/` and how generators/modules use it. Not a redesign proposal.

## Role

The template system turns trees under `templates/` (and module template folders) into project files by:

1. Resolving a template id to a directory
2. Validating it exists
3. Copying into a destination
4. Replacing `{{PLACEHOLDER}}` tokens in file contents and filenames

## Core type: `TemplateEngine`

File: `src/template-engine/template-engine.ts`

| Method | Behavior |
| --- | --- |
| `resolve(templateId)` | Join under `templatesRoot`; rejects path traversal (`..`) |
| `exists` / `validate` / `validateAll` | Presence checks; throws `TemplateNotFoundError` |
| `list(category?)` | Immediate child directories |
| `copy(templateId, options)` | validate → `copyDirectory` |
| `copyDirectory(sourceDir, options)` | Copy then `applyVariables` |

### Filesystem port

`FileSystemPort` (`src/template-engine/types.ts`) abstracts FS operations. Default adapter: `FsExtraFileSystem` (`file-system.ts`). Enables tests and alternate roots without mocking Node FS globally.

## How files are copied

Typical generator path:

1. Map `ProjectConfig` → template id (e.g. `frontend/react-ts`) via helpers in `src/template-engine/paths.ts` / generator code.
2. `engine.copy(templateId, { destination, variables, overwrite? })`.
3. Destination rules: by default overwrite is conservative — non-empty destinations can throw `TemplateDestinationError` unless overwrite is allowed (see options on `copyDirectory`).
4. Underlying copy uses fs-extra.

### Merges / overlays

UI, ORM, and modules often **merge into** an existing tree rather than creating a new root:

- `mergeTemplateInto` / `mergeDirectoryInto` (`src/generators/merge-template.ts`)
- `mergePackageJson` (`src/generators/package-json.ts`) for dependency overlays

Modules prefer `modules/<name>/templates/<path>` then fall back to `modules/<name>/<path>`.

## How placeholders are replaced

Variables built by `createTemplateVariables(config)` in `src/template-engine/variables.ts`.

Pattern (conceptually): `{{ KEY }}` with optional whitespace — regex on uppercase keys:

`/\{\{\s*([A-Z0-9_]+)\s*\}\}/g`

| Variable | Example / source |
| --- | --- |
| `PROJECT_NAME` | Trimmed project name |
| `PACKAGE_NAME` | npm-safe name |
| `DB_NAME` | DB name derivative |
| `FRONTEND` | `"React"` |
| `BACKEND` | Express / FastAPI / None |
| `DATABASE` | PostgreSQL / MongoDB / None |
| `ORM` | Prisma / Drizzle / Mongoose / None |
| `UI_FRAMEWORK` / `UI_FRAMEWORK_SLUG` | Display + slug |
| `AUTHENTICATION` | `"Base Auth"` or `"Disabled"` |
| `AUTHENTICATION_PROVIDER` | `none` \| `base-auth` |
| `AUTHENTICATION_BOOL` | `"true"` when not `none` |
| `AUTH_API_URL` / `AUTH_API_PORT` | Auth service defaults (`http://localhost:5000` / `5000`) |
| `DOCKER` | Enabled / Disabled |
| `DOCKER_BOOL` | `"true"` / `"false"` |
| `LANGUAGE` | typescript \| javascript |
| `DB_DRIVER` | `file` / `prisma` / `drizzle` / `mongoose` / `pg` / `mongodb` / FastAPI drivers |
| `API_URL` | `http://localhost:3000` |
| `FRONTEND_URL` | `http://localhost:5173` |
| `BACKEND_PORT` | `3000` |
| `CREATED_AT` | ISO timestamp |

**Unknown keys are left unchanged** in the output (not deleted).

Binary-ish extensions are skipped during content substitution (implementation detail in the engine walk).

## Who uses the engine

| Consumer | Usage |
| --- | --- |
| Stack generators | Copy baseline templates |
| Module `standardInstall` | Copy module template folders with same variables |
| Create command | Constructs `TemplateEngine({ templatesRoot: <pkg>/templates })` |

## Current limitations

| Limitation | Detail |
| --- | --- |
| Flat string replace only | No conditionals/loops in template syntax |
| Unknown vars preserved | Typos can ship as literal `{{FOO}}` |
| Template ids are folder paths | Convention-based; no separate manifest for templates/ |
| Dual Docker sources | `templates/docker/default` vs `modules/docker` — create uses module path |
| Legacy `templates/modules/` | Not the live module source |
| Auth duplication risk | Some trees under both `modules/auth/...` and `modules/auth/templates/...` (runtime prefers `templates/`) |

## Possible future improvements (ideas only)

Documented for planning — **not** scheduled work:

- Conditional sections in templates
- Strict mode that errors on unknown placeholders
- Single canonical location per module asset tree
- Removing or clearly deprecating unused `DockerGenerator` / `templates/docker`

Do not redesign the engine casually; generators and modules depend on the current `{{VAR}}` contract.
