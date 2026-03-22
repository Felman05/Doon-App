<?php

namespace App\Services;

use App\Models\Destination;

class ItineraryService
{
    public function generate(array $destinationIds): array
    {
        $destinations = Destination::query()->whereIn('id', $destinationIds)->get();

        $day = 1;
        $order = 1;
        $totalCost = 0;
        $items = [];

        foreach ($destinations as $destination) {
            $cost = (float) ($destination->price_min ?? 0);
            $travel = max(15, (int) (($destination->avg_duration_hours ?? 1) * 20));

            $items[] = [
                'day_number' => $day,
                'order_index' => $order,
                'destination_id' => $destination->id,
                'custom_title' => $destination->name,
                'estimated_cost' => $cost,
                'travel_time_minutes' => $travel,
            ];

            $totalCost += $cost;
            $order++;

            if ($order > 3) {
                $day++;
                $order = 1;
            }
        }

        return [
            'total_days' => max(1, $day),
            'total_estimated_cost' => round($totalCost, 2),
            'items' => $items,
        ];
    }
}
