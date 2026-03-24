#pragma once

// ─────────────────────────────────────────────────────────────────────────────
// config.example.h — Home Hero ESP32 Firmware Configuration Template
//
// SETUP:
//   1. Copy this file:  cp config.example.h config.h
//   2. Fill in YOUR values in config.h
//   3. config.h is listed in .gitignore and will NEVER be pushed to the repo
// ─────────────────────────────────────────────────────────────────────────────

// ── WiFi credentials ─────────────────────────────────────────────────────────
#define WIFI_SSID      "your_wifi_ssid"
#define WIFI_PASSWORD  "your_wifi_password"

// ── Backend API ───────────────────────────────────────────────────────────────

// Local dev (uncomment to use):
#define API_BASE_URL   "http://192.168.x.x:8000/api"

// ── Device identity ───────────────────────────────────────────────────────────
// Must be a unique string per physical device.
// The dashboard and backend use this to identify which ESP32 sent the data.
#define DEVICE_NAME    "esp32_living_room"
