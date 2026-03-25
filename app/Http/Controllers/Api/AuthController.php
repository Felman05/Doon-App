<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        if (($validated['role'] ?? null) === 'admin') {
            return response()->json([
                'message' => 'Admin accounts are managed internally.',
            ], 422);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'data_privacy_consent' => true,
            'consent_given_at' => now(),
            'is_active' => true,
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'user' => new UserResource($user),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = [
            'email' => mb_strtolower(trim((string) $request->input('email'))),
            'password' => (string) $request->input('password'),
        ];

        if (! Auth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (! $request->user()?->is_active) {
            Auth::guard('web')->logout();
            return response()->json(['message' => 'Your account is inactive. Contact an administrator.'], 403);
        }

        $request->session()->regenerate();

        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->loadMissing(['touristProfile:id,user_id,generational_profile,preferred_budget,travel_style']);

        return response()->json(['user' => new UserResource($user)]);
    }

    public function savePreferences(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'generational_profile' => ['nullable', 'string', 'max:50'],
            'preferred_budget' => ['nullable', 'string', 'max:50'],
            'preferred_travel_style' => ['nullable', 'string', 'max:100'],
            'preferred_provinces' => ['nullable', 'array'],
            'preferred_provinces.*' => ['string', 'max:100'],
            'preferred_themes' => ['nullable', 'array'],
            'preferred_themes.*' => ['string', 'max:100'],
            'location_tracking' => ['nullable', 'boolean'],
        ]);

        $user = $request->user();
        $user->touristProfile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'generational_profile' => $validated['generational_profile'] ?? null,
                'preferred_budget' => $validated['preferred_budget'] ?? null,
                'travel_style' => $validated['preferred_travel_style'] ?? null,
                'preferred_provinces' => $validated['preferred_provinces'] ?? [],
                'preferred_themes' => $validated['preferred_themes'] ?? [],
                'location_tracking_consent' => (bool) ($validated['location_tracking'] ?? false),
            ]
        );

        return response()->json([
            'message' => 'Preferences saved',
            'user' => new UserResource($user->load('touristProfile')),
        ]);
    }
}
