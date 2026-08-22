# Authentication

The authentication API uses JWTs in an HTTP-only cookie for browser clients and continues to accept Bearer tokens for existing API clients.

## Endpoints

- `POST /api/v1/auth/register` creates an employee account.
- `POST /api/v1/auth/login` verifies credentials and sets the authentication cookie.
- `GET /api/v1/auth/me` returns the current database user.

## Cookie Configuration

- Cookie name: `AUTH_COOKIE_NAME`, defaulting to `dayflow_token`.
- The cookie is HTTP-only and scoped to `/`.
- Development uses `SameSite=Lax` and does not require HTTPS.
- Production uses `SameSite=None` and `Secure`; HTTPS is required.
- JWT lifetime uses `JWT_EXPIRES_IN`, defaulting to `1d`.
- JWT signing always uses `HS256` and reads `JWT_SECRET` from the environment.

The frontend must use `withCredentials: true`, as configured in `frontend/src/services/api.ts`.