<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WeatherResource;
use App\Services\WeatherService;
use Illuminate\Http\JsonResponse;

class WeatherController extends Controller
{
    public function __construct(private readonly WeatherService $weatherService) {}

    public function index(): JsonResponse
    {
        $weather = $this->weatherService->getAllProvinces();

        return response()->json([
            'data' => $weather,
        ]);
    }
}
