<?php

// =========================================================
// app/Http/Controllers/AuthController.php
// =========================================================
// Handles human user authentication: register, login, logout.
// The ESP32 device does NOT use these endpoints — it posts
// directly to /api/device/data which is a public route.
//
// ROUTES (all public, no auth middleware):
//   POST /api/register  → register()
//   POST /api/login     → login()
//   POST /api/logout    → logout()  ← inside auth:sanctum group
// =========================================================

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite; // used only by the commented-out Google OAuth flow

class AuthController extends Controller
{
    // ── register() ────────────────────────────────────────────────────────────
    // Creates a new user account and immediately returns a Sanctum token.
    // The token is used by the React dashboard for all subsequent authenticated requests.
    public function register(Request $request) {
        // validate() returns only the validated fields as an array.
        // 'unique:users,email' checks the 'email' column of the 'users' table;
        // returns 422 with an error message if the email is already taken.
        $fields = $request->validate([
            'name'     => 'required|string',
            'email'    => 'required|string|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        // User::create() does a single INSERT.
        // Hash::make() runs bcrypt on the plain-text password before storage.
        // Note: the User model also has 'password' => 'hashed' in $casts,
        // so Hash::make() here is technically redundant but harmless and explicit.
        $user = User::create([
            'name'     => $fields['name'],
            'email'    => $fields['email'],
            'password' => Hash::make($fields['password']),
        ]);

        // createToken() inserts a row into personal_access_tokens.
        // The stored value is a SHA-256 hash of the token.
        // plainTextToken is the raw string (shown only once — never stored in plain text).
        // The frontend must save this in localStorage / memory for future requests.
        $token = $user->createToken('myapptoken')->plainTextToken;

        // 201 Created — a new User resource was created.
        // The $user object is serialized to JSON; $hidden columns (password, remember_token)
        // are automatically stripped before the response is sent.
        return response()->json(['user' => $user, 'token' => $token], 201);
    }

    // ── login() ───────────────────────────────────────────────────────────────
    // Validates credentials and returns a fresh Sanctum token.
    // Each login creates a new token row — previous tokens remain valid
    // (multiple devices can be logged in simultaneously).
    public function login(Request $request) {
        $fields = $request->validate([
            'email'    => 'required|string',
            'password' => 'required|string',
        ]);

        // Fetch the user by email first (single indexed lookup).
        // ->first() returns the User model or null if not found.
        $user = User::where('email', $fields['email'])->first();

        // Hash::check(plain, hash) — runs bcrypt on the plain text and compares
        // with the stored hash in constant time (prevents timing attacks).
        // The two conditions are combined so we don't leak whether the email exists
        // (both wrong-email and wrong-password return the same 401 message).
        if (!$user || !Hash::check($fields['password'], $user->password)) {
            return response()->json(['message' => 'Bad credentials'], 401);
        }

        $token = $user->createToken('myapptoken')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token], 201);
    }

    // Google OAuth flow — commented out until Socialite is configured.
    // Requires: composer require laravel/socialite + Google API credentials in .env
    // public function googleRedirect() {
    //     return Socialite::driver('google')->stateless()->redirect();
    // }

    // public function googleCallback() {
    //     $googleUser = Socialite::driver('google')->stateless()->user();

    //     $existing = User::where('email', $googleUser->email)->first();
    //     if ($existing && $existing->google_id === null && $existing->password) {
    //         // Conflict: this email was registered with a password — block Google login
    //         return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/login?error=google_email_conflict');
    //     }

    //     // updateOrCreate: if user exists update their Google info; if not, create.
    //     $user = User::updateOrCreate(
    //         ['email' => $googleUser->email],
    //         [
    //             'name'             => $googleUser->name,
    //             'google_id'        => $googleUser->id,
    //             'avatar'           => $googleUser->avatar,
    //             'password'         => $existing?->password ?? Hash::make(Str::random(40)), // password column is NOT NULL
    //             'email_verified_at' => now(), // Google already verified the email
    //         ]
    //     );

    //     $needsPassword = $existing ? 0 : 1;
    //     $token = $user->createToken('google-auth')->plainTextToken;

    //     return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/auth/callback?token=' . $token . '&provider=google&needs_password=' . $needsPassword);
    // }

    // ── logout() ──────────────────────────────────────────────────────────────
    // Revokes ALL tokens for the currently authenticated user.
    // This is a hard logout: every device/browser session is invalidated.
    // Route is inside auth:sanctum group, so $request->user() is always available here.
    public function logout(Request $request) {
        // tokens() returns a HasMany query builder on personal_access_tokens
        // filtered to this user's id. delete() issues a DELETE WHERE tokenable_id = ?
        auth()->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out']);
    }
}
