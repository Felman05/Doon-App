<?php

namespace App\Services;

use App\Models\Destination;
use App\Models\RecommendationRequest;
use App\Models\RecommendationResult;
use Illuminate\Database\Eloquent\Collection;

class RecommendationService
{
    public function recommend(array $filters, ?int $userId = null, ?string $sessionId = null): array
    {
        $start = microtime(true);

        $query = Destination::query()
            ->with(['province', 'category'])
            ->where('is_active', true)
            ->where('is_verified', true);

        if (! empty($filters['province_id'])) {
            $query->where('province_id', $filters['province_id']);
        }

        if (! empty($filters['theme'])) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $filters['theme']));
        }

        if (! empty($filters['budget'])) {
            $this->applyBudgetFilter($query, $filters['budget']);
        }

        $destinations = $query->limit(100)->get();

        $ranked = $this->scoreDestinations($destinations, $filters)
            ->sortByDesc('score')
            ->values();

        $requestModel = RecommendationRequest::create([
            'user_id' => $userId,
            'session_id' => $sessionId,
            'budget_amount' => $filters['budget_amount'] ?? null,
            'budget_label' => $filters['budget'] ?? null,
            'theme' => $filters['theme'] ?? null,
            'number_of_people' => $filters['number_of_people'] ?? null,
            'trip_duration_days' => $filters['trip_duration'] ?? null,
            'province_id' => $filters['province_id'] ?? null,
            'generational_profile' => $filters['generational_profile'] ?? null,
            'results_count' => $ranked->count(),
            'response_time_ms' => (int) ((microtime(true) - $start) * 1000),
            'created_at' => now(),
        ]);

        foreach ($ranked->take(20) as $index => $row) {
            RecommendationResult::create([
                'request_id' => $requestModel->id,
                'destination_id' => $row['destination']->id,
                'score' => $row['score'],
                'rank_position' => $index + 1,
                'created_at' => now(),
            ]);
        }

        return [
            'request' => $requestModel,
            'results' => $ranked->pluck('destination')->take(20)->values(),
        ];
    }

    private function applyBudgetFilter($query, string $budget): void
    {
        $query->where(function ($q) use ($budget): void {
            if ($budget === 'free') {
                $q->where('price_label', 'free')->orWhere('price_min', 0);
            }

            if ($budget === 'budget') {
                $q->whereIn('price_label', ['free', 'budget'])->orWhere('price_max', '<=', 1500);
            }

            if ($budget === 'mid_range') {
                $q->whereIn('price_label', ['budget', 'mid_range'])->orWhereBetween('price_max', [500, 5000]);
            }

            if ($budget === 'luxury') {
                $q->whereIn('price_label', ['mid_range', 'luxury'])->orWhere('price_max', '>=', 3000);
            }
        });
    }

    private function scoreDestinations(Collection $destinations, array $filters): Collection
    {
        return $destinations->map(function (Destination $destination) use ($filters): array {
            $score = 0.5;

            if (! empty($filters['generational_profile']) && is_array($destination->generational_appeal)) {
                $appeal = (float) ($destination->generational_appeal[$filters['generational_profile']] ?? 5);
                $score += ($appeal / 10) * 0.25;
            }

            if (! empty($filters['trip_duration']) && $destination->avg_duration_hours) {
                $tripHours = ((int) $filters['trip_duration']) * 8;
                $durationDelta = abs($tripHours - (float) $destination->avg_duration_hours);
                $score += max(0, (1 - ($durationDelta / max($tripHours, 1)))) * 0.15;
            }

            if (! empty($filters['number_of_people']) && $destination->capacity_per_day) {
                $people = (int) $filters['number_of_people'];
                if ($destination->capacity_per_day >= $people) {
                    $score += 0.1;
                }
            }

            return [
                'destination' => $destination,
                'score' => round(min($score, 1), 4),
            ];
        });
    }
}
