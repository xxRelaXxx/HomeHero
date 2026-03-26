<?php

namespace App\Models;

// MustVerifyEmail is an optional interface that forces email confirmation
// before a user can access 'verified' middleware routes.
// Currently commented out — activate it and add event(new Registered($user))
// in AuthController@register if you want email verification.
// use Illuminate\Contracts\Auth\MustVerifyEmail;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

// Authenticatable: base class that gives Eloquent the login/session contract
// (resolves $request->user(), works with Auth::user(), etc.)
class User extends Authenticatable
{
    // HasFactory   — enables User::factory() for seeders and tests.
    // Notifiable   — allows $user->notify(...) for emails, push notifications, etc.
    // HasApiTokens — adds Sanctum token methods:
    //                  $user->createToken('name')->plainTextToken  → creates a new token string
    //                  $user->tokens()                             → query builder for the user's tokens
    //                  $user->tokens()->delete()                   → revoke all tokens (used on logout)
    use HasFactory, Notifiable, HasApiTokens;

    // Mass-assignable columns — only these can be set via User::create([...]) or $user->fill([...]).
    // 'password' is safe here because the $casts definition below hashes it automatically on write.
    protected $fillable = [
        'name',      // display name (required on register)
        'email',     // unique login identifier (required on register)
        'password',  // bcrypt hash — never stored in plain text (see $casts below)
        'username',  // optional unique handle (added in 2026_01_26 migration)
        'avatar',    // optional URL to profile picture (added in 2026_01_26 migration)
    ];

    // $hidden lists columns that are EXCLUDED from JSON serialization.
    // When you return $user as JSON (e.g. in the login response), these fields
    // are automatically stripped — the password hash and session token never
    // leak to the frontend even if you accidentally return the full model.
    protected $hidden = [
        'password',       // bcrypt hash — must never be sent to the client
        'remember_token', // used for web "remember me" sessions — irrelevant for API, kept for compatibility
    ];

    // $casts converts raw DB column values to typed PHP values on read,
    // and typed PHP values back to DB-compatible values on write.
    protected function casts(): array
    {
        return [
            // Converts the stored datetime string to a Carbon instance on read.
            // Allows: $user->email_verified_at->diffForHumans(), ->isNull(), etc.
            'email_verified_at' => 'datetime',

            // 'hashed' is a special Laravel cast: on WRITE it automatically runs
            // bcrypt/argon2 on the plain-text value before storing it.
            // This means User::create(['password' => 'plain']) is safe —
            // you don't need to manually call Hash::make() before assigning.
            'password' => 'hashed',
        ];
    }
}
