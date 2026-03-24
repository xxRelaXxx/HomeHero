<?php

// =========================================================
// app/Http/Controllers/UserController.php
// =========================================================
// Manages the authenticated user's own profile.
// Both routes are inside the auth:sanctum middleware group —
// $request->user() is always a valid resolved User model here.
//
// ROUTES:
//   GET /api/user              → profile()
//   PUT /api/user/profile      → updateProfile()
// =========================================================

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // ── profile() ─────────────────────────────────────────────────────────────
    // Returns the authenticated user's profile data to the dashboard.
    // We build the response manually (instead of returning $user directly)
    // to control exactly which fields are exposed — even if new columns are
    // added to the users table in the future, they won't accidentally appear here.
    public function profile(Request $request)
    {
        // $request->user() is resolved by the auth:sanctum middleware:
        // it reads the Bearer token, hashes it, looks it up in personal_access_tokens,
        // and loads the associated User model. This is never null inside a sanctum route.
        $user = $request->user();

        return response()->json([
            'data' => [
                'id'         => $user->id,
                'name'       => $user->name,
                'username'   => $user->username,   // nullable — may be null for older accounts
                'email'      => $user->email,
                'avatar'     => $user->avatar,     // nullable — URL string or null
                'created_at' => $user->created_at, // Carbon instance, serialized as ISO 8601 string
            ],
        ]);
    }

    // ── updateProfile() ───────────────────────────────────────────────────────
    // Allows the user to update their own name and/or email.
    // Uses PATCH-style semantics even though the route is PUT:
    // only fields present in the request are updated ('sometimes' rule).
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            // 'sometimes' — only validate + update this field if it is present in the request.
            // This allows sending just { "name": "New Name" } without touching the email.
            'name'  => ['sometimes', 'string', 'max:255'],

            // Rule::unique('users')->ignore($user->id) — allows the user to submit their
            // own current email without triggering the unique constraint (it ignores their own row).
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],

            // The fields below are commented out but ready to enable:
            // 'username' — alpha_dash: only letters, numbers, dashes, underscores
            // 'avatar'   — must be a valid URL if provided
            // 'password' — 'confirmed' requires a matching 'password_confirmation' field
            // 'username' => ['sometimes', 'string', 'alpha_dash', 'min:3', 'max:30', Rule::unique('users')->ignore($user->id)],
            // 'avatar'   => ['sometimes', 'nullable', 'url', 'max:2048'],
            // 'password' => ['sometimes', 'confirmed', 'min:8'],
        ]);

        // Uncomment if/when password change is added to validation above.
        // The User model's 'hashed' cast would handle this automatically,
        // but being explicit here makes the intent clear.
        // if (isset($validated['password'])) {
        //     $validated['password'] = bcrypt($validated['password']);
        // }

        // fill() copies only the $fillable-listed keys from $validated into the model.
        // save() issues a single UPDATE only for the columns that actually changed
        // (Eloquent tracks dirty attributes — unchanged columns are not written to DB).
        $user->fill($validated)->save();

        return response()->json([
            'message' => 'Profile updated',
            'data'    => [
                // Return only the fields that were actually updatable in this endpoint.
                // Returning the full user here could expose fields the client didn't expect.
                'name'  => $user->name,
                'email' => $user->email,
            ],
        ]);
    }
}
