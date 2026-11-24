# Nayomi's Waterfront — full project

Website, backend, and Android/iOS mobile apps in one repository with an integrated **ESP32 IoT Smart Food Delivery Monitoring System for School Breakfast Distribution**.

**Guides & Manuals:**
- [Smart Delivery Monitoring System Guide](SMART_DELIVERY_SYSTEM_GUIDE.md) — Architecture, ESP32 firmware, HACCP alerts, and API reference.
- [ESP32 Firmware Source & Pinout](firmware/esp32_smart_delivery_box/README.md)
- [Setup on another laptop](SETUP_OTHER_LAPTOP.md)

| Component | Location | Development address |
| --- | --- | --- |
| React / Vite website | Repository root (`src/`) | http://localhost:8080 |
| Express backend | `backend/` | http://localhost:5000 |
| Flutter Android app | `MobileAppNayomisFlutter/` | Android emulator or USB phone |
| Kotlin Android app | `MobileAppNayomis/` | Android emulator |
| MongoDB | Install locally on your laptop | mongodb://127.0.0.1:27017/nayomis-food-app |

Copy `backend/.env.example` to `backend/.env` and generate your own JWT secret as described in the setup guide. Database contents and credentials are not included in Git.

The Flutter app was previously at the repository root. Open `MobileAppNayomisFlutter` in Android Studio after pulling this layout.
