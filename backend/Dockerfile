# ─────────────────────────────────────────────────────────────────────────────
# Dockerfile — Home Hero Laravel API
#
# PURPOSE:
#   Describes how to build the Docker image that runs this Laravel 11 backend.
#   Used in two scenarios:
#     1. LOCAL DEV  → `docker-compose up --build`  (see docker-compose.yml)
#     2. PRODUCTION → Railway detects this file and uses it to build & deploy
#                     the container automatically on every `git push`.
# ─────────────────────────────────────────────────────────────────────────────


# ── BASE IMAGE ────────────────────────────────────────────────────────────────
# Start from the official PHP 8.2 image that ships with PHP-FPM (FastCGI
# Process Manager) pre-installed.
#
# Why PHP 8.2?
#   Laravel 11 requires PHP >= 8.2. This pins the exact version so every
#   environment (local Docker, Railway) runs the same PHP, eliminating
#   "works on my machine" issues.
#
# Why the -fpm variant?
#   It is the lightest official PHP image that still includes the tools
#   needed to install extensions. We don't actually run php-fpm as a
#   process — the CMD at the bottom uses the PHP built-in server instead.
#   The -fpm base is here purely because it includes the necessary C build
#   toolchain for compiling PHP extensions in the next step.
FROM php:8.2-fpm


# ── SYSTEM DEPENDENCIES ───────────────────────────────────────────────────────
# apt-get update refreshes the Debian package list inside the container so the
# following install commands can find the packages.
#
# The packages installed:
#   git        — required by Composer to download packages that reference a
#                Git repository directly (some Laravel packages do this).
#   unzip      — required by Composer to extract .zip package archives.
#   libzip-dev — C headers needed to compile PHP's 'zip' extension (used by
#                Composer itself and by Laravel's file handling).
#   libpng-dev — C headers needed to compile PHP's 'gd' image extension
#                (used by Laravel for image manipulation, e.g. avatars).
#   libpq-dev  — C headers for the PostgreSQL client library (libpq).
#                WITHOUT this, the next step cannot compile 'pdo_pgsql',
#                which is what allows Laravel to talk to the Supabase
#                PostgreSQL database.
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libpng-dev \
    libpq-dev


# ── PHP EXTENSIONS ────────────────────────────────────────────────────────────
# docker-php-ext-install compiles and enables PHP extensions from source.
# These are NOT included in the base image and MUST be added explicitly.
#
#   pdo        — PHP Data Objects: the base database abstraction layer.
#                Laravel's Eloquent ORM sits on top of PDO. Without it,
#                no database calls work at all.
#   pdo_mysql  — PDO driver for MySQL. Not used in production (we use
#                PostgreSQL), but keeping it allows local dev to optionally
#                switch to MySQL without rebuilding the image.
#   pdo_pgsql  — PDO driver for PostgreSQL. THIS IS THE CRITICAL ONE.
#                It enables the DB_CONNECTION=pgsql configuration in
#                config/database.php to connect to Supabase PostgreSQL.
#                Without this extension, every API call that touches the
#                database throws "could not find driver".
#   zip        — Allows PHP to read/write .zip files. Required by Composer
#                during the install step below.
#   gd         — PHP image processing library. Used by Laravel for image
#                resizing/manipulation (avatar uploads, etc.).
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql zip gd


# ── COMPOSER ─────────────────────────────────────────────────────────────────
# Copies the Composer binary from the official Composer Docker image directly
# into this image at /usr/bin/composer (so it is available as a command).
#
# Why use COPY --from instead of downloading Composer with curl?
#   The official composer:latest image is always up-to-date and verified.
#   This is safer and faster than downloading an installer script at build time.
#
# Composer is the PHP package manager — the equivalent of npm for Node.js.
# It reads composer.json, resolves all Laravel dependencies (Sanctum, Eloquent,
# etc.), and downloads them into the vendor/ directory.
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer


# ── WORKING DIRECTORY ────────────────────────────────────────────────────────
# Sets /var/www as the current directory for all subsequent RUN, COPY, and CMD
# instructions. All relative paths below are relative to this directory.
#
# /var/www is the conventional webserver root on Debian/Ubuntu Linux systems.
# This is where the entire Laravel project lives inside the container.
WORKDIR /var/www


# ── COPY SOURCE CODE ─────────────────────────────────────────────────────────
# Copies everything from the build context (the backend/ folder on your machine)
# into /var/www inside the container.
#
# This includes: app/, bootstrap/, config/, database/, public/, routes/,
# resources/, composer.json, composer.lock, artisan, Procfile, etc.
#
# NOTE: In local dev (docker-compose.yml), a volume mount overlays this COPY
# so that live code changes are reflected immediately without rebuilding.
# On Railway (production), there is no volume — this COPY is the only source
# of code, which is why it must be complete.
COPY . .


# ── INSTALL PHP DEPENDENCIES ─────────────────────────────────────────────────
# Runs Composer to download all PHP packages defined in composer.json into
# the vendor/ directory inside the container.
#
#   --no-dev              — Skips development-only packages (PHPUnit test
#                           framework, Faker, collision debugger, etc.).
#                           Keeps the production image smaller and faster.
#   --optimize-autoloader — Generates a classmap (a precomputed PHP class →
#                           file lookup table). Laravel loads classes faster
#                           because PHP doesn't have to scan the filesystem
#                           on every request. Mandatory for production.
#
# After this step, vendor/autoload.php exists and all of Laravel's packages
# (Sanctum, Eloquent, Monolog, Symfony components, etc.) are available.
RUN composer install --no-dev --optimize-autoloader


# ── FILE PERMISSIONS ─────────────────────────────────────────────────────────
# Changes the owner of every file in /var/www to the www-data user and group.
#
# www-data is the default Linux web server user (used by nginx, PHP-FPM, etc.).
# Laravel needs write access to storage/ and bootstrap/cache/ to:
#   - Write log files (storage/logs/laravel.log)
#   - Cache compiled views, config, and routes (bootstrap/cache/)
#   - Store uploaded files (storage/app/)
#
# Without this, PHP throws "Permission denied" errors when trying to write
# to those directories, breaking logging and caching entirely.
RUN chown -R www-data:www-data /var/www


# ── EXPOSE PORT ───────────────────────────────────────────────────────────────
# Documents that the container listens on port 8080.
#
# IMPORTANT: EXPOSE is metadata only — it does NOT actually open or map the port.
# The actual port binding happens at runtime:
#   - On Railway: the $PORT environment variable is injected (usually 8080 or
#     similar) and the CMD below binds to it dynamically.
#   - Locally with docker-compose: the ports: "8000:8000" line in
#     docker-compose.yml does the real binding.
EXPOSE 8080


# ── START COMMAND ─────────────────────────────────────────────────────────────
# This is the command that runs when the container starts (on Railway deploy
# or `docker run`). It starts PHP's built-in HTTP server.
#
# Breaking it down:
#   sh -lc "..."
#     Runs the string as a shell command (-c). The -l flag loads a login shell
#     so that environment variables set by Railway (like $PORT) are available.
#
#   php -S 0.0.0.0:${PORT:-8080}
#     Starts PHP's built-in web server.
#     0.0.0.0  → bind on ALL network interfaces (required in Docker so external
#                traffic from Railway's load balancer can reach the container).
#     ${PORT:-8080} → uses Railway's injected $PORT variable (e.g. 3000, 8080,
#                     or whatever Railway assigns). Falls back to 8080 if $PORT
#                     is not set (e.g. when running the image manually).
#
#   -t public
#     Sets the document root to the public/ directory. Laravel requires this:
#     public/index.php is the sole entry point for every HTTP request.
#     Files in app/, config/, database/, etc. are NEVER served directly — they
#     are unreachable from the internet.
#
#   public/router.php
#     A custom router script required by PHP's built-in server. Unlike Nginx or
#     Apache, PHP's built-in server does NOT automatically forward non-file
#     requests to index.php. Without the router, a request to /api/login would
#     return 404 because there is no file at public/api/login.
#     router.php checks: if the request path is a real file (e.g. a .css or .js
#     asset), serve it directly. Otherwise, hand control to index.php so Laravel
#     can route the request normally.
CMD ["sh", "-lc", "php -S 0.0.0.0:${PORT:-8080} -t public public/router.php"]