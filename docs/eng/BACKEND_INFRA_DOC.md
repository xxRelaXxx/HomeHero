# Home Hero — Backend & Infrastructure Documentation
### Evaluation Criteria 2.1 · 2.2 · 2.3 · 4.3 · 4.4

> **Project:** Home Hero — Intelligent Environmental Monitoring Station  
> **Backend:** Laravel 12 REST API, deployed on Railway  
> **Database:** PostgreSQL via Supabase  
> **Team:** Roman (Backend & Architecture) · Luka (Frontend) · Shaeek (Hardware) · Matteo (QA/Docs) · De Togni (UI/UX & PM)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [2.1 — Database (10 pt)](#21--database-10-pt)
   - [2.1.1 DB Schema Design](#211-db-schema-design)
   - [2.1.2 Data Normalization](#212-data-normalization)
   - [2.1.3 Table Definitions](#213-table-definitions)
   - [2.1.4 Relationship Management](#214-relationship-management)
   - [2.1.5 Data Security](#215-data-security)
   - [2.1.6 Referential Integrity](#216-referential-integrity)
3. [2.2 — Application Backend (10 pt)](#22--application-backend-10-pt)
   - [2.2.1 Correct PHP Usage](#221-correct-php-usage)
   - [2.2.2 API Structure](#222-api-structure)
   - [2.2.3 Microcontroller–Server Communication](#223-microcontrollerserver-communication)
   - [2.2.4 HTTP Request Handling](#224-http-request-handling)
   - [2.2.5 Input Validation](#225-input-validation)
   - [2.2.6 Security — SQL Injection & Beyond](#226-security--sql-injection--beyond)
4. [2.3 — Architecture (5 pt)](#23--architecture-5-pt)
   - [2.3.1 Frontend / Backend Separation](#231-frontend--backend-separation)
   - [2.3.2 Modularity](#232-modularity)
   - [2.3.3 Scalability](#233-scalability)
   - [2.3.4 Maintainability](#234-maintainability)
5. [4.3 — Project Constraints (4 pt)](#43--project-constraints-4-pt)
   - [4.3.1 Technological Constraints](#431-technological-constraints)
   - [4.3.2 Economic Constraints](#432-economic-constraints)
   - [4.3.3 Time Constraints](#433-time-constraints)
   - [4.3.4 Regulatory Constraints](#434-regulatory-constraints)
6. [4.4 — Risk Management (4 pt)](#44--risk-management-4-pt)
   - [4.4.1 Risk Identification](#441-risk-identification)
   - [4.4.2 Impact Analysis](#442-impact-analysis)
   - [4.4.3 Probability and Mitigation Strategies](#443-probability-and-mitigation-strategies)
   - [4.4.4 Contingency Plans](#444-contingency-plans)

---

## 1. Project Overview

**Home Hero** is a smart home environmental monitoring and control system. An ESP32
microcontroller installed in a room reads temperature, relative humidity,
atmospheric pressure, air quality (gas resistance in kΩ), ambient light (lux), and
noise level (dB SPL) using physical sensors, and also drives a ventilation fan.
Sensor data is displayed locally on two OLED screens (one showing values, one showing
a real-time NTP clock) and transmitted over Wi-Fi to a cloud backend every 10 seconds.

The cloud backend — a **Laravel 12 REST API** deployed on **Railway** — persists
every reading in a **PostgreSQL database** hosted on **Supabase**. A **React
dashboard** (built with Vite, deployed on Netlify) allows registered users to
visualise historical sensor graphs, export data as CSV, and remotely configure the
ventilation fan (automatic threshold mode or manual on/off), with the command
reaching the ESP32 on its next data upload without any separate polling endpoint.

The project is publicly accessible:
- Backend API: `https://hhero.up.railway.app/api`
- Frontend: deployed on Netlify under the "Home Hero" brand

---

## 2.1 — Database (10 pt)

### 2.1.1 DB Schema Design

The schema was designed around two core principles:

1. **Separation of concerns between time-series data and configuration data.**  
   Sensor readings are an ever-growing append-only log — they must never be
   modified after insertion. Configuration (fan settings) is a tiny mutable record
   that is updated in place. Mixing these two concerns in a single table would
   violate the Single Responsibility Principle at the database level.

2. **Progressive enhancement via migrations.**  
   The schema started with a minimal viable set of columns and was extended
   over time through versioned migration files, without ever recreating tables or
   breaking existing data.

The final schema comprises the following **application tables** and several
**Laravel scaffold tables** (infrastructure):

```
users                     — Dashboard user accounts
personal_access_tokens    — Sanctum API tokens (one per login session)
telemetries               — Append-only sensor reading log (ESP32 → DB)
device_settings           — Mutable fan configuration (one row per device)
```

Scaffold tables (part of the default Laravel install, not used by application logic):
`password_reset_tokens`, `sessions`, `cache`, `cache_locks`, `jobs`,
`job_batches`, `failed_jobs`.

#### Entity–Relationship Overview (simplified)

```
┌──────────────────────────┐         ┌──────────────────────────────────────┐
│          users           │         │        personal_access_tokens        │
├──────────────────────────┤         ├──────────────────────────────────────┤
│ PK  id                   │◄────────│ tokenable_id (→ users.id)            │
│     name                 │  1 : N  │ tokenable_type                       │
│     email  (UNIQUE)      │         │ token  (SHA-256 hash, UNIQUE)        │
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

The link between `telemetries` and `device_settings` is a **logical join on
`device_name`** rather than a hard foreign key. This design decision is explained
in §2.1.6 (referential integrity).

---

### 2.1.2 Data Normalization

Normalization is progressively applied through the four classical normal forms.

#### First Normal Form (1NF)

> Every column contains only atomic (indivisible) values; no repeating groups exist;
> every row is uniquely identifiable by a primary key.

| Table | Atomic values? | No repeating groups? | PK exists? | 1NF |
|---|:---:|:---:|:---:|:---:|
| `users` | ✓ | ✓ | `id` | **✓** |
| `personal_access_tokens` | ✓ * | ✓ | `id` | **✓** |
| `telemetries` | ✓ | ✓ | `id` | **✓** |
| `device_settings` | ✓ | ✓ | `id` | **✓** |

\* The `abilities` column in `personal_access_tokens` stores a JSON string
(`["*"]`). At the column level this is a single TEXT atom — the database does not
see an array, merely a string. This is an accepted trade-off when using an
object-relational mapping layer such as Eloquent and is standard Sanctum practice.

#### Second Normal Form (2NF)

> The relation is in 1NF, and every non-key attribute is **fully** functionally
> dependent on the **entire** primary key (no partial dependencies on part of a
> composite key).

A partial dependency can only arise when the primary key is **composite**. Every
table here uses a **single-column auto-incrementing integer** as the PK. A
single-column PK has no proper subsets, so partial dependencies are structurally
impossible.

**Conclusion:** All tables satisfy 2NF by definition. ✓

#### Third Normal Form (3NF)

> The relation is in 2NF, and no non-key attribute is **transitively** dependent on
> the primary key through another non-key attribute.  
> Rule: if `A → B` and `B → C` and `B` is not a candidate key, then `C` is a
> transitive dependency and must be separated into its own table.

**`users`:**  
`email` is a candidate key (unique constraint). The chain `id → email → name` is
therefore a dependency between two candidate keys — not a transitive violation. No
non-key attribute determines any other non-key attribute. ✓

**`personal_access_tokens`:**  
`token` is a candidate key (unique constraint). `tokenable_id` determines which
user owns the token but does not determine `abilities` or `last_used_at` — a user
can have many tokens with different metadata. No transitive dependency. ✓

**`device_settings`:**  
Potential concern: does `fan_mode ∈ {auto, manual}` determine `fan_manual_state`
or `fan_auto_temp_threshold`?  
No. Knowing that `fan_mode = 'auto'` does **not** tell you the threshold value
(it could be 25 °C, 28 °C, 30 °C — it is a per-device choice). `fan_mode` is a
semantic selector, not a determinant of a field's value in the relational algebra
sense. All non-key attributes depend only and directly on `id`. ✓

**`telemetries`:**  
`device_name` does not determine `temperature` — many readings share the same
device with completely different sensor values. No sensor column determines another
(temperature and humidity are independent physical measurements). ✓

**Normalization summary:**

| Table | 1NF | 2NF | 3NF |
|---|:---:|:---:|:---:|
| `users` | ✓ | ✓ | ✓ |
| `personal_access_tokens` | ✓ | ✓ | ✓ |
| `telemetries` | ✓ | ✓ | ✓ |
| `device_settings` | ✓ | ✓ | ✓ |

The schema is fully normalized to **Third Normal Form (3NF)**, which is the
industry-standard target for transactional OLTP databases.

---

### 2.1.3 Table Definitions

All tables are created and versioned through **Laravel migrations** — PHP files
that describe schema changes as code. Running `php artisan migrate` applies all
pending migrations in chronological order, making the schema fully reproducible
from scratch on any environment. The `migrations` meta-table tracks which files
have already been applied.

---

#### `users`

Created by migrations:  
`0001_01_01_000000_create_users_table.php` +  
`2026_01_26_000000_add_profile_fields_to_users_table.php` +  
`2026_01_26_230938_add_google_id_to_users_table.php`

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | `BIGINT` | PK, AUTO_INCREMENT | Unique row identifier |
| `name` | `VARCHAR(255)` | NOT NULL | Display name shown in the dashboard |
| `username` | `VARCHAR(255)` | UNIQUE, NULLABLE | Optional handle, reserved for future features |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | Login credential; uniqueness enforced at DB level |
| `email_verified_at` | `TIMESTAMP` | NULLABLE | Ready for email-verification flow (currently not active) |
| `password` | `VARCHAR(255)` | NOT NULL | bcrypt hash (12 rounds); **never stored in plain text** |
| `avatar` | `VARCHAR(255)` | NULLABLE | URL to profile picture (populated by Google OAuth when enabled) |
| `google_id` | `VARCHAR(255)` | NULLABLE | Google OAuth subject ID; reserved for OAuth re-activation |
| `remember_token` | `VARCHAR(100)` | NULLABLE | Laravel Authenticatable contract field |
| `created_at` | `TIMESTAMP` | AUTO | Set once on INSERT |
| `updated_at` | `TIMESTAMP` | AUTO | Updated by Eloquent on every save |

---

#### `personal_access_tokens`

Created by migration: `2025_11_26_190929_create_personal_access_tokens_table.php`  
Managed entirely by **Laravel Sanctum**.

| Column | Type | Purpose |
|---|---|---|
| `id` | `BIGINT PK` | Row identifier |
| `tokenable_type` | `VARCHAR` | Model class that owns this token (`App\Models\User`) |
| `tokenable_id` | `BIGINT` | ID of the owning model — together with `tokenable_type` forms a polymorphic FK |
| `name` | `VARCHAR` | Human label for the token (`myapptoken`) |
| `token` | `VARCHAR(64)` UNIQUE | SHA-256 hash of the actual token string; the plaintext is returned only once on creation |
| `abilities` | `TEXT` | JSON permission array (`["*"]` = full access) |
| `last_used_at` | `TIMESTAMP` NULLABLE | Updated on every authenticated request; useful for session auditing |
| `expires_at` | `TIMESTAMP` NULLABLE | `NULL` in this project (tokens are revoked explicitly via logout) |
| `created_at / updated_at` | `TIMESTAMPS` | Eloquent auto-managed |

---

#### `telemetries`

Created by: `2025_11_26_191105_create_telemetries_table.php`  
Extended by: `2026_02_22_000000_add_new_sensors_to_telemetries_table.php`

This is an **append-only time-series log**. Rows are never updated after insertion;
they represent immutable snapshots of physical reality at a point in time.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | `BIGINT` | PK | Unique row identifier; monotonically increasing = implicit time order |
| `device_name` | `VARCHAR(255)` | NOT NULL | Identifies the physical device (e.g. `esp32_living_room`) |
| `temperature` | `FLOAT` | NOT NULL | Air temperature in °C (BME680) |
| `humidity` | `FLOAT` | NOT NULL | Relative humidity in % (BME680) |
| `air_pressure` | `FLOAT` | NOT NULL | Atmospheric pressure in hPa (BME680) |
| `gas_kohm` | `FLOAT` | NULLABLE | Gas resistance in kΩ — air quality proxy (BME680). Higher = cleaner air. Added Feb 2026; nullable for backward compatibility with older firmware |
| `light_lux` | `FLOAT` | NULLABLE | Ambient light intensity in lux (BH1750). Added Feb 2026 |
| `noise_db` | `FLOAT` | NULLABLE | Ambient sound pressure level in dB SPL (INMP441 I²S microphone). Added Feb 2026 |
| `fan_state` | `BOOLEAN` | DEFAULT `false` | Physical state of the fan relay **at the time of this reading** (historical record, distinct from the commanded `fan_desired_state`) |
| `created_at` | `TIMESTAMP` | AUTO | X-axis for all time-series charts |
| `updated_at` | `TIMESTAMP` | AUTO | Never changes (rows are never updated) |

**Design rationale for NULLABLE sensor columns:** Adding `NOT NULL` columns without
a default value to a table that already contains rows would cause the migration to
fail on the existing data. Making them `NULLABLE` is the only safe, non-destructive
migration strategy on a live production database. The API's `nullable` validation
rule and the frontend's null-safe rendering allow a smooth upgrade path for any
device running older firmware.

---

#### `device_settings`

Created by: `2026_02_22_000001_create_device_settings_table.php`

This table is a **mutable configuration store** — the exact opposite of
`telemetries`. There is always exactly **one row per physical device**, and it is
updated in place.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | `BIGINT` | PK | Row identifier |
| `device_name` | `VARCHAR(255)` | UNIQUE, NOT NULL | Must match exactly what the ESP32 sends in its POST body |
| `fan_mode` | `ENUM('auto','manual')` | DEFAULT `'auto'` | `auto` = backend turns fan on/off based on temperature threshold; `manual` = user forces a state |
| `fan_manual_state` | `BOOLEAN` | DEFAULT `false` | Target state in manual mode (true = ON, false = OFF) |
| `fan_auto_temp_threshold` | `FLOAT` | DEFAULT `30.0` | Temperature in °C above which the fan turns on automatically |
| `created_at / updated_at` | `TIMESTAMPS` | AUTO | Elapsed since last dashboard interaction |

---

### 2.1.4 Relationship Management

The schema defines the following relationships:

#### `users` → `personal_access_tokens` (One-to-Many, hard FK)

One user can own many API tokens (one per active login session / device). The
relationship is a **polymorphic** one managed by Sanctum via the
`(tokenable_type, tokenable_id)` pair. In this project `tokenable_type` is always
`App\Models\User` and `tokenable_id` is the user's `id`. On logout, Sanctum deletes
the specific token row, revoking access without affecting other active sessions.

```php
// On logout — delete only the token used for THIS request:
$request->user()->currentAccessToken()->delete();
```

#### `telemetries` → `device_settings` (Many-to-One, logical/soft FK)

Many telemetry readings belong to one device configuration. The link is made
through the `device_name` string column, present in both tables.

This is **not enforced as a database-level foreign key** constraint — the reasons
are detailed in §2.1.6. At the application level the relationship is managed in
`TelemetryController@store`, which calls `DeviceSettings::firstOrCreate()` to read
(or auto-create) the device's configuration row whenever a new reading arrives.

```php
// Auto-registers a device on its very first POST:
$settings = DeviceSettings::firstOrCreate(
    ['device_name' => $request->device_name],
    ['fan_mode' => 'auto', 'fan_manual_state' => false, 'fan_auto_temp_threshold' => 30.0]
);
```

#### Fan Command Flow (relationship across three actors)

```
React Dashboard                 Laravel API                    ESP32
      │                              │                            │
      │── PUT /device/{name}/fan ───►│                            │
      │   { fan_mode: "auto",        │                            │
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

All three actors interact through shared **`device_name`** as the coordination key,
so no polling loop is needed on the ESP32 side: it receives the updated command
bundled inside the HTTP response to its regular data upload.

---

### 2.1.5 Data Security

#### Password Hashing

Passwords are **never stored in plain text**. Two layers of protection are active:

1. `AuthController@register` explicitly calls `Hash::make($password)` (bcrypt,
   12 rounds) before calling `User::create()`.
2. The `User` model's `$casts` array includes `'password' => 'hashed'`, which
   applies bcrypt automatically on any write to that attribute, acting as a
   second safeguard even if `Hash::make()` is accidentally omitted.

```php
// bcrypt comparison on login — constant-time, no timing attack:
if (!Hash::check($fields['password'], $user->password)) { ... }
```

#### Token Security (Sanctum)

- The raw token string is returned to the client **exactly once** (on
  creation) and is **never stored in the database**.
- The database stores only the **SHA-256 hash** (64 hex characters) of the token.
- On logout, the token row is physically **deleted** from `personal_access_tokens`,
  rendering any stolen copy immediately useless.
- `$hidden = ['password', 'remember_token']` on the `User` model guarantees these
  fields are **stripped from every JSON response**, even if the entire model is
  accidentally serialised.

#### API Key for the Device (known limitation)

The `POST /api/device/data` route is currently public (no authentication required).
This was a deliberate simplification for the initial release, motivated by two
factors: the project was originally planned as a private, local system; and adding
an API key to the ESP32 firmware requires a coordinated firmware flash — a step
planned as a near-future improvement. The comment in the route file explicitly
acknowledges this:

```php
// IoT Device Route (Usually protected by a static API key, keeping public for simplicity today)
Route::post('/device/data', [TelemetryController::class, 'store']);
```

A future implementation would add a shared secret in an `X-Device-Key` header,
verified in the controller or as a custom middleware before the validation block.

#### SQL Injection Prevention

All database access uses **Eloquent ORM**, which builds queries through **PDO
prepared statements with parameter binding**. User-supplied values are **never
string-interpolated into SQL**. This makes SQL injection impossible by design,
with no additional effort required by the developer. This is described in detail
in §2.2.6.

---

### 2.1.6 Referential Integrity

#### Hard Foreign Keys (enforced by the DB)

`personal_access_tokens.tokenable_id` → `users.id` (managed by Sanctum).  
Deleting a user cascades correctly through Eloquent's token methods.

#### Soft (Logical) FK: `telemetries.device_name` → `device_settings.device_name`

This relationship is **intentionally not enforced as a PostgreSQL `FOREIGN KEY`
constraint**. The reason is fundamental to the system's design:

> The ESP32 must be able to send its first reading to `/api/device/data` without
> a pre-existing row in `device_settings`. If a hard FK were in place, the
> `INSERT INTO telemetries` would fail with a foreign key violation the very
> first time a new device connects, because no matching `device_settings` row
> exists yet.

The solution is `firstOrCreate()` in `TelemetryController@store`, which
atomically reads or inserts the `device_settings` row before inserting the
telemetry row. The logical integrity is therefore maintained **at the application
layer**, not the database layer.

A `UNIQUE` constraint on `device_settings.device_name` does exist, guaranteeing
that each physical device maps to exactly one configuration row — this provides
the "one-to-one" cardinality guarantee without requiring a formal FK chain.

---

## 2.2 — Application Backend (10 pt)

### 2.2.1 Correct PHP Usage

The backend is written in **PHP 8.2** using the **Laravel 11** framework, following
modern PHP conventions throughout:

- **Named classes and namespaces** (`namespace App\Http\Controllers;`) follow
  PSR-4 autoloading.
- **Strict typing** is enforced through PHP 8 features: typed parameters
  (`string $device`), return type inference, and match expressions.
- **`$request->only([...])`** is used instead of `$request->all()` to whitelist
  exactly which fields from the HTTP request are passed to the database,
  preventing mass-assignment attacks.
- **Eloquent models** encapsulate all database interaction; raw SQL is never
  written anywhere in the application code.
- **`Hash::make()` / `Hash::check()`** for passwords — never `md5()` or `sha1()`.
- **`response()->json()`** produces correctly typed JSON responses with explicit
  HTTP status codes.

#### Why Laravel over plain PHP

| Concern | Plain PHP | Laravel |
|---|---|---|
| SQL injection | Manual `pg_escape_string()` | PDO prepared statements via Eloquent |
| Password hashing | Remember to call `password_hash()` | `'password' => 'hashed'` cast, automatic |
| Input validation | Custom `if (!is_numeric(...))` blocks | `$request->validate([...])` — one line |
| HTTP 422 on validation failure | `http_response_code(422); echo json_encode(...)` | Automatic JSON error response |
| DB abstraction | pg_\* functions (PostgreSQL-only) | Eloquent — switch DB by changing one env var |
| Route definition | `switch($_SERVER['REQUEST_URI'])` | Expressive `Route::post('/login', ...)` |
| Auth tokens | Hand-rolled token table and hashing | Sanctum, production-grade out of the box |

---

### 2.2.2 API Structure

The API follows **REST** conventions: each resource maps to a URL, HTTP methods
carry semantic meaning, and responses use standard status codes.

**Route structure (`routes/api.php`):**

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

\* Public pending API key implementation (see §2.1.5).

**MVC Layer responsibilities:**

```
Request  →  routes/api.php  →  Middleware  →  Controller  →  Model  →  DB
                                (auth:sanctum)  (validate,    (Eloquent
                                                business      ORM)
                                                logic, JSON
                                                response)
```

| Layer | File(s) | Responsibility |
|---|---|---|
| **Routes** | `routes/api.php` | Map HTTP verb + URL to a controller method |
| **Middleware** | `auth:sanctum` | Validate the Bearer token before the controller runs |
| **Controllers** | `app/Http/Controllers/*.php` | Validate input, execute business logic, return JSON |
| **Models** | `app/Models/*.php` | Represent a DB table; execute queries via Eloquent ORM |
| **Migrations** | `database/migrations/*.php` | Version-controlled DB schema definitions |

**HTTP status codes used:**

| Code | Meaning | When used |
|---|---|---|
| 200 OK | Success | `GET` responses |
| 201 Created | Resource created | `POST /register`, `POST /device/data` |
| 401 Unauthorized | Bad credentials | Wrong email/password on login |
| 422 Unprocessable Entity | Validation failed | Automatic on `$request->validate()` failure |

---

### 2.2.3 Microcontroller–Server Communication

#### ESP32 Hardware

The ESP32 (Xtensa LX6 dual-core, 240 MHz, 520 KB SRAM) is connected to:

| Sensor | Model | Interface | Measures |
|---|---|---|---|
| Environmental | **BME680** | I²C (0x77) | Temperature (°C), Humidity (%), Pressure (hPa), Gas resistance (kΩ) |
| Ambient light | **BH1750** | I²C (second bus) | Illuminance (lux) |
| Microphone | **INMP441** | I²S (WS:27, SCK:14, SD:12) | Sound pressure level — 32-bit samples, RMS → dB SPL |
| Display 1 | **SH1107** 128×128 OLED | I²C (0x3C) | Shows sensor values and fan state |
| Display 2 | **SSD1306** 128×32 OLED | I²C (second bus, 0x3C) | Shows real-time NTP clock (date + HH:MM) |
| Fan relay | GPIO pin 25 | Digital output | Controlled by `fanDesiredState` received in server response |

#### Communication Protocol

The ESP32 connects to the internet via **Wi-Fi** (home router or mobile hotspot)
and communicates with the backend over **HTTPS using the `HTTPClient` Arduino library**.

**Every 10 seconds**, the `sendTelemetry()` function:

1. Serialises all readings into a JSON payload using `ArduinoJson`.
2. Sends a `POST` request to `https://hhero.up.railway.app/api/device/data` with
   `Content-Type: application/json`.
3. Reads the `201` response and extracts `fan_desired_state`.
4. Updates `fanDesiredState` — the fan is physically switched on the main loop's
   next `digitalWrite()` call (max lag: 500 ms).

```cpp
// ESP32 payload example:
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

// Server response (201):
{
  "telemetry": { ...stored row... },
  "fan_desired_state": true
}
```

#### Noise Level Calculation (INMP441)

The INMP441 is a digital I²S microphone delivering 32-bit, left-aligned samples.
The ESP32 firmware:

1. Reads a DMA buffer of 512 samples via `i2s_read()`.
2. Right-shifts each sample by 8 bits to recover the 24-bit signed value.
3. Computes the **RMS** (Root Mean Square) amplitude.
4. Converts to **dBFS**: `dBFS = 20 × log10(RMS / 2^23)`.
5. Adds a calibration offset (`DB_SPL_OFFSET = 110 dB`) to map to a
   human-meaningful dB SPL scale.
6. Applies **Exponential Moving Average (EMA, α = 0.20)** smoothing to
   eliminate single-sample spikes.
7. Clamps the result to [20 dB, 120 dB].

---

### 2.2.4 HTTP Request Handling

The flow of every HTTP request through the Laravel application:

```
1. PHP built-in server (public/router.php)
      If the requested path is a real file → serve it directly.
      Otherwise → forward to public/index.php.

2. public/index.php
      Loads Composer's autoloader.
      Bootstraps the Laravel application (bootstrap/app.php).
      Hands the request to the HTTP kernel.

3. HTTP Kernel (bootstrap/app.php)
      Runs global middleware (CORS headers, JSON response trimming, etc.).
      Matches the request URL + method against routes/api.php.

4. auth:sanctum middleware (on protected routes)
      Reads the "Authorization: Bearer <token>" header.
      SHA-256-hashes the token and looks it up in personal_access_tokens.
      If valid → sets $request->user() to the matching User model.
      If invalid/missing → returns 401 JSON immediately; controller never runs.

5. Controller method
      $request->validate([...]) — if validation fails, Laravel returns
        a 422 JSON response with field-level error messages automatically.
      Business logic runs (Eloquent queries, fan computation, etc.).
      return response()->json([...], $statusCode) sends the final response.
```

**CORS** is configured in `bootstrap/app.php` using Laravel's built-in
`HandleCors` middleware, allowing the Netlify frontend domain to call the
Railway backend cross-origin.

---

### 2.2.5 Input Validation

Every controller method that accepts external data calls `$request->validate()`.
Failure is **automatic**: Laravel returns a `422 Unprocessable Entity` JSON
response with per-field error messages before any business logic runs.

#### `AuthController@register`

```php
$request->validate([
    'name'     => 'required|string',
    'email'    => 'required|string|unique:users,email',  // queries DB → 422 if duplicate
    'password' => 'required|string|min:8',
]);
```

`unique:users,email` is evaluated in a single indexed DB lookup. If the email
already exists, the user receives an error message on the specific `email` field
without the request ever reaching `User::create()`.

#### `TelemetryController@store` (ESP32 data)

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

The `nullable` rule allows older ESP32 firmware (that doesn't yet send the new
sensor fields) to continue working. This backward-compatible design avoids
requiring a coordinated firmware flash every time a new sensor is added.

#### `DeviceController@setFan` (fan configuration from dashboard)

```php
$request->validate([
    'fan_mode'                => 'required|in:auto,manual',
    'fan_manual_state'        => 'required_if:fan_mode,manual|boolean',
    'fan_auto_temp_threshold' => 'nullable|numeric|min:0|max:100',
]);
```

`required_if:fan_mode,manual` ensures `fan_manual_state` is only required when
the user selects manual mode. `min:0|max:100` provides physical sanity bounds on
the temperature threshold value.

#### `UserController@updateProfile` (PATCH semantics on a PUT route)

```php
$request->validate([
    'name'  => ['sometimes', 'string', 'max:255'],
    'email' => ['sometimes', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
]);
```

The `sometimes` rule allows partial updates — a request carrying only `name` does
not trigger a validation error on `email`. `Rule::unique(...)->ignore($user->id)`
allows a user to submit their own unchanged email without hitting the uniqueness
constraint.

---

### 2.2.6 Security — SQL Injection & Beyond

#### SQL Injection: Impossible by Design

Every database operation in this project uses **Eloquent ORM**, which internally
builds all queries using **PDO prepared statements with parameter binding**.
User-provided values are passed as separate parameters — they are **never
concatenated into a SQL string**.

```php
// What Eloquent does internally when you write:
User::where('email', $fields['email'])->first();

// PDO executes:
// SELECT * FROM users WHERE email = ? LIMIT 1
// with $fields['email'] bound as a parameter.
// No matter what the user sends — even "' OR '1'='1" — it is treated as
// a literal string value, not SQL syntax.
```

Note on `eval()`: The criteria mention SQL injection via `eval()`. This project
contains **zero calls to `eval()`** anywhere in the application code. Using
`eval()` with unvalidated user input would allow arbitrary PHP code execution —
a Remote Code Execution (RCE) vulnerability far more severe than SQL injection.
Laravel development best practices explicitly forbid it.

#### Mass-Assignment Protection

Every Eloquent model defines an explicit `$fillable` allowlist:

```php
protected $fillable = [
    'device_name', 'temperature', 'humidity', 'air_pressure',
    'gas_kohm', 'light_lux', 'noise_db', 'fan_state',
];
```

Combined with `$request->only([...])` in the controller, this creates a double
barrier: the controller whitelists which request fields go to the model, and the
model whitelists which of those can be written to the DB. A malicious client
sending extra fields (e.g., `{ "temperature": 25, "id": 999 }`) has the `id`
field silently discarded at both layers, preventing primary key injection.

#### bcrypt Passwords

`Hash::make()` uses bcrypt with a cost factor of 12 (PHP's default). Bcrypt is
intentionally slow (designed to be), making brute-force attacks computationally
infeasible. `Hash::check()` runs in constant time, preventing timing-based attacks
that could determine whether a password is "close to correct".

#### Sanctum Token Security

- Plaintext token: returned to the client once, immediately discarded server-side.
- Stored token: SHA-256 hash only — even a full database dump reveals no usable token.
- Revocation: `DELETE FROM personal_access_tokens WHERE id = ?` on logout.
- Stolen token after logout: points to a deleted row → 401 on every subsequent request.

#### Output Hiding

`User::$hidden = ['password', 'remember_token']` ensures these columns are
stripped from serialisation even if code accidentally returns the entire model
object directly. No password hash can leak through any API endpoint.

---

## 2.3 — Architecture (5 pt)

### 2.3.1 Frontend / Backend Separation

The system is built on a **strict three-tier architecture**. The three layers
communicate exclusively through documented HTTP APIs — no layer has direct access to
another layer's internals.

```
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 1 — PRESENTATION (React / Vite, Netlify)                     │
│                                                                     │
│  Home Hero dashboard:                                               │
│  • Login & Registration pages (obtain Sanctum Bearer token)        │
│  • Real-time NTP clock                                              │
│  • Time-series charts for all sensor metrics                        │
│  • Fan control panel (mode selector + threshold input)             │
│  • CSV export                                                       │
│  • Light / dark theme toggle                                        │
│                                                                     │
│  Communicates with Layer 2 ONLY via: Axios HTTP calls to /api/*    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTPS REST API
                                │ (Authorization: Bearer <token>)
┌───────────────────────────────▼─────────────────────────────────────┐
│  LAYER 2 — LOGIC / API (Laravel 11, Railway)                        │
│                                                                     │
│  • Input validation (422 on bad input)                             │
│  • Authentication (Sanctum tokens)                                 │
│  • Business logic (fan command computation)                        │
│  • Data persistence (Eloquent ORM)                                 │
│  • Security boundary (no raw DB access from outside this layer)    │
│                                                                     │
│  Communicates with Layer 3 ONLY via: PDO / Eloquent                │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ TCP/SSL (PDO/PostgreSQL protocol)
                                │ via Supabase PgBouncer pooler
┌───────────────────────────────▼─────────────────────────────────────┐
│  LAYER 3 — DATA (PostgreSQL, Supabase EU-Central)                   │
│                                                                     │
│  • users, personal_access_tokens, telemetries, device_settings     │
│  • ACID transactions, unique constraints, enum type enforcement     │
│  • Row-level security ready (currently managed at API layer)       │
└─────────────────────────────────────────────────────────────────────┘

             ▲ Separate data path (no auth required):
             │
┌────────────┴─────────────────────────────────────────────────────────┐
│  ESP32 (Wi-Fi / HTTP, HTTPS POST every 10 s)                         │
│  • Reads sensors, serialises JSON, sends to POST /api/device/data   │
│  • Receives fan_desired_state in the 201 response                   │
│  • Drives fan relay without any separate polling endpoint           │
└──────────────────────────────────────────────────────────────────────┘
```

**Benefits of this separation:**
- The React frontend can be rewritten in a completely different framework (Vue,
  Angular, native mobile) without touching a single line of backend code.
- The database can be migrated from Supabase to any PostgreSQL host by changing
  four environment variables.
- The ESP32 firmware can be updated independently of backend or frontend changes,
  because the contract (JSON schema of `/api/device/data`) is stable and
  backward-compatible (new fields are `nullable`).
- Each layer is deployed independently: Netlify (frontend), Railway (backend),
  Supabase (DB) — different providers, different scaling strategies.

---

### 2.3.2 Modularity

The backend is broken into small, single-purpose units:

#### Controllers (one responsibility each)

| Controller | Sole Responsibility |
|---|---|
| `AuthController` | User registration, login, logout |
| `UserController` | Read and update the authenticated user's own profile |
| `TelemetryController` | Store incoming ESP32 readings; serve last-20 history to dashboard |
| `DeviceController` | Read and update fan configuration per device |

No controller touches another controller's concern. `TelemetryController@store`
reads `DeviceSettings` but never modifies the `User` table.

#### Models (one table each)

`User`, `Telemetry`, `DeviceSettings` — each model encapsulates the schema
definition (`$fillable`, `$casts`, `$hidden`) for exactly one table. Business
logic that spans multiple models lives in the controller, not in the model.

#### Routes (declarative, centralised)

`routes/api.php` is the single source of truth for the entire API surface.
Adding a new endpoint means adding one line here and one method in a controller —
no other file needs to change.

#### Migrations (incremental, versioned)

Each migration file changes exactly one aspect of the schema. The migration history
is:

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

Each new feature (new sensor, Google OAuth prototype, fan control) is a separate,
independently reversible migration that can be rolled back with
`php artisan migrate:rollback`.

---

### 2.3.3 Scalability

Several design decisions were made with scalability in mind:

#### Connection Pooling (PgBouncer)

Railway can spawn multiple PHP worker processes simultaneously. Each worker
would normally open its own PostgreSQL connection. PostgreSQL has a fixed
connection limit (~100 on a free Supabase instance). The backend connects via
**Supabase's PgBouncer pooler** endpoint
(`aws-1-eu-central-1.pooler.supabase.com`) which multiplexes many PHP
connections onto a smaller number of actual PostgreSQL connections, preventing
connection exhaustion under load.

#### Stateless API Design

The backend is **completely stateless**: every request carries all necessary
authentication information in its `Authorization: Bearer <token>` header. No
server-side session is kept between requests. This means **horizontal scaling** —
adding more Railway workers / containers — requires zero configuration. A load
balancer can route any request to any worker.

#### Append-Only Telemetry Table

`telemetries` is append-only: only `INSERT` and `SELECT` operations, never
`UPDATE`. This is the ideal access pattern for time-series data:
- No row-level locking contention between writers.
- A B-tree index on `created_at` makes the `ORDER BY created_at DESC LIMIT 20`
  query constant-time regardless of how many millions of rows exist.
- In the future, partitioning by month/year is straightforward and requires no
  application code changes.

#### Configurable Polling Interval

The ESP32's sending interval (`TELEMETRY_INTERVAL = 10000 ms`) is defined as a
constant in the firmware. If the backend needs to reduce write load it can be
increased; if a higher time resolution is needed it can be reduced — no backend
code needs to change.

#### Future Scalability Path

- **Multiple devices:** `device_name` is already a first-class field in both
  `telemetries` and `device_settings`; a second ESP32 with a different name
  self-registers on first POST and is immediately visible in the API.
- **Multi-tenancy (room ownership):** Adding a `user_id` foreign key to
  `device_settings` would allow different users to own different devices without
  restructuring the schema.
- **Caching:** The `GET /api/telemetry` endpoint could cache the 20-row result in
  Redis/Memcached (Laravel's `Cache::remember()`) to handle many concurrent
  dashboard users without hitting the database on every refresh.

---

### 2.3.4 Maintainability

#### Version-Controlled Schema

Every schema change is a migration file committed to Git. Any developer (or the
CI/CD pipeline) can reproduce the exact production database state with a single
command: `php artisan migrate`. There is no manual SQL to run, no "remember to
add this column" documentation — the history is in the code.

#### Documented Codebase

Every controller, model, migration, and route file contains detailed inline
comments explaining:
- What the file is responsible for.
- Why each design decision was made (e.g., why `nullable` for new sensor columns,
  why `request->only()` instead of `request->all()`).
- The data flow from incoming HTTP request to database and back.
- Edge cases handled (e.g., `firstOrCreate()` for new device auto-registration).

External documentation files (`ARCHITECTURE.md`, `Communication.md`,
`BACKEND_AND_DB_DEEP_DIVE.txt`) provide higher-level explanations, ER diagrams,
API reference tables, and normalization proofs.

#### Environment-Based Configuration

All environment-specific values — database credentials, application key, Railway
`$PORT`, API base URL — are stored in `.env` (local) or Railway's secret
environment variables (production). No secret is hardcoded in source code or
committed to Git. Switching from Supabase to another PostgreSQL host requires
changing four environment variables; no code changes are needed.

#### Dockerfile + docker-compose

The Dockerfile enables any developer to run the exact production environment
locally in one command (`docker-compose up --build`), eliminating
"works on my machine" issues regardless of the local PHP version. The
`docker-compose.yml` mounts the source directory as a volume so code edits are
immediately reflected without rebuilding the container.

#### Rollback Safety

- Every migration has a `down()` method that precisely undoes its `up()` method.
- `php artisan migrate:rollback` can undo the last batch of migrations.
- Because the database is PostgreSQL (transactional DDL), a failed migration
  is automatically rolled back — the schema is never left in a partial/corrupted
  state (unlike MySQL, where DDL changes are non-transactional).

#### Artisan CLI

Laravel's `artisan` command-line tool provides utilities that eliminate manual
boilerplate: `php artisan make:controller`, `php artisan make:model --migration`,
`php artisan migrate:status`, `php artisan tinker` (interactive REPL for testing
Eloquent queries live against the database). This keeps the developer feedback
loop fast and the code consistent.

---

*End of document — Home Hero Backend & Infrastructure v1.0*
