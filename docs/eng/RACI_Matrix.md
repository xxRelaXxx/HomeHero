> **📖 To view this file correctly:** open **https://markdownlivepreview.com** and paste the content — tables and formatting will render properly.

---

# RACI Matrix — Home Hero Project

> **Document:** Final Deliverable — Project Management
> **Deliverable author:** De Togni Andrea
> **Information provided by:** Roman
> **Last updated:** March 2026

---

## Legend

| Letter | Role | Description |
|--------|------|-------------|
| **R** | Responsible | Who **performs** the work |
| **A** | Accountable | Who **owns** the outcome (max 1 per activity) |
| **C** | Consulted | Who is **consulted** before/during the work |
| **I** | Informed | Who is **notified** upon completion |

---

## Team Members

| Code | Name | Official Role |
|------|------|---------------|
| **RO** | Roman | Architect & Backend — PM / SEO / Back-end Lead |
| **LU** | Luka | Frontend Lead — PM / Front-end Lead |
| **DT** | De Togni Andrea | UI/UX & Demo — Front-end / Presentation |
| **MA** | Matteo Rossi | QA, Documentation & Presentation — Documentation / Presentation |
| **SH** | Shaeek | Hardware & Data — Embedded Development |

---

## RACI Matrix

|  #  | Activity                                     | Roman (RO) | Luka (LU) | De Togni (DT) | Matteo (MA) | Shaeek (SH) |
| :-: | -------------------------------------------- | :--------: | :-------: | :-----------: | :---------: | :---------: |
|  1  | Project idea definition and requirements     |    **R**   |     A     |       C       |      C      |      C      |
|  2  | Architectural decisions and technology stack |   **A/R**  |     C     |       I       |      I      |      C      |
|  3  | Backend development — Laravel API            |   **A/R**  |     I     |       I       |      I      |      I      |
|  4  | Database management (PostgreSQL / Supabase)  |   **A/R**  |     I     |       I       |      I      |      I      |
|  5  | ESP32 firmware development                   |      C     |     I     |       I       |      I      |   **A/R**   |
|  6  | Sensor wiring and hardware assembly          |      C     |     I     |       I       |      I      |   **A/R**   |
|  7  | Frontend development (React / Vite)          |      I     |  **A/R**  |       C       |      I      |      I      |
|  8  | UI/UX design                                 |      C     |     C     |    **A/R**    |      I      |      I      |
|  9  | API integration (frontend ↔ backend)         |      C     |  **A/R**  |       I       |      C      |      I      |
|  10 | Backend deployment (Railway)                 |   **A/R**  |     I     |       I       |      I      |      I      |
|  11 | Frontend deployment (Netlify)                |    **A**   |     R     |       I       |      I      |      I      |
|  12 | Functional testing during development        |      R     |     R     |       I       |      A      |      R      |
|  13 | QA / Final test checklist                    |      C     |     C     |       C       |   **A/R**   |      C      |
|  14 | Technical documentation                      |      C     |     C     |       I       |   **A/R**   |      C      |
|  15 | Cost analysis                                |      C     |     I     |    **A/R**    |      I      |      I      |
|  16 | Gantt chart and project phases               |      C     |     C     |    **A/R**    |      I      |      I      |
|  17 | RACI matrix                                  |      C     |     C     |    **A/R**    |      I      |      I      |
|  18 | Presentation slides preparation              |      C     |     C     |    **A/R**    |      C      |      C      |
|  19 | Final presentation to the professor          |      C     |     C     |    **A/R**    |      C      |      C      |

---

## Explanatory Notes

### Deploy (activities 10 and 11)
Roman managed **all deployments** for the entire project (backend + frontend) to ensure technical consistency and production-readiness. For the frontend: Luka produced the code (**R**), Roman owned and managed the deployment process (**A**).

### Testing (activities 12 and 13)
Developers (Roman, Luka, Shaeek) perform continuous testing on their own components during development (**R** for activity 12). Matteo handles the comprehensive final QA checklist (**A/R** for activity 13). The entire team participates informally in system-wide testing.

### Economic analysis (activity 15)
De Togni performs the analysis (**R/A**), but the actual cost data was provided by Roman (sole purchaser of all hardware and software tools). Roman is therefore **C** — consulted for the real numbers.

### Presentation (activities 18 and 19)
Matteo is responsible for building and delivering the final slides (**A/R**). De Togni actively contributes (**C**). All members can propose corrections, but Matteo has the final say on the approved version. Technical questions are answered by the member who worked on that specific part.

---

## RACI Load Distribution per Member

| Member | R | A | C | I | Total active cells |
|--------|:-:|:-:|:-:|:-:|:-----------------:|
| Roman | 9 | 8 | 4 | 0 | 21 |
| Luka | 4 | 3 | 3 | 4 | 14 |
| De Togni | 1 | 5 | 5 | 4 | 15 |
| Matteo | 1 | 5 | 5 | 1 | 12 |
| Shaeek | 4 | 2 | 2 | 3 | 11 |

> **Observation:** Roman holds the highest number of Accountable assignments (8/19), consistent with his role as Solutions Architect and technical PM of the project.

---

*Home Hero Project — Team: Roman, Luka, De Togni, Matteo, Shaeek — March 2026*
