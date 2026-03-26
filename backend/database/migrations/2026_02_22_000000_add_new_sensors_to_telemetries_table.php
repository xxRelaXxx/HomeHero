<?php

// =========================================================
// Adds new sensor columns and fan_state to telemetries table.
// gas_kohm  – air quality reading from BME680 (kΩ, higher = cleaner air)
// light_lux – ambient light level from light sensor (lux)
// noise_db  – ambient sound level from microphone (dB)
// fan_state – actual fan state reported by the device (true = ON)
// All new columns are nullable so existing records are not broken
// and devices that haven't updated firmware still work.
// =========================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('telemetries', function (Blueprint $table) {
            $table->float('gas_kohm')->nullable()->after('air_pressure');
            $table->float('light_lux')->nullable()->after('gas_kohm');
            $table->float('noise_db')->nullable()->after('light_lux');
            $table->boolean('fan_state')->default(false)->after('noise_db');
        });
    }

    public function down(): void
    {
        Schema::table('telemetries', function (Blueprint $table) {
            $table->dropColumn(['gas_kohm', 'light_lux', 'noise_db', 'fan_state']);
        });
    }
};
