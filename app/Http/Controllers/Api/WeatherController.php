<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WeatherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    public function forecast(Request $request): JsonResponse
    {
        $province = $request->query('province');

        if (is_string($province) && $province !== '') {
            $data = $this->weatherService->getForecastForProvince($province);
            return response()->json(['data' => $data]);
        }

        $data = $this->weatherService->getAllForecastsForChatbot();
        return response()->json(['data' => $data]);
    }
}
