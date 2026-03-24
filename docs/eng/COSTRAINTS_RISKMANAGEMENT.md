## 4.3 — Project Constraints (4 pt)

Project constraints define the external and internal boundaries that limit the space of viable technical and organisational decisions. For Home Hero, constraints were analysed across four axes: technological, economic, time, and regulatory.

---

### 4.3.1 Technological Constraints

| # | Constraint | Practical Consequence |
|---|------------|----------------------|
| T1 | **Wi-Fi 2.4 GHz only (ESP32)** | Without network coverage, cloud transmission stops entirely. Adding cellular connectivity (4G/LTE) would require an additional hardware module (e.g., SIM7600) and a monthly data plan. |
| T2 | **Supabase Free Tier: 500 MB storage cap** | The 500 MB limit is a real platform boundary. With a single device at a 10 s/reading interval, the cap would be reached in ~385 days — a threshold distant enough to allow planned, non-emergency management. Feature F06 (Auto-Cleanup Scheduler) turns this limit into an operational advantage, automating nightly cleanup rather than waiting for exhaustion. |
| T3 | **No OTA firmware updates** | Any change to ESP32 behaviour — such as adding the `X-Device-Key` header for feature F05 — requires physical access to the device and re-flashing via USB/serial. |
| T4 | **HTTP polling only, no push channel** | Dashboard commands (e.g., manual fan control) reach the ESP32 only in the HTTP response to its next telemetry POST. Maximum latency equals the transmission interval (default 10 s). Real-time bidirectional communication via MQTT or WebSocket (F15) is deferred to Horizon 3 of the roadmap. |
| T5 | **Fixed technology stack** | The entire backend is written in PHP 8.2 with Laravel 11 and runs as a Docker container on Railway. This means the code is tightly coupled to that language and that infrastructure: changing stack (e.g., migrating to Node.js, Python/FastAPI, or serverless functions like AWS Lambda) would require rewriting the entire server-side logic from scratch. For the current project this is not a problem — the stack is solid and fit for purpose — but it becomes a concrete constraint for any significant future architectural evolution. |
| T6 | **Railway Basic: single-region, no auto-scaling** | The Basic plan runs the container in a single geographic region with no horizontal auto-scaling. Unexpected traffic spikes could degrade performance. |
| T7 | **Frontend structural complexity (React/Vite)** | The frontend consists of a large number of React components and files. The structure may not be immediately navigable for someone approaching the codebase without having followed the full development, increasing onboarding time for new contributors. This does not affect operational functionality, but is a real constraint in terms of maintainability and code readability. |

---

### 4.3.2 Economic Constraints

| # | Constraint | Amount / Impact |
|---|------------|----------------|
| E1 | **Zero external funding (school project)** | The project is entirely self-funded by a single team member. Roman personally covered **all** costs: hardware € 68.50 + cloud € 12.50 for 2.5 months = **€ 81.00 total**. No external financial contribution was received. This is a fundamental fact that the entire group must be fully aware of: no budget was available for premium services, spare hardware, or unforeseen expenses. |
| E2 | **Railway Basic: € 5.00/month** | The only recurring cloud cost. An upgrade to the Team plan (~€ 20/month) would only be needed if guaranteed SLA or significantly higher traffic were required. |
| E3 | **Three core services on free tiers** | Supabase (database), Netlify (frontend CDN), and GitHub (versioning and CI) all operate on free plans with no guaranteed SLA. A unilateral policy change by any of these providers could force an unplanned migration or generate unexpected costs. |
| E4 | **Non-recoverable hardware costs** | The physical components (ESP32 WROVER, BME680, BH1750, INMP441, OLED displays, fan/transistor, wiring) represent a fixed € 68.50 investment. Any component failure would require additional unbudgeted spending. |

---

### 4.3.3 Time Constraints

| # | Constraint | Impact on the Project |
|---|------------|----------------------|
| TM1 | **Fixed presentation deadline: 26/03/2026** | The entire development cycle — from requirements gathering to production deployment — had to be completed within **~11 weeks** (08/01/2026 → 26/03/2026). **This is one of the heaviest constraints of the entire project**: eleven weeks to design, develop, integrate hardware, backend, frontend and firmware, document everything, and prepare the final presentation. |
| TM2 | **Five part-time student contributors** | Each team member works on the project alongside other academic obligations. Total estimated effort is ~260 h, with an asymmetric distribution: **60–80 h each** for the three core technical contributors (Roman / Luka / Shaeek), and **20–30 h each** for the two supporting roles (Matteo / De Togni). Compared to the 160+ monthly hours of a full-time developer, this makes the concentration of work achieved in only 11 weeks all the more evident. |
| TM3 | **MVP-first approach enforced** | The time window mandated strict prioritisation. Security features (F01 email verification, F04 token expiration, F05 device API key) and advanced analytics (F07–F08) were deliberately deferred to the future roadmap, even though they were architecturally planned from the start. |
| TM4 | **Critical hardware ↔ software ↔ frontend dependency** | ESP32 firmware (Shaeek), the Laravel backend (Roman), and the React frontend (Luka / De Togni) were all developed in parallel. A delay in any of the three branches propagates directly to the integration and testing timeline: the dashboard could not be fully developed without stable APIs and real data; the backend could not be validated without working firmware. This triple dependency makes cross-stream coordination the most complex critical point of the entire project. |

---

### 4.3.4 Regulatory Constraints

| # | Regulation | Applicability and Compliance |
|---|------------|-----------------------------|
| N1 | **GDPR (EU Regulation 2016/679)** | The system processes personal data (name, email, bcrypt password hash) of registered users. Compliance ensured by: database hosted in EU-Central (Frankfurt, Germany) — data stays within the EEA; passwords stored exclusively as 12-round bcrypt hashes; no plaintext personal data ever transmitted or logged; `User::$hidden` prevents accidental serialisation of sensitive fields in JSON responses. |
| N2 | **Art. 9 GDPR — Special categories of data** | Temperature, humidity, atmospheric pressure, air quality, and ambient noise measured inside a private home do not qualify as "data concerning health" under Art. 9 GDPR. They are physical environmental measurements, not personal biometric parameters, and do not require explicit enhanced consent. |
| N3 | **NIS2 Directive (EU 2022/2555) — Communication security** | All communication occurs over HTTPS (TLS enforced by Railway). Plain HTTP calls to the API are not possible. This satisfies IT security requirements applicable to digital service providers. |
| N4 | **Radio Equipment Directive — RED (2014/53/EU)** | As an academic prototype for internal use, the ESP32 device does not require CE/RED certification. Should the product be commercialised, RED certification would be mandatory for any device containing a radio module (Wi-Fi, Bluetooth). |
| N5 | **Data breach notification (Art. 33 GDPR)** | As a school project with a limited user base and no commercial purpose, no formal DPO (Data Protection Officer) has been appointed and no 72-hour breach notification procedures have been established. In a commercial context, both would be legally required. |

---

## 4.4 — Risk Management (4 pt)

---

### 4.4.1 Risk Identification

Ten primary risks were identified, spanning hardware, software/cloud, and organisational categories.

| ID | Category | Risk Description |
|----|----------|------------------|
| R01 | Software / Cloud | Supabase storage exhaustion (500 MB free-tier cap) |
| R02 | Software / Cloud | Railway service outage (downtime, prolonged cold starts) |
| R03 | Hardware | Physical failure of the ESP32 or a sensor (BME680, BH1750, INMP441) |
| R04 | Security | Fake data injection via the public route `POST /api/device/data` |
| R05 | Hardware / Network | Loss of Wi-Fi connectivity on the ESP32 |
| R06 | Organisational | Unavailability of one or more team members (illness, academic commitments) |
| R07 | Software / Cloud | Accidental loss of production data (unintentional deletion) |
| R08 | Organisational | Uncontrolled scope expansion (scope creep) leading to timeline overrun |
| R10 | Software / Cloud | Commercial policy change by a free-tier provider (Supabase, Netlify) |

---

### 4.4.2 Impact Analysis

| ID | Impact Level | Detailed Description |
|----|:------------:|---------------------|
| R01 | **High** | The system stops accepting new readings; all data generated past the storage cap is lost until space is freed or the plan is upgraded. |
| R02 | **Medium** | API unreachable; ESP32 cannot persist data to the cloud; dashboard fails to load. Local OLED display remains operational during the downtime. |
| R03 | **High** | No environmental data collection; complete loss of monitoring functionality. Backend and dashboard remain operational but receive no incoming data. |
| R04 | **High** | Falsified data in the database; potentially manipulated fan commands; accelerated storage exhaustion; integrity of the entire system compromised. |
| R05 | **Medium** | Gap in telemetry time-series; no loss of historical data. Local OLED display remains active throughout the Wi-Fi outage. |
| R06 | **Medium** | Slowdown or blockage of the component assigned to the unavailable member; concrete risk of missing the academic deadline. |
| R07 | **High** | Potentially irreversible loss of all historical telemetry data and user accounts. |
| R08 | **Medium** | Partial or delayed delivery; risk of presenting an incomplete or unstable system at the final demo. |
| R10 | **High** | Urgent migration to an alternative provider required; unpredictable costs and timelines; potential service interruption. |

---

### 4.4.3 Probability and Mitigation Strategies

| ID | Probability | Justification | Mitigation Strategy |
|----|:-----------:|---------------|---------------------|
| R01 | **Medium** | At steady state (1 device, 10 s/reading), the cap is reached in ~385 days. With multiple devices or a reduced interval, the deadline shortens proportionally. | Implement **F06 — Auto-Cleanup Scheduler**: Artisan command `telemetry:purge` scheduled nightly at 03:00, automatically deleting rows older than a configurable number of days (default: 90). Monitor monthly storage consumption via the Supabase dashboard. |
| R02 | **Low** | Railway historically records > 99% uptime. Cold starts (container restart after inactivity) are an occasional nuisance, not a real outage. | Document the Railway redeploy procedure (< 5 min). Use local OLED displays as a fallback visualisation during outages. Enable Railway health check email notifications. |
| R03 | **Low** | Electronic components under normal operating conditions have a high MTBF. Risk increases in the presence of voltage spikes or improper physical handling. | Document the wiring schematic and firmware versions in Git to allow rapid component replacement. Keep critical spare parts on hand (BME680 ~€ 10, spare cables). |
| R04 | **Medium** | The POST route is fully public and the backend URL is exposed. Anyone who knows the JSON payload structure can inject arbitrary data. | Implement **F05 — ESP32 Device API Key**: add `api_key_hash` to `device_settings`, create `CheckDeviceKey` middleware, flash ESP32 firmware with the `X-Device-Key` header. Use `hash_equals()` for constant-time comparison to prevent timing attacks. |
| R05 | **Medium** | Wi-Fi stability depends on the home environment (router quality, RF interference, distance from access point). Brief disconnections are normal for IoT devices. | Implement Wi-Fi reconnection logic in the ESP32 firmware with automatic retries and exponential backoff. Display connection status on the OLED screen. |
| R06 | **Medium** | In a student team, competing commitments (other exams, personal obligations, illness) during an 11-week period are likely for at least one member. | Keep the RACI matrix up to date. Use Git to ensure any team member can continue an absent member's work. Weekly check-ins and proactive communication. |
| R07 | **Very Low** | Supabase runs automatic daily backups even on the free plan. A data loss event would require superadmin privileges and a deliberately destructive action. | Verify that Supabase automatic backups are active. Never run `DELETE` or `DROP` statements in production without a prior manual backup. |
| R08 | **High** | Academic projects tend to grow as new ideas emerge. The absence of an external product owner places full scope-control responsibility on the team itself. | Follow the GANTT strictly. Freeze the MVP feature set by week 8 (28/02/2026). Any new feature is evaluated only after the deploy milestone is reached. |
| R10 | **Very Low** | Providers such as Supabase, Netlify, and GitHub have maintained stable free tiers for years. An abrupt change is unlikely in the short term. | Document migration procedures for every service (Supabase → Neon; Netlify → Vercel; Railway → Render/Fly.io). Avoid vendor lock-in by using open standards (PostgreSQL, Docker, HTTPS REST). |

**Risk matrix — Impact × Probability:**

| Probability | Low Impact | Medium Impact | High Impact |
|:------------|:----------:|:-------------:|:-----------:|
| High | — | R08 | — |
| Medium | — | R05, R06 | R01, R04 |
| Low | — | R02 | R03 |
| Very Low | — | — | R07, R10 |

> Cells with High impact and Medium probability (R01, R04) represent the most urgent action priorities.

---

### 4.4.4 Contingency Plans

| ID | Contingency Plan |
|----|------------------|
| R01 | *Storage exhausted:* Immediate upgrade to **Supabase Pro** (€ 25/month, 8 GB storage). Alternatively, free up space with a manual purge: `DELETE FROM telemetries WHERE created_at < NOW() - INTERVAL '30 days'`. |
| R02 | *Railway down:* Redeploy to **Render.com** (free plan available, Docker-supported) in 20–30 minutes. Update the `VITE_API_URL` environment variable on Netlify to point to the new URL. |
| R03 | *Component failed:* Purchase replacement on Amazon (1–2 day delivery: ESP32 ~€ 20, BME680 ~€ 10). Backend, database, and dashboard remain fully operational during hardware downtime. |
| R04 | *Falsified data detected:* (1) Implement API key (F05) immediately. (2) Identify and delete malicious rows: `DELETE FROM telemetries WHERE device_name = '<attacker_name>'`. (3) Change the `device_name` in ESP32 firmware to invalidate previously known payloads. |
| R05 | *Extended Wi-Fi outage:* Restart the router. If the problem persists, move the ESP32 closer to the access point. Local OLED readings remain available throughout the downtime. |
| R06 | *Team member unavailable:* Redistribute critical tasks to the member with the closest skill set. Reduce scope by dropping features that have not yet been started. Document decisions in the README. |
| R07 | *Data loss:* Restore from the automatic Supabase backup (accessible via the web dashboard). If no backup is available, the database structure is fully reproducible via `php artisan migrate`; only historical telemetry records would be lost. |
| R08 | *Timeline at risk:* Freeze the feature list. Present the system with only the completed and stable features. Formally defer missing features to the H1/H2 roadmap during the presentation, communicating the forward plan. |
| R10 | *Provider changes policy:* Execute the migration plan to the documented alternative provider (see R10 in §4.4.3). Portability is guaranteed by the use of standard PostgreSQL and Docker. Estimated migration time: 2–4 hours. |

---