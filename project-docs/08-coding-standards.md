# 08 — Coding Standards

> Inferred from the repository as it exists — `tsconfig`, folder layout, and recurring patterns in `src/`. Not aspirational rules invented for this doc.

## TypeScript conventions

| Practice | Evidence |
| --- | --- |
| ESM + NodeNext | `package.json` `"type": "module"`, `tsconfig` `module`/`moduleResolution`: `NodeNext` |
| Strict mode | `strict`, `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes` |
| Explicit `.js` extensions in imports | Required by NodeNext (`from "./foo.js"` even for `.ts` sources) |
| `readonly` on config/option interfaces | e.g. `ProjectConfig` fields |
| Prefer `interface` for public contracts | `CliCommand`, `Generator`, `Installer`, `ModuleContext` |
| Compile target | `ES2022`, `outDir: dist`, `rootDir: src` |
| Templates excluded from tsc | `tsconfig.exclude` includes `templates` |

## Folder organization

- One concern per top-level `src/*` area (commands, generators, installers, …).
- Commands: `src/commands/<name>/index.ts` exporting `execute` + `*Command`.
- Generators/installers: `*-generator.ts` / `*-installer.ts` classes implementing small interfaces.
- Barrels: `index.ts` re-exports public surface of a folder.
- Compatibility shims stay thin (`src/modules/` → `module-system`).

## Naming conventions

| Kind | Pattern | Example |
| --- | --- | --- |
| Classes | PascalCase + role suffix | `ProjectGenerator`, `NpmInstaller`, `ModuleRegistry` |
| Files | kebab-case | `project-generator.ts`, `coming-soon.ts` |
| Functions | camelCase verbs | `collectProjectConfig`, `createTemplateVariables` |
| Constants | SCREAMING_SNAKE or camel | `CREATE_QUESTIONS`, `FUTURE_ADD_MODULES` |
| Template vars | `{{SCREAMING_SNAKE}}` | `{{PROJECT_NAME}}` |
| Module ids | kebab-case folder names | `aws-s3`, `auth` |

## Error handling

- Domain errors for templates (not found / destination) rather than bare strings where implemented.
- Installers: catch, log via `logger`, continue — scaffold success is primary.
- Module stubs: warn and return instead of throwing when not implemented.
- Avoid silent failure in generators — a failed copy should abort create.

## Logging

Centralized in `src/utils/logger.ts`:

- `info` / `success` / `warn` / `error` / `title` / `blank`
- Chalk colors live here so commands stay presentation-light
- Comment in file anticipates future `--json` / quiet mode by keeping I/O in one place

Spinners: `ora` inside `ProjectGenerator` (and similar UX), not scattered arbitrarily.

## SOLID principles (as applied)

| Principle | Application |
| --- | --- |
| SRP | Generators copy; installers spawn processes; cli only registers |
| OCP | New generator/installer/module via implementation + injection/discovery |
| LSP | Generators/installers interchangeable behind interfaces |
| ISP | Small `supports` + `generate`/`install` surfaces |
| DIP | Inject `TemplateEngine`, generator lists, `FileSystemPort` |

Documented explicitly in comments on `ProjectGenerator` and related files — follow that tone when extending.

## Code reuse

| Prefer | Over |
| --- | --- |
| `standardInstall` | Copy-paste merge logic in every module |
| `mergeDirectoryInto` / `mergePackageJson` | Ad-hoc fs walks |
| `createContext` / shared types | Re-declaring cwd/args shapes |
| `printComingSoon` | Divergent placeholder UX |
| Question registry | Hardcoded prompt sequences in the command |

## Dependency management

**Runtime deps are intentionally few:** `@inquirer/prompts`, `chalk`, `commander`, `execa`, `fs-extra`, `ora`.

Rules observed:

- Commands must not depend on Commander.
- Module `install.js` should not import deep `src/` paths — use `context.helpers`.
- Do not add heavy frameworks to the CLI itself (docs site is static HTML for the same reason).
- Engines: Node `>= 18`.

## Style details worth matching

- File headers often include a short architectural note (why the module exists).
- Prefer composition (`ProjectGenerator` + injected generators) over god-objects.
- Mark deprecated aliases clearly (`@deprecated`, compatibility exports) instead of deleting immediately.
- Do not invent features in stubs — warn and no-op.
