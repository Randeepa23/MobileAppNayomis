# Smart Food Delivery Box - Hardware Assembly & Structural Design Manual
**Project Reference:** Development of a Smart Food Delivery Box for Ensuring Food Safety in School Breakfast Distribution  
**Platform:** Nayomi's Waterfront Food App & IoT Monitoring System

---

## 1. Inventory of Physical Equipment

Based on the components you have:

| Item | Component Name | Pin Count / Interface | Role in the System |
| :---: | :--- | :--- | :--- |
| **A** | **Thermal Delivery Bag** | Insulated chamber with top zipper | The physical delivery box enclosure |
| **B** | **ESP-WROOM-32 (ESP32)** | 30-Pin Type-C Microcontroller | The central IoT brain |
| **C** | **DHT11 Sensor** | 3 Pins (VCC, DATA, GND) | Air temperature & humidity inside the food chamber |
| **D** | **MQ Gas Sensor Module** | 4 Pins (VCC, GND, A0, D0) | Detects volatile organic compounds (VOCs) and spoilage gas |
| **E** | **GY-NEO6MV2 GPS + Antenna**| 4 Pins (VCC, RX, TX, GND) | Real-time vehicle coordinates & speed |
| **F** | **MPU-6050 (HW-123)** | 8 Pins (I2C: VCC, GND, SCL, SDA)| 6-Axis motion, vehicle vibration, and shock monitoring |
| **G** | **0.96" OLED Display** | 4 Pins (I2C: GND, VCC, SCL, SDA)| Real-time on-box dashboard (Temp, battery, Wi-Fi status) |
| **H** | **Magnetic Reed Switch** | 2-terminal glass envelope | Detects unauthorized lid opening / food tampering |
| **I** | **TP4056 Module** | Type-C USB with battery protection| Recharges the Li-ion battery safely |
| **J** | **LM2596 DC-DC Buck Converter**| In+/In-, Out+/Out- | Steps down higher DC voltage to a rock-solid 5.0V |
| **K** | **1000 µF 25V Capacitors** | 2 Leads (Long=+, Stripe=-) | Absorbs ESP32 current bursts & prevents reboot brownouts |
| **L** | **KCD1-101 Rocker Switch**| 2 Pins SPST | Master Power Switch |
| **M** | **5mm Status LEDs** | 2 Leads | Visual indicator (Green = Safe, Red = Alert) |

---

## 2. Complete Electrical Schematic & Wiring

```
                         ┌────────────────────────────────────────┐
                         │         ESP-WROOM-32 (30-Pin)          │
                         │                                        │
      [ 3V3 Rail ] ◄─────┤ 3V3                                GND ├─────► [ Common GND Rail ]
                         │                                        │
      [ 5V Power ] ──────┤ VIN                                GPIO4├─────► DHT11 (DATA)
                         │                                        │
DHT11 / OLED / MPU  ◄────┤ 3V3                              GPIO34├─────► MQ Gas Sensor (A0)
                         │                                        │
      OLED / MPU (SDA) ◄─┤ GPIO21 (SDA)                     GPIO25├─────► Reed Switch (Leg 1)
                         │                                        │       (Leg 2 to GND)
      OLED / MPU (SCL) ◄─┤ GPIO22 (SCL)                     GPIO16├─────► NEO-6M GPS (TX)
                         │                                        │
     Green LED (Safe) ◄──┤ GPIO18                           GPIO17├─────► NEO-6M GPS (RX)
                         │                                        │
     Red LED (Breach) ◄──┤ GPIO19                            GND  ├─────► [ Common GND Rail ]
                         └────────────────────────────────────────┘
```

### 2.1 Pin-by-Pin Connection Matrix

1. **Power Rails:**
   - Connect **ESP32 3V3** to Breadboard Red (+) rail (3.3V).
   - Connect **ESP32 GND** to Breadboard Blue/Black (-) rail (GND).
   - Connect the **1000 µF capacitor** directly across the power rails (pay attention to polarity: stripe with `-` signs goes to GND).

2. **I2C Bus (OLED Display + MPU-6050):**
   - Both devices connect to the exact same clock and data pins!
   - `OLED VCC` and `MPU6050 VCC` &rarr; **3V3**
   - `OLED GND` and `MPU6050 GND` &rarr; **GND**
   - `OLED SDA` and `MPU6050 SDA` &rarr; **ESP32 GPIO 21**
   - `OLED SCL` and `MPU6050 SCL` &rarr; **ESP32 GPIO 22**

3. **Food Chamber Sensors:**
   - **DHT11:** `VCC` &rarr; **3V3**, `GND` &rarr; **GND**, `DATA` &rarr; **GPIO 4**
   - **MQ Gas Sensor:** `VCC` &rarr; **VIN (5V)** *(Heating element requires 5V)*, `GND` &rarr; **GND**, `A0` &rarr; **GPIO 34**
   - **Magnetic Reed Switch:** Leg 1 &rarr; **GPIO 25**, Leg 2 &rarr; **GND** *(Code uses internal `INPUT_PULLUP`)*

4. **GPS Module (NEO-6M):**
   - `VCC` &rarr; **3V3** (or 5V), `GND` &rarr; **GND**
   - `TX` &rarr; **GPIO 16** (ESP32 RX2)
   - `RX` &rarr; **GPIO 17** (ESP32 TX2)

---

## 3. Power Supply Subsystem

```
[ Type-C 5V Charger ]
         │
         ▼
[ TP4056 Charger Board ] ──► B+ / B- ──► [ 3.7V - 7.4V Li-ion Battery ]
         │
       OUT- ─────────────────────────────► Common GND
       OUT+ ──► [ Rocker Switch ] ──► [ LM2596 IN+ ]
                                            │ (Adjust blue screw until OUT is 5.0V)
                                         OUT+ ──► ESP32 VIN & MQ Gas VCC
                                            │
                             [ 1000 µF Capacitor across 5V and GND ]
```

- Before connecting the ESP32, use a small flat screwdriver to turn the potentiometer screw on the **LM2596** counter-clockwise until your multimeter reads **5.0V** at `OUT+`.

---

## 4. Physical Structural Arrangement in the Delivery Bag

### 4.1 Zone Separation (HACCP Food Safety Principle)
Never place bare electrical batteries or exposed circuits loose next to hot food containers where steam and spills can cause short circuits.

```
┌──────────────────────────────────────────────────────────────┐
│                    TOP LID FLAP (ZIPPER)                     │
│  [ Small Magnet glued here ]    [ 0.96" OLED Display ]       │
├──────────────────────────────────────────────────────────────┤
│  [ Glass Reed Switch on rim ]   [ GPS Antenna facing UP ]    │
│                                                              │
│  ┌─────────────────────────┐   ┌──────────────────────────┐  │
│  │   ELECTRONICS COMPARTMENT│   │    HOT FOOD COMPARTMENT  │  │
│  │   (Side / Outer pocket) │   │    (Main Insulated Core) │  │
│  │                         │   │                          │  │
│  │ • ESP32 Board           │   │ • Breakfast Containers   │  │
│  │ • Battery + TP4056      │   │ • DHT11 Sensor (hanging) │  │
│  │ • LM2596 Buck Regulator │   │ • MQ Gas Sensor (breather│  │
│  │ • MPU-6050 (rigid base) │   │   grill window)          │  │
│  │ • Rocker ON/OFF Switch  │   │                          │  │
│  └─────────────────────────┘   └──────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

1. **Food Chamber (Main Space):**
   - **DHT11:** Mount 5–8 cm below the top rim, protected inside a small perforated container so food boxes cannot crush it.
   - **MQ Gas Sensor:** Mount in an upper corner with a small breathable opening. Warm gases and spoilage VOCs rise to the top.

2. **Electronics Enclosure (Side Pocket):**
   - Keep the ESP32, LM2596, and battery neatly secured on a prototyping board inside the side pocket.
   - **MPU-6050:** Fasten rigidly to the bottom base of the bag so it directly senses vehicle road motion and braking impacts.
   - Mount the **Rocker Switch** and **TP4056 Type-C port** outward so you can switch the box ON and plug in a phone charger without opening the bag.

3. **Lid & Security:**
   - **Lid Tamper Switch:** Mount the glass reed switch on the inside rim of the bag. Glue a small neodymium magnet on the zipper flap. When the zipper is closed, the magnet rests right next to the reed switch. If someone unzips the flap, the reed switch opens, instantly transmitting a **Lid Tampering Breach** alert.
   - **OLED Display:** Mount into a transparent window on the top lid so the driver can see the food temperature without unzipping the bag.
   - **GPS Antenna:** Keep the ceramic patch antenna facing upward under the top fabric so it has an unobstructed line of sight to the sky.

---

## 5. Arduino IDE Flashing Checklist

1. Open Arduino IDE.
2. In **Library Manager** (`⌘ + Shift + I`), ensure you have:
   - `ArduinoJson` (v6 or v7)
   - `DHT sensor library` (Adafruit)
   - `Adafruit SSD1306`
   - `Adafruit GFX Library`
3. Open [`firmware/esp32_smart_delivery_box/esp32_smart_delivery_box.ino`](firmware/esp32_smart_delivery_box/esp32_smart_delivery_box.ino).
4. Update your phone's hotspot name (`WIFI_SSID`), hotspot password (`WIFI_PASSWORD`), your Mac's IP (`SERVER_URL`), and the 48-char device token (`DEVICE_TOKEN`).
5. Select **ESP32 Dev Module**, choose your USB port, and hit **Upload**!

