# MongoDB

MongoDB typically creates the database automatically when the first document is written.

1. Ensure MongoDB is reachable (local, Docker, or Atlas).
2. Set `MONGODB_URI` in `backend/.env`.
3. Start the app and follow the Setup Wizard, or run `npm run seed` when applicable.

Do not commit `.env` files.
