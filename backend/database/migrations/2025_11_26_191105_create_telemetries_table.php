<?php

// =========================================================
// 1. FILE: database/migrations/xxxx_xx_xx_create_telemetries_table.php
// =========================================================
// creates the "telemetrics" table to store device data
// =========================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('telemetries', function (Blueprint $table) {
            $table->id();
            $table->string('device_name'); // e.g., "esp32_living_room"
            $table->float('temperature');
            $table->float('humidity');
            $table->float('air_pressure');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('telemetries');
    }
};