> **📖 Per visualizzare correttamente:** apri **https://markdownlivepreview.com** e incolla questo testo.

---

# Analisi Economica — Progetto Home Hero

> **Documento:** Deliverable finale — Economic & Commercial Analysis
> **Autore deliverable:** De Togni Andrea
> **Dati hardware forniti da:** Roman (acquirente unico di tutti i componenti)
> **Ultima revisione:** Marzo 2026

---

## 1. Riepilogo Esecutivo

| Voce | Importo |
|------|:-------:|
| Costi hardware (componenti fisici) | € 68,50 |
| Costi cloud e software (2,5 mesi) | € 12,50 |
| **Costo materiale totale** | **€ 81,00** |
| + Lavoro umano — Modalità A (studenti) | € 2.830,00 |
| **Costo totale — Modalità A** | **€ 2.911,00** |
| + Lavoro umano — Modalità B (professionisti) | € 7.425,00 |
| **Costo totale — Modalità B** | **€ 7.506,00** |

---

## 2. Costi Hardware

Tutti i componenti sono stati acquistati da **Amazon / AliExpress** da Roman.
Prezzi indicativi al momento dell'acquisto, senza sconti.

| # | Componente | Funzione nel sistema | Prezzo |
|:-:|------------|----------------------|:------:|
| 1 | **ESP32 WROVER DevKit** | Microcontrollore principale: CPU dual-core 240 MHz, WiFi integrato, 4 MB PSRAM | € 20,00 |
| 2 | **BME680** | Sensore ambientale: temperatura (°C), umidità (%), pressione (hPa), qualità aria (kΩ) — interfaccia I²C | € 10,00 |
| 3 | **BH1750** | Sensore luminosità: lux ambientali — interfaccia I²C | € 4,00 |
| 4 | **INMP441** | Microfono digitale I²S: campioni 32-bit → calcolo RMS → dB SPL | € 4,00 |
| 5 | **Display SH1107** 128×128 OLED | Schermo 1: mostra in tempo reale tutti i valori dei sensori + stato ventola | € 10,00 |
| 6 | **Display SSD1306** 128×64 OLED | Schermo 2: orologio NTP — data e ora in tempo reale | € 4,00 |
| 7 | **Ventola + transistor ULN2803A** | Attuatore fisico: ventola ambientale controllata via GPIO (pin 25) | € 4,00 |
| 8 | **Cavi, breadboard, resistenze** | Connessioni, prototipazione, alimentazione | € 12,50 |
| | **TOTALE HARDWARE** | | **€ 68,50** |

---

## 3. Costi Software e Servizi Cloud

Periodo progetto: **08 gennaio → 26 marzo 2026** ≈ 2,5 mesi

| Servizio | Funzione | Piano | Costo mensile | Totale periodo |
|----------|----------|:-----:|:-------------:|:--------------:|
| **Railway** | Hosting backend Laravel (server + runtime PHP) | Basic | € 5,00 | € 12,50 |
| **Supabase** | Database PostgreSQL cloud | Free | € 0,00 | € 0,00 |
| **Netlify** | Hosting frontend React (CDN globale) | Free | € 0,00 | € 0,00 |
| **GitHub** | Versioning, repository, code review | Free | € 0,00 | € 0,00 |
| **Dominio personalizzato** | Non utilizzato (usa netlify.app) | — | € 0,00 | € 0,00 |
| | **TOTALE CLOUD** | | | **€ 12,50** |

> **Nota Supabase:** il piano gratuito include 500 MB storage, 2 core CPU condivisi, e 50.000 righe attive — ampiamente sufficiente per questo progetto con dati telemetrici ogni 10 secondi.
>
> **Nota Netlify Free:** include banda CDN illimitata per siti statici e deploy automatici da GitHub — zero costi per tutto il ciclo di vita del frontend.

---

## 4. Costo del Lavoro Umano

### Ore investite

| Membro | Ruolo | Ore stimate* |
|--------|-------|:------------:|
| **Roman** | Architetto & Backend (PM / SEO / Back-end Lead) | 70 h |
| **Luka** | Frontend Lead (PM / Front-end Lead) | 70 h |
| **Shaeek** | Hardware & Firmware (Embedded Developer) | 70 h |
| **Matteo** | QA, Documentazione & Presentazione | 25 h |
| **De Togni** | UI/UX, Analisi, GANTT, RACI (Designer / PM) | 25 h |
| **TOTALE** | | **~260 h** |

*\* Include lavoro effettivo + apprendimento strumenti/tecnologie. La distribuzione è asimmetrica: i tre sviluppatori tecnici (Roman, Luka, Shaeek) hanno contribuito 60–80 h ciascuno; i ruoli di supporto (Matteo, De Togni) 20–30 h ciascuno.*

---

### 📊 MODALITÀ A — Costo come Studenti / Stagisti

*Riferimento: borsa lavoro / stage formativo in Italia (€ 8-12/h)*

| Membro | Ruolo | Ore | Tariffa | Costo |
|--------|-------|:---:|:-------:|:-----:|
| Roman | PM + Solutions Architect + Backend Dev | 70 h | € 12,00/h | **€ 840,00** |
| Luka | PM + Frontend Lead Developer | 70 h | € 12,00/h | **€ 840,00** |
| Shaeek | Embedded / Firmware Developer | 70 h | € 10,00/h | **€ 700,00** |
| Matteo | QA Tester + Technical Writer | 25 h | € 8,00/h | **€ 200,00** |
| De Togni | UI/UX Designer + PM | 25 h | € 10,00/h | **€ 250,00** |
| **TOTALE LAVORO — Modalità A** | | **260 h** | | **€ 2.830,00** |

---

### 📊 MODALITÀ B — Costo come Professionisti Junior

*Riferimento: libero professionista junior / studio digitale, mercato italiano 2026*
*(Fonte: LinkedIn Jobs Italia, Glassdoor IT, Indeed IT — range junior/mid entry)*

| Membro | Ruolo | Ore | Tariffa | Costo |
|--------|-------|:---:|:-------:|:-----:|
| Roman | Solutions Architect + PM + Backend Developer | 70 h | € 35,00/h | **€ 2.450,00** |
| Luka | PM + Frontend Lead Developer | 70 h | € 30,00/h | **€ 2.100,00** |
| Shaeek | IoT / Embedded Developer | 70 h | € 25,00/h | **€ 1.750,00** |
| Matteo | QA Engineer + Technical Writer | 25 h | € 20,00/h | **€ 500,00** |
| De Togni | UI/UX Designer + Project Manager | 25 h | € 25,00/h | **€ 625,00** |
| **TOTALE LAVORO — Modalità B** | | **260 h** | | **€ 7.425,00** |

> **Nota tariffe differenziate:** Le tariffe riflettono il valore di mercato reale di ciascun ruolo.
> Un Solutions Architect / PM senior guadagna sensibilmente più di un QA Tester entry-level.
> Roman detiene il profilo più complesso (architettura + PM + development full-stack), giustificando la tariffa più alta.

---

### 💰 Quadro Comparativo Costi Totali

| Voce | Modalità A (studenti) | Modalità B (professionisti) |
|------|:---------------------:|:---------------------------:|
| Hardware | € 68,50 | € 68,50 |
| Cloud (2,5 mesi) | € 12,50 | € 12,50 |
| Lavoro umano | € 2.830,00 | € 7.425,00 |
| **TOTALE** | **€ 2.911,00** | **€ 7.506,00** |

---

## 5. Confronto con Prodotti Commerciali Simili

| Prodotto | Prezzo | Sensori | Fan control | API aperta | Cloud |
|----------|:------:|---------|:-----------:|:----------:|:-----:|
| **Home Hero** *(nostro)* | — prototipo | Temp, Umidità, Press, Gas kΩ, Lux, dB | ✅ | ✅ completa | ✅ custom |
| Xiaomi Mi Air Monitor 2 | ~€ 50 | Temp, Umidità, PM2.5, CO₂ | ❌ | ❌ | Solo app Mi Home |
| Govee Air Quality Monitor | ~€ 45 | Temp, Umidità, tVOC, CO₂ | ❌ | Limitata | Solo app Govee |
| Airthings Wave Mini | ~€ 80 | Temp, Umidità, tVOC | ❌ | Limitata | Solo app Airthings |
| Netatmo Weather Station | ~€ 200 | Temp, Umidità, CO₂, rumore | ❌ | Parziale | Netatmo cloud |
| Airthings Wave Plus | ~€ 270 | Temp, Umidità, Press, tVOC, Radon | ❌ | Limitata | Solo app Airthings |

### Vantaggi unici di Home Hero

| Vantaggio | Descrizione |
|-----------|-------------|
| 🎛️ **Controllo attuatore** | Unico prodotto con ventola controllabile remotamente via dashboard e automatizzabile |
| 🔓 **API completamente aperta** | Integrabile con qualsiasi sistema (domotica, AI, automazioni) senza lock-in |
| 📊 **Dashboard personalizzata** | Grafici storici, export CSV, temi dark/light — costruita da zero per le nostre esigenze |
| 🔬 **6 sensori eterogenei** | Ambientale (BME680) + luce (BH1750) + rumore (INMP441) in un unico dispositivo |
| 🚀 **Espandibile** | Firmware open, API open: si possono aggiungere sensori, AI hints, integrazioni esterne |
| 💾 **Nessun lock-in** | Nessun abbonamento obbligatorio a cloud proprietario; dati sempre accessibili |

---

## 6. Analisi Commerciale e Break-Even

### Scenario di Vendita Ipotetico

| Voce | Valore |
|------|:------:|
| Costo hardware per unità prodotta | € 68,50 |
| Costo cloud fisso mensile (Railway Basic) | € 5,00/mese |
| **Prezzo di vendita ipotetico — kit hardware** | € 150,00 |
| Margine lordo per unità (escl. lavoro) | **€ 81,50** |
| Opzione SaaS: abbonamento cloud | € 5,00/mese per dispositivo |

### Break-Even Analysis

| Scenario | Costi da ricuperare | Margine/unità | Unità necessarie |
|----------|:------------------:|:-------------:|:----------------:|
| Solo costi materiali (hardware + cloud) | € 81,00 | € 81,50 | **~1 unità** |
| + Lavoro Modalità A (studenti) | € 2.911,00 | € 81,50 | **~36 unità** |
| + Lavoro Modalità B (professionisti) | € 7.506,00 | € 81,50 | **~92 unità** |

> **Analisi:** il breakeven a 36 unità (scenario studenti) o 92 unità (professionale) riflette il reale investimento orario del team. Il modello SaaS opzionale (€5/mese/device) garantisce inoltre un ricavo ricorrente prevedibile dopo il break-even. Il modello SaaS opzionale (€5/mese/device) garantisce inoltre un ricavo ricorrente prevedibile dopo il break-even.

### Segmenti di Mercato Target

| Segmento | Profilo cliente | Prezzo suggerito | Potenziale |
|----------|-----------------|:----------------:|:----------:|
| **Consumer** | Appassionati IoT, maker, Smart Home enthusiast | € 120-150 | Alto volume |
| **Educativo** | Istituti tecnici, università, laboratori IoT | € 100-130/unità (bulk) | Medio volume |
| **PMI** | Piccoli uffici: qualità aria + comfort dipendenti | € 180-220 | Medio valore |
| **B2B Smart Building** | Integratori domotica, gestori immobiliari | € 250-400 | Alto valore |

### ROI Educativo — Valore delle Competenze Acquisite

Al di là dei numeri di progetto, il vero ROI di Home Hero è il **valore delle competenze sviluppate** dai componenti del team:

| Membro | Competenze acquisite | Valore stimato sul mercato del lavoro* |
|--------|---------------------|:--------------------------------------:|
| Roman | Laravel, Docker, Railway, PostgreSQL, REST API, Git PM | +€ 5.000 – 15.000/anno |
| Luka | React, Vite, Tailwind, Axios, Netlify, Deploy CI | +€ 4.000 – 10.000/anno |
| Shaeek | ESP32, I²C/I²S sensors, Arduino, HTTP embedded | +€ 3.000 – 8.000/anno |
| Matteo | Technical writing, Markdown, QA methodology | +€ 2.000 – 5.000/anno |
| De Togni | UI/UX design, GANTT, RACI, economic analysis | +€ 2.000 – 6.000/anno |

*\* Differenziale salariale stimato rispetto a profilo senza queste competenze — mercato IT italiano 2026.*

**Conclusione:** il costo reale del progetto (€ 2.911 in Modalità A) genera un ritorno educativo e professionale che supera di decine di volte l'investimento iniziale.

---

*Progetto Home Hero — Team: Roman, Luka, De Togni, Matteo, Shaeek — Marzo 2026*
