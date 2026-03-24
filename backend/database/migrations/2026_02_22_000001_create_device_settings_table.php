<?php

// =========================================================
// Creates the "device_settings" table.
// One row per physical device, acting as a lightweight
// configuration store / actuator-command layer.
//
// fan_mode:
//   'auto'   – fan is controlled automatically by the backend
//              based on fan_auto_temp_threshold.
//   'manual' – fan is forced to the state stored in fan_manual_state.
//
// The ESP32 receives the computed "fan_desired_state" in the
// response to every POST /device/data call, so it always knows
// what to do without a separate polling endpoint.
// =========================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('device_settings', function (Blueprint $table) {
            $table->id();
            $table->string('device_name')->unique();
            $table->enum('fan_mode', ['auto', 'manual'])->default('auto');
            $table->boolean('fan_manual_state')->default(false);
            $table->float('fan_auto_temp_threshold')->default(30.0); // °C
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_settings');
    }
};
