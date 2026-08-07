# PostgreSQL

Vistaar does **not** create the database for you — environments differ (local, Docker, cloud).

1. Create a database named as configured in your project (see Setup Wizard / `.env`).
2. Set `DATABASE_URL` in `backend/.env` (and `auth-api/.env` when Base Auth is installed).
3. Start the app and follow the Setup Wizard, or run:

```bash
npm run migrate
npm run seed
```

Do not commit `.env` files.
