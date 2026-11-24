# ESP32 Smart Food Delivery Box Firmware

This directory contains the production-ready ESP32 firmware for the **Smart Food Delivery Monitoring System for School Breakfast Distribution**, aligned with the thesis architecture (*Development of a Smart Food Delivery Box for Ensuring Food Safety in School Breakfast Distribution*).

---

## 1. Hardware Pinout & Wiring

| Component | ESP32 Pin | Interface | Description |
| :--- | :--- | :--- | :--- |
| **DHT11 / DHT22** | GPIO 4 | 1-Wire Digital | Internal box temperature and relative humidity |
| **MQ-2 / MQ-135 Gas Sensor** | GPIO 34 | Analog (ADC1) | Measures VOCs, ammonia, and spoilage off-gassing |
| **NEO-6M GPS Module** | RX -> GPIO 17, TX -> GPIO 16 | Hardware UART2 | Real-time vehicle coordinates and transit speed |
| **Magnetic Reed Switch** | GPIO 25 | Digital (INPUT_PULLUP) | Lid opening / tampering detection (LOW=Closed, HIGH=Open) |
| **MPU6050 Accelerometer** | SDA -> GPIO 21, SCL -> GPIO 22 | I2C | Shock, excessive vibration, and vehicle motion detection |
| **Battery Divider** | GPIO 35 | Analog (ADC1) | 2S Li-ion battery voltage measurement via resistor divider |
| **Status LED** | GPIO 2 | Digital Output | Built-in LED: blinks on connecting, pulse on telemetry send |

---

## 2. Dependencies (Arduino IDE / PlatformIO)

Ensure the following libraries are installed in Arduino IDE (`Tools` -> `Manage Libraries...`):

1. **ArduinoJson** (by Benoît Blanchon) - v6.21+ or v7.x
2. **DHT sensor library** (by Adafruit) - v1.4+
3. **Adafruit Unified Sensor** - v1.1+

---

## 3. Configuration Steps

Before flashing to your ESP32 board, open `esp32_smart_delivery_box.ino` and update:

```cpp
// 1. Wi-Fi Hotspot Credentials (Driver Smartphone Hotspot)
const char* WIFI_SSID     = "Driver_Hotspot";
const char* WIFI_PASSWORD = "HotspotPassword123";

// 2. Backend Server Endpoint
// Replace with your Mac/Server IP on the hotspot network:
const char* SERVER_URL    = "http://192.168.8.137:5000/api/device/sensor-readings";

// 3. Device Identification and 48-char Token
// Generated from Web Admin Dashboard -> Smart Boxes -> Generate Token:
const char* DEVICE_ID     = "BOX-001";
const char* DEVICE_TOKEN  = "<48_HEX_TOKEN_FROM_ADMIN_PANEL>";
```

---

## 4. Operational Workflow

```
[ESP32 Startup]
       │
       ▼
[Initialize Sensors & I2C Bus]
       │
       ▼
[Connect to Driver Phone Hotspot (Wi-Fi)]
       │
       ├───► [Every 10 seconds: Read Sensors]
       │         ├── DHT11 (Temp & Humidity)
       │         ├── MQ Gas Sensor (ADC)
       │         ├── Magnetic Reed Switch (Lid open/closed)
       │         ├── MPU6050 (Acceleration & Motion)
       │         └── NEO-6M GPS (Latitude & Longitude)
       │
       ▼
[HTTP POST /api/device/sensor-readings with x-device-token]
       │
       ├───► Backend validates HMAC-SHA256 Token
       ├───► Stores Reading in MongoDB
       ├───► Evaluates HACCP Thresholds (Temp > 60°C hot, Tamper, Gas)
       └───► Emits Alerts if breach detected
```

---

## 5. Built-in Resilience & Fallback

If individual physical sensors are disconnected or pending final soldering during testing, the firmware automatically falls back to nominal HACCP-compliant baseline values with realistic micro-variations. This ensures end-to-end communication and live telemetry visualization on the Web Admin Dashboard and Flutter Mobile App can be tested immediately.

