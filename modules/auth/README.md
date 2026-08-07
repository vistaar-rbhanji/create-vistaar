# Base Auth module (`modules/auth`)

Integrates the existing **`modules/base-auth`** implementation into generated
Vistaar projects. Auth logic is **not** recreated here — `base-auth` is the
source of truth.

## Selection

During `create-vistaar`:

```
Authentication:
  None
  Base Auth (email OTP)   ← only when Backend=Express and Database=PostgreSQL
```

- `authentication: "none"` → this module is **not** installed
- `authentication: "base-auth"` → `install(context)` runs

## Compatibility

| Dimension | Supported |
| --- | --- |
| Backend | **Express only** |
| Database | **PostgreSQL only** (raw `pg` inside auth-api; Prisma/Drizzle may still power Vistaar AppInfo) |
| ORM | Any Postgres ORM for the main backend; auth-api does **not** use Prisma/Mongoose |
| FastAPI / MongoDB | **Not available** — prompt hides Base Auth |
| UI | Bootstrap / ShadCN / Material UI adapters (or native baseline) |

Incompatible stacks fail clearly if somehow selected:

```
✖ Authentication could not be installed.
Reason: Base Auth is not compatible with fastapi + mongodb.
Base Auth requires Express + PostgreSQL.
```

## What gets installed

| Path | Contents |
| --- | --- |
| `auth-api/` | Copy of `modules/base-auth/backend` (OTP/JWT/crypto API) |
| `frontend/src/auth/` | Copy of base-auth frontend library + UI adapter |
| `frontend/src/App.*` | Setup wizard first, then `AuthShell` |
| `frontend/vite.config.*` | Proxies setup routes → main backend; auth/crypto → auth-api |

## UI framework rule

Auth pages consume the **VistaarUI** contract. The installer copies **one**
adapter matching `uiFramework` so the project does not mix Tailwind + Bootstrap.

## Runtime requirements (auth-api)

- PostgreSQL (`DATABASE_URL`) — run `auth-api/scripts/init-db.sql`
- Redis (crypto handshake)
- Mail (or `MAIL_DEV_LOG_OTP=true` in development)
- Create a user via `npm run create:admin --prefix auth-api` (no public register)

## Updating base-auth

1. Change code under `modules/base-auth/` only
2. Re-run create (or future `vistaar add auth`) to copy into projects
3. Keep `modules/auth/install.js` as the wiring layer

See `COMPATIBILITY.md` and `project-docs/05-module-system.md`.
