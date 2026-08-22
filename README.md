# Dayflow

Dayflow is a MySQL-backed workforce management platform for employee attendance, leave, profiles, and payroll workflows. It provides role-aware employee and admin workspaces suitable for a live HR operations demo.

## Architecture

The React/Vite frontend calls an Express API. Sequelize owns the MySQL schema through migrations, while service modules contain validation and business rules. Authentication uses HTTP-only JWT cookies, with Bearer-token compatibility for API clients.

## Tech Stack

- Frontend: React, TypeScript, Vite, Axios
- Backend: Node.js, Express, Sequelize, MySQL 8.4+
- Security: Helmet, CORS, rate limiting, bcrypt password hashing, JWT authentication

## Project Structure

- `backend/`: Node.js API, authentication, business logic, and persistence
- `frontend/`: React application and user workflows
- `docs/`: API and development documentation

## Prerequisites

- Node.js 20+
- MySQL 8.4+
- A non-root MySQL application user with access to the `dayflow` database

## Environment

Copy `backend/.env.example` to `backend/.env` and replace the placeholders with local values. Never commit `backend/.env` or real credentials.

## Database and Development

MySQL 8.4+ is required. Use the non-root application account `dayflow_app` for the backend.

```powershell
cd backend
npm install
npx sequelize-cli db:migrate:status
npm run db:migrate
npm run db:seed
npm test
npm run lint
npm start
```

In another terminal:

```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1
```

The frontend uses `VITE_API_URL` when set, otherwise it calls `/api/v1`, and sends credentials for the HTTP-only authentication cookie. Verify the backend at `http://127.0.0.1:5000/health` and the frontend at `http://127.0.0.1:5173/`.

## Demo Accounts

Use the seeded local-demo credentials configured in your environment. Keep passwords out of source control and presentation materials. The expected accounts are an admin account such as `admin@example.com` and at least one seeded employee account.

## Workflows

Employees can sign in, view and update contact details, check in and out, review attendance, submit leave, and view their own payroll. Admins can review employee records, attendance, pending leave, and payroll, then approve or reject leave and update salary records.

## Testing

```powershell
cd backend; npm test; npm run lint
cd ../frontend; npm run build; npm run lint
```

For a live demo, use the admin dashboard first, approve a pending request, then switch to the employee account to check attendance, create leave, update a profile field, and view payroll. Return to admin to approve the new request and confirm the employee sees the updated status.

## Troubleshooting

- `401`: confirm the backend is running and the browser is using the same host origin configured by `CLIENT_URL`.
- Database connection errors: verify MySQL is running, the database exists, and `DB_USER` is the non-root application account.
- Missing tables: run `npx sequelize-cli db:migrate:status`, then `npm run db:migrate`; do not use `sync({ alter: true })`.
- Empty demo data: run the idempotent seeder with `npm run db:seed`.

## API

Authentication is available at `/api/v1/auth/login`, `/api/v1/auth/register`, and `/api/v1/auth/me`. Profile, attendance, leave, and salary workflows are available under `/api/v1`; see `docs/API_CONTRACT.md` and `docs/AUTHENTICATION.md` for details.
