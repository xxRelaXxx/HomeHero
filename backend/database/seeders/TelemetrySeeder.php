<?php
# =========================================================
# 1. FILE: database/seeders/TelemetrySeeder.php
# =========================================================
# seeds the "telemetries" table with sample device data
# =========================================================

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TelemetrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        for($i=0; $i<50; $i++) {
            \App\Models\Telemetry::create([
                'device_name' => 'esp32_living_room',
                'temperature' => rand(20, 30) + (rand(0,99)/100),
                'humidity' => rand(40, 60),
                'air_pressure' => 1000 + rand(0, 30) + (rand(0,99)/100),
                'created_at' => now()->subMinutes(50-$i)
            ]);
        }
    }
}
