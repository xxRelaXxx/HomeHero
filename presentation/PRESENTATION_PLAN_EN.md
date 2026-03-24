# Presentation Plan — HomeHero
## Smart Environmental Monitoring Station with IoT Dashboard

> **Project:** Smart Weather Station / HomeHero  
> **Team:** S.A.R.R.L. — Roman · Luka · Shaeek · Matteo · De Togni  
> **Date:** March 26, 2026 · **Total duration:** 50 minutes  
> **Speaker reference document — to be used in preparation**

---

## HONEST OPINION ON THE PROJECT

### Genuine strengths

- **End-to-end IoT system in real production** — not a localhost prototype. Backend on Railway, database on Supabase, frontend on Netlify: three separate cloud providers, all running.
- **Real physical hardware** — 6 sensors, 2 OLED displays, relay for a physical fan, hand-wired on breadboard. Not a simulation.
- **Professional architecture** — MVC Laravel, Eloquent ORM, Sanctum Bearer auth, Axios interceptors, Docker containers. Choices found in commercial production systems.
- **Quality firmware** — dB SPL calculation with EMA smoothing, 32-bit I²S microphone, NTP clock, dual I²C buses. Beyond a "blink an LED" level.
- **Excellent documentation** — bilingual, detailed GANTT (8 milestones), RACI matrix, real economic analysis with break-even.
- **Security considered** — bcrypt, mandatory HTTPS, CORS scoped to Netlify domain, credentials never in the repository (`config.h` pattern).

### Honest limitations (don't hide — know how to explain)

- **Almost no automated tests** — the `tests/` directory exists but is nearly empty. Testing was manual. *Ready answer: acknowledged. In 11 weeks part-time with 5 students we prioritised functionality and deploy. CI/CD with GitHub Actions is in the roadmap as feature F12.*
- **Dashboard doesn't auto-refresh** — no WebSocket, no polling. User must reload page. *Ready answer: deliberate architectural limitation that we leverage: fan control arrives in the HTTP response to the ESP32 POST — zero extra endpoint. WebSocket is in H3 roadmap (F15).*
- **Fan control latency = max 10 seconds** — it's the ESP32's send cycle. Not a bug. *Ready answer: by-design limit. The dashboard sends the command; the ESP32 receives it on the next transmission. For an environmental system (not medical), 10 seconds is acceptable.*
- **Email verification and password reset missing** — deliberately deferred. *Ready answer: documented in roadmap (F01, F02), architecturally planned, cut to deliver a working MVP in 11 weeks.*

### Overall rating: **8/10**

For a school project developed in 11 weeks part-time by 5 students, this is a solid result. The system is real, deployed, functional, and documented. Existing gaps are acknowledged, documented, and have a resolution plan. This demonstrates engineering maturity.

**Core message for the professor:** this is not "a website with a database". It is a complete IoT system with physical hardware, embedded C++ firmware, a production REST API, a cloud database, and a web dashboard — all integrated and running simultaneously.

---

## WHY SOME THINGS ARE NOT IN THE SLIDES

| Technical content | Why NOT in slides | How it is presented instead |
|---|---|---|
| Detailed source code | Unreadable on projector | Live walkthrough in VS Code — Phase 5 |
| Full DB schema with columns | Too dense — already in `BACKEND_INFRA_DOC.md` | Document opened during walkthrough — Phase 5 |
| All API endpoints with JSON payloads | In the written docs | Live browser or `BACKEND_INFRA_DOC.md` — Phase 5 |
| dB SPL calculation formula | Too specialized | Verbal explanation by Shaeek in Phase 5 |
| Docker deploy process step-by-step | Operational detail, not vision | Mentioned verbally in architecture slide |
| GDPR and regulatory compliance | Document-depth — already in `COSTRAINTS_RISKMANAGEMENT.md` | Available as backup if professor asks |
| All 9 DB migrations detail | Too granular | Roman explains schema evolution in 2 sentences |
| Every React component | Too much detail | Luka shows the structure from the file explorer in Phase 5 |

---

## 50-MINUTE STRUCTURE

| Phase | Content | Duration | Main speakers |
|:----:|-----------|:------:|---------------------|
| **0** | Opening and team introduction | 3 min | Matteo → all |
| **1** | Technical slides (hardware, backend, frontend, comms) | 13 min | Shaeek, Roman, Luka, De Togni |
| **2** | PM slides (RACI, GANTT, Tuckman, economics) | 7 min | De Togni, Matteo |
| **3** | Closing slides (commercial comparison, constraints, future) | 4 min | Matteo, Roman |
| **4** | Live demo — dashboard + fan control | 10 min | Luka + Roman + Shaeek |
| **5** | Code walkthrough + documentation | 10 min | Roman, Shaeek, Luka, De Togni |
| **Buffer** | Questions, time recovery, closing | 3 min | All |
| **TOTAL** | | **50 min** | |

---

## PHASE 0 — OPENING (3 minutes)

### Slide 0 — COVER
**Title:** HomeHero — Smart Environmental Monitoring Station  
**Visual content:**
- HomeHero logo centred (`frontend/src/styles/img/HomeHero.svg`)
- Subtitle: *"Smart Weather Station with IoT Dashboard"*
- Team names on single line: **Roman · Luka · Shaeek · Matteo · De Togni**
- Date: March 26, 2026
- (Optional) Screenshot of live dashboard as blurred background — high visual impact

**Who speaks:** Matteo opens with 1-2 sentences introducing the project, passes to De Togni.  
**Timing:** 30 seconds

---

## PHASE 1 — TECHNICAL SLIDES (13 minutes)

### Slide 1 — WHAT IS HOMEHERO + THE TEAM
**Title:** Who we are and what we built

**Content — two columns:**

Left column – **THE S.A.R.R.L. TEAM:**
| Member | Role |
|--------|-------|
| Roman | Backend Lead & Architect |
| Luka | Frontend Lead |
| Shaeek | Hardware & Firmware |
| Matteo | QA & Documentation |
| De Togni | UI/UX & Analysis |

Right column – **HOMEHERO IN ONE SENTENCE:**  
> *"A physical ESP32 reads 6 environmental parameters every 10 seconds, sends them to a REST API on the cloud, saves them to PostgreSQL, and displays them on a React dashboard accessible from any browser."*

**Key concept to convey:** every member worked on a separate component and everything integrates into one system.  
**Who speaks:** De Togni introduces the slide → each member says their name and role in 1 sentence (order: Roman, Luka, Shaeek, Matteo, De Togni).  
**Timing:** 1 minute 30 seconds  
**Assets:** simple table — NO photos, NO images

---

### Slide 2 — ARCHITECTURE & TECH STACK
**Title:** System Architecture — How the components communicate

**Content — vertical diagram with arrows:**
```
┌──────────────────────────────────────┐
│   ESP32 WROVER + 6 sensors           │  ← Shaeek
│   2 OLED · fan relay · firmware      │
└────────────────┬─────────────────────┘
                 │  HTTPS POST every 10 s
                 │  (response with fan_desired_state)
                 ▼
┌──────────────────────────────────────┐
│   Laravel 12 REST API                │  ← Roman
│   PHP 8.2 · Sanctum · Docker         │
│   HOST: Railway (hhero.up.railway.app)│
└───────┬──────────────────────────────┘
        │  Eloquent ORM
        ▼
┌──────────────────────────────────────┐
│   PostgreSQL on Supabase             │  ← Roman
│   3 tables: users, telemetries,      │
│   device_settings                    │
└──────────────────────────────────────┘
        ↑  Axios (Bearer token)
┌──────────────────────────────────────┐
│   React 19 + Vite 7 Dashboard        │  ← Luka + De Togni
│   TailwindCSS 4 · Recharts · Netlify │
└──────────────────────────────────────┘
```

**Mandatory verbal points:**
- The ESP32 is the HTTP **client**, not the server — it speaks first
- Fan control has no dedicated endpoint: it arrives as the JSON response to the ESP32's POST
- Three separate clouds: Railway (€5/month), Supabase (free), Netlify (free)
- Docker ensures the backend behaves identically locally and in production

**Who speaks:** Roman  
**Timing:** 2 minutes 30 seconds  
**Assets:** ASCII diagram (copy above) or SVG/PNG created by team. `firmware/ESP32_HomeHero_scheme.svg` can be shown as support.

---

### Slide 3 — HARDWARE & FIRMWARE
**Title:** Hardware & Firmware — The physical soul of the project *(Shaeek)*

**Content — component table + image:**

| Component | Function | Interface |
|------------|---------|-------------|
| ESP32 WROVER 240MHz | Brain: WiFi, computation, transmission | — |
| BME680 | Temperature · Humidity · Pressure · Gas | I²C bus 1 |
| BH1750 | Ambient light in lux | I²C bus 2 |
| INMP441 | Microphone → dB SPL calculation | I²S |
| SH1107 128×128 OLED | Screen 1: all sensors + fan state in real time | I²C bus 1 |
| SSD1306 128×64 OLED | Screen 2: NTP clock in real time | I²C bus 2 |
| Relay GPIO 25 | Actuator: controls the physical fan | GPIO |

**Image:** `firmware/HomeHero_scheme.jpeg` or `firmware/ESP32_HomeHero_scheme.svg` — MANDATORY. Makes the wiring complexity immediately clear.  
**Add:** photo of the physical assembled device if available — this is the most impactful moment in the presentation.

**Verbal points:**
- Two separate I²C buses because BME680 and BH1750 share the same I²C address (0x23): impossible on a single bus
- The INMP441 microphone uses I²S (not I²C) because it streams 32-bit audio samples
- The noise (dB SPL) calculation runs on the ESP32: sample RMS → dBFS → +110 calibration offset → EMA smoothing. All in C++ firmware.

**Who speaks:** Shaeek  
**Timing:** 2 minutes  
**Required assets:** `firmware/HomeHero_scheme.jpeg` — large, readable image

---

### Slide 4 — BACKEND
**Title:** Backend — Laravel API in production *(Roman)*

**Content:**

```
MAIN ENDPOINTS
───────────────────────────────────────────────────────
POST /api/device/data      ← ESP32 (no auth — it is the device)
GET  /api/telemetry        ← Dashboard  [Bearer token]
PUT  /api/device/{n}/fan   ← Dashboard  [Bearer token]
POST /api/login            ← Any client
```

**Application structure:**
- **4 Controllers:** AuthController · TelemetryController · DeviceController · UserController
- **3 Models:** User · Telemetry · DeviceSettings
- **Auth:** Laravel Sanctum — SHA-256 token in `personal_access_tokens` table
- **DB:** PostgreSQL on Supabase — 9 evolutionary migrations
- **Deploy:** Docker container → Railway, started via `Procfile`

**What to emphasise verbally:**
- `DeviceSettings::firstOrCreate()` — a new ESP32 auto-registers on its first send, no manual setup
- The response to `/device/data` contains `fan_desired_state` — zero extra polling, zero separate endpoint
- Sanctum uses **stateless** tokens: every request carries the token, no server-side session

**Who speaks:** Roman  
**Timing:** 2 minutes 30 seconds  
**Assets:** endpoint table — NO code screenshot on slide

---

### Slide 5 — FRONTEND
**Title:** Frontend — The React Dashboard *(Luka · De Togni)*

**Content:**

**Stack:** React 19 · Vite 7 · TailwindCSS 4 · Recharts 3 · Framer Motion · Axios · Lucide React

**Dashboard features:**
- Login / Register with navigation guards (`RequireAuth`)
- 6 **sensor cards** with current value + unit
- 6 **time-series charts** (last 20 readings, Recharts)
- Fan control: Auto/Manual toggle + configurable temperature threshold
- Historical data CSV export
- Editable user profile (name, email)
- Deploy: Netlify (global CDN, free)

**⚠️ MANDATORY:** Large screenshot of the dashboard with real data. Without an image, this slide communicates nothing.

**Who speaks:** Luka (stack + component architecture) → De Togni (UI/UX and design decisions)  
**Timing:** 2 minutes  
**Required assets:** Screenshot of the live dashboard (full page, real data visible) — MUST PREPARE BEFORE

---

### Slide 6 — ESP32 ↔ BACKEND COMMUNICATION
**Title:** How do the device and the server communicate?

**Content — two JSON blocks side by side:**

```json
// ESP32 → POST /api/device/data (every 10 s)
{
  "device_name": "esp32_living_room",
  "temperature": 22.5,
  "humidity": 58.3,
  "air_pressure": 1013.2,
  "gas_kohm": 45.7,
  "light_lux": 320.0,
  "noise_db": 48.2,
  "fan_state": false
}

// Backend → Immediate response
{
  "fan_desired_state": true,
  "message": "Telemetry stored"
}
```

**Arrow diagram:** ESP32 → POST → API → saves to DB + responds with fan command → ESP32 applies fan state

**Verbal points:**
- The backend responds in milliseconds — the ESP32 doesn't wait. Total latency: network + PHP ≈ 200-400ms
- Fan control latency is caused by the ESP32 interval (10s), not the backend
- This pattern is called "Command-in-Response" — avoids a second `/device/command` endpoint

**Who speaks:** Roman (protocol) + Shaeek (firmware side, 1 sentence on how JSON is read)  
**Timing:** 1 minute 30 seconds  
**Assets:** two formatted JSON blocks — text only, no additional images

---

## PHASE 2 — PM AND DOCUMENTATION SLIDES (7 minutes)

### Slide 7 — RACI MATRIX
**Title:** RACI Matrix — Who did what, with clear accountability

**Content:** Reduced version of the RACI (top 12 most representative activities):

| # | Activity | Roman | Luka | De Togni | Matteo | Shaeek |
|:-:|----------|:-----:|:----:|:--------:|:------:|:------:|
| 1 | Idea and requirements | **A/R** | R | C | C | C |
| 2 | Architecture | **A/R** | C | I | I | C |
| 3 | Laravel backend | **A/R** | I | I | I | I |
| 4 | Database | **A/R** | I | I | I | I |
| 5 | ESP32 firmware | C | I | I | I | **A/R** |
| 6 | Hardware | I | I | I | I | **A/R** |
| 7 | React frontend | I | **A/R** | C | I | I |
| 8 | UI/UX design | C | C | **A/R** | I | I |
| 9 | Deploy | **A/R** | R | I | I | I |
| 10 | QA / Final testing | C | C | C | **A/R** | C |
| 11 | Documentation | C | I | C | **A/R** | I |
| 12 | GANTT / RACI / Analysis | I | I | **A/R** | I | I |

**Mandatory visual note:** the column with most **A**s for a member should be highlighted in a different colour.

**What to emphasise:** R = who executes, A = who is accountable for the outcome (max 1 per row). Roman is the sole A for all backend and deploy — say this explicitly.

**Who speaks:** De Togni  
**Timing:** 1 minute  
**Assets:** simple table — full RACI (19 activities) available as separate document in `docs/eng/RACI_Matrix.md`

---

### Slide 8 — GANTT CHART
**Title:** GANTT — From team formation to final presentation

**Content:** PNG/SVG image of the GANTT exported from mermaid.live

**⚠️ CRITICAL ASSET:** The GANTT must be exported as an image from `docs/eng/GANTT.md`. Open https://mermaid.live, paste the mermaid block, export as PNG (1920×1080 or higher). Save as `presentation/assets/gantt_en.png`.

**Verbal points to emphasise:**
- Project start: **December 2, 2025** (team formation)
- 8 main milestones — not just "presentation"
- Backend + Firmware + Frontend developed **in parallel** (→ coordination was critical)
- Deploy completed: **March 14, 2026** — 12 days before the presentation
- Everything is `:done` — all activities completed

**Who speaks:** De Togni  
**Timing:** 1 minute  
**Required assets:** `presentation/assets/gantt_en.png` — MANDATORY, create from mermaid.live

---

### Slide 9 — TEAM EVOLUTION — TUCKMAN
**Title:** How the team grew — Tuckman Model

**Content — horizontal timeline:**

```
🔵 FORMING           ⚡ STORMING          🤝 NORMING            🚀 PERFORMING         🎯 ADJOURNING
Dec 2025 – Jan 2026  Jan – Feb 2026       Feb 2026              Feb – Mar 2026         Mar 2026
────────────────────────────────────────────────────────────────────────────────────
Team formed          First tensions       Shared tech stack     Maximum productivity   Closure
Roles assigned       Work distribution    Git workflow          System deployed        Presentation
Idea defined
```

**One sentence per phase:**
- **Forming:** we met, chose the name and assigned roles
- **Storming:** tensions over workload distribution — normal in every team
- **Norming:** we found a common rhythm — stack approved, Git structured
- **Performing:** all components developed and integrated in parallel
- **Adjourning:** deploy done, documentation complete, today we present

**Who speaks:** Matteo (Forming/Storming) → De Togni (Norming/Performing/Adjourning)  
**Timing:** 1 minute 30 seconds  
**Assets:** simple horizontal timeline — create as image or coloured table

---

### Slide 10 — ECONOMIC ANALYSIS
**Title:** Economic Analysis — What does HomeHero really cost?

**Content — summary table:**

| Item | Amount |
|------|:-------:|
| Hardware (physical components) | **€ 68.50** |
| Cloud and software (2.5 months) | **€ 12.50** |
| **Total material cost** | **€ 81.00** |
| + Human labour (students ~€19/h estimate) | € 2,830.00 |
| + Human labour (professionals ~€47/h estimate) | € 7,425.00 |

**Break-even (commercialisation hypothesis):**
- Hypothetical retail price: **€89/unit**
- Units needed for break-even (year 1): **~140 units**
- Variable cost per unit: ~€68.50 hardware + ~€8.50 shipping = €77 → margin €12/unit

**Critical statement to say aloud:** *"All hardware costs — €81 — were personally covered by Roman. The group received zero external funding."*

**Who speaks:** De Togni  
**Timing:** 1 minute 30 seconds  
**Assets:** table + optional break-even chart (from `docs/eng/Economic_Analysis.md`)

---

## PHASE 3 — CLOSING SLIDES (4 minutes)

### Slide 11 — COMMERCIAL COMPARISON
**Title:** HomeHero vs Commercial Products

**Content:**

| Feature | HomeHero | Netatmo Weather | Xiaomi Mi Home | Arduino DIY |
|---------|:--------:|:---------------:|:--------------:|:-----------:|
| Price | **€81** | €150+ | €120+ | €40 (no cloud) |
| Environmental sensors | **6** | 3-4 | 2-3 | 1-2 |
| Custom web dashboard | ✅ | ✅ (app only) | ✅ (app only) | ❌ |
| Open source / custom | ✅ | ❌ | ❌ | ✅ |
| Self-hosted backend | ✅ | ❌ | ❌ | ❌ |
| Actuator control | ✅ (fan) | ❌ | ✅ (partial) | Limited |
| dB SPL noise calculation | ✅ | ❌ | ❌ | External module |
| Cloud vendor lock-in | None | Yes | Yes | N/A |

**Message:** HomeHero costs less, does more, and is entirely ours.

**Who speaks:** Matteo  
**Timing:** 1 minute  
**Assets:** comparison table — create for slides

---

### Slide 12 — CONSTRAINTS AND PROJECT STATUS
**Title:** Constraints, managed risks, and final status

**Content — two columns:**

Left column — **Main constraints:**
- ⏱️ 11 weeks of part-time development
- 💶 €81 entirely self-funded by Roman  
- 📶 WiFi 2.4GHz only (no 4G/LTE)
- 🔧 No OTA firmware updates

Right column — **Final deliverable status:**
| Component | Status |
|------------|:-----:|
| ESP32 Firmware | ✅ |
| Laravel API | ✅ |
| PostgreSQL | ✅ |
| React Dashboard | ✅ |
| Cloud Deploy | ✅ |
| Documentation | ✅ |
| Automated testing | ⚠️ |

**Who speaks:** Roman  
**Timing:** 1 minute  
**Assets:** none — two columns of text

---

### Slide 13 — LESSONS LEARNED + FUTURE PERSPECTIVES
**Title:** What we learned — and what comes after HomeHero v1.0

**Content:**

**Team lessons (1 per member):**
- **Roman:** "Separating backend and frontend from day 1 prevented every integration problem"
- **Luka:** "React 19 + Vite 7 + Tailwind 4 is productive but requires knowing CSS fundamentals first"
- **Shaeek:** "With multiple I²C devices, separate buses aren't optional — they're necessary"
- **Matteo:** "Documenting during development, not after, is the difference between a deliverable and chaos"
- **De Togni:** "The real GANTT always diverges from the planned one — and that's normal in project management"

**Roadmap (3 horizons):**
- **H1 (short term):** Email verification · Token expiration · ESP32 API key
- **H2 (medium):** Multi-device · CI/CD pipeline · Role-based access
- **H3 (long term):** Mobile app · MQTT real-time · Custom PCB

**Who speaks:** all (1 sentence each on "lesson") → Roman closes with roadmap  
**Timing:** 1 minute 30 seconds  
**Assets:** none

---

### Slide 14 — FINAL SLIDE
**Title:** Thank you — HomeHero is live

**Content:**
- API URL: `https://hhero.up.railway.app/api`
- Dashboard URL: *(insert real Netlify URL)*
- Repository: `github.com/xxRelaXxx/HomeHero`
- Documentation: `docs/eng/` · `docs/ita/`
- Large centred logo
- "Questions?"

**Who speaks:** Matteo closes  
**Timing:** 30 seconds  
**Assets:** HomeHero logo + live URLs

---

## PHASE 4 — LIVE DEMO (10 minutes)

> **Required setup BEFORE:** browser open on dashboard, VS Code open on project, ESP32 connected and transmitting, serial monitor active.

### Demo 4.1 — Live dashboard (3 minutes) — *Luka*

**What to show:**
1. Open dashboard in browser: **login screen** (explain `RequireAuth` guard in 1 sentence)
2. **Log in** with real credentials — show the Bearer token appearing in localStorage (DevTools → Application → Storage)
3. Arrive at the **dashboard** — show 6 sensor cards with real-time values
4. Show the **Recharts charts** (last 20 data points)
5. Open the **fan control panel** — explain Auto mode (temperature threshold) vs Manual

**What to say:** "Every value you see here was sent by that physical device on the table. It is real data."

---

### Demo 4.2 — Live fan control (3 minutes) — *Roman + Shaeek*

**What to show:**
1. From the dashboard UI: switch fan to **manual ON mode**
2. Wait at most 10 seconds — in the ESP32 serial monitor you'll see `fan_desired_state: true` → relay clicks
3. Explain the flow: **dashboard → PUT /api/device/{name}/fan → DB updated → next ESP32 POST → JSON response → relay**
4. Show the **serial monitor** (Arduino IDE / PlatformIO) with ESP32 logs: sensor values + fan state
5. Switch back to **automatic mode** with temperature threshold

**What Shaeek says:** "What you see on the OLED display is the same data arriving at the server."

---

### Demo 4.3 — API health check (2 minutes) — *Roman*

**What to show:**
1. Open browser: `https://hhero.up.railway.app/api` — JSON response `{"status": "ok"}`
2. Open **DevTools → Network** on the dashboard and show the `GET /api/telemetry` call with Bearer token in the Authorization header
3. Optional: open `GET /api/device/esp32_living_room/settings` in the browser after adding the token (Postman or browser extension)

**What to say:** "The backend is live in production on Railway in Frankfurt. Everything on the dashboard passes through this endpoint every time the page loads."

---

### Demo 4.4 — Physical ESP32 displays (2 minutes) — *Shaeek*

**What to show:**
1. The **SH1107 display** showing temperature, humidity, pressure, gas, light, noise dB, and fan state
2. The **SSD1306 display** showing the NTP-synchronised real-time clock
3. Breathe on the BME680 sensor or cover the BH1750 with your hand — values change on the display in real time and after 10 seconds update on the dashboard
4. Show the relay clicking physically (audible click) when fan state is toggled from the dashboard

---

## PHASE 5 — CODE WALKTHROUGH + DOCUMENTATION (10 minutes)

> **Tool open:** VS Code with `HomeHero_fin/` repository

### Walkthrough 5.1 — ESP32 C++ firmware (3 minutes) — *Shaeek*

**File:** `firmware/sketch.cpp`

**What to show in order:**
1. The `#include "config.h"` line → explain the security pattern: credentials are never in the repository
2. The `computeNoiseDbFromI2S()` function → 1-minute explanation: 32-bit I²S samples → right-shift 8 → RMS → dBFS → +110 offset → EMA smoothing
3. The main loop: read sensors → update displays → every 10s → build JSON → POST to API → read response → apply fan state

**What NOT to show:** I²C and I²S initialisation code (too technical and long for the time available).

---

### Walkthrough 5.2 — Laravel backend (4 minutes) — *Roman*

**File 1:** `backend/routes/api.php` — show the route definitions (30 seconds, understand structure)

**File 2:** `backend/app/Http/Controllers/TelemetryController.php`
- `store()` method → Request validation → `Model::create()` → response with `fan_desired_state`
- Show how `DeviceSettings::firstOrCreate()` auto-registers the device

**File 3:** `backend/app/Http/Controllers/DeviceController.php`
- `setFan()` method → UPSERT with fan settings

**File 4:** `backend/database/migrations/` — show the list of 9 files, explain each migration is a "commit" of the schema. Don't open any file.

**What to say:** "Each migration is a step in the database evolution. This let us add sensors (gas, light, noise) weeks after creating the original table — without losing any data."

---

### Walkthrough 5.3 — React frontend + documentation (3 minutes) — *Luka + De Togni*

**Luka (2 min) — File:** `frontend/src/api/api.js`
- Show the Request interceptor: every call automatically receives the Bearer token from localStorage
- Show the Response interceptor: if backend responds 401, clears token and redirects to login
- Open `frontend/src/App.jsx`: show `RequireAuth` and `RedirectIfLoggedIn` — the guard is in the router, not in individual components

**De Togni (1 min) — Documentation:**
- Quickly open `docs/eng/BACKEND_INFRA_DOC.md` — show the table of contents (8 sections, grading criteria covered: 2.1 DB, 2.2 Backend, 2.3 Architecture, 4.3 Constraints, 4.4 Risks)
- Open `docs/eng/GANTT.md` and `docs/eng/RACI_Matrix.md` — show they exist as separate documents for follow-up
- Say: "All documents are available in the repository in bilingual English/Italian format."

---

## BUFFER — QUESTIONS (3 minutes)

### Ready answers to probable professor questions

| Probable question | Ready answer |
|---|---|
| "Why no automated tests?" | "We acknowledge the gap. With 11 weeks and 5 part-time students, we prioritised functionality and deploy. Automated tests are in the roadmap as feature F12 (CI/CD with GitHub Actions)." |
| "Why does the fan respond after 10 seconds?" | "By-design limit documented in our constraints analysis. The ESP32 has no HTTP server — it is a client. The command travels in the response to the next POST. For an environmental system (not medical) 10 seconds is acceptable. MQTT in H3 roadmap would resolve the latency." |
| "Why no email verification?" | "Deliberately deferred (feature F01 in roadmap). In 11 weeks with a single-feature MVP, we chose to deliver a working deployed system rather than an incomplete system with email verification." |
| "Who paid for the project?" | "Roman personally covered all costs — €81 in hardware and cloud. No school funding was available." |
| "How does the security work?" | "Mandatory HTTPS on Railway. Sanctum Bearer token with SHA-256 hash. bcrypt with 12 rounds for passwords. CORS configured to accept only requests from the Netlify domain. Credentials never in the repository via the config.h pattern." |
| "Can it be used from a phone?" | "The dashboard is a responsive web app — it works from a mobile browser. A native app is in H3 of the roadmap (F16)." |

---

## ASSETS TO PREPARE BEFORE THE PRESENTATION

> Save all assets in `presentation/assets/`

| Asset | How to get it | Priority |
|-------|----------------|:--------:|
| Dashboard screenshot (real data) | Screenshot from browser on live dashboard | **CRITICAL** |
| GANTT PNG (high resolution) | mermaid.live → paste `docs/eng/GANTT.md` → Export PNG | **CRITICAL** |
| Photo of assembled ESP32 device | Phone photo of physical device on the table | **HIGH** |
| `firmware/HomeHero_scheme.jpeg` | Already in the repo | ✅ Ready |
| `firmware/ESP32_HomeHero_scheme.svg` | Already in the repo | ✅ Ready |
| `frontend/src/styles/img/HomeHero.svg` | Already in the repo | ✅ Ready |
| Login screen screenshot | Screenshot from browser on login page | MEDIUM |
| ESP32 serial monitor screenshot | Screenshot during active data transmission | MEDIUM |

---

## FINAL TIME BREAKDOWN PER SPEAKER

| Member | Slides / Sections | Total minutes |
|--------|---------------------|:-------------:|
| **Matteo** | Opening (Phase 0) · Slide 1 (team intro) · Slide 9 (Tuckman Forming/Storming) · Slide 11 (commercial) · Final closing | ~8 min |
| **Roman** | Slide 2 (architecture) · Slide 4 (backend) · Slide 6 (comms) · Slide 12 (constraints) · Walkthrough 5.2 · Demo 4.3 | ~13 min |
| **Shaeek** | Slide 3 (hardware) · Demo 4.2 (fan) · Demo 4.4 (displays) · Walkthrough 5.1 | ~8 min |
| **Luka** | Slide 5 (frontend) · Demo 4.1 (dashboard) · Walkthrough 5.3 (code) | ~8 min |
| **De Togni** | Slide 1 (presenter) · Slide 7 (RACI) · Slide 8 (GANTT) · Slide 9 (Tuckman Norming+) · Slide 10 (economics) · Slide 13 (lessons) · Walkthrough 5.3 (docs) | ~9 min |
| **All** | 1 sentence on lesson learned (Slide 13) · 1 sentence on role (Slide 1) · Q&A buffer | ~4 min |
| **TOTAL** | | **~50 min** |

---

## PRACTICAL TIPS FOR PRESENTATION DAY

1. **Do ONE full run-through** with a stopwatch — never go under 45 min, never exceed 52.
2. **Roman owns ALL code navigation** — never touch the presenter's PC while Roman isn't in front of it. Avoids interruptions and wrong clicks.
3. **Shaeek keeps the ESP32 on the table** with USB cable connected to the PC open on the serial monitor. The hardware is the highest visual impact point of the whole presentation.
4. **Luka starts the slideshow** and advances slides during Phase 1. During the demo, hands the mouse to Roman.
5. **Don't read from the slides** — speak in your own words. Slides are visual reminders, not the presentation script.
6. **If WiFi drops during demo:** Roman has a dashboard screenshot as backup. Say: "Let us show you what it looks like with real data" and proceed with the screenshot.
7. **Slide 14 (final) stays on screen** during questions — professor sees the live URL and the repository.

---

*Presentation plan prepared by GitHub Copilot — HomeHero project, S.A.R.R.L. — March 2026*  
*Italian version available: `presentation/PRESENTATION_PLAN_IT.md`*
