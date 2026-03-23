<?php

namespace App\Services;

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

    public function getForecastForProvince(string $province): array
    {
        $city = $this->cities[$province] ?? null;
        if (! $city) {
            return [];
        }

        try {
            $response = Http::timeout(12)->get($this->baseUrl . '/forecast', [
                'q' => $city,
                'appid' => $this->apiKey,
                'units' => 'metric',
                'cnt' => 40,
            ]);
        } catch (ConnectionException) {
            return [];
        }

        if ($response->failed()) {
            return [];
        }

        $data = $response->json();
        $list = $data['list'] ?? [];
        if (! is_array($list) || $list === []) {
            return [];
        }

        $grouped = [];
        foreach ($list as $item) {
            $timestamp = (int) ($item['dt'] ?? 0);
            if ($timestamp <= 0) {
                continue;
            }

            $date = date('Y-m-d', $timestamp);
            if (! isset($grouped[$date])) {
                $grouped[$date] = [];
            }
            $grouped[$date][] = $item;
        }

        $dailyForecast = [];
        foreach ($grouped as $date => $items) {
            usort($items, fn ($a, $b) => ((int) ($a['dt'] ?? 0)) <=> ((int) ($b['dt'] ?? 0)));

            $temps = array_values(array_filter(array_column(array_column($items, 'main'), 'temp'), fn ($value) => is_numeric($value)));
            $humidity = array_values(array_filter(array_column(array_column($items, 'main'), 'humidity'), fn ($value) => is_numeric($value)));

            if ($temps === [] || $humidity === []) {
                continue;
            }

            $midday = collect($items)->sortBy(function ($item) {
                $hour = isset($item['dt']) ? (int) date('H', (int) $item['dt']) : 0;
                return abs($hour - 12);
            })->first();

            $hourly = array_map(function ($item): array {
                $timestamp = (int) ($item['dt'] ?? 0);
                $main = $item['main'] ?? [];
                $weather = $item['weather'][0] ?? [];
                $wind = $item['wind'] ?? [];

                return [
                    'time' => $timestamp > 0 ? date('g:i A', $timestamp) : 'N/A',
                    'hour' => $timestamp > 0 ? (int) date('H', $timestamp) : 0,
                    'temp' => isset($main['temp']) && is_numeric($main['temp']) ? (int) round((float) $main['temp']) : null,
                    'feels_like' => isset($main['feels_like']) && is_numeric($main['feels_like']) ? (int) round((float) $main['feels_like']) : null,
                    'humidity' => isset($main['humidity']) && is_numeric($main['humidity']) ? (int) $main['humidity'] : null,
                    'condition' => (string) ($weather['description'] ?? ''),
                    'icon' => (string) ($weather['icon'] ?? '01d'),
                    'wind_speed' => isset($wind['speed']) && is_numeric($wind['speed']) ? (float) round((float) $wind['speed'], 1) : 0.0,
                    'pop' => isset($item['pop']) && is_numeric($item['pop']) ? (int) round(((float) $item['pop']) * 100) : 0,
                ];
            }, $items);

            $dailyForecast[] = [
                'date' => $date,
                'date_label' => date('l, M j', strtotime($date)),
                'temp_min' => (int) round(min($temps)),
                'temp_max' => (int) round(max($temps)),
                'temp_avg' => (int) round(array_sum($temps) / count($temps)),
                'humidity' => (int) round(array_sum($humidity) / count($humidity)),
                'condition' => (string) ($midday['weather'][0]['description'] ?? 'Unknown'),
                'icon' => (string) ($midday['weather'][0]['icon'] ?? '01d'),
                'wind_speed' => (float) round((float) ($midday['wind']['speed'] ?? 0), 1),
                'hourly' => $hourly,
            ];
        }

        return $dailyForecast;
    }

    public function getAllForecastsForChatbot(): array
    {
        $forecasts = [];

        foreach (array_keys($this->cities) as $province) {
            $forecasts[$province] = $this->getForecastForProvince($province);
        }

        return $forecasts;
    }

    private function getForProvince(string $province, string $city): array
    {
        $provinceModel = \App\Models\Province::query()->where('name', $province)->first();

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
            'province_id' => $provinceModel?->id,
            'province'    => $province,
            'temperature' => isset($data['main']['temp']) ? (int) round((float) $data['main']['temp']) : null,
            'feels_like'  => isset($data['main']['feels_like']) ? (int) round((float) $data['main']['feels_like']) : null,
            'condition'   => $data['weather'][0]['description'] ?? 'Unknown',
            'icon'        => $data['weather'][0]['icon'] ?? null,
            'icon_url'    => isset($data['weather'][0]['icon'])
                ? 'https://openweathermap.org/img/wn/' . $data['weather'][0]['icon'] . '@2x.png'
                : null,
            'humidity'    => isset($data['main']['humidity']) ? (int) $data['main']['humidity'] : null,
            'wind_speed'  => isset($data['wind']['speed']) ? (float) $data['wind']['speed'] : null,
        ];
    }

    private function fallback(string $province): array
    {
        $provinceModel = \App\Models\Province::query()->where('name', $province)->first();

        return [
            'province_id' => $provinceModel?->id,
            'province'    => $province,
            'temperature' => null,
            'feels_like'  => null,
            'condition'   => 'Unavailable',
            'icon'        => null,
            'icon_url'    => null,
            'humidity'    => null,
            'wind_speed'  => null,
        ];
    }
}
