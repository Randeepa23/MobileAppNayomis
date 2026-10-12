# Nayomi’s Waterfront Android

Native Android customer application for Nayomi’s Waterfront. Phase 2 connects real customer registration, login, protected profile access, and secure session restoration to the existing Express/MongoDB backend.

## Technology stack

- Kotlin, Jetpack Compose, Material 3, and Navigation Compose
- Hilt dependency injection and KSP
- Retrofit, OkHttp, Kotlin Serialization, Coroutines, and StateFlow
- Room, Preferences DataStore, Android Keystore AES-GCM storage
- WorkManager and Coil (foundation dependencies; feature usage follows later)
- JUnit, AndroidX Test, Compose UI Test, and MockWebServer
- Gradle Kotlin DSL and `gradle/libs.versions.toml`

## Project structure

Application wiring is under `app/`; reusable infrastructure is under `core/`; phase-owned UI is under `feature/`. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for dependency and navigation boundaries.

## Required tools

- Android Studio Ladybug (2024.2.1) or newer
- Android SDK Platform 35 and Build Tools 35.0.0 or newer
- JDK 17 or newer (the inspected Android Studio installation bundles JDK 21)
- Windows PowerShell for the commands below, or use equivalent shell commands on macOS/Linux

## Android Studio setup

1. Open this repository folder in Android Studio.
2. Select Android Studio’s bundled JDK under **Settings → Build, Execution, Deployment → Build Tools → Gradle → Gradle JDK**.
3. Install Android SDK Platform 35 if it is not already present.
4. Let Gradle sync. `local.properties` is intentionally ignored; Android Studio creates it with the local `sdk.dir`.

The inspected machine uses `C:\Program Files\Android\Android Studio\jbr` and `C:\Users\User\AppData\Local\Android\Sdk`. Terminal builds on this machine need `JAVA_HOME` and `ANDROID_HOME` set for the current session because they are not configured globally.

## Environment and API URLs

The `environment` flavor dimension provides:

- `development`: `http://10.0.2.2:5000/api/`
- `staging`: `https://staging.example.invalid/api/` — replace when the approved staging host exists
- `production`: `https://api.example.invalid/api/` — replace with the approved HTTPS production host before release

URLs are BuildConfig fields in `app/build.gradle.kts`; no secrets belong there. `10.0.2.2` is the Android Emulator alias for the development computer’s loopback interface. A physical device needs a reachable LAN or tunneled backend URL. Only the development flavor permits cleartext, and only for `10.0.2.2`/`localhost`; staging and production deny cleartext.

## Build

From PowerShell, when environment variables are not globally configured:

```powershell
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
.\gradlew.bat assembleDebug
```

`assembleDebug` builds development, staging, and production debug variants. Build one explicitly with `assembleDevelopmentDebug` when preferred.

## Test

```powershell
.\gradlew.bat test
```

With an emulator or device available:

```powershell
.\gradlew.bat connectedDevelopmentDebugAndroidTest
```

## Current phase

Phase 2 — Customer Authentication and Secure Session Management implements real registration/login against `/api/students`, an authenticated `/me` profile, encrypted JWT persistence, startup restoration, protected Profile navigation, centralized 401 expiry handling, and logout. Registration deliberately returns to login and never auto-authenticates.

Intentionally deferred: profile editing, password reset/change, refresh tokens, menu data, cart, checkout, parent/student management, pickup points, orders, tracking, rewards, reviews, notifications, payments, and admin functionality.

## Backend authentication

Run MongoDB, set `MONGODB_URI` and a strong `JWT_SECRET` in the backend environment, then run `npm start` from `../backend`. The development emulator reaches it at `http://10.0.2.2:5000/api/`. See [docs/AUTH_CONTRACT.md](docs/AUTH_CONTRACT.md) and [docs/PHASE_2_AUTHENTICATION.md](docs/PHASE_2_AUTHENTICATION.md).

## Security notes

Session fields are encrypted using an AES-256-GCM key generated inside Android Keystore. The encrypted session preferences file is excluded from backup and device transfer. Preferences DataStore stores only non-sensitive UI preferences. Debug HTTP logging is BASIC only; bodies and headers are not logged. Never commit API keys, tokens, `google-services.json`, signing materials, or production secrets.

## Fonts and future phases

The foundation uses system serif/sans-serif fonts. Approved Playfair Display and Inter files can later be placed in `app/src/main/res/font/`, then referenced from the design-system typography file; do not add unlicensed or invented font assets. Dark mode remains a later design-system enhancement.

The next recommended phase is Phase 3 — Customer profile completion and parent/student management.
