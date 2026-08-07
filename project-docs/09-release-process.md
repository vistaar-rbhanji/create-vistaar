# 09 — Release Process

> Describes the workflow supported by this repository today. There is **no** GitHub Actions release workflow in-repo at handbook time.

## Development workflow

1. Install: `npm install` (Node 18+).
2. Iterate:
   - `npm run dev` → `tsx src/index.ts` (create)
   - `npm run dev:vistaar` → management CLI
3. Typecheck: `npm run typecheck` (`tsc --noEmit`)
4. Build: `npm run build` (`tsc` → `dist/`)
5. Optional local bins: `npm link` then `create-vistaar` / `vistaar`

Smoke-test create against a temp directory; confirm `templates/` and `modules/` resolve from the package root.

## Build

| Script | Command | Output |
| --- | --- | --- |
| `clean` | `rimraf dist` | Removes build |
| `build` | `tsc` | `dist/**` + `.d.ts` + source maps |
| `prepublishOnly` | `npm run build` | Runs automatically before `npm publish` |

`tsconfig`: `rootDir: src`, `outDir: dist`. Templates and modules are **not** compiled — they are copied as package files.

## Versioning

| Source | Current note |
| --- | --- |
| `package.json` `version` | `0.2.0` — source of truth for npm |
| Commander `.version(...)` | Still `0.1.0` in `src/cli/create-program.ts` and `manage-program.ts` |

**Release practice:** bump `package.json` version with your normal semver policy, and keep CLI `--version` in sync when changing it.

No automated changelog generator is configured in this repo.

## Publishing to npm

Configured signals:

- `"publishConfig": { "access": "public" }`
- `"preferGlobal": true`
- `bin`: `create-vistaar`, `vistaar`
- `files`: `dist`, `templates`, `modules`, `README.md`, `MODULES.md`, `LICENSE`

Suggested manual publish checklist:

```bash
npm run typecheck
npm run build
npm pack --dry-run    # verify files list
npm publish           # triggers prepublishOnly build
```

**Watch-outs observed in-repo:**

- `LICENSE` is listed in `files` — ensure the file exists before publish.
- Confirm packed tarball includes `modules/` and `templates/` (required at runtime).

## Testing

There is **no** dedicated test runner script in `package.json` today (no Jest/Vitest config in the audited tree).

Practical verification used by the project:

| Check | How |
| --- | --- |
| Types | `npm run typecheck` |
| Create smoke | Run create into a temp folder; start generated apps |
| Module smoke | Enable auth + docker; confirm overlays and `SMOKE`-style manual checks |
| Doctor | Generate project with `scripts/doctor.js`; run `vistaar doctor` from that root |
| Docs | Open `docs/index.html` in a browser |

Add automated tests when introducing a runner — do not claim coverage that does not exist.

## Documentation updates

| Audience | Location | When to update |
| --- | --- | --- |
| End users | `docs/*.html` | User-visible CLI/behavior changes |
| Module authors | `MODULES.md` | Manifest / install API changes |
| Public overview | `README.md` | Phase milestones, install examples |
| Maintainers / AI | `project-docs/` | Architecture, standards, roadmap truth |

Keep **current vs future** language honest (coming soon ≠ shipped).

## Release checklist

- [ ] `package.json` version bumped (semver)
- [ ] Commander `.version` matches (or intentionally documented lag fixed)
- [ ] `npm run typecheck` and `npm run build` pass
- [ ] Manual smoke: `create-vistaar` happy path (+ auth/docker if touched)
- [ ] `vistaar doctor` still works against a fresh scaffold
- [ ] `MODULES.md` / `README.md` / `docs/` updated if UX changed
- [ ] `project-docs/` updated if architecture or maturity changed
- [ ] `npm pack --dry-run` includes `dist`, `templates`, `modules`
- [ ] `LICENSE` present if still listed in `files`
- [ ] `npm publish` (or CI equivalent when added)
- [ ] Tag release in git if that is your team practice

## CI / automation status

| Item | Status |
| --- | --- |
| `.github/workflows` | Not present in audit |
| `.npmignore` | Not present (rely on `files` whitelist) |
| Automated release | Not present |

When CI is added, prefer typecheck + build (+ future tests) on PRs, and keep publish gated on main/tags.
