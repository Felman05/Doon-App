<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PackingTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PackingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->ensureDefaults();

        $categoryId = $request->integer('category_id') ?: null;
        $condition = (string) $request->query('weather_condition', 'any');

        $templates = PackingTemplate::query()
            ->where(function ($q) use ($categoryId): void {
                if ($categoryId) {
                    $q->where('category_id', $categoryId)->orWhereNull('category_id');
                } else {
                    $q->whereNull('category_id');
                }
            })
            ->where(function ($q) use ($condition): void {
                $q->where('weather_condition', $condition)->orWhere('weather_condition', 'any');
            })
            ->get();

        if ($templates->isEmpty()) {
            return response()->json(['data' => $this->fallbackByWeather($condition)]);
        }

        $essential = [];
        $recommended = [];
        $wardrobeTip = 'Dress based on weather and activity level.';

        foreach ($templates as $template) {
            $items = (array) $template->items;
            foreach ((array) ($items['essential'] ?? []) as $item) {
                $essential[] = is_array($item)
                    ? $item
                    : ['item' => (string) $item, 'reason' => 'Useful for this trip profile'];
            }
            foreach ((array) ($items['recommended'] ?? []) as $item) {
                $recommended[] = is_array($item)
                    ? $item
                    : ['item' => (string) $item];
            }
            if (! empty($items['wardrobe_tip'])) {
                $wardrobeTip = (string) $items['wardrobe_tip'];
            }
        }

        return response()->json([
            'data' => [
                'essential' => array_values($essential),
                'recommended' => array_values($recommended),
                'wardrobe_tip' => $wardrobeTip,
            ],
        ]);
    }

    private function fallbackByWeather(string $condition): array
    {
        $preset = match ($condition) {
            'sunny' => [
                'essential' => [
                    ['item' => 'sunscreen', 'reason' => 'Protect skin from UV rays'],
                    ['item' => 'hat', 'reason' => 'Reduce direct sun exposure'],
                    ['item' => 'water bottle', 'reason' => 'Stay hydrated in the heat'],
                    ['item' => 'light clothing', 'reason' => 'Comfort in warm conditions'],
                ],
                'recommended' => [['item' => 'sunglasses'], ['item' => 'power bank']],
                'wardrobe_tip' => 'Choose breathable fabrics and sun-protective layers.',
            ],
            'rainy' => [
                'essential' => [
                    ['item' => 'umbrella', 'reason' => 'Rain protection'],
                    ['item' => 'raincoat', 'reason' => 'Stay dry while moving'],
                    ['item' => 'waterproof bag', 'reason' => 'Protect valuables'],
                    ['item' => 'extra clothes', 'reason' => 'Prepare for getting wet'],
                ],
                'recommended' => [['item' => 'waterproof phone case'], ['item' => 'slip-resistant shoes']],
                'wardrobe_tip' => 'Use quick-dry clothes and waterproof footwear.',
            ],
            'cold' => [
                'essential' => [
                    ['item' => 'jacket', 'reason' => 'Insulation in cooler weather'],
                    ['item' => 'layers', 'reason' => 'Temperature flexibility'],
                    ['item' => 'thermals', 'reason' => 'Retain body heat'],
                    ['item' => 'warm socks', 'reason' => 'Comfort and warmth'],
                ],
                'recommended' => [['item' => 'light gloves'], ['item' => 'scarf']],
                'wardrobe_tip' => 'Wear layered outfits so you can adjust through the day.',
            ],
            default => [
                'essential' => [
                    ['item' => 'comfortable shoes', 'reason' => 'Long walking comfort'],
                    ['item' => 'ID', 'reason' => 'Verification and emergencies'],
                    ['item' => 'cash', 'reason' => 'Many local spots are cash-first'],
                    ['item' => 'phone charger', 'reason' => 'Keep maps and contacts available'],
                ],
                'recommended' => [['item' => 'small day bag'], ['item' => 'power bank']],
                'wardrobe_tip' => 'Choose practical, flexible clothing suitable for travel.',
            ],
        };

        return $preset;
    }

    private function ensureDefaults(): void
    {
        if (PackingTemplate::query()->exists()) {
            return;
        }

        PackingTemplate::query()->insert([
            [
                'category_id' => null,
                'label' => 'General Beach',
                'weather_condition' => 'sunny',
                'season' => null,
                'items' => json_encode([
                    'essential' => [
                        ['item' => 'sunscreen SPF50+', 'reason' => 'Strong sun protection'],
                        ['item' => 'cash', 'reason' => 'Useful for small local vendors'],
                        ['item' => 'dry bag', 'reason' => 'Keep valuables dry'],
                        ['item' => 'water shoes', 'reason' => 'Comfort and protection near shore'],
                    ],
                    'recommended' => [
                        ['item' => 'change of clothes'],
                        ['item' => 'snacks'],
                        ['item' => 'power bank'],
                        ['item' => 'light jacket'],
                        ['item' => 'reef-safe soap'],
                        ['item' => 'sunglasses'],
                    ],
                    'wardrobe_tip' => 'lightweight swim attire + rash guard recommended',
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => null,
                'label' => 'General Hiking',
                'weather_condition' => 'any',
                'season' => null,
                'items' => json_encode([
                    'essential' => [
                        ['item' => 'trail shoes', 'reason' => 'Grip and stability'],
                        ['item' => 'water (2L min)', 'reason' => 'Hydration on trails'],
                        ['item' => 'trail food', 'reason' => 'Sustained energy'],
                        ['item' => 'first aid kit', 'reason' => 'Safety preparedness'],
                    ],
                    'recommended' => [
                        ['item' => 'trekking poles'],
                        ['item' => 'rain jacket'],
                        ['item' => 'sun protection'],
                        ['item' => 'navigation app'],
                    ],
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => null,
                'label' => 'General Rainy',
                'weather_condition' => 'rainy',
                'season' => null,
                'items' => json_encode([
                    'essential' => [
                        ['item' => 'umbrella', 'reason' => 'Rain cover'],
                        ['item' => 'waterproof bag', 'reason' => 'Protect electronics/documents'],
                        ['item' => 'rain jacket', 'reason' => 'Stay dry while commuting'],
                        ['item' => 'extra socks', 'reason' => 'Comfort after rain exposure'],
                    ],
                    'recommended' => [
                        ['item' => 'waterproof phone case'],
                        ['item' => 'rubber shoes'],
                        ['item' => 'extra clothes'],
                    ],
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
