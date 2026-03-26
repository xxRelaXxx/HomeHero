> **📖 Per visualizzare correttamente:** apri **https://markdownlivepreview.com** e incolla questo testo.

---

# Matrice RACI — Progetto Home Hero

> **Documento:** Deliverable finale — Project Management
> **Autore deliverable:** De Togni Andrea
> **Informazioni fornite da:** Roman
> **Ultima revisione:** Marzo 2026

---

## Legenda

| Lettera | Ruolo | Descrizione |
|---------|-------|-------------|
| **R** | Responsible | Chi **esegue** il lavoro |
| **A** | Accountable | Chi **risponde** del risultato (max 1 per attività) |
| **C** | Consulted | Chi viene **consultato** prima/durante |
| **I** | Informed | Chi viene **informato** a lavoro completato |

---

## Membri del Team

| Sigla | Nome | Ruolo ufficiale |
|-------|------|-----------------|
| **RO** | Roman | Architetto & Backend — PM / SEO / Back-end Lead |
| **LU** | Luka | Frontend Lead — PM / Front-end Lead |
| **DT** | De Togni Andrea | UI/UX & Demo — Front-end / Presentation |
| **MA** | Matteo Rossi | QA, Documentazione & Presentazione — Documentation / Presentation |
| **SH** | Shaeek | Hardware & Dati — Embedded Development |

---

## Matrice RACI Completa

| # | Attività | Roman (RO) | Luka (LU) | De Togni (DT) | Matteo (MA) | Shaeek (SH) |
|:-:|----------|:----------:|:---------:|:-------------:|:-----------:|:-----------:|
| 1 | Definizione idea e requisiti del progetto | **R** | A | C | C | C |
| 2 | Scelte architetturali e stack tecnologico | **A/R** | C | I | I | C |
| 3 | Sviluppo backend — Laravel API | **A/R** | I | I | I | I |
| 4 | Gestione database (PostgreSQL / Supabase) | **A/R** | I | I | I | I |
| 5 | Sviluppo firmware ESP32 | C | I | I | I | **A/R** |
| 6 | Cablaggio sensori e assemblaggio hardware | C | I | I | I | **A/R** |
| 7 | Sviluppo frontend (React / Vite) | I | **A/R** | C | I | I |
| 8 | Design UI/UX | C | C | **A/R** | I | I |
| 9 | Integrazione API (frontend ↔ backend) | C | **A/R** | I | C | I |
| 10 | Deploy backend (Railway) | **A/R** | I | I | I | I |
| 11 | Deploy frontend (Netlify) | **A** | R | I | I | I |
| 12 | Testing funzionale durante lo sviluppo | R | R | I | A | R |
| 13 | QA / Test checklist finale | C | C | C | **A/R** | C |
| 14 | Documentazione tecnica | C | C | I | **A/R** | C |
| 15 | Analisi economica | C | I | **A/R** | I | I |
| 16 | Diagramma GANTT e fasi progetto | C | C | **A/R** | I | I |
| 17 | Matrice RACI | C | C | **A/R** | I | I |
| 18 | Preparazione slide presentazione | C | C | **A/R** | C | C |
| 19 | Presentazione finale al professore | C | C | **A/R** | C | C |

---

## Note Esplicative

### Deploy (attività 10 e 11)
Roman ha gestito **tutti i deploy** dell'intero progetto (backend + frontend), sia per coerenza tecnica che per garantire la production-readiness del sistema. Per il frontend: Luka ha prodotto il codice (**R**), Roman ha supervisionato e gestito il processo (**A**).

### Testing (attività 12 e 13)
I developer (Roman, Luka, Shaeek) eseguono test continui sul proprio componente durante lo sviluppo (**R** attività 12). Matteo si occupa della checklist QA complessiva e finale (**A/R** attività 13). Tutto il team partecipate informalmente ai test di sistema.

### Analisi economica (attività 15)
De Togni esegue l'analisi (**R/A**), ma i dati sui costi hardware e software sono stati forniti da Roman (acquirente unico di tutti i componenti). Roman è quindi **C** — consultato per i numeri reali.

### Presentazione (attività 18 e 19)
Matteo è responsabile della costruzione e presentazione delle slide (**A/R**). De Togni contribuisce attivamente (**C**). Tutti i membri possono proporre correzioni — ma Matteo ha l'ultima parola sulla versione finale. Per le domande tecniche specifiche, risponde il membro che ha lavorato su quella parte.

---

## Distribuzione del Carico RACI per Membro

| Membro | R | A | C | I | Totale celle attive |
|--------|:-:|:-:|:-:|:-:|:------------------:|
| Roman | 9 | 8 | 4 | 0 | 21 |
| Luka | 4 | 3 | 3 | 4 | 14 |
| De Togni | 1 | 5 | 5 | 4 | 15 |
| Matteo | 1 | 5 | 5 | 1 | 12 |
| Shaeek | 4 | 2 | 2 | 3 | 11 |

> **Osservazione:** Roman ha il maggior numero di responsabilità Accountable (8/19), coerente con il suo ruolo di Solutions Architect e PM tecnico del progetto.

---

*Progetto Home Hero — Team: Roman, Luka, De Togni, Matteo, Shaeek — Marzo 2026*
