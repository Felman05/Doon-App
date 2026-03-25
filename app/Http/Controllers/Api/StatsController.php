<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use App\Models\Province;
use App\Models\RecommendationRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'destinations_count' => Destination::where('is_active', true)->where('is_verified', true)->count(),
            'users_count' => User::where('is_active', true)->count(),
            'provinces_count' => Province::count(),
            'monthly_requests' => RecommendationRequest::whereMonth('created_at', now()->month)->count(),
        ]);
    }
}