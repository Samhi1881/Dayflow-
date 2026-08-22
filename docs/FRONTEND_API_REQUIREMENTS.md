# Frontend API Requirements

This document records the API behavior used by the existing frontend in `frontend/src`.

## API Client

Source: `frontend/src/services/api.ts`

- Axios base URL: `import.meta.env.VITE_API_URL ?? '/api/v1'`
- Default header: `Content-Type: application/json`
- `withCredentials: true`
- No Axios interceptors
- No explicit `Authorization: Bearer` header
- No query parameters are currently sent

## Implemented API Calls

| Feature | Method | Endpoint | Auth | Role | Request | Expected Response |
|---|---|---|---|---|---|---|
| Login | POST | `${VITE_API_URL}/auth/login` or `/api/v1/auth/login` | Browser credentials included; no Bearer header | Public | JSON `{ email: string, password: string }` | JSON containing either `{ user: AuthUser }` or `{ data: AuthUser }` |
| Registration | POST | `${VITE_API_URL}/auth/register` or `/api/v1/auth/register` | Browser credentials included; no Bearer header | Public; new users are treated as employees | JSON `{ name: string, email: string, password: string }` | JSON containing either `{ user: AuthUser }` or `{ data: AuthUser }` |
| Restore current user | GET | `${VITE_API_URL}/auth/me` or `/api/v1/auth/me` | Browser credentials included; no Bearer header | Authenticated user | No body | JSON containing either `{ user: AuthUser }` or `{ data: AuthUser }` |

`AuthUser` is expected to contain:

```ts
{
  id: string | number;
  name: string;
  email: string;
  role: 'admin' | 'employee' | string;
}
```

The frontend expects `role` to be present and calls `role.toLowerCase()`. The exact role `admin` receives admin navigation and routes; all other roles are treated as employee users.

## Authentication

Sources: `frontend/src/context/AuthContext.tsx`, `frontend/src/services/authService.ts`, and `frontend/src/services/api.ts`.

- Authentication state is stored only in React memory as `AuthContext.user`.
- No `localStorage` or `sessionStorage` token is used.
- No JWT parsing or explicit token persistence exists.
- `withCredentials: true` indicates that browser-managed credentials, most likely an HTTP-only cookie, are expected.
- Login and registration store the returned user in React context.
- Application startup calls `GET /auth/me` to restore the current user.
- Logout makes no API request; it only clears the in-memory user.

## Error Expectations

The frontend does not read structured error bodies. `AuthContext.getErrorMessage` maps Axios statuses:

| Status | Frontend behavior |
|---|---|
| No response | Unable to reach the server message |
| 400 or 422 | Check details and try again |
| 401 | Email or password is incorrect |
| 403 | Permission denied |
| 404 | Authentication service not found |
| 500+ | Server unavailable |
| Other | Generic request failure |

`GET /auth/me` suppresses errors during initialization and treats the user as unauthenticated. Invalid user payloads without `user` or `data` produce `The server returned an invalid user response.`

## Feature API Usage

The following screens currently make no API calls and use placeholders or local UI state only:

| Feature | Method | Endpoint | Auth | Role | Request | Expected Response |
|---|---|---|---|---|---|---|
| Employee dashboard | None | None | N/A | Authenticated UI route | No request; displays `user.name` and empty states | No API response expected |
| Profile | None | None | N/A | Authenticated UI route | No request; displays `user.name`, `user.email`, `user.id`, and `user.role` | No API response expected |
| Attendance | None | None | N/A | Authenticated UI route | Daily/weekly selection is local state; no check-in or check-out request | No API response expected |
| Leave | None | None | N/A | Authenticated UI route | Filters are local state; request-leave control is disabled | No API response expected |
| Payroll | None | None | N/A | Authenticated UI route | Placeholder page only | No API response expected |
| Admin dashboard | None | None | N/A | Admin UI route | Placeholder page only | No API response expected |
| Employee directory | None | None | N/A | Admin UI route | Placeholder page only | No API response expected |
| Admin leave approvals | None | None | N/A | Admin UI route | Placeholder page only | No API response expected |

## Routes and Roles

- Admin routes: `/admin/dashboard`, `/admin/leave`, and `/employees`
- Authenticated routes: `/employee/dashboard`, `/profile`, `/attendance`, `/leave`, and `/payroll`
- Login and registration route users with role `admin` to `/admin/dashboard`; all other roles go to `/employee/dashboard`.

## Frontend Environment Variables

- `VITE_API_URL`: optional API base URL override.
- No other frontend environment variables are referenced.
- No frontend `.env` files or additional environment declarations were found under `frontend`.

## Source References

- `frontend/src/services/api.ts`
- `frontend/src/services/authService.ts`
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/context/contextValue.ts`
- `frontend/src/routes/ProtectedRoute.tsx`
- `frontend/src/layouts/AppLayout.tsx`
- `frontend/src/pages/AuthPage.tsx`
- `frontend/src/pages/EmployeeDashboard.tsx`
- `frontend/src/pages/ProfilePage.tsx`
- `frontend/src/pages/AttendancePage.tsx`
- `frontend/src/pages/LeavePage.tsx`
- `frontend/src/pages/PlaceholderPage.tsx`
