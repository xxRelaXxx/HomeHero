<?php

// =========================================================
// app/Http/Controllers/TelemetryController.php
// =========================================================
// Handles all sensor data: storage (ESP32) and retrieval (dashboard).
//
// ROUTES:
//   POST /api/device/data    → store()   — public, no auth required
//   GET  /api/telemetry      → index()   — protected by auth:sanctum
// =========================================================

namespace App\Http\Controllers;

use App\Models\Telemetry;
use App\Models\DeviceSettings;
use Illuminate\Http\Request;

class TelemetryController extends Controller
{
    // ── index() ───────────────────────────────────────────────────────────────
    // Called by the React dashboard via GET /api/telemetry.
    // Protected by auth:sanctum — unauthenticated requests get a 401 before
    // this method is ever reached.
    //
    // Returns the last 20 sensor readings ordered oldest→newest, ready for
    // a time-series chart on the frontend.
    public function index()
    {
        return Telemetry::orderBy('created_at', 'desc') // step 1: sort newest-first so LIMIT grabs the right rows
            ->take(20)                                   // step 2: keep only 20 rows (efficient; uses the DB index)
            ->get()                                      // step 3: execute SELECT, returns a Collection
            ->reverse()                                  // step 4: flip to oldest-first (chart needs ascending order)
            ->values();                                  // step 5: re-index keys 0,1,2... (reverse() keeps original keys)
    }

    // ── store() ───────────────────────────────────────────────────────────────
    // Called by the ESP32 via POST /api/device/data.
    // No auth header needed — the device posts on a fixed interval (e.g. every 10s).
    //
    // Responsibilities:
    //   1. Validate the incoming sensor JSON.
    //   2. Persist the reading to the telemetries table.
    //   3. Look up (or auto-create) the fan settings for this device.
    //   4. Compute whether the fan SHOULD be on right now.
    //   5. Return the stored row + the fan command back to the ESP32.
    public function store(Request $request)
    {
        // validate() checks types and presence.
        // On failure Laravel automatically returns a 422 JSON response with
        // field-level error messages — the controller code below never runs.
        // 'nullable' means the field is optional; if missing it is treated as null
        // rather than causing a validation error. This keeps compatibility with
        // older ESP32 firmware that doesn't send the new sensor fields yet.
        $request->validate([
            'device_name'  => 'required|string',
            'temperature'  => 'required|numeric',
            'humidity'     => 'required|numeric',
            'air_pressure' => 'required|numeric',
            'gas_kohm'     => 'nullable|numeric',  // BME680 gas resistance in kΩ — air quality proxy
            'light_lux'    => 'nullable|numeric',  // BH1750 ambient light in lux
            'noise_db'     => 'nullable|numeric',  // microphone ADC ambient noise in dB SPL
            'fan_state'    => 'nullable|boolean',  // current physical fan state reported by the device
        ]);
        // Last ones are marked as nullable since older firmware versions might not include them yet;
        // this allows for backward compatibility without breaking validation.(we just have added them later sooo yeah)

        // Telemetry::create() does a single INSERT.
        // $request->only([...]) is used instead of $request->all() for safety:
        // it whitelists exactly which fields from the request go into the DB,
        // so unexpected extra fields sent by the client are silently ignored
        // even if they somehow passed validation.
        $data = Telemetry::create($request->only([
            'device_name', 'temperature', 'humidity', 'air_pressure',
            'gas_kohm', 'light_lux', 'noise_db', 'fan_state',
        ]));

        // ── Fan command resolution ────────────────────────────────────────────
        // The ESP32 doesn't decide fan logic itself — it delegates to the backend.
        // This allows changing mode/threshold from the dashboard without reflashing.
        //
        // firstOrCreate():  two arguments:
        //   arg 1 — the WHERE clause to find an existing row
        //   arg 2 — the default column values used ONLY when creating a new row
        // Effect: first POST from a brand-new device auto-registers its settings
        // with safe defaults (auto mode, 30°C threshold). No manual pre-registration needed.
        $settings = DeviceSettings::firstOrCreate(
            ['device_name' => $request->device_name], // arg 1: find settings for this device using DeviceSettings model
            [
                'fan_mode'                => 'auto',
                'fan_manual_state'        => false,   // default manual state if no device name exists in the database controlled by the model
                'fan_auto_temp_threshold' => 30.0,
            ]
        );

        if ($settings->fan_mode === 'manual') {
            // Manual mode: ignore temperature entirely.
            // fan_desired_state is whatever the dashboard last set.
            $fanDesiredState = $settings->fan_manual_state;
        } else {
            // Auto mode: simple threshold comparison.
            // >= means the fan turns on exactly at the threshold, not just above it.
            // Result is a PHP bool (true/false) which JSON-encodes as true/false.
            $fanDesiredState = $request->temperature >= $settings->fan_auto_temp_threshold;
        }

        // Return both the stored reading AND the fan command in a single response.
        // The ESP32 reads 'fan_desired_state' and sets its GPIO relay pin accordingly.
        // The next POST from the device will report the updated 'fan_state', confirming
        // the command was executed — closing the control loop.
        return response()->json([
            'telemetry'         => $data,          // full stored row (ESP32 can confirm what was saved)
            'fan_desired_state' => $fanDesiredState, // the command: true = turn ON, false = turn OFF
        ], 201); // 201 Created — a new telemetry resource was created
    }
}