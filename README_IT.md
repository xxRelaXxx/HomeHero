<div align="center">

<img src="frontend/src/styles/img/HomeHero.svg" alt="Home Hero Logo" width="110" />

# Home Hero

**Stazione di Monitoraggio Ambientale Intelligente**

> `ESP32` → `Laravel REST API` → `PostgreSQL` → `React Dashboard`

[![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?style=flat-square&logo=php&logoColor=white)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://supabase.com)
[![ESP32](https://img.shields.io/badge/ESP32-C%2B%2B-E7352C?style=flat-square&logo=espressif&logoColor=white)](https://espressif.com)
[![Licenza: MIT](https://img.shields.io/badge/Licenza-MIT-22c55e?style=flat-square)](LICENSE)

[![API su Railway](https://img.shields.io/badge/API-Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white)](https://hhero.up.railway.app/api)
[![Dashboard su Netlify](https://img.shields.io/badge/Dashboard-Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)](https://hohero.netlify.app)

[🇬🇧 Read in English](README.md) &nbsp;|&nbsp; [📖 Documentazione](docs/) &nbsp;|&nbsp; [🔌 API Live](https://hhero.up.railway.app/api)

</div>

---

## Cos'è Home Hero?

**Home Hero** è un sistema IoT full-stack per il monitoraggio ambientale in tempo reale. Un microcontrollore ESP32 campiona sei grandezze ambientali ogni 10 secondi e le invia a un'API REST cloud. Una dashboard React permette di visualizzare lo storico dei dati e di controllare una ventola da remoto — automaticamente tramite soglia di temperatura oppure manualmente con un solo clic.

---

## Architettura

```
┌────────────────────────────────────────────────────────────────────┐
│                       Dispositivo ESP32                            │
│   BME680 · BH1750 · INMP441 · 2× display OLED · relay ventola      │
│              POST /api/device/data  ogni 10 s                      │
└────────────────────────────┬───────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                     Laravel 12 REST API                            │
│       PHP 8.2 · autenticazione Sanctum · Docker · Railway          │
│  AuthController  TelemetryController  DeviceController  UserCtrl   │
└──────────────┬─────────────────────────────────┬───────────────────┘
               │ Eloquent ORM                    │ Risposte JSON
               ▼                                 ▼
┌─────────────────────────┐      ┌──────────────────────────────────┐
│  PostgreSQL (Supabase)  │      │          React Dashboard         │
│                         │      │  Vite 7 · Tailwind 4 · Recharts  │
│  users                  │      │  Login / Registrazione           │
│  telemetries            │      │  Card sensori · Grafici timeline │
│  device_settings        │      │  Controllo ventola · Profilo     │
│  personal_access_tokens │      │  Ospitato su Netlify             │
└─────────────────────────┘      └──────────────────────────────────┘
```

---

## Sensori e Dati

| Sensore | Grandezza | Unità | Chiave dashboard |
|---------|-----------|-------|-----------------|
| BME680 | Temperatura | °C | `temperature` |
| BME680 | Umidità relativa | %RH | `humidity` |
| BME680 | Pressione atmosferica | hPa | `air_pressure` |
| BME680 | Resistenza del gas | kΩ | `gas_kohm` |
| BH1750 | Illuminazione ambientale | lux | `light_lux` |
| INMP441 | Rumore ambientale | dB(A) | `noise_db` |

---

## Funzionalità

- 📡 **Telemetria in tempo reale** — l'ESP32 invia i dati ogni 10 secondi tramite HTTPS POST
- 📊 **Grafici storici** — ultime 20 letture visualizzate come serie temporali interattive (Recharts)
- 🌀 **Controllo ventola da remoto** — modalità automatica (soglia di temperatura) o manuale dalla dashboard
- 🔒 **Autenticazione sicura** — Bearer token Laravel Sanctum, password in bcrypt
- 👤 **Profilo utente** — registrazione, login, aggiornamento nome/email
- 🐳 **Pronto per Docker** — setup locale con un solo comando `docker-compose up --build`
- ☁️ **Deploy cloud** — Railway (API) + Supabase (PostgreSQL) + Netlify (Dashboard)
- 🌐 **Bilingue** — documentazione in italiano e inglese

---

## Live

| Servizio | URL |
|----------|-----|
| 🔌 Health Check API | [https://hhero.up.railway.app/api](https://hhero.up.railway.app/api) |
| 🖥️ Dashboard | [https://hohero.netlify.app](https://hohero.netlify.app) |

---

## Struttura del Repository

```
HomeHero/
├── backend/                   Laravel 12 REST API  (Roman)
│   ├── app/
│   │   ├── Http/Controllers/  AuthController · TelemetryController
│   │   │                      DeviceController · UserController
│   │   └── Models/            User · Telemetry · DeviceSettings
│   ├── database/migrations/   9 migration — storico completo dello schema
│   ├── routes/api.php         Definizione di tutte le route API
│   ├── Dockerfile             Immagine container per la produzione
│   ├── docker-compose.yml     Stack di sviluppo locale
│   └── .env.example           Template variabili d'ambiente
│
├── frontend/                  Dashboard React + Vite  (Luka · De Togni)
│   ├── src/api/               Client Axios con interceptor
│   ├── src/componentsDashboard/  Grafici · card sensori · controllo ventola
│   ├── src/pages/             Login · Registrazione · Dashboard
│   └── vite.config.js
│
├── firmware/                  Firmware C++ ESP32  (Shaeek)
│   ├── sketch.cpp             Firmware principale (framework Arduino)
│   ├── config.example.h       Template di configurazione (copiare → config.h)
│   └── libraries.txt          Librerie Arduino richieste
│
└── docs/                      Documentazione tecnica  (Matteo · De Togni)
    ├── eng/                   Documenti in inglese
    │   ├── BACKEND_INFRA_DOC.md       GANTT.md       RACI_Matrix.md
    │   ├── Economic_Analysis.md       Project_Phases_Tuckman.md
    │   ├── COSTRAINTS_RISKMANAGEMENT.md
    │   └── FUTURE_PERSPECTIVES.md
    └── ita/                   Documenti in italiano
        ├── BACKEND_INFRA_DOC_IT.md    GANTT.md       RACI_Matrice.md
        ├── Analisi_Economica.md       Fasi_Progetto_Tuckman.md
        ├── COSTRAINTS_RISKMANAGEMENT_IT.md
        └── FUTURE_PERSPECTIVES_IT.md
```

---

## Avvio Rapido

### Backend (Laravel API)

Installa composer: https://getcomposer.org/download/

```bash
cd backend

# 1. Configura l'ambiente
cp .env.example .env
# Modifica .env: imposta DB_HOST, DB_PASSWORD, APP_KEY, FRONTEND_URL
php artisan key:generate

# 2. Installa le dipendenze e migra il database
composer install
php artisan migrate

# 3. Avvia il server
php artisan serve           # → http://localhost:8000/api
```

**Con Docker (consigliato):**
```bash
cd backend
docker-compose up --build   # → http://localhost:8000/api
```

### Frontend (React + Vite)

Installa node: https://nodejs.org/en/download

```bash
cd frontend

# 1. Configura l'ambiente
cp .env.example .env
# Modifica .env: VITE_API_BASE_URL=http://localhost:8000/api

# 2. Installa ed avvia
npm install
npm run dev                 # → http://localhost:5173
```

### Firmware (ESP32)

Installa Arduino IDE: https://www.arduino.cc/en/software/

```bash
# 1. Vai nella cartella firmware
cd firmware

# 2. Modifica sketch.cpp/.ino: imposta WIFI_SSID, WIFI_PASSWORD, API_BASE_URL, DEVICE_NAME

# 3. Apri sketch.cpp in Arduino IDE
#    Board: ESP32 Dev Module  |  Baud rate: 115200
#    Installa le librerie elencate in libraries.txt

# 4. Carica il firmware sulla scheda
```

---

## Riferimento API

| Metodo | Endpoint | Auth | Descrizione |
|--------|----------|------|-------------|
| `GET` | `/api/` | — | Health check |
| `POST` | `/api/register` | — | Registra utente, restituisce Bearer token |
| `POST` | `/api/login` | — | Login, restituisce Bearer token |
| `POST` | `/api/logout` | Bearer | Revoca tutti i token |
| `GET` | `/api/user` | Bearer | Profilo dell'utente autenticato |
| `PUT` | `/api/user/profile` | Bearer | Aggiorna nome / email |
| `GET` | `/api/telemetry` | Bearer | Ultime 20 letture (dal più vecchio al più recente) |
| `POST` | `/api/device/data` | — | Push dati ESP32; restituisce `fan_desired_state` |
| `GET` | `/api/device/{name}/settings` | Bearer | Impostazioni ventola del dispositivo |
| `PUT` | `/api/device/{name}/fan` | Bearer | Aggiorna modalità o soglia ventola |

> Documentazione API completa: [`docs/ita/BACKEND_INFRA_DOC_IT.md`](docs/ita/BACKEND_INFRA_DOC_IT.md)

---

## Team — S.A.R.R.L.

| Membro | Ruolo Principale |
|--------|-----------------|
| **Roman** | Backend — Laravel API, progettazione database, deploy Railway; Project architect |
| **Luka** | Frontend — dashboard React, Vite, grafici, deploy Netlify; PM |
| **Shaeek** | Firmware — C++ per ESP32, integrazione sensori, hardware |
| **Matteo** | Documentazione |
| **De Togni** | UI/UX, analisi economica |

---

## Licenza

Questo progetto è distribuito con [Licenza MIT](LICENSE).
