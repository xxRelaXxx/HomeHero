# Home Hero — ESP32 Firmware

[🇮🇹 Leggi in Italiano](README_IT.md)

C++ firmware for the ESP32 microcontroller. Reads 6 environmental sensors every 10 seconds, posts the data to the Home Hero REST API, and drives a fan relay based on the command returned by the backend.

---

## Hardware

| Component | Role | Interface |
|-----------|------|-----------|
| ESP32 Dev Module | Main MCU | — |
| BME680 | Temperature · Humidity · Pressure · Gas | I²C bus 1 (SDA=21, SCL=22) |
| BH1750 | Ambient light | I²C bus 2 (SDA=32, SCL=33) |
| INMP441 | Ambient noise (microphone) | I²S (WS=27, SCK=14, SD=12) |
| SH1107 OLED 128×128 | Sensor readout display | I²C bus 1 (0x3C) |
| SSD1306 OLED 128×64 | Date/time display | I²C bus 2 (0x3C) |
| Relay module | Fan control | GPIO 25 |

### Wiring summary

```
ESP32 GPIO 21 (SDA) ──── BME680 SDA, SH1107 SDA
ESP32 GPIO 22 (SCL) ──── BME680 SCL, SH1107 SCL

ESP32 GPIO 32 (SDA) ──── BH1750 SDA, SSD1306 SDA
ESP32 GPIO 33 (SCL) ──── BH1750 SCL, SSD1306 SCL

ESP32 GPIO 27 (I2S_WS ) ──── INMP441 WS
ESP32 GPIO 14 (I2S_SCK) ──── INMP441 SCK
ESP32 GPIO 12 (I2S_SD ) ──── INMP441 SD

ESP32 GPIO 25 ──── Relay IN  (HIGH = fan ON)
3.3V / GND   ──── all sensors VCC / GND
```

---

## Setup

### 1 — Install required libraries

Open **Arduino IDE → Sketch → Include Library → Manage Libraries** and install each library listed in [`libraries.txt`](libraries.txt).

Add the ESP32 board manager URL if not already present:
```
https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
```

### 2 — Configure credentials

```bash
cp config.example.h config.h
```

Edit `config.h` and fill in:

```cpp
#define WIFI_SSID      "your_wifi_ssid"
#define WIFI_PASSWORD  "your_wifi_password"
#define API_BASE_URL   "https://hhero.up.railway.app/api"
#define DEVICE_NAME    "esp32_living_room"
```

> ⚠️ `config.h` is listed in `.gitignore` — it will never be pushed to the repository.

### 3 — Flash

| Setting | Value |
|---------|-------|
| Board | ESP32 Dev Module |
| Upload Speed | 115200 |
| Partition Scheme | Default |
| Port | COM* (Windows) / /dev/ttyUSB0 (Linux/Mac) |

Open `sketch.cpp` in Arduino IDE or PlatformIO and click **Upload**.

---

## Communication protocol

Every `TELEMETRY_INTERVAL` ms (default: 10 000 ms) the device posts:

```json
POST https://hhero.up.railway.app/api/device/data
Content-Type: application/json

{
  "device_name":  "esp32_living_room",
  "temperature":  23.45,
  "humidity":     58.0,
  "air_pressure": 1013.25,
  "gas_kohm":     102.3,
  "light_lux":    420.0,
  "noise_db":     42.7,
  "fan_state":    false
}
```

The backend responds with:

```json
{
  "telemetry":         { ...stored row... },
  "fan_desired_state": true
}
```

The firmware reads `fan_desired_state` and sets GPIO 25 HIGH/LOW on the next loop iteration.

---

## Noise dB calculation

The INMP441 outputs 24-bit LEFT-ALIGNED samples inside a 32-bit I²S frame.  
The firmware:
1. Right-shifts each sample by 8 bits to recover the real 24-bit signed value
2. Computes RMS over the buffer
3. Converts to dBFS: `20 × log10(RMS / 2²³)`
4. Applies a calibration offset (`DB_SPL_OFFSET = 110 dB`) to produce a human-readable SPL estimate
5. Clamps to [20, 120] dB and smooths with an EMA filter (α = 0.20)

Adjust `DB_SPL_OFFSET` in `sketch.cpp` to calibrate against a reference meter.

---

## License

[MIT](../LICENSE) — S.A.R.R.L. Team, 2026
