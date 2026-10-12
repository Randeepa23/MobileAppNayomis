# Customer authentication contract

Audit date: 2026-07-11

This document records behavior verified from the React client and Express/Mongoose source before Phase 2 changes. Examples omit secrets and shorten MongoDB identifiers.

## Verified existing behavior

- API prefix: `/api`; customer routes are mounted at `/api/students`.
- Registration: `POST /api/students/register` with `{ "name": string, "email": string, "password": string }`. The controller also accepts optional `school`, `grade`, `address`, and `whatsapp` fields, although the website sends only the three required fields.
- Login: `POST /api/students/login` with `{ "email": string, "password": string }`.
- Profile: `GET /api/students/:id`. Before Phase 2 this route was public and did not verify ownership.
- Registration success (`201`): `{ "success": true, "message": "Student registered successfully", "data": { "student": { "_id", "id", "name", "email", "role", "points", "loyaltyPoints", "orders", "createdAt", "updatedAt" } } }`.
- Login success (`200`): `{ "success": true, "message": "Login successful", "data": { "token": "<JWT>", "student": { "_id", "id", "name", "email", "role", "points", "loyaltyPoints", "orders", "createdAt", "updatedAt" } } }`.
- Duplicate email (`400`): `{ "success": false, "message": "Student already exists" }`.
- Invalid credentials (`401`), for both an unknown email and a wrong password: `{ "success": false, "message": "Invalid email or password" }`.
- Missing registration fields (`400`): `{ "success": false, "message": "Name, email, and password are required" }`. There was no structured field-error object.
- Customer JWT payload: `studentId`, `email`, `role`, plus library-generated `iat` and `exp` claims. Lifetime: `24h`.
- There are no refresh tokens, customer logout endpoint, or token-revocation mechanism.
- Registration does not issue a token and does not sign the customer in.
- Passwords are hashed with `bcryptjs`, cost factor 10, in the registration controller.
- Before Phase 2, email lookup and persistence used the submitted string without trimming or lowercasing.
- Before Phase 2, the review submission route used JWT middleware. Student registration, login, and `GET /students/:id` did not. Order routes declared middleware but did not attach it. Admin verification used separate `type: "admin"` tokens.
- `GET /students/:id` selected `-password` and its manual response omitted the password, but it did not verify ownership. Registration and login also returned manually selected safe fields.
- Registration and login were not rate-limited.
- The React website depends on the existing `success`, `message`, `data.token`, and `data.student` shape and on all three existing student routes.
- CORS was unrestricted (`cors()`), and the server entry point started listening immediately when imported.

## Required corrections

- Require `JWT_SECRET` from the environment; remove customer-auth fallback secrets.
- Normalize email by trimming and lowercasing in both schema and controller queries.
- Validate and sanitize customer-auth input, including the website-established six-character password minimum.
- Handle MongoDB duplicate-key races without exposing database errors.
- Stop logging request bodies/credentials and stop returning internal exception messages.
- Add stable error `code` values and optional field `errors` while preserving `success` and `message`.
- Rate-limit registration and login.
- Centralize customer JWT verification and explicitly reject admin tokens/customer roles other than `user`.
- Keep password hashes excluded from every customer response.
- Make the server importable for safe automated API tests and use the configured database URI.

## New backward-compatible additions

- `GET /api/students/me` requires `Authorization: Bearer <customer JWT>`, derives identity only from `studentId`, and returns `{ "success": true, "data": { "student": <safe student> } }`.
- The existing registration/login success envelopes and `/api/students/:id` response shape remain available to the website. The legacy ID route remains documented as a compatibility endpoint; Android uses only `/me`.
- Stable codes added for Android include `VALIDATION_ERROR`, `EMAIL_ALREADY_EXISTS`, `INVALID_CREDENTIALS`, `TOKEN_REQUIRED`, `INVALID_TOKEN`, `SESSION_EXPIRED`, `CUSTOMER_NOT_FOUND`, `RATE_LIMITED`, and `INTERNAL_ERROR`.

## Final Android contract

Android uses only:

1. `POST /api/students/register` (public)
2. `POST /api/students/login` (public)
3. `GET /api/students/me` (customer JWT required)

JWT decoding on Android is used only to obtain `exp` and `studentId` for local session lifecycle. Signature verification and authorization remain server responsibilities. Production deployments must terminate HTTPS and configure a restricted CORS origin list; cleartext HTTP is limited to the development emulator configuration.
