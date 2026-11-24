# Smart Food Delivery Monitoring System for School Breakfast Distribution
## Architecture, Operations & Integration Manual

This system enhances Nayomi's Waterfront food-service platform into a complete **Smart Food Delivery Monitoring System for School Breakfast Distribution**, implementing the hardware, networking, and software specifications defined in the thesis (*"Development of a Smart Food Delivery Box for Ensuring Food Safety in School Breakfast Distribution"*).

---

## 1. System Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │          ESP32 Smart Delivery Box            │
                    │  • DHT11 (Temp & Humidity: GPIO 4)           │
                    │  • MQ Gas Sensor (Spoilage VOCs: GPIO 34)    │
                    │  • NEO-6M GPS (Coordinates: RX 17 / TX 16)   │
                    │  • Magnetic Reed Switch (Lid: GPIO 25)       │
                    │  • MPU6050 (Acceleration/Shock: I2C 21/22)   │
                    │  • Battery Divider (Level %: GPIO 35)        │
                    └──────────────────────┬───────────────────────┘
                                           │ Wi-Fi 2.4GHz
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │    Driver Smartphone Hotspot Gateway         │
                    │    (Mobile Data Cellular Uplink)             │
                    └──────────────────────┬───────────────────────┘
                                           │ HTTP POST (x-device-token)
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │             Node.js / Express API            │
                    │  • Device HMAC Token Authentication          │
                    │  • Rate Limiting & Input Sanitization        │
                    │  • Automated HACCP Threshold Validation     │
                    │  • Alert Generation (Temp, Gas, Tamper)      │
                    └──────────────┬───────────────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                                         ▼
   ┌──────────────────────┐                  ┌──────────────────────┐
   │ MongoDB Persistence  │                  │  Client Interfaces   │
   │ • SensorReadings     │                  │  • Web Admin Portal  │
   │ • DeliveryBoxes      │                  │  • Flutter App       │
   │ • Alerts             │                  │  • Driver Portal     │
   │ • Orders / Food      │                  │  • Customer Tracking │
   └──────────────────────┘                  └──────────────────────┘
```

---

## 2. Hardware & Firmware Guide (`firmware/esp32_smart_delivery_box/`)

### 2.1 Hardware Wiring Pinout

| Sensor / Module | ESP32 Pin | Logic Level | Function |
| :--- | :--- | :--- | :--- |
| **DHT11 / DHT22** | GPIO 4 | 3.3V | Temperature & Relative Humidity inside insulated chamber |
| **MQ-2 / MQ-135** | GPIO 34 | Analog (ADC1) | VOC & spoilage gas detection |
| **NEO-6M GPS** | RX -> GPIO 17, TX -> GPIO 16 | 3.3V Serial | Real-time vehicle coordinates & speed |
| **Magnetic Reed Switch** | GPIO 25 | INPUT_PULLUP | Lid open/closed tampering detection (LOW=Closed, HIGH=Open) |
| **MPU6050 Accelerometer** | SDA -> GPIO 21, SCL -> GPIO 22 | I2C | Impact shock and delivery motion tracking |
| **Battery Divider** | GPIO 35 | Analog (ADC1) | 2S Li-ion battery voltage measurement |
| **Status LED** | GPIO 2 | Digital Output | Built-in LED: blink = Wi-Fi search, solid = connected |

### 2.2 Flashing ESP32 via Arduino IDE
1. Open `firmware/esp32_smart_delivery_box/esp32_smart_delivery_box.ino`.
2. Install libraries via Library Manager:
   - `ArduinoJson` (v6 or v7)
   - `DHT sensor library` (Adafruit)
3. Set your driver hotspot credentials:
   ```cpp
   const char* WIFI_SSID     = "Driver_Hotspot";
   const char* WIFI_PASSWORD = "HotspotPassword123";
   const char* SERVER_URL    = "http://<YOUR_BACKEND_LAN_IP>:5000/api/device/sensor-readings";
   const char* DEVICE_ID     = "BOX-001";
   const char* DEVICE_TOKEN  = "<48_CHAR_TOKEN_FROM_ADMIN_PANEL>";
   ```
4. Select board **ESP32 Dev Module**, choose serial port, and click **Upload**.

---

## 3. Backend API Endpoints

### 3.1 Device Telemetry Ingestion
- **`POST /api/device/sensor-readings`**
  - **Headers:** `Content-Type: application/json`, `x-device-token: <DEVICE_TOKEN>`
  - **Payload:**
    ```json
    {
      "device_id": "BOX-001",
      "temperature_c": 64.5,
      "humidity_percent": 55.2,
      "gas_raw": 310,
      "latitude": 6.9271,
      "longitude": 79.8612,
      "motion_detected": true,
      "box_open": false,
      "battery_percent": 94,
      "sequence_number": 42
    }
    ```
  - **Behavior:**
    - Checks device token against HMAC digest using `DEVICE_TOKEN_PEPPER`.
    - Stores observation in `SensorReading`.
    - Automatically checks HACCP thresholds:
      - Hot breakfast holding safe range: 60°C – 80°C.
      - Lid opening during transit: triggers high-severity tampering alert.
      - Gas sensor ADC > 800: triggers gas anomaly alert.

### 3.2 Admin Fleet Management (`/api/admin/boxes`)
- `GET /api/admin/boxes/devices` — List all registered delivery boxes with live telemetry status.
- `POST /api/admin/boxes/devices` — Register a new smart delivery box.
- `POST /api/admin/boxes/devices/:boxId/token` — Generate a secure 48-character token for ESP32.
- `POST /api/admin/boxes/devices/assign` — Assign a delivery box to an active breakfast order.
- `POST /api/admin/boxes/devices/unassign` — Release a delivery box.
- `PATCH /api/admin/boxes/devices/:boxId/settings` — Update HACCP temperature/gas thresholds.

### 3.3 Safety Alerts (`/api/alerts`)
- `GET /api/alerts` — Fetch all incidents with severity, type, and status filters.
- `GET /api/alerts/summary` — Active incident counts by severity.
- `PATCH /api/alerts/:id/resolve` — Mark incident resolved with operational resolution notes.

### 3.4 Driver Operations (`/api/driver`)
- `GET /api/driver/deliveries` — List assigned breakfast deliveries for authenticated driver.
- `POST /api/driver/deliveries/:orderId/dispatch` — Mark breakfast order as dispatched (In Transit).
- `POST /api/driver/deliveries/:orderId/complete` — Confirm physical handover at school pickup point.
- `POST /api/driver/deliveries/:orderId/incident` — Log driver field incident (delay, vehicle breakdown, etc.).

---

## 4. Web Application Features

1. **Fleet Management (`/admin` -> Smart Boxes)**:
   - View all delivery boxes, battery levels, online/offline status, and assigned orders.
   - One-click token generation dialog (displays raw secret once for flashing into firmware).
   - Instant assignment/unassignment to student pre-orders.
2. **Safety Alerts Center (`/admin` -> Safety Alerts)**:
   - Real-time alert feed with severity chips (Critical, High, Medium, Low).
   - Incident resolution modal with required notes for audit logging.
3. **Live Customer Sensor Tracker**:
   - Live temperature, humidity, gas index, and lid security indicator.
   - Interactive OpenStreetMap GPS coordinate links.

---

## 5. Mobile Application Features (`MobileAppNayomisFlutter`)

1. **Customer Orders Screen (`/orders`)**:
   - Dynamic real-time list of current and past school breakfast orders from MongoDB.
   - One-tap navigation to Smart Box Live Tracking for in-transit orders.
2. **Smart Box Tracking Screen (`/tracking/:id`)**:
   - Real-time environmental observation panel: Safe (Green), Warning (Amber), Critical (Red).
   - Live metric cards: Temperature, Humidity, Spoilage Gas, Tamper Switch, Motion, and Battery.
   - HACCP Operational Compliance statement.
3. **Driver & Operational Portal (`/driver` accessible from Profile)**:
   - Hotspot gateway status checker.
   - Assigned delivery list with dispatch and school handover buttons.
   - Quick incident reporting.

---

## 6. Testing & Simulation

To test the system without flashing physical hardware:

```bash
cd backend

# Send simulated telemetry packets for BOX-001
npm run simulate:telemetry -- --boxId=BOX-001 --temp=64.5 --gas=310 --count=10

# Simulate a temperature breach (< 60°C)
npm run simulate:telemetry -- --boxId=BOX-001 --temp=48.0 --count=3

# Simulate lid open tampering
npm run simulate:telemetry -- --boxId=BOX-001 --open=true --count=2
```

