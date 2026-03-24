<?php

// =========================================================
// app/Models/Telemetry.php
// =========================================================
// Represents a single sensor snapshot sent by an ESP32 device.
// This table is APPEND-ONLY — rows are never updated after insert.
// Think of it as a time-series log: one row per reading per device.
//
// Data flow:
//   ESP32  →  POST /api/device/data  →  TelemetryController@store
//          →  Telemetry::create()   →  INSERT into telemetries
//   Dashboard  →  GET /api/telemetry  →  TelemetryController@index
//             →  SELECT last 20 rows  →  JSON response
// =========================================================

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Telemetry extends Model
{
    // HasFactory enables Telemetry::factory() for seeders and tests.
    use HasFactory;

    // $fillable is the ALLOWLIST for mass-assignment.
    // Only columns listed here can be written via Telemetry::create($request->all()).
    // This prevents a malicious client from injecting unexpected columns
    // (e.g. overwriting an 'id' or adding a column that doesn't exist).
    protected $fillable = [
        'device_name',   // string  — identifies which physical device sent this (e.g. "esp32_room")
        'temperature',   // float   — °C, from BME680
        'humidity',      // float   — relative humidity %, from BME680
        'air_pressure',  // float   — atmospheric pressure in hPa, from BME680
        'gas_kohm',      // float   — BME680 gas resistance in kΩ (air quality proxy; higher = cleaner)
        'light_lux',     // float   — ambient light level in lux, from BH1750 sensor
        'noise_db',      // float   — ambient noise level in dB SPL, estimated from ADC microphone
        'fan_state',     // boolean — actual physical state of the fan at the time of reading (true = ON)
        'created_at',    // allows manual override of the timestamp (useful for seeding/testing)
    ];

    // $casts tells Eloquent how to convert raw DB values to PHP types.
    // The 'telemetries' table stores fan_state as a TINYINT(1) (0/1).
    // Without this cast, $telemetry->fan_state would be the string "1" or "0".
    // With the cast it becomes a proper PHP bool: true / false.
    protected $casts = [
        'fan_state' => 'boolean',
    ];

    // NOTE: No relationship to DeviceSettings is declared here.
    // The two tables are linked only by the 'device_name' string (soft/logical join).
    // A formal FK is intentionally omitted so the ESP32 can self-register on first POST
    // without needing a pre-existing DeviceSettings row.
}