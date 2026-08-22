# Dayflow API Contract

Version: `v1`

This document is the shared contract between the backend and frontend teams.

## Conventions

- Base URL: `/api/v1`
- JSON request and response bodies use `camelCase` fields.
- Authenticated requests send `Authorization: Bearer <jwt>`.
- Roles are `employee` and `admin`.
- Successful responses use the status listed below and return `{ "data": ... }`.
- Errors return `{ "error": { "code": "...", "message": "...", "fields": {} } }`.
- Common errors: `400` validation error, `401` missing or invalid authentication, `403` insufficient role, `404` resource not found, `409` conflict.
- Unless stated otherwise, authenticated endpoints return `401` for an invalid token and `403` when the role is not allowed.

## Auth

### POST `/api/v1/auth/register`

- **Authentication:** None
- **Allowed role:** Public; new users are created as `employee`.
- **Request fields:** `firstName` (string, required), `lastName` (string, required), `email` (string, required, unique), `password` (string, required, minimum 8 characters)
- **Response:** `data.user` (`id`, `firstName`, `lastName`, `email`, `role`), `data.token`
- **Success:** `201 Created`
- **Errors:** `400` invalid fields; `409` email already registered
- **Not found:** Not applicable

### POST `/api/v1/auth/login`

- **Authentication:** None
- **Allowed role:** Public
- **Request fields:** `email` (string, required), `password` (string, required)
- **Response:** `data.user` (`id`, `firstName`, `lastName`, `email`, `role`), `data.token`
- **Success:** `200 OK`
- **Errors:** `400` missing or invalid fields; `401` invalid credentials
- **Not found:** User not found returns `401` invalid credentials

### GET `/api/v1/auth/me`

- **Authentication:** Required
- **Allowed role:** `employee`, `admin`
- **Request fields:** None
- **Response:** `data.user` (`id`, `firstName`, `lastName`, `email`, `role`)
- **Success:** `200 OK`
- **Errors:** `401` unauthenticated
- **Not found:** `404` authenticated user no longer exists

## Profile

### GET `/api/v1/profile/me`

- **Authentication:** Required
- **Allowed role:** `employee`, `admin`
- **Request fields:** None
- **Response:** `data.profile` (`userId`, `firstName`, `lastName`, `email`, `phone`, `department`, `jobTitle`, `avatarUrl`)
- **Success:** `200 OK`
- **Errors:** `401` unauthenticated
- **Not found:** `404` profile not found

### PUT `/api/v1/profile/me`

- **Authentication:** Required
- **Allowed role:** `employee`, `admin`
- **Request fields:** `firstName` (string, optional), `lastName` (string, optional), `phone` (string, optional), `department` (string, optional), `jobTitle` (string, optional), `avatarUrl` (string, optional)
- **Response:** `data.profile` with the updated profile fields
- **Success:** `200 OK`
- **Errors:** `400` invalid fields; `401` unauthenticated
- **Not found:** `404` profile not found

## Attendance

### POST `/api/v1/attendance/checkin`

- **Authentication:** Required
- **Allowed role:** `employee`, `admin`
- **Request fields:** `checkInAt` (ISO 8601 datetime, optional; defaults to server time)
- **Response:** `data.attendance` (`id`, `userId`, `date`, `checkInAt`, `checkOutAt`, `status`)
- **Success:** `201 Created`
- **Errors:** `400` invalid datetime; `401` unauthenticated; `409` already checked in for the date
- **Not found:** Not applicable

### POST `/api/v1/attendance/checkout`

- **Authentication:** Required
- **Allowed role:** `employee`, `admin`
- **Request fields:** `checkOutAt` (ISO 8601 datetime, optional; defaults to server time)
- **Response:** `data.attendance` with updated attendance fields
- **Success:** `200 OK`
- **Errors:** `400` invalid datetime; `401` unauthenticated; `409` already checked out
- **Not found:** `404` no attendance record to check out

### GET `/api/v1/attendance/me`

- **Authentication:** Required
- **Allowed role:** `employee`, `admin`
- **Request fields:** Query `from` and `to` (ISO 8601 dates, optional)
- **Response:** `data.attendance` array of attendance records
- **Success:** `200 OK`
- **Errors:** `400` invalid date range; `401` unauthenticated
- **Not found:** Empty array when no records exist

### GET `/api/v1/admin/attendance`

- **Authentication:** Required
- **Allowed role:** `admin`
- **Request fields:** Query `userId`, `from`, and `to` (optional; `from` and `to` are ISO 8601 dates)
- **Response:** `data.attendance` array of attendance records
- **Success:** `200 OK`
- **Errors:** `400` invalid filters; `401` unauthenticated; `403` admin role required
- **Not found:** Empty array when no records match

## Leave

### POST `/api/v1/leave`

- **Authentication:** Required
- **Allowed role:** `employee`, `admin`
- **Request fields:** `startDate` (ISO 8601 date, required), `endDate` (ISO 8601 date, required), `type` (string, required), `reason` (string, required)
- **Response:** `data.leave` (`id`, `userId`, `startDate`, `endDate`, `type`, `reason`, `status`, `reviewedBy`, `reviewedAt`)
- **Success:** `201 Created`
- **Errors:** `400` invalid dates or fields; `401` unauthenticated; `409` overlapping leave request
- **Not found:** Not applicable

### GET `/api/v1/leave/me`

- **Authentication:** Required
- **Allowed role:** `employee`, `admin`
- **Request fields:** Query `status` (optional)
- **Response:** `data.leave` array of leave records
- **Success:** `200 OK`
- **Errors:** `400` invalid status; `401` unauthenticated
- **Not found:** Empty array when no requests exist

### GET `/api/v1/admin/leave`

- **Authentication:** Required
- **Allowed role:** `admin`
- **Request fields:** Query `status` and `userId` (optional)
- **Response:** `data.leave` array of leave records
- **Success:** `200 OK`
- **Errors:** `400` invalid filters; `401` unauthenticated; `403` admin role required
- **Not found:** Empty array when no requests match

### PATCH `/api/v1/admin/leave/:id/approve`

- **Authentication:** Required
- **Allowed role:** `admin`
- **Request fields:** Path `id` (leave request ID); optional `comment` (string)
- **Response:** `data.leave` updated leave record with `status: "approved"`
- **Success:** `200 OK`
- **Errors:** `400` invalid ID or request state; `401` unauthenticated; `403` admin role required; `409` request already decided
- **Not found:** `404` leave request not found

### PATCH `/api/v1/admin/leave/:id/reject`

- **Authentication:** Required
- **Allowed role:** `admin`
- **Request fields:** Path `id` (leave request ID); `comment` (string, optional)
- **Response:** `data.leave` updated leave record with `status: "rejected"`
- **Success:** `200 OK`
- **Errors:** `400` invalid ID or request state; `401` unauthenticated; `403` admin role required; `409` request already decided
- **Not found:** `404` leave request not found

## Admin

### GET `/api/v1/admin/employees`

- **Authentication:** Required
- **Allowed role:** `admin`
- **Request fields:** Query `search`, `department`, `role`, `page`, and `limit` (optional)
- **Response:** `data.employees` array (`id`, `firstName`, `lastName`, `email`, `role`, `department`, `jobTitle`, `isActive`), `data.pagination` (`page`, `limit`, `totalPages`, `totalItems`)
- **Success:** `200 OK`
- **Errors:** `400` invalid filters; `401` unauthenticated; `403` admin role required
- **Not found:** Empty array when no employees match

## Payroll

### GET `/api/v1/payroll/me`

- **Authentication:** Required
- **Allowed role:** `employee`, `admin`
- **Request fields:** Query `month` (optional, `YYYY-MM`)
- **Response:** `data.payroll` (`id`, `userId`, `month`, `basicSalary`, `allowances`, `deductions`, `netSalary`, `status`, `paidAt`)
- **Success:** `200 OK`
- **Errors:** `400` invalid month; `401` unauthenticated
- **Not found:** `404` payroll record not found for the requested month

### GET `/api/v1/admin/payroll`

- **Authentication:** Required
- **Allowed role:** `admin`
- **Request fields:** Query `month` (optional, `YYYY-MM`), `userId` (optional)
- **Response:** `data.payroll` array of payroll records
- **Success:** `200 OK`
- **Errors:** `400` invalid filters; `401` unauthenticated; `403` admin role required
- **Not found:** Empty array when no records match

### PUT `/api/v1/admin/payroll/:userId`

- **Authentication:** Required
- **Allowed role:** `admin`
- **Request fields:** Path `userId`; `month` (string, required, `YYYY-MM`), `basicSalary` (number, required), `allowances` (number, optional), `deductions` (number, optional), `status` (string, optional)
- **Response:** `data.payroll` created or updated payroll record
- **Success:** `200 OK`
- **Errors:** `400` invalid fields; `401` unauthenticated; `403` admin role required; `409` payroll record conflict
- **Not found:** `404` employee not found
