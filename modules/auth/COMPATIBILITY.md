# Base Auth compatibility

## Supported

| Frontend | UI | Backend | Database | Auth |
| --- | --- | --- | --- | --- |
| React | shadcn | Express | PostgreSQL (+ Prisma or Drizzle) | Base Auth |
| React | bootstrap | Express | PostgreSQL (+ Prisma or Drizzle) | Base Auth |
| React | material-ui | Express | PostgreSQL (+ Prisma or Drizzle) | Base Auth |

## Unsupported (Base Auth hidden / rejected)

| Stack | Reason |
| --- | --- |
| FastAPI | base-auth server is Express-only |
| Backend none | No API to host auth |
| MongoDB / Mongoose | base-auth uses PostgreSQL + `pg` SQL |
| Database none | No Postgres for users/otp/tokens |

## Dependencies added (frontend)

- `axios`, `react-router-dom`, `zod`

## Dependencies (auth-api)

Copied from `modules/base-auth/backend/package.json` (express, pg, redis, jsonwebtoken, nodemailer, cookie-parser, …). Not merged into the main Vistaar `backend/package.json`.

## Environment

See `auth-api/.env.example` after generation. Do not commit real secrets.
