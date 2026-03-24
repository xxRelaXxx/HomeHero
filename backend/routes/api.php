<?php

// =========================================================
// routes/api.php
// =========================================================
// defines API routes for login, registration, telemetry data
// =========================================================

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TelemetryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DeviceController;

// Alive
Route::get('/', function () {
    return response()->json([
        "status" => "ok",
        "message" => "API is alive"
    ]);
});


// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
// Route::get('auth/google/redirect', [AuthController::class, 'googleRedirect']);
// Route::get('auth/google/callback', [AuthController::class, 'googleCallback']);

// IoT Device Route (Usually protected by a static API key, keeping public for simplicity today)
Route::post('/device/data', [TelemetryController::class, 'store']);

// Protected User Routes (Dashboard)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [UserController::class, 'profile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);

    // Fetch data for the dashboard graph
    Route::get('/telemetry', [TelemetryController::class, 'index']);

    // Device settings & fan control (called by the React dashboard)
    Route::get('/device/{device}/settings', [DeviceController::class, 'getSettings']);
    Route::put('/device/{device}/fan', [DeviceController::class, 'setFan']);
});