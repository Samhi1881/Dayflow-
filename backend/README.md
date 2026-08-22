## Backend

The backend is an Express and Sequelize API backed by MySQL 8.4+. Configure `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and `JWT_SECRET` in the repository `.env` file.

Run from this directory:

```powershell
npm test
npm run lint
npm run db:migrate
npm run db:seed
npm start
```

The application uses the `dayflow_app` database user, HTTP-only JWT cookies for browser authentication, and Bearer-token compatibility for API clients.
