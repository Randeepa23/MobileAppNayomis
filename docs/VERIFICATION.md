# Verification record

## Passed

- `flutter --version`: Flutter 3.44.4 stable
- `dart --version`: Dart 3.12.2 stable
- `flutter doctor -v`: no issues
- `flutter devices`: API 36 emulator visible
- `dart run build_runner build`: Drift and JSON sources generated
- `flutter analyze`: no issues
- `flutter test`: 7 tests passed
- Development APK produced: `build/app/outputs/flutter-apk/app-development-debug.apk`
- APK installed on `emulator-5554`
- `com.nayomis.waterfront.dev/com.nayomis.waterfront.MainActivity` reached top-resumed state
- Controlled `pm clear` cold launch displayed onboarding page 1 with no onboarding preference stored

Tests cover environment transport policy, auth validation, secure JWT lifecycle fields/expiry, and backend menu mapping through a Dio mock adapter.

## Android build notes

The first cold build identified and led to correction of AGP 9’s explicit `resValues` requirement. The generated Gradle JVM request was reduced from 8 GB to 2 GB with two workers because the daemon reported approximately 1.2 GB free physical memory.

The command wrapper exceeded its verification window while Gradle was still packaging, but the active Gradle process completed and produced the APK and SHA-1 sidecar. Installation and launch on the API 36 emulator then passed. Cold debug startup was approximately 10 seconds on this constrained emulator; warm launches are faster.
