# Nayomi’s Waterfront Flutter customer app

Android-first Flutter application for Nayomi’s Waterfront. The default entry point is development and reaches the local Express API at `http://192.168.1.47:5000/api/`.

## Environment verified on 2026-07-12

- Flutter 3.44.4 stable
- Dart 3.12.2 stable
- Android SDK 36.1.0; Platform API 36
- Android licences accepted
- Android Studio JBR 21 detected
- Medium Phone / `sdk gphone64 x86 64`, Android 16 API 36, visible as `emulator-5554`
- `flutter doctor -v`: no issues

## One-click Android Studio run

1. Open `MobileAppNayomisFlutter` in Android Studio.
2. Allow Flutter/Pub indexing to complete.
3. Select the API 36 Android emulator.
4. Select **Nayomi’s Development**.
5. Click the green Run button.

The checked-in run configuration targets `lib/main.dart` with the `development` Android flavor. Hot reload and hot restart work normally. Android Studio’s Flutter plugin is preferred, but project creation and all Dart verification also work from the terminal.

## Terminal workflow

```powershell
flutter pub get
dart run build_runner build
flutter analyze
flutter test
flutter run --flavor development -t lib/main.dart
flutter build apk --debug --flavor development -t lib/main.dart
```

Entry points:

- `lib/main.dart` and `lib/main_development.dart`: development
- `lib/main_staging.dart`: staging placeholder
- `lib/main_production.dart`: production placeholder

Staging and production reject non-HTTPS API URLs. Override an approved URL with `--dart-define=API_BASE_URL=https://host.example/api/`; it must end with `/`.

Physical Android devices must be on the same network as the development computer to reach `192.168.1.47`. Use a secure tunnel or deployed HTTPS API via `API_BASE_URL` when the LAN address is unavailable.

## Android identities

- Development: `com.nayomis.waterfront.dev`
- Staging: `com.nayomis.waterfront.staging`
- Production: `com.nayomis.waterfront`

Only the development flavor permits HTTP, limited by Android network security configuration to `192.168.1.47` and `localhost`. Release signing is intentionally not committed or configured with debug credentials.

## Architecture

The app uses feature-first presentation/application/domain/data boundaries, Riverpod dependency injection, `go_router` stateful tab stacks, Dio, secure storage, and Drift/SQLite. API models are mapped to domain models before display; widgets never perform direct network calls.

Implemented and connected:

- Direct login startup and verified session restoration
- Registration, login, secure JWT lifecycle storage, `/students/me`, logout, protected route restoration, centralized protected-request 401 handling
- Material 3 design system, accessibility-sized controls, connectivity banner, status/safety components
- Native home experience, Colombo opening-hour fallback, backend menu with an explicit local catalog fallback, search/categories, food details, dietary/allergen display
- Persistent offline-editable cart, quantity changes, remove/undo, clear, badge, and subtotal estimate
- Authenticated eight-step checkout UI and real pickup-point/slot discovery
- Read-only verified loyalty points and tier progress
- Safe orders/tracking/notification/gallery states that never fabricate server data or classify food safety locally

See [backend integration audit](docs/BACKEND_INTEGRATION_AUDIT.md) for server features that cannot yet be completed safely.

## Secrets and generated data

Do not add JWT secrets, MongoDB URIs, payment credentials, Firebase service files, Maps server keys, signing passwords, or test passwords. JWTs are stored only with `flutter_secure_storage`. The cart stores no authentication material.

Generated Drift and JSON serializer sources are committed so Android Studio can run immediately. Regenerate them after schema/DTO edits with `dart run build_runner build`.
