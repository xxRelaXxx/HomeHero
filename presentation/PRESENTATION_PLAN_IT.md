# Piano della Presentazione Finale — HomeHero
## Stazione di Monitoraggio Ambientale Intelligente con Dashboard IoT

> **Progetto:** Smart Weather Station / HomeHero  
> **Gruppo:** S.A.R.R.L. — Roman · Luka · Shaeek · Matteo · De Togni  
> **Data:** 26 marzo 2026 · **Durata totale:** 50 minuti  
> **Documento di riferimento per i relatori — da usare in preparazione alla presentazione**

---

## OPINIONE ONESTA SUL PROGETTO

Prima di pianificare come presentarlo, è necessario capire cosa abbiamo realmente.

### Punti di forza autentici

- **Sistema IoT completo in produzione reale** — non è un prototipo localhost. Backend su Railway, database su Supabase, frontend su Netlify: tre cloud diversi, tutti funzionanti.
- **Hardware fisico reale** — 6 sensori su PCB, 2 display OLED, relay ventola, cablaggio a mano su breadboard. Non è una simulazione.
- **Architettura professionale** — MVC Laravel, ORM Eloquent, Bearer token Sanctum, interceptor Axios, container Docker. Scelte che si trovano in produzione aziendale.
- **Firmware di qualità** — calcolo dB SPL con media mobile esponenziale (EMA), microphone I²S a 32-bit, gestione NTP, I²C su due bus separati. Non è "accendi un LED".
- **Documentazione eccellente** — bilingue, GANTT dettagliato (8 milestone), RACI matrice, analisi economica con break-even reale.
- **Sicurezza considerata** — bcrypt, HTTPS obbligatorio, CORS configurato per Netlify, credenziali mai nel repository grazie al pattern `config.h`.

### Limiti onesti (da non nascondere, ma da saper spiegare)

- **Test automatici quasi assenti** — la cartella `tests/` esiste ma è quasi vuota. I test sono stati eseguiti manualmente. *Risposta pronta: lo riconosciamo, è nel roadmap come feature CI/CD (F12). Per un MVP con 11 settimane e 5 studenti part-time, abbiamo scelto la funzionalità prima della copertura test.*
- **Dashboard non si aggiorna in tempo reale** — non ci sono WebSocket né polling automatico. L'utente deve ricaricare la pagina. *Risposta pronta: è una limitazione architetturale deliberata che sfruttiamo: il controllo ventola arriva come risposta alla POST dell'ESP32, zero endpoint extra. WebSocket è in H3 del roadmap (F15).*
- **Latenza controllo ventola = max 10 secondi** — è il ciclo di invio dell'ESP32. Non è un bug. *Risposta pronta: è un limite by design. La dashboard invia il comando; l'ESP32 lo riceve alla prossima trasmissione. Per un sistema ambientale (non chirurgico) 10 secondi è accettabile.*
- **Email verification e password reset mancanti** — deliberatamente deferiti. *Risposta pronta: documentati nel roadmap (F01, F02), architetturalmente pianificati, tagliati per rispettare MVP in 11 settimane.*

### Valutazione: **8/10**

Per un progetto scolastico sviluppato in 11 settimane a tempo parziale da 5 studenti, questo è un risultato solido. Il sistema è reale, deployato, funzionante e documentato. I gap esistono, sono riconosciuti, e sono documentati con un piano di risoluzione. Questo dimostra maturità ingegneristica.

**Il messaggio principale per il professore:** questo non è "un sito con un database". È un sistema IoT completo con hardware fisico, firmware embedded in C++, REST API in produzione, database cloud, e dashboard web — tutto integrato e funzionante in simultanea.

---

## PERCHÉ ALCUNE COSE NON SONO NELLE SLIDE

Molte informazioni tecniche esistono ma non appartengono alle slide. Ecco dove vanno.

| Contenuto tecnico | Perché NON in slide | Come viene mostrato |
|---|---|---|
| Codice sorgente dettagliato | Illeggibile su proiettore, inefficace per comprendere | Walkthrough live su VS Code — Fase 4 |
| Schema DB con tutte le colonne | Troppo denso, già in `BACKEND_INFRA_DOC.md` | Documento aperto durante walkthrough — Fase 4 |
| Tutti gli endpoint API con payload JSON | Nella documentazione scritta | Browser live o `BACKEND_INFRA_DOC.md` — Fase 4 |
| Formula dB SPL (calcolo microfono) | Matematica troppo specialistica | Spiegazione verbale da Shaeek in Fase 4 |
| Processo deploy Docker step-by-step | Dettaglio operativo, non visione | Menzionato verbalmente in slide architettura |
| GDPR e compliance normativa | Profondità documentale — già in `COSTRAINTS_RISKMANAGEMENT_IT.md` | Disponibile come backup se il professore chiede |
| Dettaglio 9 migrazioni DB | Troppo granulare | Roman spiega l'evoluzione schema in 2 frasi |
| Ogni componente frontend React | Troppo nel dettaglio | Luka mostra la struttura dal file explorer in Fase 4 |

---

## STRUTTURA DEI 50 MINUTI

| Fase | Contenuto | Durata | Relatori principali |
|:----:|-----------|:------:|---------------------|
| **0** | Apertura e presentazione team | 3 min | Matteo → tutti |
| **1** | Slide tecniche (hardware, backend, frontend, comunicazione) | 13 min | Shaeek, Roman, Luka, De Togni |
| **2** | Slide PM (RACI, GANTT, Tuckman, economia) | 7 min | De Togni, Matteo |
| **3** | Slide conclusive (confronto commerciale, vincoli, futuro) | 4 min | Matteo, Roman |
| **4** | Demo live — dashboard + controllo ventola | 10 min | Luka + Roman + Shaeek |
| **5** | Walkthrough codice + documentazione | 10 min | Roman, Shaeek, Luka, De Togni |
| **Buffer** | Domande, recupero tempo, conclusione | 3 min | Tutti |
| **TOTALE** | | **50 min** | |

---

## FASE 0 — APERTURA (3 minuti)

### Slide 0 — COPERTINA
**Titolo:** HomeHero — Stazione di Monitoraggio Ambientale Intelligente  
**Contenuto visivo:**
- Logo HomeHero centrato (`frontend/src/styles/img/HomeHero.svg`)
- Sottotitolo: *"Smart Weather Station con Dashboard IoT"*
- Nomi del gruppo su riga unica: **Roman · Luka · Shaeek · Matteo · De Togni**
- Data: 26 marzo 2026
- (Opzionale) Screenshot della dashboard live come sfondo sfocato — ottimo impatto visivo

**Chi parla:** Matteo apre con 1-2 frasi introducendo il progetto e passando a De Togni per la slide seguente.  
**Timing:** 30 secondi

---

## FASE 1 — SLIDE TECNICHE (13 minuti)

### Slide 1 — COS'È HOMEHERO E IL TEAM
**Titolo:** Chi siamo e cosa abbiamo costruito

**Contenuto — due colonne:**

Colonna sinistra – **IL TEAM S.A.R.R.L.**:
| Membro | Ruolo |
|--------|-------|
| Roman | Backend Lead & Architetto |
| Luka | Frontend Lead |
| Shaeek | Hardware & Firmware |
| Matteo | QA & Documentazione |
| De Togni | UI/UX & Analisi |

Colonna destra – **HOMEHERO IN UNA FRASE:**  
> *"Un ESP32 fisico legge 6 parametri ambientali ogni 10 secondi, li invia a una REST API su cloud, li salva in PostgreSQL, e li mostra in una dashboard React accessibile da browser."*

**Concetto chiave da trasmettere:** ogni membro ha lavorato su una parte separata e tutto si integra in un unico sistema.  
**Chi parla:** De Togni introduce la slide → ogni membro dice il proprio nome e ruolo in 1 frase (ordine: Roman, Luka, Shaeek, Matteo, De Togni).  
**Timing:** 1 minuto 30 secondi  
**Asset:** tabella semplice — NO foto, NO immagini

---

### Slide 2 — ARCHITETTURA E STACK TECNOLOGICO
**Titolo:** Architettura di sistema — Come parlano le componenti

**Contenuto — diagramma verticale con frecce:**
```
┌──────────────────────────────────────┐
│   ESP32 WROVER + 6 sensori           │  ← Shaeek
│   2 OLED · relay ventola · firmware  │
└────────────────┬─────────────────────┘
                 │  HTTPS POST ogni 10 s
                 │  (risposta con fan_desired_state)
                 ▼
┌──────────────────────────────────────┐
│   Laravel 12 REST API                │  ← Roman
│   PHP 8.2 · Sanctum · Docker         │
│   HOST: Railway (hhero.up.railway.app)│
└───────┬──────────────────────────────┘
        │  Eloquent ORM
        ▼
┌──────────────────────────────────────┐
│   PostgreSQL su Supabase             │  ← Roman
│   3 tabelle: users, telemetries,     │
│   device_settings                    │
└──────────────────────────────────────┘
        ↑  Axios (Bearer token)
┌──────────────────────────────────────┐
│   React 19 + Vite 7 Dashboard        │  ← Luka + De Togni
│   TailwindCSS 4 · Recharts · Netlify │
└──────────────────────────────────────┘
```

**Punti verbali obbligatori:**
- L'ESP32 è il **client** HTTP, non il server — è lui che "parla per primo"
- Il controllo ventola non ha endpoint dedicato: arriva come risposta JSON alla POST dell'ESP32
- Tre cloud separati: Railway (€5/mese), Supabase (gratuito), Netlify (gratuito)
- Docker garantisce che il backend si comporti uguale in locale e in produzione

**Chi parla:** Roman  
**Timing:** 2 minuti 30 secondi  
**Asset:** diagramma ASCII (copiare quello sopra) oppure SVG/PNG creato da team. Il `firmware/ESP32_HomeHero_scheme.svg` può essere mostrato come supporto.

---

### Slide 3 — HARDWARE & FIRMWARE
**Titolo:** Hardware & Firmware — L'anima fisica del progetto *(Shaeek)*

**Contenuto — tabella componenti + immagine:**

| Componente | Funzione | Interfaccia |
|------------|---------|-------------|
| ESP32 WROVER 240MHz | Cervello: WiFi, calcolo, trasmissione | — |
| BME680 | Temperatura · Umidità · Pressione · Gas | I²C bus 1 |
| BH1750 | Luce in lux | I²C bus 2 |
| INMP441 | Microfono → calcolo dB SPL | I²S |
| SH1107 128×128 OLED | Schermo 1: tutti i sensori + stato ventola | I²C bus 1 |
| SSD1306 128×64 OLED | Schermo 2: orologio NTP in tempo reale | I²C bus 2 |
| Relay GPIO 25 | Attuatore: controlla la ventola fisica | GPIO |

**Immagine:** `firmware/HomeHero_scheme.jpeg` o `firmware/ESP32_HomeHero_scheme.svg` — OBBLIGATORIA. Fa capire immediatamente la complessità del cablaggio.  
**Aggiungi:** foto del dispositivo fisico assemblato se disponibile — è il punto più impressivo della presentazione.

**Punti verbali:**
- Due bus I²C separati perché BME680 e BH1750 hanno lo stesso indirizzo I²C (0x23): impossibile su un solo bus
- Il microfono INMP441 usa I²S (non I²C) perché trasmette campioni audio a 32-bit in streaming
- Il calcolo del rumore (dB SPL) avviene nell'ESP32: RMS dei campioni → dBFS → offset di calibrazione +110 → EMA smoothing. Tutto in firmware C++.

**Chi parla:** Shaeek  
**Timing:** 2 minuti  
**Asset necessari:** `firmware/HomeHero_scheme.jpeg` — immagine grande, leggibile

---

### Slide 4 — BACKEND
**Titolo:** Backend — Laravel API in produzione *(Roman)*

**Contenuto:**

```
ENDPOINT PRINCIPALI
───────────────────────────────────────────────────────
POST /api/device/data      ← ESP32 (no auth — è il device)
GET  /api/telemetry        ← Dashboard  [Bearer token]
PUT  /api/device/{n}/fan   ← Dashboard  [Bearer token]
POST /api/login            ← Qualsiasi client
```

**Struttura applicazione:**
- **4 Controller:** AuthController · TelemetryController · DeviceController · UserController
- **3 Model:** User · Telemetry · DeviceSettings
- **Auth:** Laravel Sanctum — token SHA-256 in tabella `personal_access_tokens`
- **DB:** PostgreSQL su Supabase — 9 migrazioni evolutive
- **Deploy:** Docker container → Railway, avvio con `Procfile`

**Cosa enfatizzare verbalmente:**
- `DeviceSettings::firstOrCreate()` — un nuovo ESP32 si "auto-registra" al primo invio senza configurazione manuale
- La risposta a `/device/data` contiene `fan_desired_state` — zero polling extra, zero endpoint separato
- Sanctum usa token **stateless**: ogni richiesta porta il token, nessuna sessione server-side

**Chi parla:** Roman  
**Timing:** 2 minuti 30 secondi  
**Asset:** tabella endpoint — NO screenshot di codice su slide

---

### Slide 5 — FRONTEND
**Titolo:** Frontend — La Dashboard React *(Luka · De Togni)*

**Contenuto:**

**Stack:** React 19 · Vite 7 · TailwindCSS 4 · Recharts 3 · Framer Motion · Axios · Lucide React

**Funzionalità della dashboard:**
- Login / Registrazione con guards di navigazione (`RequireAuth`)
- 6 **sensor cards** con valore corrente + unità di misura
- 6 **grafici time-series** (ultime 20 letture, Recharts)
- Controllo ventola: toggle Auto/Manual + soglia temperatura configurabile
- Export CSV dei dati storici
- Deploy: Netlify (CDN globale, gratuito)

**⚠️ OBBLIGATORIO:** Screenshot grande della dashboard con dati reali. Senza immagine questa slide non comunica niente.

**Chi parla:** Luka (stack + componenti) → De Togni (UI/UX e decisioni di design)  
**Timing:** 2 minuti  
**Asset necessari:** Screenshot della dashboard live (tutta la pagina, dati reali visibili) — DA PREPARARE PRIMA

---

### Slide 6 — COMUNICAZIONE ESP32 ↔ BACKEND
**Titolo:** Come comunicano il device e il server?

**Contenuto — due blocchi JSON affiancati:**

```json
// ESP32 → POST /api/device/data (ogni 10 s)
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

// Backend → Risposta immediata
{
  "fan_desired_state": true,
  "message": "Telemetry stored"
}
```

**Schema frecce:** ESP32 → POST → API → salva su DB + risponde con comando ventola → ESP32 applica stato ventola

**Punti verbali:**
- Il backend risponde in millisecondi — l'ESP32 non aspetta. Latenza totale: rete + PHP ≈ 200-400ms
- La latenza di controllo ventola è dovuta all'intervallo ESP32 (10s), non al backend
- Questo schema si chiama "Command-in-Response" — evita un secondo endpoint `/device/command`

**Chi parla:** Roman (protocollo) + Shaeek (lato firmware, 1 frase su come viene letto il JSON)  
**Timing:** 1 minuto 30 secondi  
**Asset:** due blocchi JSON formattati — testo, nessun'altra immagine

---

## FASE 2 — SLIDE PM E DOCUMENTAZIONE (7 minuti)

### Slide 7 — MATRICE RACI
**Titolo:** Matrice RACI — Chi ha fatto cosa, con responsabilità chiara

**Contenuto:** Versione ridotta della RACI (top 12 attività più rappresentative):

| # | Attività | Roman | Luka | De Togni | Matteo | Shaeek |
|:-:|----------|:-----:|:----:|:--------:|:------:|:------:|
| 1 | Idea e requisiti | **A/R** | R | C | C | C |
| 2 | Architettura | **A/R** | C | I | I | C |
| 3 | Backend Laravel | **A/R** | I | I | I | I |
| 4 | Database | **A/R** | I | I | I | I |
| 5 | Firmware ESP32 | C | I | I | I | **A/R** |
| 6 | Hardware | I | I | I | I | **A/R** |
| 7 | Frontend React | I | **A/R** | C | I | I |
| 8 | UI/UX Design | C | C | **A/R** | I | I |
| 9 | Deploy | **A/R** | R | I | I | I |
| 10 | QA / Test finale | C | C | C | **A/R** | C |
| 11 | Documentazione | C | I | C | **A/R** | I |
| 12 | GANTT / RACI / Analisi | I | I | **A/R** | I | I |

**Nota visiva obbligatoria:** la colonna con più **A** per un membro va evidenziata in colore diverso.

**Cosa enfatizzare:** R = chi esegue, A = chi risponde del risultato (max 1 per riga). Roman è il solo A per tutto il backend e il deploy — questo va detto esplicitamente.

**Chi parla:** De Togni  
**Timing:** 1 minuto  
**Asset:** tabella semplice — la RACI completa (19 attività) è disponibile come documento a parte in `docs/ita/RACI_Matrice.md`

---

### Slide 8 — DIAGRAMMA GANTT
**Titolo:** GANTT — Dalla formazione del team alla presentazione

**Contenuto:** immagine PNG/SVG del GANTT esportata da mermaid.live

**⚠️ ASSET CRITICO:** Il GANTT deve essere esportato come immagine da `docs/ita/GANTT.md`. Aprire https://mermaid.live, incollare il blocco mermaid, esportare in PNG (1920×1080 o superiore). Salvare come `presentation/assets/gantt_it.png`.

**Punti verbali da enfatizzare:**
- Inizio progetto: **2 dicembre 2025** (formazione team)
- 8 milestone principali — non solo "presentazione"
- Backend + Firmware + Frontend sviluppati **in parallelo** (→ coordinamento era critico)
- Deploy completato: **14 marzo 2026** — 12 giorni prima della presentazione
- Tutto `:done` — tutte le attività sono state completate

**Chi parla:** De Togni  
**Timing:** 1 minuto  
**Asset necessari:** `presentation/assets/gantt_it.png` — OBBLIGATORIO ricreare da mermaid.live

---

### Slide 9 — EVOLUZIONE DEL TEAM — TUCKMAN
**Titolo:** Come è cresciuto il team — Modello di Tuckman

**Contenuto — timeline orizzontale:**

```
🔵 FORMING          ⚡ STORMING         🤝 NORMING          🚀 PERFORMING        🎯 ADJOURNING
dic 2025 – gen 2026  gen – feb 2026      feb 2026            feb – mar 2026       mar 2026
─────────────────────────────────────────────────────────────────────────────
Team formato         Prime tensioni      Stack condiviso     Massima produttività  Chiusura
Ruoli assegnati      Distribuzione       Workflow Git        Sistema in deploy     Presentazione
Idea definita        carichi di lavoro   definito
```

**Una frase per fase:**
- **Forming:** ci siamo incontrati, abbiamo scelto il nome e i ruoli
- **Storming:** tensioni sulla distribuzione del lavoro — normale in ogni team
- **Norming:** abbiamo trovato un ritmo comune — stack tecnologico approvato, Git strutturato
- **Performing:** tutti i componenti sviluppati e integrati in parallelo
- **Adjourning:** deploy completato, documentazione finita, oggi ci presentiamo

**Chi parla:** Matteo (Forming/Storming) → De Togni (Norming/Performing/Adjourning)  
**Timing:** 1 minuto 30 secondi  
**Asset:** timeline visuale orizzontale — creare come immagine o tabella colorata

---

### Slide 10 — ANALISI ECONOMICA
**Titolo:** Analisi Economica — Quanto costa davvero HomeHero?

**Contenuto — tabella riassuntiva:**

| Voce | Importo |
|------|:-------:|
| Hardware (componenti fisici) | **€ 68,50** |
| Cloud e software (2,5 mesi) | **€ 12,50** |
| **Totale costi materiali** | **€ 81,00** |
| + Lavoro umano (stima studenti ~€19/h) | € 2.830,00 |
| + Lavoro umano (stima professionisti ~€47/h) | € 7.425,00 |

**Break-even (ipotesi commercializzazione):**
- Prezzo di vendita ipotetico: **€ 89/unità**
- Unità necessarie break-even (anno 1): **~140 unità**
- Costo variabile per unità: ~€ 68,50 hardware + ~€ 8,50 shipping = €77 → margine €12/unità

**Nota fondamentale da dire ad alta voce:** *"Tutti i costi hardware — €81 — sono stati sostenuti interamente da Roman, personalmente."*

**Chi parla:** De Togni  
**Timing:** 1 minuto 30 secondi  
**Asset:** tabella + grafico break-even opzionale (da `docs/ita/Analisi_Economica.md`)

---

## FASE 3 — SLIDE CONCLUSIVE (4 minuti)

### Slide 11 — CONFRONTO CON PRODOTTI COMMERCIALI
**Titolo:** HomeHero vs Prodotti commerciali

**Contenuto:**

| Caratteristica | HomeHero | Netatmo Weather | Xiaomi Mi Home | Arduino DIY |
|----------------|:--------:|:---------------:|:--------------:|:-----------:|
| Prezzo | **€81** | €150+ | €120+ | €40 (no cloud) |
| Sensori ambientali | **6** | 3-4 | 2-3 | 1-2 |
| Dashboard web custom | ✅ | ✅ (app) | ✅ (app) | ❌ |
| Open source / custom | ✅ | ❌ | ❌ | ✅ |
| Backend proprietario | ✅ | ❌ | ❌ | ❌ |
| Controllo attuatori | ✅ (ventola) | ❌ | ✅ (parziale) | Limitato |
| Calcolo dB SPL | ✅ | ❌ | ❌ | Con modulo ext. |
| Deploy in cloud | ✅ | Vendor lock-in | Vendor lock-in | ❌ |

**Messaggio:** HomeHero costa meno, fa di più, ed è completamente nostro.

**Chi parla:** Matteo  
**Timing:** 1 minuto  
**Asset:** tabella comparativa — creare

---

### Slide 12 — VINCOLI E STATO PROGETTO
**Titolo:** Vincoli, rischi gestiti e stato finale

**Contenuto — due colonne:**

Colonna sinistra — **Vincoli principali:**
- ⏱️ 11 settimane di sviluppo a tempo parziale
- 💶 €81 autofinanziati interamente da Roman  
- 📶 Solo WiFi 2.4GHz (no 4G/LTE)
- 🔧 No aggiornamenti firmware OTA

Colonna destra — **Stato finale deliverable:**
| Componente | Stato |
|------------|:-----:|
| Firmware ESP32 | ✅ |
| Laravel API | ✅ |
| PostgreSQL | ✅ |
| React Dashboard | ✅ |
| Deploy cloud | ✅ |
| Documentazione | ✅ |
| Test automatici | ⚠️ |

**Chi parla:** Roman  
**Timing:** 1 minuto  
**Asset:** nessuno — due colonne di testo

---

### Slide 13 — LEZIONI APPRESE E PROSPETTIVE FUTURE
**Titolo:** Cosa abbiamo imparato — e cosa viene dopo

**Contenuto:**

**Lezioni del team (1 per membro):**
- **Roman:** "Separare backend e frontend fin dal giorno 1 ha evitato ogni problema di integrazione"
- **Luka:** "React 19 + Vite 7 + Tailwind 4 è una combinazione produttiva ma richiede conoscere le basi CSS prima"
- **Shaeek:** "Con più dispositivi I²C, i bus separati non sono opzionali — sono necessari"
- **Matteo:** "Documentare durante lo sviluppo, non dopo, fa la differenza tra deliverable e caos"
- **De Togni:** "Il GANTT reale diverge sempre da quello pianificato — e questo è normale nella gestione di progetto"

**Roadmap (3 orizzonti):**
- **H1 (breve):** Email verification · Token expiration · API key ESP32
- **H2 (medio):** Multi-dispositivo · CI/CD pipeline · RBAC
- **H3 (lungo):** App mobile · MQTT real-time · PCB personalizzata

**Chi parla:** Tutti (1 frase su "lezione" ciascuno) → Roman chiude con il roadmap  
**Timing:** 1 minuto 30 secondi  
**Asset:** nessuno

---

### Slide 14 — SLIDE FINALE
**Titolo:** Grazie — HomeHero è live

**Contenuto:**
- URL API: `https://hhero.up.railway.app/api`
- URL Dashboard: *(inserire URL Netlify reale)*
- Repository: `github.com/xxRelaXxx/HomeHero`
- Documentazione: `docs/eng/` · `docs/ita/`
- Logo grande centrato
- "Domande?"

**Chi parla:** Matteo chiude  
**Timing:** 30 secondi  
**Asset:** logo HomeHero + URL live

---

## FASE 4 — DEMO LIVE (10 minuti)

> **Setup richiesto PRIMA:** browser aperto sulla dashboard, VS Code aperto sul progetto, ESP32 connesso e funzionante, monitor seriale attivo.

### Demo 4.1 — Dashboard live (3 minuti) — *Luka*

**Cosa mostrare:**
1. Aprire la dashboard nel browser: schermata di **login** (mostrare la pagina, spiegare la guard `RequireAuth`)
2. Fare **login** con credenziali reali — mostrare il Bearer token che appare nel localStorage (DevTools → Application → Storage)
3. Arrivare alla **dashboard** — mostrare le 6 sensor cards con valori in tempo reale
4. Mostrare i **grafici Recharts** (ultimi 20 punti)
5. Aprire il pannello **controllo ventola** — spiegare la differenza tra Auto mode (soglia temperatura) e Manual

**Cosa dire:** "Ogni dato che vedete qui è stato inviato da quel dispositivo fisico che potete vedere sul banco. È un dato reale."

---

### Demo 4.2 — Controllo ventola live (3 minuti) — *Roman + Shaeek*

**Cosa mostrare:**
1. Dall'interfaccia: cambiare la ventola in **modalità manuale ON**
2. Aspettare al massimo 10 secondi — nella console seriale dell'ESP32 apparirà `fan_desired_state: true` → il relay scatta
3. Spiegare il flusso: **dashboard → PUT /api/device/{name}/fan → DB aggiornato → prossima POST ESP32 → risposta JSON → relay**
4. Mostrare il **monitor seriale** (IDE Arduino / PlatformIO) con i log dell'ESP32: dati letti + stato ventola
5. Rimettere **modalità automatica** con soglia temperatura

**Cosa dice Shaeek:** "Quello che vedete sul display OLED è lo stesso che arriva al server."

---

### Demo 4.3 — Health check API (2 minuti) — *Roman*

**Cosa mostrare:**
1. Aprire browser: `https://hhero.up.railway.app/api` — risposta JSON `{"status": "ok"}`
2. Aprire **DevTools → Network** sulla dashboard e mostrare la chiamata `GET /api/telemetry` con il Bearer token nell'header
3. Opzionale: aprire `GET /api/device/esp32_living_room/settings` nel browser dopo aver aggiunto il token (Postman o browser extension)

**Cosa dire:** "Il backend è in produzione su Railway, a Francoforte. Quello che vedete nella dashboard passa attraverso questo endpoint ogni volta che si ricarica."

---

### Demo 4.4 — Display ESP32 fisico (2 minuti) — *Shaeek*

**Cosa mostrare:**
1. Il **display SH1107** con temperatura, umidità, pressione, gas, luce, rumore dB, e stato ventola
2. Il **display SSD1306** con l'orologio NTP sincronizzato in tempo reale
3. Soffiare sul sensore BME680 o coprire il BH1750 con la mano — i valori cambiano in tempo reale sul display e, dopo 10 secondi, si aggiornano sulla dashboard
4. Mostrare che il relay scatta fisicamente con un click audibile quando si cambia lo stato ventola dalla dashboard

---

## FASE 5 — WALKTHROUGH CODICE + DOCUMENTAZIONE (10 minuti)

> **Tool aperto:** VS Code con il repository in `HomeHero_fin/`

### Walkthrough 5.1 — Firmware ESP32 C++ (3 minuti) — *Shaeek*

**File:** `firmware/sketch.cpp`

**Cosa mostrare in ordine:**
1. La sezione `#include "config.h"` → spiegare il pattern di sicurezza: le credenziali non sono mai nel repository
2. La funzione `computeNoiseDbFromI2S()` → spiegare in 1 minuto: campioni I²S a 32-bit → righshift 8 → RMS → dBFS → offset +110 → EMA smoothing
3. Il loop principale: leggi sensori → aggiorna display → ogni 10s → costruisci JSON → POST all'API → leggi risposta → applica stato ventola

**Cosa NON mostrare:** Il codice di inizializzazione I²C e I²S (troppo tecnico e lungo per il tempo disponibile).

---

### Walkthrough 5.2 — Backend Laravel (4 minuti) — *Roman*

**File 1:** `backend/routes/api.php` — mostrare le route (30 secondi, capire la struttura)

**File 2:** `backend/app/Http/Controllers/TelemetryController.php`
- metodo `store()` → Request validation → Model::create() → risposta con `fan_desired_state`
- mostrare come `DeviceSettings::firstOrCreate()` auto-registra il device

**File 3:** `backend/app/Http/Controllers/DeviceController.php`
- metodo `setFan()` → UPSERT con le impostazioni ventola

**File 4:** `backend/database/migrations/` — mostrare l'elenco dei 9 file, spiegare che ogni migrazione è un "commit" dello schema. Non aprire nessuno.

**Cosa dire:** "Ogni migrazione è un passo nell'evoluzione del database. Questo ci ha permesso di aggiungere sensori (gas, luce, rumore) settimane dopo aver creato la tabella originale — senza perdere dati."

---

### Walkthrough 5.3 — Frontend React + Documentazione (3 minuti) — *Luka + De Togni*

**Luka (2 min) — File:** `frontend/src/api/api.js`
- Mostrare il Request interceptor: ogni chiamata riceve automaticamente il Bearer token da localStorage
- Mostrare il Response interceptor: se il backend risponde 401, cancella il token e reindirizza al login
- Aprire `frontend/src/App.jsx`: mostrare `RequireAuth` e `RedirectIfLoggedIn` — la guard è nel router, non nei singoli componenti

**De Togni (1 min) — Documentazione:**
- Aprire `docs/ita/BACKEND_INFRA_DOC_IT.md` velocemente — mostrare l'indice (8 sezioni, criteri di valutazione coperti: 2.1 DB, 2.2 Backend, 2.3 Architettura, 4.3 Vincoli, 4.4 Rischi)
- Aprire `docs/ita/GANTT.md` e `docs/ita/RACI_Matrice.md` — mostrare che esistono come documenti separati per approfondimento
- Dire: "Tutti i documenti sono disponibili nel repository in formato bilingue inglese/italiano."

---

## BUFFER FINALE — DOMANDE (3 minuti)

### Risposte pronte alle domande probabili del professore

| Domanda probabile | Risposta pronta |
|---|---|
| "Perché non avete test automatici?" | "Riconosciamo il gap. Con 11 settimane e 5 studenti part-time, abbiamo prioritizzato funzionalità e deploy. I test automatici sono nella roadmap come feature F12 (CI/CD con GitHub Actions)." |
| "Come mai la ventola risponde dopo 10 secondi?" | "È un limite by design documentato. L'ESP32 non ha un server HTTP — è un client. Il comando viaggia nella risposta alla prossima POST. Per un sistema ambientale (non medico) 10 secondi è accettabile. MQTT in H3 del roadmap risolverebbe la latenza." |
| "Perché non c'è la verifica email?" | "Deliberatamente deferita (feature F01 nel roadmap). In 11 settimane con un single-feature MVP, abbiamo scelto di consegnare un sistema funzionante piuttosto che un sistema incompleto con verifica email." |
| "Chi ha pagato per il progetto?" | "Roman ha sostenuto personalmente tutti i costi — €81 in hardware e cloud. Nessun finanziamento scolastico era disponibile." |
| "Come funziona la sicurezza?" | "HTTPS obbligatorio su Railway. Bearer token Sanctum con hash SHA-256. bcrypt con 12 round per le password. CORS configurato per accettare solo richieste da Netlify. Credenziali mai nel repository (pattern config.h)." |
| "Si può usare da telefono?" | "La dashboard è un sito web responsive — funziona da browser mobile. Un'app nativa è in H3 del roadmap (F16)." |

---

## ASSET DA PREPARARE PRIMA DELLA PRESENTAZIONE

> Salvare tutti gli asset in `presentation/assets/`

| Asset | Come ottenerlo | Priorità |
|-------|----------------|:--------:|
| Screenshot dashboard (dati reali) | Screenshot del browser sulla dashboard live | **CRITICA** |
| PNG GANTT (alta risoluzione) | mermaid.live → incolla `docs/ita/GANTT.md` → Export PNG | **CRITICA** |
| Foto ESP32 assemblato | Foto con telefono del dispositivo fisico sul banco | **ALTA** |
| `firmware/HomeHero_scheme.jpeg` | Già presente nel repo | ✅ Pronto |
| `firmware/ESP32_HomeHero_scheme.svg` | Già presente nel repo | ✅ Pronto |
| `frontend/src/styles/img/HomeHero.svg` | Già presente nel repo | ✅ Pronto |
| Screenshot schermata login | Screenshot del browser sulla pagina login | MEDIA |
| Screenshot monitor seriale ESP32 | Screenshot durante trasmissione dati | MEDIA |

---

## RIPARTIZIONE FINALE TEMPI PER RELATORE

| Membro | Slide/Sezione | Minuti totali |
|--------|--------------|:-------------:|
| **Matteo** | Apertura (Fase 0) · Slide 1 (intro team) · Slide 9 (Tuckman Forming/Storming) · Slide 11 (confronto comm.) · Chiusura finale | ~8 min |
| **Roman** | Slide 2 (architettura) · Slide 4 (backend) · Slide 6 (comunicazione) · Slide 12 (vincoli) · Walkthrough 5.2 · Demo 4.3 | ~13 min |
| **Shaeek** | Slide 3 (hardware) · Demo 4.2 (ventola) · Demo 4.4 (display) · Walkthrough 5.1 | ~8 min |
| **Luka** | Slide 5 (frontend) · Demo 4.1 (dashboard) · Walkthrough 5.3 (codice) | ~8 min |
| **De Togni** | Slide 1 (presenter) · Slide 7 (RACI) · Slide 8 (GANTT) · Slide 9 (Tuckman Norming+) · Slide 10 (economia) · Slide 13 (lezioni) · Walkthrough 5.3 (documentazione) | ~9 min |
| **Tutti** | 1 frase su lezione appresa (Slide 13) · 1 frase su ruolo (Slide 1) · Buffer Q&A | ~4 min |
| **TOTALE** | | **~50 min** |

---

## CONSIGLI PRATICI PER IL GIORNO DELLA PRESENTAZIONE

1. **Provate UNA VOLTA completa** con cronometro — non scendete mai sotto 45 min, non sforatate i 52.
2. **Roman gestisce TUTTO il codice** — mai toccare il PC del presentatore mentre Roman non è davanti a esso. Evita interruzioni e click sbagliati.
3. **Shaeek tiene l'ESP32 sul banco** con il cavo USB collegato al PC aperto sul monitor seriale. L'hardware è il punto di maggiore impatto visivo.
4. **Luka fa partire la slideshow** e gestisce l'avanzamento durante la Fase 1. Durante la demo, cede il mouse a Roman.
5. **Non leggete dalle slide** — parlate con parole proprie. Le slide sono promemoria visivi, non il testo della presentazione.
6. **Se il WiFi cade durante la demo:** Roman ha uno screenshot della dashboard come backup. Dire: "Vi mostriamo come appare con dati reali" e procedere con lo screenshot.
7. **Slide 14 (finale) rimane a schermo** durante le domande — il professore vede l'URL live e il repository.

---

*Piano di presentazione preparato da GitHub Copilot — Progetto HomeHero, S.A.R.R.L. — Marzo 2026*  
*Versione inglese disponibile: `presentation/PRESENTATION_PLAN_EN.md`*
