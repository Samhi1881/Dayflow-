# Dayflow

Dayflow is an Odoo Hackathon HRMS project built by a two-member team.

## Project Structure

- `backend/`: Node.js API, authentication, business logic, and persistence
- `frontend/`: React application and user workflows
- `docs/`: API and development documentation

## Development

Copy `.env.example` to `.env` and configure the local database before starting the backend.

MySQL 8.4+ is required. Use the non-root application account `dayflow_app` for the backend.

```powershell
cd backend
npm install
npm test
npm run lint
npm run db:migrate
npm run db:seed
npm start
```

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend uses `VITE_API_URL` and sends credentials for the HTTP-only authentication cookie. Do not commit `.env` or real credentials.

## API

Authentication is available at `/api/v1/auth/login`, `/api/v1/auth/register`, and `/api/v1/auth/me`. Profile, attendance, leave, and salary workflows are available under `/api/v1`; see `docs/API_CONTRACT.md` and `docs/AUTHENTICATION.md` for details.
