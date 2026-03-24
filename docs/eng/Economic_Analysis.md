> **📖 To view this file correctly:** open **https://markdownlivepreview.com** and paste the content.

---

# Economic Analysis — Home Hero Project

> **Document:** Final Deliverable — Economic & Commercial Analysis
> **Deliverable author:** De Togni Andrea
> **Hardware cost data provided by:** Roman (sole purchaser of all components)
> **Last updated:** March 2026

---

## 1. Executive Summary

| Item | Amount |
|------|:------:|
| Hardware costs (physical components) | € 68.50 |
| Cloud and software costs (2.5 months) | € 12.50 |
| **Total material cost** | **€ 81.00** |
| + Human labour — Mode A (students) | € 2,830.00 |
| **Total project cost — Mode A** | **€ 2,911.00** |
| + Human labour — Mode B (professionals) | € 7,425.00 |
| **Total project cost — Mode B** | **€ 7,506.00** |

---

## 2. Hardware Costs

All components were purchased from **Amazon / AliExpress** by Roman.
Prices are indicative at time of purchase, without discounts applied.

| # | Component | Role in the system | Price |
|:-:|-----------|-------------------|:-----:|
| 1 | **ESP32 WROVER DevKit** | Main microcontroller: dual-core 240 MHz CPU, integrated WiFi, 4 MB PSRAM | € 20.00 |
| 2 | **BME680** | Environmental sensor: temperature (°C), humidity (%), pressure (hPa), air quality (kΩ) — I²C | € 10.00 |
| 3 | **BH1750** | Ambient light sensor: lux — I²C interface | € 4.00 |
| 4 | **INMP441** | Digital I²S microphone: 32-bit samples → RMS → dB SPL calculation | € 4.00 |
| 5 | **SH1107 128×128 OLED display** | Screen 1: shows all sensor values + fan status in real time | € 10.00 |
| 6 | **SSD1306 128×64 OLED display** | Screen 2: NTP clock — real-time date and time | € 4.00 |
| 7 | **Fan + ULN2803A transistor** | Physical actuator: ambient fan controlled via GPIO (pin 25) | € 4.00 |
| 8 | **Wires, breadboard, resistors** | Connections, prototyping, power routing | € 12.50 |
| | **TOTAL HARDWARE** | | **€ 68.50** |

---

## 3. Software and Cloud Service Costs

Project period: **January 8 → March 26, 2026** ≈ 2.5 months

| Service | Function | Plan | Monthly cost | Period total |
|---------|----------|:----:|:------------:|:------------:|
| **Railway** | Laravel backend hosting (server + PHP runtime) | Basic | € 5.00 | € 12.50 |
| **Supabase** | Cloud PostgreSQL database | Free | € 0.00 | € 0.00 |
| **Netlify** | React frontend hosting (global CDN) | Free | € 0.00 | € 0.00 |
| **GitHub** | Versioning, repository, code review | Free | € 0.00 | € 0.00 |
| **Custom domain** | Not used (using netlify.app subdomain) | — | € 0.00 | € 0.00 |
| | **TOTAL CLOUD** | | | **€ 12.50** |

> **Note on Supabase Free:** includes 500 MB storage, 2 shared CPU cores, and 50,000 active rows — more than sufficient for telemetry data sent every 10 seconds.
>
> **Note on Netlify Free:** includes unlimited CDN bandwidth for static sites and automatic GitHub-triggered deployments — zero cost for the entire frontend lifecycle.

---

## 4. Human Labour Costs

### Hours invested

| Member | Role | Estimated hours* |
|--------|------|:----------------:|
| **Roman** | Architect & Backend (PM / SEO / Back-end Lead) | 70 h |
| **Luka** | Frontend Lead (PM / Front-end Lead) | 70 h |
| **Shaeek** | Hardware & Firmware (Embedded Developer) | 70 h |
| **Matteo** | QA, Documentation & Presentation | 25 h |
| **De Togni** | UI/UX, Analysis, GANTT, RACI (Designer / PM) | 25 h |
| **TOTAL** | | **~260 h** |

*\* Includes both actual work and time spent learning tools and technologies. Distribution is asymmetric: the three core technical developers (Roman, Luka, Shaeek) contributed 60–80 h each; the two supporting roles (Matteo, De Togni) 20–30 h each.*

---

### 📊 MODE A — Cost as Students / Interns

*Reference: work-study grant / training internship in Italy (€ 8–12/h)*

| Member | Role | Hours | Rate | Cost |
|--------|------|:-----:|:----:|:----:|
| Roman | PM + Solutions Architect + Backend Dev | 70 h | € 12.00/h | **€ 840.00** |
| Luka | PM + Frontend Lead Developer | 70 h | € 12.00/h | **€ 840.00** |
| Shaeek | Embedded / Firmware Developer | 70 h | € 10.00/h | **€ 700.00** |
| Matteo | QA Tester + Technical Writer | 25 h | € 8.00/h | **€ 200.00** |
| De Togni | UI/UX Designer + PM | 25 h | € 10.00/h | **€ 250.00** |
| **TOTAL LABOUR — Mode A** | | **260 h** | | **€ 2,830.00** |

---

### 📊 MODE B — Cost as Junior Professionals

*Reference: junior freelancer / digital studio, Italian market 2026*
*(Source: LinkedIn Jobs Italy, Glassdoor IT, Indeed IT — junior/mid-entry range)*

| Member | Role | Hours | Rate | Cost |
|--------|------|:-----:|:----:|:----:|
| Roman | Solutions Architect + PM + Backend Developer | 70 h | € 35.00/h | **€ 2,450.00** |
| Luka | PM + Frontend Lead Developer | 70 h | € 30.00/h | **€ 2,100.00** |
| Shaeek | IoT / Embedded Developer | 70 h | € 25.00/h | **€ 1,750.00** |
| Matteo | QA Engineer + Technical Writer | 25 h | € 20.00/h | **€ 500.00** |
| De Togni | UI/UX Designer + Project Manager | 25 h | € 25.00/h | **€ 625.00** |
| **TOTAL LABOUR — Mode B** | | **260 h** | | **€ 7,425.00** |

> **Note on differentiated rates:** Rates reflect the real market value of each role. A Solutions Architect / PM earns significantly more than a QA Tester entry-level in the Italian market. Roman holds the most complex profile (architecture + PM + full-stack development), justifying the highest rate.

---

### 💰 Total Cost Comparison

| Item | Mode A (students) | Mode B (professionals) |
|------|:-----------------:|:----------------------:|
| Hardware | € 68.50 | € 68.50 |
| Cloud (2.5 months) | € 12.50 | € 12.50 |
| Human labour | € 2,830.00 | € 7,425.00 |
| **TOTAL** | **€ 2,911.00** | **€ 7,506.00** |

---

## 5. Comparison with Existing Commercial Products

| Product | Market price | Sensors | Fan control | Open API | Cloud |
|---------|:------------:|---------|:-----------:|:--------:|:-----:|
| **Home Hero** *(ours)* | — prototype | Temp, Humidity, Press, Gas kΩ, Lux, dB | ✅ | ✅ full | ✅ custom |
| Xiaomi Mi Air Monitor 2 | ~€ 50 | Temp, Humidity, PM2.5, CO₂ | ❌ | ❌ | Mi Home app only |
| Govee Air Quality Monitor | ~€ 45 | Temp, Humidity, tVOC, CO₂ | ❌ | Limited | Govee app only |
| Airthings Wave Mini | ~€ 80 | Temp, Humidity, tVOC | ❌ | Limited | Airthings app only |
| Netatmo Weather Station | ~€ 200 | Temp, Humidity, CO₂, noise | ❌ | Partial | Netatmo cloud |
| Airthings Wave Plus | ~€ 270 | Temp, Humidity, Press, tVOC, Radon | ❌ | Limited | Airthings app only |

### Home Hero's Unique Advantages

| Advantage | Description |
|-----------|-------------|
| 🎛️ **Actuator control** | Only product with a remotely controllable fan — automatable via dashboard threshold |
| 🔓 **Fully open API** | Integrable with any third-party system (home automation, AI, workflows) — no lock-in |
| 📊 **Custom dashboard** | Historical charts, CSV export, dark/light themes — built from scratch for our needs |
| 🔬 **6 heterogeneous sensors** | Environmental (BME680) + light (BH1750) + sound (INMP441) in one device |
| 🚀 **Unlimited expandability** | Open firmware + open API: add new sensors, AI hints, third-party integrations |
| 💾 **No vendor lock-in** | No mandatory proprietary cloud subscription; data always accessible under user control |

---

## 6. Commercial Analysis and Break-Even

### Hypothetical Sales Scenario

| Item | Value |
|------|:-----:|
| Hardware cost per unit produced | € 68.50 |
| Fixed monthly cloud cost (Railway Basic) | € 5.00/month |
| **Hypothetical selling price — hardware kit** | € 150.00 |
| Gross margin per unit (excl. labour) | **€ 81.50** |
| Optional SaaS model: cloud subscription | € 5.00/month per device |

### Break-Even Analysis

| Scenario | Costs to recover | Margin/unit | Units needed |
|----------|:----------------:|:-----------:|:------------:|
| Only material costs (hardware + cloud) | € 81.00 | € 81.50 | **~1 unit** |
| + Labour Mode A (students) | € 2,911.00 | € 81.50 | **~36 units** |
| + Labour Mode B (professionals) | € 7,506.00 | € 81.50 | **~92 units** |

> **Analysis:** break-even at 36 units (student scenario) or 92 units (professional) reflects the team's real hour investment. The optional SaaS model (€5/month/device) additionally provides a predictable recurring revenue stream after break-even.

### Target Market Segments

| Segment | Customer profile | Suggested price | Potential |
|---------|-----------------|:---------------:|:---------:|
| **Consumer** | IoT enthusiasts, makers, Smart Home early adopters | € 120–150 | High volume |
| **Education** | Technical institutes, universities, IoT labs | € 100–130/unit (bulk) | Medium volume |
| **SMB** | Small offices: air quality + employee wellness monitoring | € 180–220 | Medium value |
| **B2B Smart Building** | Home automation integrators, property managers | € 250–400 | High value |

### Educational ROI — Value of Skills Acquired

Beyond the project numbers, the true ROI of Home Hero is the **value of the skills developed** by the team members:

| Member | Skills acquired | Estimated market value impact* |
|--------|----------------|:------------------------------:|
| Roman | Laravel, Docker, Railway, PostgreSQL, REST API, Git PM | +€ 5,000 – 15,000/year |
| Luka | React, Vite, Tailwind, Axios, Netlify, CI deploy | +€ 4,000 – 10,000/year |
| Shaeek | ESP32, I²C/I²S sensors, Arduino, embedded HTTP | +€ 3,000 – 8,000/year |
| Matteo | Technical writing, Markdown, QA methodology | +€ 2,000 – 5,000/year |
| De Togni | UI/UX design, GANTT, RACI, economic analysis | +€ 2,000 – 6,000/year |

*\* Estimated salary differential vs. profile without these skills — Italian IT market 2026.*

**Conclusion:** the actual project cost (€ 2,911 in Mode A) generates an educational and professional return that far exceeds the initial investment — making Home Hero a high-ROI undertaking by any measure.

---

*Home Hero Project — Team: Roman, Luka, De Togni, Matteo, Shaeek — March 2026*
