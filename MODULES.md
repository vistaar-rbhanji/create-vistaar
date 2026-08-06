# Vistaar Local Module System

This guide explains how local modules work inside the `create-vistaar` repository.

> Remote downloads, marketplaces, and `@vistaar/*` packages are **out of scope**.
> Everything stays under the repo `modules/` folder today. The installer API is
> intentionally stable so those folders can become packages later without
> rewriting generators.

## How modules work

1. Each feature (auth, docker, rbac, …) lives in `modules/<name>/`.
2. `ModuleRegistry` discovers every folder that contains `module.json`.
3. During `create-vistaar`, `ModuleGenerator` asks the registry which modules
   match the user's `ProjectConfig` (`enabledWhen` in the manifest).
4. For each match, the registry calls that module's `install(context)`.
5. The generator **never** hardcodes `if (auth)` / `if (docker)`.

The same `install(context)` path will power `vistaar add <module>` later.

## Folder conventions

```
modules/
  auth/
    module.json          # required — single source of truth
    install.js           # required at runtime — export async function install(ctx)
    install.ts           # optional typed twin for editors
    README.md
    templates/
      frontend/
      backend/
      shared/
      assets/
  docker/
  rbac/                  # stub (not auto-enabled)
  aws-s3/
  swagger/
  email/
  redis/
  shared/                # skipped by discovery — docs/helpers only
```

Template paths in `module.json` are resolved as:

1. `modules/<name>/templates/<path>`
2. fallback: `modules/<name>/<path>`

## Manifest format (`module.json`)

```json
{
  "name": "auth",
  "displayName": "Authentication",
  "version": "1.0.0",
  "description": "JWT Authentication Module",
  "dependencies": [],
  "compatibleWith": ["express", "fastapi", "none"],
  "enabledWhen": { "field": "authentication", "equals": true },
  "templateFolders": {
    "frontend": "frontend/typescript",
    "backend": "backend/express"
  },
  "npmPackages": { "frontend": { "dependencies": {} } },
  "envExample": { "backend": ["JWT_SECRET=change-me"] },
  "variants": [],
  "features": ["Login page scaffold"],
  "postInstallCommands": []
}
```

| Field | Purpose |
| --- | --- |
| `name` | Registry id (`vistaar add auth`) |
| `version` | Local semver (no remote checks yet) |
| `compatibleWith` | Backend ids this module supports |
| `enabledWhen` | Auto-install rule against `ProjectConfig` |
| `dependencies` | Other local module names |
| `templateFolders` | Map of project target → template subfolder |
| `variants` | Stack-specific overlays (language/backend) |

**Do not hardcode module metadata in the CLI.** Always read the manifest.

## Installer lifecycle

```ts
install(context: ModuleContext): Promise<void>
```

`ModuleContext` includes:

- `projectPath` / `paths` — where to write files
- `config` / `stack` — selected frontend, backend, language, database, orm, UI
- `variables` — `{{PROJECT_NAME}}` etc.
- `engine` — template copy + substitution
- `moduleRoot` — this module's folder
- `manifest` — parsed `module.json`
- `helpers.standardInstall` — shared copy/merge/env lifecycle

### Standard install

Most modules only need:

```js
export async function install(context) {
  await context.helpers.standardInstall(context);
}
```

`standardInstall` will:

1. Resolve variants against the stack
2. Copy template folders into frontend/backend/root
3. Merge `package.json` dependencies
4. Append `.env.example` lines
5. Print feature summary

### Custom install

Add extra steps before/after `standardInstall` (route registration, config patches, etc.) inside `install.js`. Keep the function signature unchanged.

## How modules are registered

`ModuleRegistry` scans `modulesRoot` (the repo `modules/` directory):

- Skips `shared/` and hidden folders
- Requires `module.json`
- Loads `install.js` when present; otherwise uses `standardInstall`

```ts
const registry = new ModuleRegistry({ modulesRoot });
const selected = await registry.resolveForConfig(config);
for (const mod of selected) {
  await mod.install(moduleContext);
}
```

## How to create a new module

1. Create `modules/my-feature/` with the folder layout above.
2. Fill in `module.json` (name, version, description, templates, `enabledWhen` if auto).
3. Add `install.js` that calls `context.helpers.standardInstall(context)` (or custom logic).
4. Drop templates under `templates/`.
5. Run `create-vistaar` — if `enabledWhen` matches, it installs automatically.
6. Later: `vistaar add my-feature` will call the same `install()`.

## Future-ready note

When `modules/auth` becomes `@vistaar/auth`, only the **registry discovery** changes.
`install(context)` and `ModuleContext` stay the same — no generator rewrite.
