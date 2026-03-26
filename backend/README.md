<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

# IoT Telemetry Backend — Laravel API

A **Laravel 12 REST API** backend for an IoT telemetry dashboard.  
It receives sensor data from an ESP32 device and serves it to a React frontend via authenticated JSON endpoints.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Laravel 12 (PHP 8.2) |
| Auth | Laravel Sanctum (Bearer tokens) |
| Database | PostgreSQL (Supabase) / SQLite (local) |
| Deployment | Railway (via Procfile + Dockerfile) |

---

## Project Layout

```
app/Http/Controllers/   AuthController, TelemetryController, UserController
app/Models/             User, Telemetry
routes/api.php          All API route definitions
database/migrations/    Table schema (users, telemetries, tokens)
public/router.php       PHP built-in server router (needed for Railway)
Dockerfile              Container image for production
docker-compose.yml      Local development with Docker
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/` | ✗ | Health check |
| `POST` | `/api/register` | ✗ | Register, returns Bearer token |
| `POST` | `/api/login` | ✗ | Login, returns Bearer token |
| `POST` | `/api/logout` | Bearer | Invalidate all user tokens |
| `GET` | `/api/user` | Bearer | Get own profile |
| `PUT` | `/api/user/profile` | Bearer | Update own profile |
| `GET` | `/api/telemetry` | Bearer | Last 20 sensor readings (oldest→newest) |
| `POST` | `/api/device/data` | ✗ | ESP32 pushes temperature/humidity/pressure |

---

## Local Development

### Without Docker

```bash
cd backend
cp .env.example .env          # set DB_*, APP_KEY
php artisan key:generate
php artisan migrate
php artisan serve             # http://localhost:8000
```

### With Docker

```bash
docker-compose up --build     # http://localhost:8000
```

---

## Production Deploy (Railway)

Railway reads the `Procfile` to know how to start the app:

```
web: php -S 0.0.0.0:$PORT -t public public/router.php
```

Required environment variables on Railway:

```
APP_KEY=base64:...
APP_ENV=production
DB_CONNECTION=pgsql
DB_HOST=...
DB_PORT=5432
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...
```

Run migrations after first deploy:

```bash
railway run php artisan migrate --force
```