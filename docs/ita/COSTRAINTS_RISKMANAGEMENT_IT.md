## 4.3 — Vincoli di Progetto (4 pt)

I vincoli di progetto rappresentano le condizioni esterne e interne che delimitano lo spazio delle soluzioni adottabili. Per Home Hero, i vincoli sono stati analizzati lungo quattro assi: tecnologico, economico, temporale e normativo.

---

### 4.3.1 Vincoli Tecnologici

| # | Vincolo | Conseguenza pratica |
|---|---------|---------------------|
| T1 | **Connettivita esclusivamente Wi-Fi 2.4 GHz (ESP32)** | In assenza di copertura di rete, la trasmissione dati al cloud si interrompe. L'aggiunta di connettivita mobile (4G/LTE) richiederebbe un modulo hardware extra (es. SIM7600) e un piano dati mensile aggiuntivo. |
| T2 | **Supabase Free Tier: 500 MB di storage** | Il limite di 500 MB e un confine reale imposto dalla piattaforma. Con un singolo dispositivo e un intervallo di 10 s/lettura, lo spazio si esaurirebbe in ~385 giorni: una soglia sufficientemente distante da rendere la gestione pianificata, non d'emergenza. La feature F06 (Auto-Cleanup Scheduler) trasforma questo limite in un vantaggio operativo, automatizzando la pulizia notturna piuttosto che attendere l'esaurimento. |
| T3 | **Nessun aggiornamento firmware OTA** | Qualsiasi modifica al comportamento dell'ESP32 — ad esempio l'aggiunta dell'header `X-Device-Key` per la feature F05 — richiede accesso fisico al dispositivo e ri-flashing via USB/seriale. |
| T4 | **Comunicazione HTTP polling, nessun canale push** | I comandi inviati dalla dashboard (es. accensione manuale ventola) raggiungono l'ESP32 solo nella risposta alla successiva POST telemetrica. Il ritardo massimo e pari all'intervallo di invio (default 10 s). La comunicazione bidirezionale real-time via MQTT o WebSocket (F15) e posticipata all'Horizon 3 del roadmap. |
| T5 | **Stack tecnologico vincolante** | L'intero backend e scritto in PHP 8.2 con Laravel 12 ed eseguito come container Docker su Railway. Questo significa che il codice e strettamente dipendente da quel linguaggio e da quella infrastruttura: cambiare stack (ad esempio passare a Node.js, Python/FastAPI o a funzioni serverless come AWS Lambda) richiederebbe riscrivere l'intera logica del server. Per il progetto attuale non e un problema — lo stack e solido e adeguato — ma diventa un vincolo concreto in caso di evoluzioni future significative dell'architettura. |
| T6 | **Railway Basic: single-region, senza auto-scaling** | Il piano Basic di Railway esegue il container in una singola regione geografica senza scalabilita orizzontale automatica. In caso di picchi di traffico significativi, le prestazioni possono degradare. |
| T7 | **Complessita strutturale del frontend (React/Vite)** | Il frontend e composto da numerosi componenti e file React. La struttura puo risultare meno immediata da navigare per chi si avvicina al codice senza aver seguito l'intero sviluppo, aumentando i tempi di onboarding per nuovi collaboratori. Non impatta le funzionalita operative, ma e un vincolo reale in termini di manutenibilita e leggibilita del codice. |

---

### 4.3.2 Vincoli Economici

| # | Vincolo | Importo / Impatto |
|---|---------|-------------------|
| E1 | **Budget scolastico senza finanziamento esterno** | Il progetto e interamente autofinanziato da un unico membro del team. Roman ha sostenuto personalmente **tutti** i costi: hardware € 68,50 + cloud € 12,50 per 2,5 mesi = **€ 81,00 totali**. Nessun contributo economico esterno e stato ricevuto. Questo e un dato fondamentale di cui tutto il gruppo deve essere pienamente consapevole: nessun fondo era disponibile per servizi premium, hardware di riserva o imprevisti. |
| E2 | **Railway Basic: € 5,00/mese** | L'unico costo cloud ricorrente. Un upgrade al piano Team (~€ 20/mese) sarebbe necessario solo in caso di requisiti di SLA garantiti o traffico significativamente superiore all'attuale. |
| E3 | **Tre servizi core su tier gratuiti** | Supabase (database), Netlify (frontend CDN) e GitHub (versioning e CI) operano su piani gratuiti senza SLA garantiti. Un cambiamento unilaterale delle policy commerciali di uno di questi provider potrebbe generare costi imprevisti o forzare migrazioni urgenti. |
| E4 | **Costi hardware non recuperabili** | I componenti fisici (ESP32 WROVER, BME680, BH1750, INMP441, display OLED, ventola/transistor, cablaggio) costituiscono un investimento fisso di € 68,50. In caso di guasto, la sostituzione comporta una spesa aggiuntiva non prevista. |

---

### 4.3.3 Vincoli Temporali

| # | Vincolo | Impatto sul progetto |
|---|---------|----------------------|
| TM1 | **Deadline presentazione: 26/03/2026 (non negoziabile)** | L'intero ciclo di sviluppo — dalla definizione dei requisiti al deploy in produzione — ha dovuto completarsi in **~11 settimane** (08/01/2026 → 26/03/2026). **Questo rappresenta uno dei vincoli piu pesanti dell'intero progetto**: undici settimane per progettare, sviluppare, integrare hardware, backend, frontend e firmware, documentare e preparare la presentazione finale. |
| TM2 | **Team di cinque studenti part-time** | Ciascun membro contribuisce al progetto parallelamente ad altri impegni scolastici. Il monte ore totale stimato e ~260 h, con una distribuzione asimmetrica: **60–80 h ciascuno** per i tre sviluppatori tecnici principali (Roman / Luka / Shaeek), e **20–30 h ciascuno** per i due ruoli di supporto (Matteo / De Togni). Il confronto con le 160+ h mensili di un developer full-time rende evidente la densita del lavoro concentrato in sole 11 settimane. |
| TM3 | **Approccio MVP-first obbligato** | La finestra temporale ha imposto una prioritizzazione rigida. Funzionalita di sicurezza (F01 email verification, F04 token expiration, F05 API key dispositivo) e analytics avanzate (F07–F08) sono state consapevolmente posticipate al roadmap futuro, anche se architetturalmente pianificate fin dall'inizio. |
| TM4 | **Dipendenza critica hardware ↔ software ↔ frontend** | Il firmware ESP32 (Shaeek), il backend Laravel (Roman) e il frontend React (Luka / De Togni) sono stati sviluppati in parallelo. Ogni ritardo in uno dei tre rami si propaga direttamente sulla timeline di integrazione e testing: la dashboard non poteva essere sviluppata pienamente senza API stabili e dati reali; il backend non poteva essere validato senza il firmware funzionante. Questa tripla dipendenza rende il coordinamento tra le componenti il punto critico piu complesso del progetto. |

---

### 4.3.4 Vincoli Normativi

| # | Normativa | Applicabilita e conformita |
|---|-----------|---------------------------|
| N1 | **GDPR (Reg. UE 2016/679)** | Il sistema tratta dati personali (nome, email, hash password) di utenti registrati. Conformita garantita da: database in EU-Central (Francoforte) — i dati restano nel SEE; password archiviate esclusivamente come hash bcrypt a 12 round; nessuna trasmissione di dati personali in chiaro; `User::$hidden` impedisce la serializzazione accidentale di campi sensibili nelle risposte JSON. |
| N2 | **Art. 9 GDPR — Categorie speciali di dati** | Temperatura, umidita, pressione, qualita dell'aria e rumore ambientale misurati in un'abitazione domestica non rientrano nella categoria "dati relativi alla salute" ai sensi dell'Art. 9 GDPR. Non sono parametri biometrici personali e non richiedono consenso esplicito rafforzato. |
| N3 | **Direttiva NIS2 (UE 2022/2555) — Sicurezza delle comunicazioni** | Tutte le comunicazioni avvengono su HTTPS (TLS obbligatorio su Railway). Non e possibile contattare l'API in HTTP non cifrato. Questo e conforme ai requisiti di sicurezza IT per fornitori di servizi digitali. |
| N4 | **Radio Equipment Directive — RED (2014/53/UE)** | Come prototipo accademico ad uso interno, il dispositivo ESP32 non richiede certificazione CE/RED. In caso di sviluppo commerciale futuro, la certificazione sarebbe obbligatoria per qualsiasi prodotto con modulo radio (Wi-Fi, Bluetooth). |
| N5 | **Notifica data breach (Art. 33 GDPR)** | Per un progetto scolastico con utenti limitati e senza finalita commerciali, non sono stati formalmente nominati un DPO (Data Protection Officer) ne definite procedure di notifica data breach entro 72 ore. In un contesto commerciale, entrambi gli adempimenti sarebbero obbligatori. |

---

## 4.4 — Risk Management (4 pt)

---

### 4.4.1 Identificazione dei Rischi

Sono stati identificati 9 rischi primari, distribuiti tra hardware, software/cloud e organizzativo.

| ID | Categoria | Descrizione del Rischio |
|----|-----------|-------------------------|
| R01 | Software / Cloud | Esaurimento dello storage Supabase (limite 500 MB del piano gratuito) |
| R02 | Software / Cloud | Interruzione del servizio Railway (downtime, cold start prolungati) |
| R03 | Hardware | Guasto fisico dell'ESP32 o di un sensore (BME680, BH1750, INMP441) |
| R04 | Sicurezza | Iniezione di dati falsi tramite la route pubblica `POST /api/device/data` |
| R05 | Hardware / Rete | Perdita di connettivita Wi-Fi dell'ESP32 |
| R06 | Organizzativo | Indisponibilita di uno o piu membri del team (malattia, impegni accademici) |
| R07 | Software / Cloud | Perdita accidentale dei dati di produzione (cancellazione involontaria) |
| R08 | Organizzativo | Espansione incontrollata dello scope (scope creep) con sforamento della timeline |
| R10 | Software / Cloud | Modifica delle policy commerciali di un provider gratuito (Supabase, Netlify) |

---

### 4.4.2 Analisi dell'Impatto

| ID | Livello d'Impatto | Descrizione dettagliata |
|----|:-----------------:|-------------------------|
| R01 | **Alto** | Il sistema smette di accettare nuove letture; i dati generati oltre il limite vengono persi finche non si libera spazio o si esegue l'upgrade del piano. |
| R02 | **Medio** | API irraggiungibile; l'ESP32 non puo persistere dati nel cloud; la dashboard non carica. La visualizzazione locale sugli OLED rimane operativa durante il downtime. |
| R03 | **Alto** | Nessuna raccolta dati ambientali; perdita totale della funzionalita di monitoraggio. Il backend e la dashboard rimangono operativi ma senza dati in ingresso. |
| R04 | **Alto** | Dati falsificati nel database; comandi ventola potenzialmente alterati; esaurimento accelerato dello storage; compromissione dell'integrita del sistema. |
| R05 | **Medio** | Gap nella serie temporale dei dati telemetrici; nessuna perdita di dati storici. La visualizzazione OLED locale rimane attiva durante il downtime Wi-Fi. |
| R06 | **Medio** | Rallentamento o blocco del componente assegnato al membro indisponibile; rischio concreto di mancato rispetto della deadline scolastica. |
| R07 | **Alto** | Perdita potenzialmente irreversibile di tutti i dati storici di telemetria e degli account utente. |
| R08 | **Medio** | Consegna parziale o ritardata; rischio di presentare un sistema incompleto o instabile alla demo finale. |
| R10 | **Alto** | Necessita di migrazione urgente verso un provider alternativo; costi e tempistiche imprevedibili; possibile interruzione del servizio. |

---

### 4.4.3 Probabilita e Strategie di Mitigazione

| ID | Probabilita | Motivazione | Strategia di Mitigazione |
|----|:-----------:|-------------|---------------------------|
| R01 | **Media** | A regime (1 device, 10 s/lettura) il limite viene raggiunto in ~385 giorni. Con piu dispositivi o un intervallo ridotto, il termine si accorcia proporzionalmente. | Implementare **F06 — Auto-Cleanup Scheduler**: job Artisan `telemetry:purge` schedulato ogni notte alle 03:00, che elimina automaticamente le righe piu vecchie di un numero configurabile di giorni (default: 90). Monitorare il consumo storage mensile dalla dashboard Supabase. |
| R02 | **Bassa** | Railway registra storicamente un uptime > 99%. I cold start (riavvio del container dopo inattivita) sono un fastidio occasionale, non un'interruzione vera. | Documentare la procedura di redeploy su Railway (< 5 min). Sfruttare gli OLED come fallback di visualizzazione locale durante i downtime. Abilitare le Railway health check notifications. |
| R03 | **Bassa** | Componenti elettronici in condizioni normali d'uso hanno un MTBF elevato. Il rischio aumenta in presenza di sbalzi di tensione o manipolazione fisica impropria. | Documentare schema di cablaggio e versioni firmware in Git. Tenere disponibili ricambi critici (BME680 ~€ 10, cavi di ricambio). |
| R04 | **Media** | La route POST e completamente pubblica e l'URL del backend e esposto. Chiunque conosca la struttura JSON del payload puo iniettare dati arbitrari. | Implementare **F05 — ESP32 Device API Key**: aggiungere `api_key_hash` a `device_settings`, creare middleware `CheckDeviceKey`, flashare il firmware ESP32 con l'header `X-Device-Key`. Usare `hash_equals()` per il confronto constant-time e prevenire timing attack. |
| R05 | **Media** | La stabilita Wi-Fi dipende dall'ambiente domestico (qualita del router, interferenze RF, distanza dall'access point). Disconnessioni brevi sono normali per dispositivi IoT. | Implementare logica di riconnessione Wi-Fi nel firmware con tentativi automatici e backoff esponenziale. Visualizzare lo stato della connessione sul display OLED. |
| R06 | **Media** | In un team di studenti, impegni concorrenti (altri esami, impegni personali, malattia) durante 11 settimane sono probabili. | Mantenere la matrice RACI aggiornata. Usare Git per garantire la continuita del lavoro in caso di assenza. Check-in settimanali tra i membri e comunicazione proattiva. |
| R07 | **Molto Bassa** | Supabase esegue backup automatici giornalieri anche nel piano gratuito. Una perdita dati richiederebbe un errore di superadmin e un'azione deliberatamente distruttiva. | Verificare che i backup automatici Supabase siano attivi. Non eseguire mai istruzioni `DELETE` o `DROP` in produzione senza un backup manuale preventivo. |
| R08 | **Alta** | I progetti accademici tendono ad espandersi man mano che emergono nuove idee. L'assenza di un product owner esterno rende il controllo dello scope responsabilita interna del team. | Seguire rigorosamente il GANTT. Congelare il feature set MVP entro la settimana 8 (28/02/2026). Qualsiasi nuova feature viene valutata solo dopo il raggiungimento della milestone di deploy. |
| R10 | **Molto Bassa** | Provider come Supabase, Netlify e GitHub hanno mantenuto i loro free tier stabili per anni. Un cambiamento improvviso e improbabile nel breve termine. | Documentare le procedure di migrazione per ogni servizio (Supabase → Neon; Netlify → Vercel; Railway → Render/Fly.io). Evitare il vendor lock-in usando standard aperti (PostgreSQL, Docker, HTTPS REST). |

**Matrice di rischio — Impatto x Probabilita:**

| Probabilita | Impatto Basso | Impatto Medio | Impatto Alto |
|:------------|:-------------:|:-------------:|:------------:|
| Alta | — | R08 | — |
| Media | — | R05, R06 | R01, R04 |
| Bassa | — | R02 | R03 |
| Molto Bassa | — | — | R07, R10 |

> Le celle con impatto Alto e probabilita Media (R01, R04) costituiscono le priorita d'azione piu urgenti.

---

### 4.4.4 Piani di Contingenza

| ID | Piano di Contingenza |
|----|----------------------|
| R01 | *Storage esaurito:* Upgrade immediato al piano **Supabase Pro** (€ 25/mese, 8 GB storage). In alternativa, purga manuale con `DELETE FROM telemetries WHERE created_at < NOW() - INTERVAL '30 days'` per liberare spazio senza upgrade. |
| R02 | *Railway down:* Redeploy su **Render.com** (piano gratuito disponibile, supporta Docker) in 20–30 minuti. Aggiornare la variabile `VITE_API_URL` nelle environment variable di Netlify per puntare al nuovo URL. |
| R03 | *Componente guasto:* Acquisto di ricambio su Amazon (consegna 1–2 giorni: ESP32 ~€ 20, BME680 ~€ 10). Il backend, il database e la dashboard rimangono pienamente operativi durante il downtime hardware. |
| R04 | *Dati falsificati rilevati:* (1) Implementare immediatamente l'API key (F05). (2) Identificare e cancellare le righe malicious con `DELETE FROM telemetries WHERE device_name = '<attacker_name>'`. (3) Cambiare il `device_name` nell'ESP32 per invalidare payload precedentemente noti. |
| R05 | *Wi-Fi offline prolungato:* Riavviare il router. Se il problema persiste, avvicinare l'ESP32 all'access point. I dati OLED locali rimangono disponibili durante tutto il downtime. |
| R06 | *Membro del team indisponibile:* Ridistribuire i task critici al membro con skill piu affini. Ridurre lo scope eliminando le feature non ancora iniziate. Documentare le decisioni nel README. |
| R07 | *Perdita dati:* Ripristinare dal backup automatico Supabase (disponibile nell'interfaccia web). Se il backup non fosse disponibile, la struttura del database e completamente riproducibile da `php artisan migrate`; solo i dati telemetrici storici andrebbero perduti. |
| R08 | *Timeline a rischio:* Congelare la feature list. Presentare il sistema con le sole funzionalita completate e stabili. Posticipare formalmente le feature mancanti alla roadmap H1/H2 durante la presentazione, comunicando il piano futuro. |
| R10 | *Provider cambia policy:* Eseguire la migrazione pianificata al provider alternativo documentato (vedi R10 in §4.4.3). La portabilita e garantita dall'uso di PostgreSQL standard e Docker. Tempo stimato di migrazione: 2–4 ore. |

---