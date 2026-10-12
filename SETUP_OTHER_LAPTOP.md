# Run the full project on another laptop

## Install tools

Install Node.js (LTS), Git, MongoDB Community Server, MongoDB Compass, Flutter (stable), and Android Studio with the Android SDK and an emulator. Run `flutter doctor` and resolve Android toolchain issues before starting the mobile app.

## Clone

```powershell
git clone https://github.com/Randeepa23/MobileAppNayomis.git
cd MobileAppNayomis
```

The repository root contains the React website. `backend` contains the Express API, `MobileAppNayomisFlutter` contains the Flutter Android app, and `MobileAppNayomis` contains the separate Kotlin Android app.

## MongoDB and backend

Start your local MongoDB service. In MongoDB Compass, connect to `mongodb://127.0.0.1:27017/nayomis-food-app`.

```powershell
cd backend
npm.cmd ci
Copy-Item .env.example .env
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the generated value into `JWT_SECRET` in `backend/.env`. Then:

```powershell
npm.cmd start
```

Keep this terminal running. The API runs at `http://localhost:5000`.

For a new database, open another terminal in `backend` and run:

```powershell
npm.cmd run seed
node scripts/seedPickupPoints.js
```

The food seed replaces the food catalog, so use it on a new development database. Existing users, orders, and local database contents are not stored in Git. Register a new account in the app. To transfer existing data, use MongoDB Database Tools (`mongodump` on the old laptop and `mongorestore` on the new laptop) privately.

## Website

In another terminal at the repository root:

```powershell
npm.cmd ci
npm.cmd run dev
```

Open `http://localhost:8080`. Vite forwards `/api` requests to port 5000.

## Flutter Android app

Start an Android emulator from Android Studio's Device Manager. In another terminal:

```powershell
cd MobileAppNayomisFlutter
flutter pub get
flutter devices
adb reverse tcp:5000 tcp:5000
flutter run --flavor development -t lib/main.dart --dart-define=API_BASE_URL=http://localhost:5000/api/
```

Select the Android emulator if prompted. `adb reverse` connects the app's localhost port 5000 to your laptop's backend. Repeat it after restarting the emulator or reconnecting a USB device. If `adb` is not on PATH, use Android SDK's `platform-tools/adb.exe` (normally under `%LOCALAPPDATA%/Android/Sdk` on Windows).

This also supports a USB Android phone with USB debugging enabled. With multiple devices, specify the same device ID using `adb -s DEVICE_ID reverse tcp:5000 tcp:5000` and `flutter run -d DEVICE_ID` with the other arguments above.

## Kotlin Android app (optional)

Open `MobileAppNayomis` in Android Studio, let Gradle sync, select the `developmentDebug` variant, and run on an emulator. Its development API URL is `http://10.0.2.2:5000/api/`, which reaches the laptop from Android Emulator.

Secrets, dependencies, Android SDK paths, emulator data, and compiled builds are intentionally excluded. Each laptop installs its own tools and dependencies.
