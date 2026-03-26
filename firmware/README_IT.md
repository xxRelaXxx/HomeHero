# Home Hero — Firmware ESP32

[🇬🇧 Read in English](README.md)

Firmware C++ per il microcontrollore ESP32. Legge 6 sensori ambientali ogni 10 secondi, invia i dati all'API REST di Home Hero e controlla un relay per la ventola in base al comando restituito dal backend.

---

## Hardware

| Componente | Funzione | Interfaccia |
|------------|----------|-------------|
| ESP32 Dev Module | MCU principale | — |
| BME680 | Temperatura · Umidità · Pressione · Gas | I²C bus 1 (SDA=21, SCL=22) |
| BH1750 | Luce ambientale | I²C bus 2 (SDA=32, SCL=33) |
| INMP441 | Rumore ambientale (microfono) | I²S (WS=27, SCK=14, SD=12) |
| SH1107 OLED 128×128 | Display lettura sensori | I²C bus 1 (0x3C) |
| SSD1306 OLED 128×64 | Display data/ora | I²C bus 2 (0x3C) |
| Modulo relay | Controllo ventola | GPIO 25 |

### Schema di cablaggio

```
ESP32 GPIO 21 (SDA) ──── BME680 SDA, SH1107 SDA
ESP32 GPIO 22 (SCL) ──── BME680 SCL, SH1107 SCL

ESP32 GPIO 32 (SDA) ──── BH1750 SDA, SSD1306 SDA
ESP32 GPIO 33 (SCL) ──── BH1750 SCL, SSD1306 SCL

ESP32 GPIO 27 (I2S_WS ) ──── INMP441 WS
ESP32 GPIO 14 (I2S_SCK) ──── INMP441 SCK
ESP32 GPIO 12 (I2S_SD ) ──── INMP441 SD

ESP32 GPIO 25 ──── Relay IN  (HIGH = ventola ON)
3.3V / GND   ──── VCC / GND di tutti i sensori
```

---

## Setup

### 1 — Installa le librerie

Apri **Arduino IDE → Sketch → Includi libreria → Gestisci librerie** e installa ogni libreria elencata in [`libraries.txt`](libraries.txt).

Aggiungi l'URL del board manager ESP32 se non è già presente:
```
https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
```

### 2 — Configura le credenziali

```cpp
#define WIFI_SSID      "nome_rete_wifi"
#define WIFI_PASSWORD  "password_wifi"
#define API_BASE_URL   "https://hhero.up.railway.app/api"
#define DEVICE_NAME    "esp32_living_room"
```

> ⚠️ `config.h` è in `.gitignore` — non verrà mai caricato nel repository.

### 3 — Flash

| Impostazione | Valore |
|--------------|--------|
| Board | ESP32 Dev Module |
| Upload Speed | 115200 |
| Partition Scheme | Default |
| Porta | COM* (Windows) / /dev/ttyUSB0 (Linux/Mac) |

Apri `sketch.cpp` in Arduino IDE o PlatformIO e clicca **Carica**.

---

## Protocollo di comunicazione

Ogni `TELEMETRY_INTERVAL` ms (default: 10 000 ms) il dispositivo invia:

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

Il backend risponde con:

```json
{
  "telemetry":         { ...riga salvata... },
  "fan_desired_state": true
}
```

Il firmware legge `fan_desired_state` e imposta GPIO 25 HIGH/LOW all'iterazione successiva del loop.

---

## Calcolo dei dB di rumore

Il microfono INMP441 produce campioni a 24 bit LEFT-ALIGNED in un frame I²S a 32 bit.  
Il firmware:
1. Sposta ogni campione di 8 bit a destra per recuperare il valore signed a 24 bit
2. Calcola il valore RMS sul buffer
3. Converte in dBFS: `20 × log10(RMS / 2²³)`
4. Applica un offset di calibrazione (`DB_SPL_OFFSET = 110 dB`) per ottenere un valore SPL leggibile
5. Limita il range a [20, 120] dB e applica un filtro EMA (α = 0.20)

Regola `DB_SPL_OFFSET` in `sketch.cpp` per calibrare rispetto a un fonometro di riferimento.

---

## Licenza

[MIT](../LICENSE) — Team S.A.R.R.L., 2026
