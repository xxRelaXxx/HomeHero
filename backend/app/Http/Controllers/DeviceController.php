<?php

// =========================================================
// app/Http/Controllers/DeviceController.php
// =========================================================
// Exposes fan configuration endpoints consumed by the React dashboard.
// The ESP32 never calls these routes — it only POST /api/device/data
// and reads the fan_desired_state back in the response.
//
// Both routes are inside the auth:sanctum middleware group (see routes/api.php),
// so a valid Bearer token is mandatory. Unauthenticated requests get a 401
// before this controller is reached.
//
// ROUTES:
//   GET /api/device/{device}/settings  → getSettings()
//   PUT /api/device/{device}/fan       → setFan()
//
// {device} in the URL is the device_name string, e.g. "esp32_living_room".
// It must exactly match what the ESP32 sends as 'device_name' in its POST.
// =========================================================

namespace App\Http\Controllers;

use App\Models\DeviceSettings;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    // ── getSettings() ─────────────────────────────────────────────────────────
    // Called by the dashboard on page load to show the current fan configuration.
    //
    // Uses firstOrCreate so the dashboard never gets a 404 for a device that
    // exists in telemetries but hasn't had its settings explicitly configured yet.
    // The device auto-registers with safe defaults the first time either the
    // ESP32 posts data OR the dashboard opens the settings panel.
    public function getSettings(string $device)
    {
        // arg 1: WHERE clause — find the row for this device.
        // arg 2: default values written ONLY on INSERT (not on subsequent reads).
        $settings = DeviceSettings::firstOrCreate(
            ['device_name' => $device],
            [
                'fan_mode'                => 'auto',  // safe default: temperature-based control
                'fan_manual_state'        => false,   // default manual state: OFF
                'fan_auto_temp_threshold' => 30.0,    // default threshold: 30°C
            ]
        );

        // Returns the full DeviceSettings row as JSON.
        // The dashboard uses this to pre-populate the fan control form.
        return response()->json($settings);
    }

    // ── setFan() ──────────────────────────────────────────────────────────────
    // Called when the user changes fan settings on the React dashboard.
    //
    // This does NOT immediately change the fan — it only writes to device_settings.
    // The fan physically changes state on the next ESP32 POST, when TelemetryController
    // reads device_settings and includes the updated fan_desired_state in the response.
    // Maximum delay = ESP32's posting interval (e.g. 10 seconds).
    public function setFan(Request $request, string $device)
    {
        
        $request->validate([
            'fan_mode'                => 'required|in:auto,manual', // 'in:auto,manual' — rejects any value that isn't exactly those two strings.
            'fan_manual_state'        => 'required_if:fan_mode,manual|boolean', // 'required_if:fan_mode,manual' — fan_manual_state is only required when
                                                                                //  the user chose manual mode; in auto mode it can be omitted entirely.
            'fan_auto_temp_threshold' => 'nullable|numeric|min:0|max:100', // 'min:0|max:100' — sanity bounds on the temperature threshold.
        ]);

        // updateOrCreate() is an UPSERT:
        //   - if a row with device_name exists: UPDATE it
        //   - if not: INSERT a new row
        // arg 1: the WHERE / match condition
        // arg 2: the column values to write
        //
        // array_filter(..., fn($v) => $v !== null) strips keys whose value is null
        // so that omitting 'fan_auto_temp_threshold' in the request doesn't overwrite
        // the existing threshold with NULL in the database.
        $settings = DeviceSettings::updateOrCreate(
            ['device_name' => $device],
            array_filter([
                'fan_mode'                => $request->fan_mode,
                // input() with a default: if fan_mode is 'auto', fan_manual_state
                // may not be in the request — default to false rather than null.
                'fan_manual_state'        => $request->input('fan_manual_state', false),
                'fan_auto_temp_threshold' => $request->fan_auto_temp_threshold, // null if not sent
            ], fn($v) => $v !== null)
        );

        // Return the full updated settings row.
        // The dashboard uses this to immediately reflect the confirmed saved state.
        return response()->json($settings);
    }
}
