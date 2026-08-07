# Base Auth integration notes

## What it is

Email-OTP authentication product living in `modules/base-auth`, installed into
generated apps by `modules/auth` when the user selects **Base Auth**.

## Supported stacks

| Layer | Supported |
| --- | --- |
| Frontend | React (TS or JS host; auth library is TSX) |
| UI | Bootstrap, ShadCN/Tailwind-oriented, Material UI, or native adapter |
| Backend | Express only (auth-api service) |
| Database | PostgreSQL only (`pg` inside auth-api) |
| Main ORM | Prisma or Drizzle may still power Vistaar AppInfo on `backend/` |

## Unsupported

FastAPI, MongoDB, backend/database `none` — prompt does not offer Base Auth.

## Install path

`modules/auth/install.js` → `install(context)`:

1. Validate Express + PostgreSQL
2. `standardInstall` (deps/env summary from `module.json`)
3. Copy base-auth frontend library → `frontend/src/auth/`
4. Copy one UI adapter matching `uiFramework`
5. Patch `App` (setup wizard → AuthShell), Vite proxy, tsconfig paths
6. Copy base-auth backend → `auth-api/`
7. Root scripts: `dev:auth-api`, `auth:init-db`, `auth:create-admin`

## Adding auth later

```bash
cd my-existing-app
npx create-vistaar add auth
```

Flow: read `vistaar.json` → detect missing Express/Postgres/ORM → prompt → generators for missing pieces → `modules/auth` `install(context)` → update manifest.

Do not recreate `modules/base-auth`. Do not overwrite an existing frontend UI framework.