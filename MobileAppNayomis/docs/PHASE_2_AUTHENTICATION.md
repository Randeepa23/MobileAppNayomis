# Phase 2 — Customer authentication and secure sessions

## Flows

- Registration validates full name, normalized email, the verified six-character minimum password, and confirmation; calls `POST /api/students/register`; clears password fields; and returns to Login with email prefilled and a success confirmation.
- Login calls `POST /api/students/login`, rejects incomplete/malformed/expired responses, encrypts the JWT session with Android Keystore AES-GCM, then calls `GET /api/students/me` before publishing `Authenticated`.
- Startup reads onboarding first. A valid local session is confirmed with `/me`; absent, malformed, or expired data becomes Guest. A protected 401 clears storage once and surfaces session expiry without interceptor-driven navigation.
- Profile is the only Phase 2 protected tab. Guest taps are restored after successful login. Logout is local because the backend has no revocation endpoint; it preserves onboarding and future guest-owned state.

## Backend changes

Created: `backend/middleware/customerAuth.js`, `backend/middleware/authRateLimit.js`, `backend/tests/studentAuth.test.js`.

Modified: `backend/controllers/studentController.js`, `backend/controllers/reviewController.js`, `backend/routes/studentRoutes.js`, `backend/routes/orderRoutes.js`, `backend/routes/reviewRoutes.js`, `backend/models/Student.js`, `backend/config/db.js`, `backend/server.js`, `backend/package.json`, and `backend/package-lock.json`. The order route’s unused fallback-secret middleware was removed; review submission now reuses the customer-token middleware.

The website-compatible `success/message/data.student/data.token` envelopes remain. The legacy ID profile route now requires its matching customer JWT. Android uses only `/students/me`.

## Running and testing

Backend (from `backend`):

```powershell
npm install
npm test -- --runInBand
npm start
```

Android (from `MobileAppNayomis`):

```powershell
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
.\gradlew.bat --no-daemon --no-watch-fs --project-cache-dir "C:\GradleProjectCache\Nayomis" testDevelopmentDebugUnitTest
.\gradlew.bat --no-daemon --no-watch-fs --project-cache-dir "C:\GradleProjectCache\Nayomis" assembleDevelopmentDebug
.\gradlew.bat --no-daemon --no-watch-fs --project-cache-dir "C:\GradleProjectCache\Nayomis" installDevelopmentDebug
```

Clear emulator data with `adb shell pm clear com.nayomis.waterfront.dev`. Use a clearly labelled development-only account entered interactively; never commit its password.

## Production requirements and limitations

Production must use HTTPS, a strong environment-only `JWT_SECRET`, a production MongoDB URI, a reverse proxy, and an explicit CORS allowlist. There is no refresh-token or token-revocation endpoint, so logout clears the device session and a stolen token remains valid until its verified 24-hour expiry. The current backend-wide CORS policy and legacy unauthenticated admin data routes require a coordinated website/admin security migration and are not silently changed in this Android phase.

Deferred: all profile editing, password recovery/change, social/biometric login, email verification, parent/student profiles, menu/cart/checkout, orders, rewards, reviews, notifications, tracking, payments, and Android admin features.
