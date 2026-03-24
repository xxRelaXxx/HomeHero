<?php

// =========================================================
// app/Models/DeviceSettings.php
// =========================================================
// Stores the fan control configuration for each physical device.
// This table is a KEY-VALUE config store, NOT a time-series.
// There is exactly ONE row per device_name — it is mutated in place
// whenever the dashboard changes the fan settings.
//
// Contrast with Telemetry: that table grows forever (append-only).
// This table stays tiny (one row per device, always).
//
// Data flow:
//   Dashboard  →  PUT /api/device/{name}/fan  →  DeviceController@setFan
//             →  DeviceSettings::updateOrCreate()  →  UPSERT device_settings
//
//   ESP32  →  POST /api/device/data  →  TelemetryController@store
//          →  DeviceSettings::firstOrCreate()  →  READ (or auto-create) settings
//          →  compute fan_desired_state  →  include in 201 response
// =========================================================

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceSettings extends Model
{
    // $fillable allowlist — same mass-assignment protection as Telemetry.
    protected $fillable = [
        'device_name',            // string  — must match the device_name the ESP32 sends
        'fan_mode',               // enum    — 'auto' or 'manual'
        //   'auto':   backend turns fan on/off based on fan_auto_temp_threshold
        //   'manual': backend always returns fan_manual_state regardless of temperature
        'fan_manual_state',       // boolean — used only when fan_mode = 'manual'
        //   true  = force fan ON
        //   false = force fan OFF
        'fan_auto_temp_threshold', // float  — °C threshold used in 'auto' mode
        //   fan turns on when temperature >= this value
    ];

    // Cast DB integers/strings to correct PHP types.
    // fan_manual_state is stored as TINYINT(1) — cast to bool.
    // fan_auto_temp_threshold is stored as DOUBLE — cast to float for arithmetic.
    protected $casts = [
        'fan_manual_state'        => 'boolean',
        'fan_auto_temp_threshold' => 'float',
    ];
}
