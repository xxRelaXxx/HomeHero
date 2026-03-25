# Home Hero — Documentazione Backend e Infrastruttura
### Criteri di Valutazione 2.1 · 2.2 · 2.3 · 4.3 · 4.4

> **Project:** Home Hero — Stazione Intelligente di Monitoraggio Ambientale  
> **Backend:** REST API Laravel 12, distribuita su Railway  
> **Database:** PostgreSQL tramite Supabase  
> **Team:** Roman (Backend e Architettura) · Luka (Frontend) · Shaeek (Hardware) · Matteo (QA/Documentazione) · De Togni (UI/UX e PM)

---

## Indice dei contenuti

1. [Panoramica del progetto](#1-panoramica-del-progetto)
2. [2.1 — Database (10 pt)](#21--database-10-pt)
   - [2.1.1 Progettazione dello schema DB](#211-progettazione-dello-schema-db)
   - [2.1.2 Normalizzazione dei dati](#212-normalizzazione-dei-dati)
   - [2.1.3 Definizione delle tabelle](#213-definizione-delle-tabelle)
   - [2.1.4 Gestione delle relazioni](#214-gestione-delle-relazioni)
   - [2.1.5 Sicurezza dei dati](#215-sicurezza-dei-dati)
   - [2.1.6 Integrita referenziale](#216-integrita-referenziale)
3. [2.2 — Backend Applicativo (10 pt)](#22--backend-applicativo-10-pt)
   - [2.2.1 Uso corretto di PHP](#221-uso-corretto-di-php)
   - [2.2.2 Struttura dell'API](#222-struttura-dellapi)
   - [2.2.3 Comunicazione microcontrollore-server](#223-comunicazione-microcontrollore-server)
   - [2.2.4 Gestione delle richieste HTTP](#224-gestione-delle-richieste-http)
   - [2.2.5 Validazione degli input](#225-validazione-degli-input)
   - [2.2.6 Sicurezza — SQL Injection e oltre](#226-sicurezza--sql-injection-e-oltre)
4. [2.3 — Architettura (5 pt)](#23--architettura-5-pt)
   - [2.3.1 Separazione Frontend / Backend](#231-separazione-frontend--backend)
   - [2.3.2 Modularita](#232-modularita)
   - [2.3.3 Scalabilita](#233-scalabilita)
   - [2.3.4 Manutenibilita](#234-manutenibilita)
5. [4.3 — Vincoli di Progetto (4 pt)](#43--vincoli-di-progetto-4-pt)
   - [4.3.1 Vincoli Tecnologici](#431-vincoli-tecnologici)
   - [4.3.2 Vincoli Economici](#432-vincoli-economici)
   - [4.3.3 Vincoli Temporali](#433-vincoli-temporali)
   - [4.3.4 Vincoli Normativi](#434-vincoli-normativi)
6. [4.4 — Risk Management (4 pt)](#44--risk-management-4-pt)
   - [4.4.1 Identificazione dei Rischi](#441-identificazione-dei-rischi)
   - [4.4.2 Analisi dell'Impatto](#442-analisi-dellimpatto)
   - [4.4.3 Probabilita e Strategie di Mitigazione](#443-probabilita-e-strategie-di-mitigazione)
   - [4.4.4 Piani di Contingenza](#444-piani-di-contingenza)

---

## 1. Panoramica del progetto

**Home Hero** e un sistema smart home per il monitoraggio ambientale e il controllo. Un microcontrollore ESP32 installato in una stanza rileva temperatura, umidita relativa, pressione atmosferica, qualita dell'aria (resistenza del gas in kΩ), luce ambientale (lux) e livello di rumore (dB SPL) tramite sensori fisici, e controlla anche una ventola di ventilazione. I dati dei sensori vengono mostrati localmente su due schermi OLED (uno dedicato ai valori e uno a un orologio NTP in tempo reale) e trasmessi via Wi‑Fi a un backend cloud ogni 10 secondi.

Il backend cloud, una **REST API Laravel 12** distribuita su **Railway**, persiste ogni rilevazione in un **database PostgreSQL** ospitato su **Supabase**. Una **dashboard React** (costruita con Vite e distribuita su Netlify) consente agli utenti registrati di visualizzare grafici storici dei sensori, esportare i dati in CSV e configurare da remoto la ventola di ventilazione (modalita automatica con soglia oppure manuale on/off), con il comando che raggiunge l'ESP32 al successivo invio dei dati senza bisogno di un endpoint separato di polling.

Il progetto e pubblicamente accessibile:
- Backend API: `https://hhero.up.railway.app/api`
- Frontend: distribuito su Netlify con il brand "Home Hero"

---

## 2.1 — Database (10 pt)

### 2.1.1 Progettazione dello schema DB

Lo schema e stato progettato attorno a due principi fondamentali:

1. **Separazione delle responsabilita tra dati time-series e dati di configurazione.**  
   Le letture dei sensori costituiscono un log append-only in costante crescita e non devono mai essere modificate dopo l'inserimento. La configurazione (impostazioni della ventola) e invece un piccolo record mutabile che viene aggiornato in place. Mescolare questi due ambiti nella stessa tabella violerebbe il principio di Single Responsibility a livello di database.

2. **Evoluzione progressiva tramite migration.**  
   Lo schema e partito da un insieme minimo di colonne ed e stato esteso nel tempo tramite file di migration versionati, senza mai ricreare tabelle o compromettere i dati esistenti.

Lo schema finale comprende le seguenti **tabelle applicative** e alcune **tabelle scaffold di Laravel** (infrastruttura):

```
users                     — Account utenti della dashboard
personal_access_tokens    — Token API Sanctum (uno per sessione di login)
telemetries               — Log append-only delle letture sensoriali (ESP32 → DB)
device_settings           — Configurazione mutabile della ventola (una riga per dispositivo)
```

Tabelle scaffold (parte dell'installazione standard di Laravel, non usate dalla logica applicativa):
`password_reset_tokens`, `sessions`, `cache`, `cache_locks`, `jobs`,
`job_batches`, `failed_jobs`.

#### Panoramica Entity–Relationship (semplificata)

```
┌──────────────────────────┐         ┌──────────────────────────────────────┐
│          users           │         │        personal_access_tokens        │
├──────────────────────────┤         ├──────────────────────────────────────┤
│ PK  id                   │◄────────│ tokenable_id (→ users.id)            │
│     name                 │  1 : N  │ tokenable_type                       │
│     email  (UNIQUE)      │         │ token  (hash SHA-256, UNIQUE)        │
│     password (bcrypt)    │         │ last_used_at                         │
│     username (UNIQUE)    │         └──────────────────────────────────────┘
│     avatar               │
│     google_id            │
└──────────────────────────┘

┌──────────────────────────┐          ┌──────────────────────────────────┐
│       telemetries        │          │         device_settings          │
├──────────────────────────┤          ├──────────────────────────────────┤
│ PK  id                   │          │ PK  id                           │
│     device_name  ───────────────────►    device_name  (UNIQUE)        │
│     temperature          │ N : 1    │     fan_mode   ENUM(auto|manual) │
│     humidity             │ (logical)│     fan_manual_state  BOOL       │
│     air_pressure         │          │     fan_auto_temp_threshold      │
│     gas_kohm    NULLABLE │          └──────────────────────────────────┘
│     light_lux   NULLABLE │
│     noise_db    NULLABLE │
│     fan_state   BOOL     │
│     created_at           │
└──────────────────────────┘
```

Il collegamento tra `telemetries` e `device_settings` e una **join logica su `device_name`** invece di una foreign key rigida. Questa scelta progettuale e spiegata in §2.1.6 (integrita referenziale).

---

### 2.1.2 Normalizzazione dei dati

La normalizzazione viene applicata progressivamente attraverso le quattro forme normali classiche.

#### Prima Forma Normale (1NF)

> Ogni colonna contiene solo valori atomici (indivisibili); non esistono gruppi ripetuti; ogni riga e identificabile univocamente tramite una chiave primaria.

| Tabella | Valori atomici? | Nessun gruppo ripetuto? | PK presente? | 1NF |
|---|:---:|:---:|:---:|:---:|
| `users` | ✓ | ✓ | `id` | **✓** |
| `personal_access_tokens` | ✓ * | ✓ | `id` | **✓** |
| `telemetries` | ✓ | ✓ | `id` | **✓** |
| `device_settings` | ✓ | ✓ | `id` | **✓** |

\* La colonna `abilities` in `personal_access_tokens` memorizza una stringa JSON
(`[*]`). A livello di colonna si tratta di un singolo atomo di tipo TEXT: il database non vede un array, ma semplicemente una stringa. E un compromesso accettato quando si usa un layer object-relational come Eloquent ed e una pratica standard di Sanctum.

#### Seconda Forma Normale (2NF)

> La relazione e in 1NF e ogni attributo non chiave dipende **completamente** dall'**intera** chiave primaria (nessuna dipendenza parziale da una parte di una chiave composta).

Una dipendenza parziale puo sorgere solo quando la chiave primaria e **composta**. Ogni tabella qui usa un **intero auto-incrementale a colonna singola** come PK. Una PK a colonna singola non ha sottoinsiemi propri, quindi le dipendenze parziali sono strutturalmente impossibili.

**Conclusione:** tutte le tabelle soddisfano la 2NF per definizione. ✓

#### Terza Forma Normale (3NF)

> La relazione e in 2NF e nessun attributo non chiave dipende **transitivamente** dalla chiave primaria tramite un altro attributo non chiave.  
> Regola: se `A → B` e `B → C` e `B` non e una candidate key, allora `C` e una dipendenza transitiva e deve essere separata in una propria tabella.

**`users`:**  
`email` e una candidate key (vincolo unique). La catena `id → email → name` e quindi una dipendenza tra due candidate key, non una violazione transitiva. Nessun attributo non chiave determina un altro attributo non chiave. ✓

**`personal_access_tokens`:**  
`token` e una candidate key (vincolo unique). `tokenable_id` determina quale utente possiede il token ma non determina `abilities` o `last_used_at`: un utente puo avere molti token con metadati diversi. Nessuna dipendenza transitiva. ✓

**`device_settings`:**  
Possibile dubbio: `fan_mode ∈ {auto, manual}` determina `fan_manual_state` o `fan_auto_temp_threshold`?  
No. Sapere che `fan_mode = 'auto'` **non** dice quale sia la soglia (potrebbe essere 25 °C, 28 °C, 30 °C: e una scelta per dispositivo). `fan_mode` e un selettore semantico, non un determinante nel senso dell'algebra relazionale. Tutti gli attributi non chiave dipendono solo e direttamente da `id`. ✓

**`telemetries`:**  
`device_name` non determina `temperature`: molte letture condividono lo stesso dispositivo ma hanno valori completamente diversi. Nessuna colonna sensoriale determina un'altra colonna sensoriale (temperatura e umidita sono misure fisiche indipendenti). ✓

**Riepilogo normalizzazione:**

| Tabella | 1NF | 2NF | 3NF |
|---|:---:|:---:|:---:|
| `users` | ✓ | ✓ | ✓ |
| `personal_access_tokens` | ✓ | ✓ | ✓ |
| `telemetries` | ✓ | ✓ | ✓ |
| `device_settings` | ✓ | ✓ | ✓ |

Lo schema e completamente normalizzato fino alla **Terza Forma Normale (3NF)**, che rappresenta il target standard industriale per database transazionali OLTP.

---

### 2.1.3 Definizione delle tabelle

Tutte le tabelle vengono create e versionate tramite **migration Laravel**, cioe file PHP che descrivono le modifiche allo schema come codice. L'esecuzione di `php artisan migrate` applica tutte le migration pendenti in ordine cronologico, rendendo lo schema completamente riproducibile da zero in qualsiasi ambiente. La meta-tabella `migrations` traccia quali file sono gia stati applicati.

---

#### `users`

Creata dalle migration:  
`0001_01_01_000000_create_users_table.php` +  
`2026_01_26_000000_add_profile_fields_to_users_table.php` +  
`2026_01_26_230938_add_google_id_to_users_table.php`

| Colonna | Tipo | Vincoli | Scopo |
|---|---|---|---|
| `id` | `BIGINT` | PK, AUTO_INCREMENT | Identificatore univoco della riga |
| `name` | `VARCHAR(255)` | NOT NULL | Nome visualizzato nella dashboard |
| `username` | `VARCHAR(255)` | UNIQUE, NULLABLE | Handle opzionale, riservato a funzionalita future |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | Credenziale di login; unicita garantita a livello DB |
| `email_verified_at` | `TIMESTAMP` | NULLABLE | Pronto per un flusso di verifica email (attualmente non attivo) |
| `password` | `VARCHAR(255)` | NOT NULL | Hash bcrypt (12 round); **mai memorizzata in chiaro** |
| `avatar` | `VARCHAR(255)` | NULLABLE | URL dell'immagine profilo (popolata da Google OAuth quando abilitato) |
| `google_id` | `VARCHAR(255)` | NULLABLE | Subject ID di Google OAuth; riservato alla futura riattivazione dell'OAuth |
| `remember_token` | `VARCHAR(100)` | NULLABLE | Campo richiesto dal contratto Laravel Authenticatable |
| `created_at` | `TIMESTAMP` | AUTO | Impostato una sola volta in INSERT |
| `updated_at` | `TIMESTAMP` | AUTO | Aggiornato da Eloquent a ogni save |

---

#### `personal_access_tokens`

Creata dalla migration: `2025_11_26_190929_create_personal_access_tokens_table.php`  
Gestita interamente da **Laravel Sanctum**.

| Colonna | Tipo | Scopo |
|---|---|---|
| `id` | `BIGINT PK` | Identificatore della riga |
| `tokenable_type` | `VARCHAR` | Classe del model proprietario del token (`App\Models\User`) |
| `tokenable_id` | `BIGINT` | ID del model proprietario; insieme a `tokenable_type` forma una FK polimorfica |
| `name` | `VARCHAR` | Etichetta umana del token (`myapptoken`) |
| `token` | `VARCHAR(64)` UNIQUE | Hash SHA-256 del token reale; il plaintext viene restituito una sola volta alla creazione |
| `abilities` | `TEXT` | Array JSON di permessi (`["*"]` = accesso completo) |
| `last_used_at` | `TIMESTAMP` NULLABLE | Aggiornato a ogni richiesta autenticata; utile per auditing della sessione |
| `expires_at` | `TIMESTAMP` NULLABLE | `NULL` in questo progetto (i token vengono revocati esplicitamente tramite logout) |
| `created_at / updated_at` | `TIMESTAMPS` | Gestiti automaticamente da Eloquent |

---

#### `telemetries`

Creata da: `2025_11_26_191105_create_telemetries_table.php`  
Estesa da: `2026_02_22_000000_add_new_sensors_to_telemetries_table.php`

Si tratta di un **log time-series append-only**. Le righe non vengono mai aggiornate dopo l'inserimento; rappresentano snapshot immutabili della realta fisica in un determinato istante.

| Colonna | Tipo | Vincoli | Scopo |
|---|---|---|---|
| `id` | `BIGINT` | PK | Identificatore univoco della riga; l'incremento monotono fornisce un ordinamento temporale implicito |
| `device_name` | `VARCHAR(255)` | NOT NULL | Identifica il dispositivo fisico (es. `esp32_living_room`) |
| `temperature` | `FLOAT` | NOT NULL | Temperatura dell'aria in °C (BME680) |
| `humidity` | `FLOAT` | NOT NULL | Umidita relativa in % (BME680) |
| `air_pressure` | `FLOAT` | NOT NULL | Pressione atmosferica in hPa (BME680) |
| `gas_kohm` | `FLOAT` | NULLABLE | Resistenza del gas in kΩ, proxy della qualita dell'aria (BME680). Valori maggiori = aria piu pulita. Aggiunta a Feb 2026; nullable per retrocompatibilita con firmware piu vecchi |
| `light_lux` | `FLOAT` | NULLABLE | Intensita luminosa ambientale in lux (BH1750). Aggiunta a Feb 2026 |
| `noise_db` | `FLOAT` | NULLABLE | Livello di pressione sonora ambientale in dB SPL (microfono I²S INMP441). Aggiunta a Feb 2026 |
| `fan_state` | `BOOLEAN` | DEFAULT `false` | Stato fisico del relay della ventola **al momento di questa lettura** (record storico, distinto dal comando `fan_desired_state`) |
| `created_at` | `TIMESTAMP` | AUTO | Asse X per tutti i grafici time-series |
| `updated_at` | `TIMESTAMP` | AUTO | Non cambia mai (le righe non vengono aggiornate) |

**Motivazione progettuale per le colonne sensoriali NULLABLE:** aggiungere colonne `NOT NULL` senza un valore di default a una tabella gia popolata causerebbe il fallimento della migration sui dati esistenti. Rendere le nuove colonne `NULLABLE` e l'unica strategia sicura e non distruttiva per una migration su un database di produzione. La regola `nullable` dell'API e il rendering null-safe del frontend consentono un percorso di upgrade graduale per qualsiasi dispositivo che esegua firmware meno recente.

---

#### `device_settings`

Creata da: `2026_02_22_000001_create_device_settings_table.php`

Questa tabella e un **archivio di configurazione mutabile**, cioe l'opposto esatto di `telemetries`. Esiste sempre esattamente **una riga per ogni dispositivo fisico**, aggiornata in place.

| Colonna | Tipo | Vincoli | Scopo |
|---|---|---|---|
| `id` | `BIGINT` | PK | Identificatore della riga |
| `device_name` | `VARCHAR(255)` | UNIQUE, NOT NULL | Deve corrispondere esattamente a cio che l'ESP32 invia nel body della POST |
| `fan_mode` | `ENUM('auto','manual')` | DEFAULT `'auto'` | `auto` = il backend attiva/disattiva la ventola in base alla soglia di temperatura; `manual` = l'utente forza uno stato |
| `fan_manual_state` | `BOOLEAN` | DEFAULT `false` | Stato target in modalita manuale (true = ON, false = OFF) |
| `fan_auto_temp_threshold` | `FLOAT` | DEFAULT `30.0` | Temperatura in °C oltre la quale la ventola si accende automaticamente |
| `created_at / updated_at` | `TIMESTAMPS` | AUTO | Tempo trascorso dall'ultima interazione con la dashboard |

---

### 2.1.4 Gestione delle relazioni

Lo schema definisce le seguenti relazioni:

#### `users` → `personal_access_tokens` (Uno-a-Molti, hard FK)

Un utente puo possedere molti token API (uno per sessione di login/dispositivo attivo). La relazione e **polimorfica** e viene gestita da Sanctum tramite la coppia `(tokenable_type, tokenable_id)`. In questo progetto `tokenable_type` e sempre `App\Models\User` e `tokenable_id` e l'`id` dell'utente. Al logout, Sanctum elimina la riga specifica del token, revocando l'accesso senza influire sulle altre sessioni attive.

```php
// In logout — elimina solo il token usato per QUESTA richiesta:
$request->user()->currentAccessToken()->delete();
```

#### `telemetries` → `device_settings` (Molti-a-Uno, soft/logical FK)

Molte letture di telemetria appartengono a una sola configurazione di dispositivo. Il collegamento avviene tramite la colonna stringa `device_name`, presente in entrambe le tabelle.

Questa relazione **non e imposta come foreign key a livello di database**: i motivi sono dettagliati in §2.1.6. A livello applicativo la relazione viene gestita in `TelemetryController@store`, che usa `DeviceSettings::firstOrCreate()` per leggere (oppure auto-creare) la riga di configurazione del dispositivo ogni volta che arriva una nuova lettura.

```php
// Registra automaticamente un dispositivo alla sua primissima POST:
$settings = DeviceSettings::firstOrCreate(
    ['device_name' => $request->device_name],
    ['fan_mode' => 'auto', 'fan_manual_state' => false, 'fan_auto_temp_threshold' => 30.0]
);
```

#### Flusso del comando ventola (relazione tra tre attori)

```
Dashboard React                 API Laravel                    ESP32
      │                              │                            │
      │── PUT /device/{name}/fan ───►│                            │
      │   { fan_mode: "auto",       │                            │
      │     fan_auto_temp_threshold: │── UPDATE device_settings ─►│
      │     28.0 }                   │                            │
      │                              │                            │
      │                              │◄── POST /device/data ──────│
      │                              │    { temperature: 29.5,    │
      │                              │      fan_state: false, … } │
      │                              │                            │
      │                              │── READ device_settings     │
      │                              │── compute fan_desired_state│
      │                              │   (29.5 >= 28.0 → ON)      │
      │                              │── INSERT telemetries       │
      │                              │                            │
      │                              │── 201 { fan_desired_state: │
      │                              │          true } ──────────►│
      │                              │                            │── digitalWrite(FAN_PIN, HIGH)
```

Tutti e tre gli attori interagiscono tramite il **`device_name`** condiviso come chiave di coordinamento, quindi sul lato ESP32 non serve alcun loop di polling: il dispositivo riceve il comando aggiornato all'interno della risposta HTTP al suo caricamento periodico dei dati.

---

### 2.1.5 Sicurezza dei dati

#### Hash delle password

Le password **non vengono mai memorizzate in chiaro**. Sono attivi due livelli di protezione:

1. `AuthController@register` richiama esplicitamente `Hash::make($password)` (bcrypt, 12 round) prima di invocare `User::create()`.
2. L'array `$casts` del model `User` include `'password' => 'hashed'`, che applica automaticamente bcrypt a ogni write su quell'attributo, fungendo da seconda salvaguardia anche se `Hash::make()` venisse omesso per errore.

```php
// confronto bcrypt in login — constant-time, nessun timing attack:
if (!Hash::check($fields['password'], $user->password)) { ... }
```

#### Sicurezza dei token (Sanctum)

- La stringa raw del token viene restituita al client **una sola volta** (in creazione) e **non viene mai memorizzata nel database**.
- Nel database viene memorizzato solo l'**hash SHA-256** (64 caratteri esadecimali) del token.
- Al logout, la riga del token viene **fisicamente eliminata** da `personal_access_tokens`, rendendo immediatamente inutile qualsiasi copia rubata.
- `$hidden = ['password', 'remember_token']` nel model `User` garantisce che questi campi vengano **rimossi da ogni risposta JSON**, anche se l'intero model venisse serializzato accidentalmente.

#### API key per il dispositivo (limitazione nota)

La route `POST /api/device/data` e attualmente pubblica (nessuna autenticazione richiesta). Si e trattato di una semplificazione deliberata per la release iniziale, motivata da due fattori: il progetto era stato concepito inizialmente come sistema privato e locale; inoltre l'aggiunta di una API key nel firmware ESP32 richiede un flash coordinato del dispositivo, attivita prevista come miglioramento a breve termine. Il commento nel file delle route lo dichiara esplicitamente:

```php
// IoT Device Route (Usually protected by a static API key, keeping public for simplicity today)
Route::post('/device/data', [TelemetryController::class, 'store']);
```

Una futura implementazione aggiungerebbe un secret condiviso nell'header `X-Device-Key`, verificato nel controller o in una middleware custom prima del blocco di validazione.

#### Prevenzione della SQL injection

Tutto l'accesso al database usa **Eloquent ORM**, che costruisce le query tramite **PDO prepared statements con parameter binding**. I valori forniti dall'utente **non vengono mai interpolati come stringhe SQL**. Questo rende la SQL injection impossibile per progettazione, senza sforzi addizionali da parte dello sviluppatore. Il tema viene approfondito in §2.2.6.

---

### 2.1.6 Integrita referenziale

#### Hard Foreign Keys (imposte dal DB)

`personal_access_tokens.tokenable_id` → `users.id` (gestita da Sanctum).  
L'eliminazione di un utente propaga correttamente attraverso i metodi token di Eloquent.

#### Soft (Logical) FK: `telemetries.device_name` → `device_settings.device_name`

Questa relazione e **intenzionalmente non imposta come `FOREIGN KEY` PostgreSQL**. Il motivo e fondamentale per il design del sistema:

> L'ESP32 deve poter inviare la sua prima lettura a `/api/device/data` senza che esista gia una riga in `device_settings`. Se fosse presente una hard FK, l'`INSERT INTO telemetries` fallirebbe con una violazione di foreign key la prima volta che un nuovo dispositivo si collega, perche non esisterebbe ancora una riga corrispondente in `device_settings`.

La soluzione e `firstOrCreate()` in `TelemetryController@store`, che legge o inserisce atomicamente la riga `device_settings` prima dell'inserimento della riga di telemetria. L'integrita logica viene quindi mantenuta **a livello applicativo**, non a livello di database.

Esiste comunque un vincolo `UNIQUE` su `device_settings.device_name`, che garantisce che ogni dispositivo fisico corrisponda a una sola riga di configurazione: questo fornisce la garanzia di cardinalita "uno-a-uno" senza richiedere una chain formale di FK.

---

## 2.2 — Backend Applicativo (10 pt)

### 2.2.1 Uso corretto di PHP

Il backend e scritto in **PHP 8.2** usando il framework **Laravel 11**, seguendo costantemente convenzioni PHP moderne:

- **Classi nominate e namespace** (`namespace App\Http\Controllers;`) conformi all'autoloading PSR-4.
- **Strict typing** applicato tramite funzionalita di PHP 8: parametri tipizzati (`string $device`), return type inference e match expressions.
- **`$request->only([...])`** al posto di `$request->all()` per whitelisting esplicito dei campi HTTP effettivamente inoltrati al database, prevenendo attacchi di mass-assignment.
- **Model Eloquent** che incapsulano tutta l'interazione con il database; nessun SQL raw compare nel codice applicativo.
- **`Hash::make()` / `Hash::check()`** per le password, mai `md5()` o `sha1()`.
- **`response()->json()`** per produrre JSON correttamente tipizzato con status code HTTP espliciti.

#### Perche Laravel invece di PHP puro

| Problema | PHP puro | Laravel |
|---|---|---|
| SQL injection | `pg_escape_string()` manuale | Prepared statement PDO tramite Eloquent |
| Hashing password | Ricordarsi di chiamare `password_hash()` | Cast `'password' => 'hashed'`, automatico |
| Validazione input | Blocchi custom `if (!is_numeric(...))` | `$request->validate([...])` in una riga |
| HTTP 422 su validazione fallita | `http_response_code(422); echo json_encode(...)` | Risposta JSON automatica |
| Astrazione DB | funzioni `pg_*` (solo PostgreSQL) | Eloquent, cambio DB tramite env var |
| Definizione route | `switch($_SERVER['REQUEST_URI'])` | `Route::post('/login', ...)` espressivo |
| Token auth | Tabella token artigianale e hashing manuale | Sanctum, gia pronto per uso produttivo |

---

### 2.2.2 Struttura dell'API

L'API segue convenzioni **REST**: ogni risorsa e associata a un URL, i metodi HTTP hanno un significato semantico, e le risposte usano status code standard.

**Struttura delle route (`routes/api.php`):**

```
Method  Endpoint                      Auth           Controller@method
──────  ────────────────────────────  ─────────────  ─────────────────────────────
GET     /api/                         Public         Closure (health check)
POST    /api/register                 Public         AuthController@register
POST    /api/login                    Public         AuthController@login
POST    /api/logout                   Bearer Token   AuthController@logout
GET     /api/user                     Bearer Token   UserController@profile
PUT     /api/user/profile             Bearer Token   UserController@updateProfile
GET     /api/telemetry                Bearer Token   TelemetryController@index
POST    /api/device/data              Public *       TelemetryController@store
GET     /api/device/{device}/settings Bearer Token   DeviceController@getSettings
PUT     /api/device/{device}/fan      Bearer Token   DeviceController@setFan
```

\* Pubblica in attesa dell'implementazione dell'API key (vedi §2.1.5).

**Responsabilita del layer MVC:**

```
Request  →  routes/api.php  →  Middleware  →  Controller  →  Model  →  DB
                                (auth:sanctum)  (validazione,  (Eloquent
                                                logica di      ORM)
                                                business,
                                                risposta JSON)
```

| Layer | File | Responsabilita |
|---|---|---|
| **Routes** | `routes/api.php` | Mappare verbo HTTP + URL a un metodo controller |
| **Middleware** | `auth:sanctum` | Validare il Bearer token prima che il controller venga eseguito |
| **Controllers** | `app/Http/Controllers/*.php` | Validare input, eseguire logica di business, restituire JSON |
| **Models** | `app/Models/*.php` | Rappresentare una tabella DB; eseguire query tramite Eloquent ORM |
| **Migrations** | `database/migrations/*.php` | Definizioni di schema DB versionate |

**Status code HTTP usati:**

| Codice | Significato | Quando viene usato |
|---|---|---|
| 200 OK | Successo | Risposte `GET` |
| 201 Created | Risorsa creata | `POST /register`, `POST /device/data` |
| 401 Unauthorized | Credenziali errate | Email/password sbagliate in login |
| 422 Unprocessable Entity | Validazione fallita | Generato automaticamente da `$request->validate()` |

---

### 2.2.3 Comunicazione microcontrollore-server

#### Hardware ESP32

L'ESP32 (Xtensa LX6 dual-core, 240 MHz, 520 KB SRAM) e collegato a:

| Sensore | Modello | Interfaccia | Misura |
|---|---|---|---|
| Ambientale | **BME680** | I²C (0x77) | Temperatura (°C), Umidita (%), Pressione (hPa), Resistenza del gas (kΩ) |
| Luce ambientale | **BH1750** | I²C (second bus) | Illuminazione (lux) |
| Microfono | **INMP441** | I²S (WS:27, SCK:14, SD:12) | Livello di pressione sonora, campioni 32-bit, RMS → dB SPL |
| Display 1 | **SH1107** 128×128 OLED | I²C (0x3C) | Mostra i valori dei sensori e lo stato della ventola |
| Display 2 | **SSD1306** 128×32 OLED | I²C (second bus, 0x3C) | Mostra l'orologio NTP in tempo reale (data + HH:MM) |
| Relay ventola | GPIO pin 25 | Uscita digitale | Controllato da `fanDesiredState` ricevuto nella risposta del server |

#### Protocollo di comunicazione

L'ESP32 si connette a Internet tramite **Wi‑Fi** (router domestico o hotspot mobile) e comunica con il backend via **HTTPS usando la libreria Arduino `HTTPClient`**.

**Ogni 10 secondi**, la funzione `sendTelemetry()`:

1. Serializza tutte le letture in un payload JSON usando `ArduinoJson`.
2. Invia una richiesta `POST` a `https://hhero.up.railway.app/api/device/data` con `Content-Type: application/json`.
3. Legge la risposta `201` ed estrae `fan_desired_state`.
4. Aggiorna `fanDesiredState`: la ventola viene fisicamente commutata alla successiva `digitalWrite()` nel loop principale (lag massimo: 500 ms).

```cpp
// Esempio di payload ESP32:
{
  "device_name":  "esp32_living_room",
  "temperature":  24.51,
  "humidity":     58.30,
  "air_pressure": 1012.45,
  "gas_kohm":     120.40,
  "light_lux":    350.00,
  "noise_db":     41.73,
  "fan_state":    false
}

// Risposta server (201):
{
  "telemetry": { ...stored row... },
  "fan_desired_state": true
}
```

#### Calcolo del livello di rumore (INMP441)

L'INMP441 e un microfono digitale I²S che fornisce campioni a 32 bit, left-aligned.
Il firmware ESP32:

1. Legge un buffer DMA di 512 campioni tramite `i2s_read()`.
2. Applica uno shift a destra di 8 bit a ciascun campione per recuperare il valore signed a 24 bit.
3. Calcola l'ampiezza **RMS** (Root Mean Square).
4. Converte in **dBFS**: `dBFS = 20 × log10(RMS / 2^23)`.
5. Aggiunge un offset di calibrazione (`DB_SPL_OFFSET = 110 dB`) per ottenere una scala dB SPL comprensibile.
6. Applica smoothing tramite **Exponential Moving Average (EMA, α = 0.20)** per eliminare spike da singolo campione.
7. Clampa il risultato nell'intervallo [20 dB, 120 dB].

---

### 2.2.4 Gestione delle richieste HTTP

Il flusso di ogni richiesta HTTP attraverso l'applicazione Laravel e il seguente:

```
1. PHP built-in server (public/router.php)
      Se il path richiesto e un file reale → viene servito direttamente.
      Altrimenti → la richiesta viene inoltrata a public/index.php.

2. public/index.php
      Carica l'autoloader di Composer.
      Esegue il bootstrap dell'applicazione Laravel (bootstrap/app.php).
      Passa la richiesta all'HTTP kernel.

3. HTTP Kernel (bootstrap/app.php)
      Esegue la global middleware (header CORS, trimming risposte JSON, ecc.).
      Effettua il match tra URL + metodo e le route definite in routes/api.php.

4. auth:sanctum middleware (sulle route protette)
      Legge l'header "Authorization: Bearer <token>".
      Calcola l'hash SHA-256 del token e lo cerca in personal_access_tokens.
      Se valido → imposta $request->user() sul model User corrispondente.
      Se non valido/assente → restituisce immediatamente 401 JSON; il controller non viene eseguito.

5. Metodo controller
      $request->validate([...]) — se la validazione fallisce, Laravel restituisce automaticamente
        una risposta 422 JSON con errori a livello di campo.
      Viene eseguita la logica di business (query Eloquent, calcolo ventola, ecc.).
      return response()->json([...], $statusCode) invia la risposta finale.
```

**CORS** e configurato in `bootstrap/app.php` tramite la middleware built-in `HandleCors` di Laravel, consentendo al dominio Netlify del frontend di chiamare il backend Railway in cross-origin.

---

### 2.2.5 Validazione degli input

Ogni metodo controller che accetta dati esterni richiama `$request->validate()`. Il fallimento e **automatico**: Laravel restituisce una risposta `422 Unprocessable Entity` in JSON con messaggi di errore per campo prima che qualsiasi logica di business venga eseguita.

#### `AuthController@register`

```php
$request->validate([
    'name'     => 'required|string',
    'email'    => 'required|string|unique:users,email',  // query al DB → 422 se duplicata
    'password' => 'required|string|min:8',
]);
```

`unique:users,email` viene valutata con una singola lookup indicizzata sul database. Se l'email esiste gia, l'utente riceve un messaggio di errore associato specificamente al campo `email` e la richiesta non raggiunge mai `User::create()`.

#### `TelemetryController@store` (dati ESP32)

```php
$request->validate([
    'device_name'  => 'required|string',
    'temperature'  => 'required|numeric',
    'humidity'     => 'required|numeric',
    'air_pressure' => 'required|numeric',
    'gas_kohm'     => 'nullable|numeric',
    'light_lux'    => 'nullable|numeric',
    'noise_db'     => 'nullable|numeric',
    'fan_state'    => 'nullable|boolean',
]);
```

La regola `nullable` consente ai firmware ESP32 meno recenti (che non inviano ancora i nuovi campi sensore) di continuare a funzionare. Questo design retrocompatibile evita la necessita di un flash coordinato del firmware ogni volta che viene aggiunto un nuovo sensore.

#### `DeviceController@setFan` (configurazione ventola dalla dashboard)

```php
$request->validate([
    'fan_mode'                => 'required|in:auto,manual',
    'fan_manual_state'        => 'required_if:fan_mode,manual|boolean',
    'fan_auto_temp_threshold' => 'nullable|numeric|min:0|max:100',
]);
```

`required_if:fan_mode,manual` assicura che `fan_manual_state` sia obbligatorio solo quando l'utente seleziona la modalita manuale. `min:0|max:100` impone limiti di coerenza fisica sul valore della soglia di temperatura.

#### `UserController@updateProfile` (semantica PATCH su una route PUT)

```php
$request->validate([
    'name'  => ['sometimes', 'string', 'max:255'],
    'email' => ['sometimes', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
]);
```

La regola `sometimes` permette aggiornamenti parziali: una richiesta che contiene solo `name` non produce un errore di validazione su `email`. `Rule::unique(...)->ignore($user->id)` consente a un utente di reinviare la propria email invariata senza colpire il vincolo di unicita.

---

### 2.2.6 Sicurezza — SQL Injection e oltre

#### SQL Injection: impossibile per progettazione

Ogni operazione sul database in questo progetto usa **Eloquent ORM**, che internamente costruisce tutte le query con **PDO prepared statements e parameter binding**. I valori forniti dall'utente vengono passati come parametri separati: **non vengono mai concatenati in una stringa SQL**.

```php
// Cio che Eloquent fa internamente quando scrivi:
User::where('email', $fields['email'])->first();

// PDO esegue:
// SELECT * FROM users WHERE email = ? LIMIT 1
// con $fields['email'] bindato come parametro.
// Qualunque valore invii l'utente — anche "' OR '1'='1" — viene trattato
// come stringa letterale, non come sintassi SQL.
```

Nota su `eval()`: i criteri menzionano la SQL injection tramite `eval()`. Questo progetto contiene **zero chiamate a `eval()`** in tutto il codice applicativo. L'uso di `eval()` con input utente non validato permetterebbe l'esecuzione arbitraria di codice PHP, cioe una vulnerabilita di Remote Code Execution (RCE) molto piu grave della SQL injection. Le best practice di sviluppo Laravel la vietano esplicitamente.

#### Protezione dal mass-assignment

Ogni model Eloquent definisce una allowlist esplicita in `$fillable`:

```php
protected $fillable = [
    'device_name', 'temperature', 'humidity', 'air_pressure',
    'gas_kohm', 'light_lux', 'noise_db', 'fan_state',
];
```

Combinata con `$request->only([...])` nel controller, questa crea una doppia barriera: il controller filtra i campi della request che possono raggiungere il model, e il model filtra quali di questi possono essere scritti nel DB. Un client malevolo che inviasse campi aggiuntivi (es. `{ "temperature": 25, "id": 999 }`) vedrebbe il campo `id` scartato silenziosamente in entrambi i layer, impedendo l'iniezione di primary key.

#### Password bcrypt

`Hash::make()` usa bcrypt con cost factor 12 (default PHP). Bcrypt e intenzionalmente lento, quindi rende gli attacchi brute-force computazionalmente non praticabili. `Hash::check()` lavora in constant time, prevenendo timing attack che potrebbero determinare se una password sia "vicina" a quella corretta.

#### Sicurezza dei token Sanctum

- Token plaintext: restituito al client una sola volta e immediatamente scartato lato server.
- Token memorizzato: solo hash SHA-256, quindi anche un dump completo del database non rivela alcun token utilizzabile.
- Revoca: `DELETE FROM personal_access_tokens WHERE id = ?` durante il logout.
- Token rubato dopo il logout: punta a una riga eliminata → 401 a ogni richiesta successiva.

#### Nascondere l'output sensibile

`User::$hidden = ['password', 'remember_token']` garantisce che queste colonne vengano rimosse dalla serializzazione anche se il codice restituisse accidentalmente l'intero oggetto model. Nessun hash password puo trapelare attraverso gli endpoint API.

---

## 2.3 — Architettura (5 pt)

### 2.3.1 Separazione Frontend / Backend

Il sistema e costruito secondo una **rigorosa architettura a tre livelli**. I tre layer comunicano esclusivamente tramite API HTTP documentate: nessun layer ha accesso diretto agli interni di un altro.

```
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 1 — PRESENTATION (React / Vite, Netlify)                     │
│                                                                     │
│  Dashboard Home Hero:                                               │
│  • Pagine Login e Registrazione (ottengono il Bearer token Sanctum)│
│  • Orologio NTP in tempo reale                                      │
│  • Grafici time-series per tutte le metriche dei sensori            │
│  • Pannello di controllo ventola (selettore modalita + input soglia)│
│  • Export CSV                                                       │
│  • Toggle light / dark theme                                        │
│                                                                     │
│  Comunica con il Layer 2 SOLO tramite: chiamate Axios HTTP a /api/*│
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTPS REST API
                                │ (Authorization: Bearer <token>)
┌───────────────────────────────▼─────────────────────────────────────┐
│  LAYER 2 — LOGIC / API (Laravel 11, Railway)                        │
│                                                                     │
│  • Validazione input (422 su dati non validi)                      │
│  • Autenticazione (token Sanctum)                                  │
│  • Logica di business (calcolo del comando ventola)                │
│  • Persistenza dati (Eloquent ORM)                                 │
│  • Boundary di sicurezza (nessun accesso DB raw dall'esterno)      │
│                                                                     │
│  Comunica con il Layer 3 SOLO tramite: PDO / Eloquent              │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ TCP/SSL (protocollo PDO/PostgreSQL)
                                │ tramite pooler PgBouncer di Supabase
┌───────────────────────────────▼─────────────────────────────────────┐
│  LAYER 3 — DATA (PostgreSQL, Supabase EU-Central)                   │
│                                                                     │
│  • users, personal_access_tokens, telemetries, device_settings     │
│  • Transazioni ACID, vincoli unique, enforcement enum              │
│  • Row-level security pronta (attualmente gestita a livello API)   │
└─────────────────────────────────────────────────────────────────────┘

             ▲ Percorso dati separato (nessuna auth richiesta):
             │
┌────────────┴─────────────────────────────────────────────────────────┐
│  ESP32 (Wi‑Fi / HTTP, HTTPS POST ogni 10 s)                          │
│  • Legge i sensori, serializza JSON, invia a POST /api/device/data  │
│  • Riceve fan_desired_state nella risposta 201                      │
│  • Comanda il relay della ventola senza endpoint di polling         │
└──────────────────────────────────────────────────────────────────────┘
```

**Benefici di questa separazione:**
- Il frontend React puo essere riscritto in un framework completamente diverso (Vue, Angular, mobile nativo) senza toccare una singola riga del backend.
- Il database puo essere migrato da Supabase a qualunque host PostgreSQL modificando quattro env var.
- Il firmware ESP32 puo essere aggiornato indipendentemente da backend e frontend, perche il contratto (schema JSON di `/api/device/data`) e stabile e retrocompatibile (i nuovi campi sono `nullable`).
- Ogni layer viene distribuito indipendentemente: Netlify (frontend), Railway (backend), Supabase (DB), con provider e strategie di scaling diverse.

---

### 2.3.2 Modularita

Il backend e suddiviso in unita piccole e a responsabilita singola:

#### Controller (una responsabilita ciascuno)

| Controller | Responsabilita unica |
|---|---|
| `AuthController` | Registrazione utente, login, logout |
| `UserController` | Lettura e aggiornamento del profilo dell'utente autenticato |
| `TelemetryController` | Memorizzazione delle letture ESP32 e fornitura della cronologia delle ultime 20 letture alla dashboard |
| `DeviceController` | Lettura e aggiornamento della configurazione della ventola per dispositivo |

Nessun controller interviene sull'ambito di un altro. `TelemetryController@store` legge `DeviceSettings` ma non modifica mai la tabella `User`.

#### Model (una tabella ciascuno)

`User`, `Telemetry`, `DeviceSettings`: ogni model incapsula la definizione di schema (`$fillable`, `$casts`, `$hidden`) di una sola tabella. La logica di business che coinvolge piu model risiede nel controller, non nel model.

#### Route (dichiarative, centralizzate)

`routes/api.php` e la single source of truth dell'intera superficie API. Aggiungere un nuovo endpoint significa aggiungere una sola riga qui e un solo metodo nel controller: nessun altro file deve cambiare.

#### Migration (incrementali, versionate)

Ogni file migration modifica esattamente un aspetto dello schema. La cronologia delle migration e:

```
0001_01_01_000000 — Create users, sessions, password_reset_tokens  (Laravel scaffold)
0001_01_01_000001 — Create cache tables                            (Laravel scaffold)
0001_01_01_000002 — Create jobs tables                             (Laravel scaffold)
2025_11_26_190929 — Create personal_access_tokens                 (Sanctum scaffold)
2025_11_26_191105 — Create telemetries (core sensor table)
2026_01_26_000000 — Add username + avatar to users
2026_01_26_230938 — Add google_id to users
2026_02_22_000000 — Add gas_kohm, light_lux, noise_db, fan_state to telemetries
2026_02_22_000001 — Create device_settings
```

Ogni nuova feature (nuovo sensore, prototipo Google OAuth, controllo ventola) corrisponde a una migration separata e reversibile in modo indipendente con `php artisan migrate:rollback`.

---

### 2.3.3 Scalabilita

Diverse scelte progettuali sono state prese con la scalabilita in mente:

#### Connection Pooling (PgBouncer)

Railway puo avviare simultaneamente piu processi worker PHP. Ogni worker aprirebbe normalmente la propria connessione PostgreSQL. PostgreSQL ha pero un limite fisso di connessioni (~100 su un'istanza Supabase free). Il backend si connette tramite l'endpoint del **pooler PgBouncer di Supabase** (`aws-1-eu-central-1.pooler.supabase.com`), che multiplexerizza molte connessioni PHP su un numero minore di connessioni PostgreSQL reali, prevenendo l'esaurimento delle connessioni sotto carico.

#### API stateless

Il backend e **completamente stateless**: ogni richiesta trasporta tutte le informazioni di autenticazione necessarie nel proprio header `Authorization: Bearer <token>`. Nessuna sessione server-side viene mantenuta tra le richieste. Questo rende lo **scaling orizzontale** immediato: aggiungere piu worker/container Railway non richiede alcuna configurazione. Un load balancer puo instradare qualsiasi richiesta verso qualsiasi worker.

#### Tabella telemetrie append-only

`telemetries` e append-only: solo operazioni `INSERT` e `SELECT`, mai `UPDATE`. Si tratta del pattern di accesso ideale per dati time-series:
- Nessuna contesa di row-level locking tra writer.
- Un indice B-tree su `created_at` rende la query `ORDER BY created_at DESC LIMIT 20` a tempo costante anche in presenza di milioni di righe.
- In futuro, il partizionamento per mese/anno e diretto e non richiede modifiche al codice applicativo.

#### Intervallo di polling configurabile

L'intervallo di invio dell'ESP32 (`TELEMETRY_INTERVAL = 10000 ms`) e definito come costante nel firmware. Se il backend dovesse ridurre il carico di scrittura, il valore puo essere aumentato; se fosse necessaria una risoluzione temporale maggiore, puo essere ridotto, senza alcuna modifica al backend.

#### Percorso di scalabilita futura

- **Dispositivi multipli:** `device_name` e gia un campo di primo livello sia in `telemetries` sia in `device_settings`; un secondo ESP32 con nome diverso si auto-registra alla prima POST ed e immediatamente visibile in API.
- **Multi-tenancy (proprieta della stanza):** aggiungere una foreign key `user_id` a `device_settings` consentirebbe a utenti diversi di possedere dispositivi diversi senza ristrutturare lo schema.
- **Caching:** l'endpoint `GET /api/telemetry` potrebbe mettere in cache il risultato di 20 righe in Redis/Memcached tramite `Cache::remember()` di Laravel, gestendo molti utenti dashboard concorrenti senza colpire il database a ogni refresh.

---

### 2.3.4 Manutenibilita

#### Schema versionato in controllo di versione

Ogni modifica di schema e un file migration commitato su Git. Qualsiasi sviluppatore (o pipeline CI/CD) puo riprodurre lo stato esatto del database di produzione con un unico comando: `php artisan migrate`. Non esiste SQL manuale da eseguire, ne documentazione del tipo "ricordati di aggiungere questa colonna": la storia e nel codice.

#### Codebase documentata

Ogni controller, model, migration e file di route contiene commenti inline dettagliati che spiegano:
- Di cosa e responsabile il file.
- Perche e stata presa ciascuna decisione progettuale (ad esempio perche usare `nullable` per le nuove colonne sensoriali, oppure perche `request->only()` invece di `request->all()`).
- Il flusso dei dati dalla richiesta HTTP in ingresso al database e ritorno.
- Gli edge case gestiti (es. `firstOrCreate()` per l'auto-registrazione di nuovi dispositivi).

I file di documentazione esterni (`CONSTRAINTS_RISKMANAGEMENT.md`, `BACKEND_INFRA_DOC_IT.md`) forniscono spiegazioni di livello piu alto, diagrammi ER, tabelle di riferimento API e dimostrazioni della normalizzazione.

#### Configurazione basata su ambiente

Tutti i valori dipendenti dall'ambiente — credenziali database, application key, `$PORT` di Railway, API base URL — vengono salvati in `.env` (locale) oppure nelle environment variables segrete di Railway (produzione). Nessun segreto e hardcoded nel codice sorgente o commitato su Git. Passare da Supabase a un altro host PostgreSQL richiede solo la modifica di quattro environment variable, senza cambiamenti al codice.

#### Dockerfile + docker-compose

Il Dockerfile consente a qualunque sviluppatore di eseguire localmente lo stesso ambiente di produzione con un solo comando (`docker-compose up --build`), eliminando i problemi del tipo "works on my machine" indipendentemente dalla versione PHP locale. Il `docker-compose.yml` monta la directory dei sorgenti come volume, cosi le modifiche al codice si riflettono immediatamente senza rebuild del container.

#### Sicurezza del rollback

- Ogni migration possiede un metodo `down()` che annulla precisamente quanto definito nel relativo `up()`.
- `php artisan migrate:rollback` puo annullare l'ultimo batch di migration.
- Poiche il database e PostgreSQL (DDL transazionale), una migration fallita viene automaticamente rollbackata: lo schema non resta mai in uno stato parziale o corrotto (a differenza di MySQL, dove le modifiche DDL non sono transazionali).

#### CLI Artisan

Lo strumento a riga di comando `artisan` di Laravel fornisce utilita che eliminano boilerplate manuale: `php artisan make:controller`, `php artisan make:model --migration`, `php artisan migrate:status`, `php artisan tinker` (REPL interattiva per testare query Eloquent direttamente sul database). Questo mantiene rapido il ciclo di feedback per lo sviluppatore e coerente la codebase.

---

*Fine del documento — Home Hero Backend e Infrastruttura v1.0*