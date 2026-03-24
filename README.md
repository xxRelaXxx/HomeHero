<div align="center">

<img src="frontend/src/styles/img/HomeHero.svg" alt="Home Hero Logo" width="110" />

# Home Hero

**Intelligent Environmental Monitoring Station**

> `ESP32` → `Laravel REST API` → `PostgreSQL`
                    |            
            `React Dashboard`

[![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?style=flat-square&logo=php&logoColor=white)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://supabase.com)
[![ESP32](https://img.shields.io/badge/ESP32-C%2B%2B-E7352C?style=flat-square&logo=espressif&logoColor=white)](https://espressif.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

[![API on Railway](https://img.shields.io/badge/API-Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white)](https://hhero.up.railway.app/api)
[![Dashboard on Netlify](https://img.shields.io/badge/Dashboard-Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)](https://hohero.netlify.app)

[🇮🇹 Leggi in Italiano](README_IT.md) &nbsp;|&nbsp; [📖 Documentation](docs/) &nbsp;|&nbsp; [🔌 Live API](https://hhero.up.railway.app/api)

</div>

---

## What is Home Hero?

**Home Hero** is a full-stack IoT system that monitors your home environment in real time. An ESP32 microcontroller samples six environmental metrics every 10 seconds and pushes them to a cloud REST API. A React dashboard lets you visualise historical trends and remotely control a fan — either automatically via a temperature threshold or manually with a single click.

---

## Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                          ESP32 Device                              │
│   BME680 · BH1750 · INMP441 · 2× OLED displays · Fan relay       │
│                POST /api/device/data  every 10 s                   │
└────────────────────────────┬───────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                     Laravel 12 REST API                            │
│           PHP 8.2 · Sanctum auth · Docker · Railway                │
│   AuthController  TelemetryController  DeviceController  UserCtrl  │
└──────────────┬─────────────────────────────────┬───────────────────┘
               │ Eloquent ORM                    │ JSON responses
               ▼                                 ▼
┌─────────────────────────┐      ┌──────────────────────────────────┐
│  PostgreSQL (Supabase)  │      │       React Dashboard            │
│                         │      │  Vite 7 · Tailwind 4 · Recharts  │
│  users                  │      │  Login / Register                 │
│  telemetries            │      │  Sensor cards · Timeline charts   │
│  device_settings        │      │  Fan control · User profile       │
│  personal_access_tokens │      │  Hosted on Netlify                │
└─────────────────────────┘      └──────────────────────────────────┘
```

---

## Sensors & Data

| Sensor | Metric | Unit | Dashboard key |
|--------|--------|------|---------------|
| BME680 | Temperature | °C | `temperature` |
| BME680 | Relative Humidity | %RH | `humidity` |
| BME680 | Atmospheric Pressure | hPa | `air_pressure` |
| BME680 | Gas Resistance | kΩ | `gas_kohm` |
| BH1750 | Ambient Light | lux | `light_lux` |
| INMP441 | Ambient Noise | dB(A) | `noise_db` |

---

## Features

- 📡 **Real-time telemetry** — ESP32 pushes data every 10 seconds via HTTPS POST
- 📊 **Historical charts** — last 20 readings visualised as interactive time-series (Recharts)
- 🌀 **Remote fan control** — auto mode (temperature threshold) or manual override from the dashboard
- 🔒 **Secure authentication** — Laravel Sanctum Bearer tokens, bcrypt password hashing
- 👤 **User profiles** — register, login, update name/email
- 🐳 **Docker-ready** — one-command local setup with `docker-compose up --build`
- ☁️ **Cloud-deployed** — Railway (API) + Supabase (PostgreSQL) + Netlify (Dashboard)
- 🌐 **Bilingual** — English and Italian documentation throughout

---

## Live

| Service | URL |
|---------|-----|
| 🔌 API Health Check | [https://hhero.up.railway.app/api](https://hhero.up.railway.app/api) |
| 🖥️ Dashboard | [https://your-site.netlify.app](https://your-site.netlify.app) |

---

## Repository Structure

```
HomeHero/
├── backend/                   Laravel 12 REST API  (Roman)
│   ├── app/
│   │   ├── Http/Controllers/  AuthController · TelemetryController
│   │   │                      DeviceController · UserController
│   │   └── Models/            User · Telemetry · DeviceSettings
│   ├── database/migrations/   9 migrations — full schema history
│   ├── routes/api.php         All API route definitions
│   ├── Dockerfile             Production container image
│   ├── docker-compose.yml     Local development stack
│   ├── Procfile               Railway start command
│   └── .env.example           Environment variable template
│
├── frontend/                  React + Vite dashboard  (Luka · De Togni)
│   ├── src/api/               Axios API client with interceptors
│   ├── src/componentsDashboard/  Charts · sensor cards · fan control
│   ├── src/pages/             Login · Register · Dashboard
│   └── vite.config.js
│
├── firmware/                  ESP32 C++ firmware  (Shaeek)
│   ├── sketch.cpp             Main firmware (Arduino framework)
│   ├── config.example.h       Configuration template (copy → config.h)
│   └── libraries.txt          Required Arduino libraries
│
└── docs/                      Technical documentation  (Matteo · De Togni)
    ├── eng/                   English docs
    │   ├── BACKEND_INFRA_DOC.md       GANTT.md       RACI_Matrix.md
    │   ├── Economic_Analysis.md       Project_Phases_Tuckman.md
    │   ├── COSTRAINTS_RISKMANAGEMENT.md
    │   └── FUTURE_PERSPECTIVES.md
    └── ita/                   Italian docs
        ├── BACKEND_INFRA_DOC_IT.md    GANTT.md       RACI_Matrice.md
        ├── Analisi_Economica.md       Fasi_Progetto_Tuckman.md
        ├── COSTRAINTS_RISKMANAGEMENT_IT.md
        └── FUTURE_PERSPECTIVES_IT.md
```

---

## Quick Start

### Backend (Laravel API)

```bash
cd backend

# 1. Configure environment
cp .env.example .env
# Edit .env: set DB_HOST, DB_PASSWORD, APP_KEY, FRONTEND_URL
php artisan key:generate

# 2. Install dependencies & migrate
composer install
php artisan migrate

# 3. Run
php artisan serve           # → http://localhost:8000/api
```

**With Docker (recommended):**
```bash
cd backend
docker-compose up --build   # → http://localhost:8000/api
```

### Frontend (React + Vite)

```bash
cd frontend

# 1. Configure environment
cp .env.example .env
# Edit .env: VITE_API_BASE_URL=http://localhost:8000/api

# 2. Install & run
npm install
npm run dev                 # → http://localhost:5173
```

### Firmware (ESP32)

```bash
# 1. Navigate to the firmware folder
cd firmware

# 2. Create your config file from the template
cp config.example.h config.h
# Edit config.h: set WIFI_SSID, WIFI_PASSWORD, API_BASE_URL, DEVICE_NAME

# 3. Open sketch.cpp in Arduino IDE
#    Board: ESP32 Dev Module  |  Baud rate: 115200
#    Install libraries listed in libraries.txt

# 4. Upload to the board
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/` | — | Health check |
| `POST` | `/api/register` | — | Register new user, returns Bearer token |
| `POST` | `/api/login` | — | Login, returns Bearer token |
| `POST` | `/api/logout` | Bearer | Revoke all tokens |
| `GET` | `/api/user` | Bearer | Authenticated user's profile |
| `PUT` | `/api/user/profile` | Bearer | Update name / email |
| `GET` | `/api/telemetry` | Bearer | Last 20 readings (oldest → newest) |
| `POST` | `/api/device/data` | — | ESP32 data push; returns `fan_desired_state` |
| `GET` | `/api/device/{name}/settings` | Bearer | Fan settings for a device |
| `PUT` | `/api/device/{name}/fan` | Bearer | Update fan mode or threshold |

> Full API documentation: [`docs/eng/BACKEND_INFRA_DOC.md`](docs/eng/BACKEND_INFRA_DOC.md)

---

## Team — S.A.R.R.L.

| Member | Primary Role |
|--------|-------------|
| **Roman** | Backend — Laravel API, database design, Railway deployment |
| **Luka** | Frontend — React dashboard, Vite, charts, Netlify deployment |
| **Shaeek** | Firmware — ESP32 C++, sensor integration, hardware |
| **Matteo** | Documentation, project management |
| **De Togni** | Frontend, documentation |

---

## License

This project is licensed under the [MIT License](LICENSE).
