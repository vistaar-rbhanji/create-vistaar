# Authentication module

Self-contained Vistaar module. Installed during `create-vistaar` when Authentication is enabled, and later via `vistaar add auth` (same `install()` API).

## Layout

```
auth/
  module.json
  install.ts
  README.md
  templates/
    frontend/
    backend/
```

Metadata always comes from `module.json` — never hardcode auth details in the CLI.
