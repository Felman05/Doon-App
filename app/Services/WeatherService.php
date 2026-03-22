<?php

namespace App\Services;

use App\Models\Province;
use App\Models\WeatherCache;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class WeatherService
{
    private string $apiKey;
    private string $baseUrl;

    // Exact city names that OpenWeatherMap recognises for CALABARZON
    private array $cities = [
        'Batangas' => 'Batangas City,PH',
        'Laguna'   => 'Santa Cruz,PH',
        'Cavite'   => 'Cavite City,PH',
        'Rizal'    => 'Antipolo,PH',
        'Quezon'   => 'Lucena,PH',
    ];

    public function __construct()
    {
        $this->apiKey  = config('services.openweathermap.key');
        $this->baseUrl = config('services.openweathermap.base_url');
    }

    public function getAllProvinces(): array
    {
        $results = [];

        foreach ($this->cities as $province => $city) {
            $results[] = $this->getForProvince($province, $city);
        }

        return $results;
    }

    private function getForProvince(string $province, string $city): array
    {
        // Check cache first (expires_at in DB)
        $cached = WeatherCache::whereHas('province', fn($q) => 
                $q->where('name', $province)
            )
            ->where('expires_at', '>', now())
            ->first();

        if ($cached) {
            $data = $cached->weather_data;
        } else {
            try {
                $response = Http::timeout(12)->get($this->baseUrl . '/weather', [
                    'q'     => $city,
                    'appid' => $this->apiKey,
                    'units' => 'metric',
                ]);

                if ($response->failed()) {
                    return $this->fallback($province);
                }

                $data = $response->json();
            } catch (ConnectionException $e) {
                return $this->fallback($province);
            }

            // Upsert into weather_cache
            $provinceModel = \App\Models\Province::where('name', $province)->first();

            if ($provinceModel) {
                WeatherCache::updateOrCreate(
                    ['province_id' => $provinceModel->id],
                    [
                        'weather_data' => $data,
                        'fetched_at'   => now(),
                        'expires_at'   => now()->addHour(),
                    ]
                );
            }
        }

        return [
            'province'    => $province,
            'temperature' => round($data['main']['temp'] ?? 0),
            'feels_like'  => round($data['main']['feels_like'] ?? 0),
            'condition'   => $data['weather'][0]['description'] ?? 'Unknown',
            'icon'        => $data['weather'][0]['icon'] ?? '01d',
            'icon_url'    => 'https://openweathermap.org/img/wn/' . 
                             ($data['weather'][0]['icon'] ?? '01d') . '@2x.png',
            'humidity'    => $data['main']['humidity'] ?? 0,
            'wind_speed'  => $data['wind']['speed'] ?? 0,
        ];
    }

    private function fallback(string $province): array
    {
        return [
            'province'    => $province,
            'temperature' => null,
            'condition'   => 'Unavailable',
            'icon'        => '01d',
            'icon_url'    => null,
            'humidity'    => null,
            'wind_speed'  => null,
        ];
    }
}
