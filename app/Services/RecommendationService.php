<?php

namespace App\Services;

use App\Models\Destination;
use App\Models\RecommendationRequest;
use App\Models\RecommendationResult;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class RecommendationService
{
    public function recommend(array $filters, ?int $userId = null, ?string $sessionId = null): array
    {
        $start = microtime(true);
        $page = max((int) ($filters['page'] ?? 1), 1);
        $people = $filters['number_of_people'] ?? $filters['people'] ?? null;
        $duration = $filters['trip_duration'] ?? $filters['duration'] ?? null;
        $provinceId = $filters['province_id'] ?? null;
        $destinationTable = (new Destination())->getTable();
        $hasIsActive = Schema::hasColumn($destinationTable, 'is_active');
        $hasIsVerified = Schema::hasColumn($destinationTable, 'is_verified');
        $hasCapacity = Schema::hasColumn($destinationTable, 'capacity_per_day');
        $hasAvgDuration = Schema::hasColumn($destinationTable, 'avg_duration_hours');
        $hasAvgRating = Schema::hasColumn($destinationTable, 'avg_rating');

        $hasValue = static function (array $input, string $key): bool {
            if (! array_key_exists($key, $input)) {
                return false;
            }

            return $input[$key] !== null && $input[$key] !== '';
        };

        $query = Destination::query()
            ->with(['province', 'category']);

        if ($hasIsActive) {
            $query->where('is_active', true);
        }

        if ($hasIsVerified) {
            $query->where('is_verified', true);
        }

        if ($hasValue($filters, 'budget')) {
            $query->where('price_label', $filters['budget']);
        }

        if ($hasValue($filters, 'theme')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $filters['theme']));
        }

        if ($people !== null && $people !== '' && is_numeric($people)) {
            if ($hasCapacity) {
                $query->where(function ($q) use ($people): void {
                    $q->where('capacity_per_day', '>=', $people)
                        ->orWhereNull('capacity_per_day');
                });
            }
        }

        if ($duration !== null && $duration !== '' && is_numeric($duration)) {
            $maxHours = ((int) $duration) * 8;
            if ($hasAvgDuration) {
                $query->where(function ($q) use ($maxHours): void {
                    $q->where('avg_duration_hours', '<=', $maxHours)
                        ->orWhereNull('avg_duration_hours');
                });
            }
        }

        if ($provinceId !== null && $provinceId !== '' && is_numeric($provinceId)) {
            $query->where('province_id', (int) $provinceId);
        }

        if (! empty($filters['province_ids']) && is_array($filters['province_ids'])) {
            $provinceIds = collect($filters['province_ids'])
                ->filter(fn ($value) => is_numeric($value))
                ->map(fn ($value) => (int) $value)
                ->unique()
                ->values()
                ->all();

            if ($provinceIds !== []) {
                $query->whereIn('province_id', $provinceIds);
            }
        }

        if (! empty($filters['min_rating']) && $hasAvgRating) {
            $query->where('avg_rating', '>=', (float) $filters['min_rating']);
        }

        if ($hasAvgRating) {
            $query->orderByDesc('avg_rating');
        }

        /** @var LengthAwarePaginator $results */
        $results = $query->paginate(10, ['*'], 'page', $page);

        $resultItems = collect($results->items());

        $requestModel = null;

        try {
            $requestModel = RecommendationRequest::create([
                'user_id' => $userId,
                'session_id' => $sessionId,
                'budget_amount' => $filters['budget_amount'] ?? null,
                'budget_label' => $filters['budget'] ?? null,
                'theme' => $filters['theme'] ?? null,
                'number_of_people' => $people,
                'trip_duration_days' => $duration,
                'province_id' => $provinceId,
                'generational_profile' => $filters['generational_profile'] ?? null,
                'results_count' => $results->total(),
                'response_time_ms' => (int) ((microtime(true) - $start) * 1000),
                'created_at' => now(),
            ]);

            foreach ($resultItems as $index => $destination) {
                RecommendationResult::create([
                    'request_id' => $requestModel->id,
                    'destination_id' => $destination->id,
                    'score' => (float) ($destination->avg_rating ?? 0),
                    'rank_position' => (($page - 1) * 10) + $index + 1,
                    'created_at' => now(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::warning('Recommendation analytics persistence skipped', ['error' => $e->getMessage()]);
        }

        return [
            'request' => $requestModel,
            'results' => $results,
        ];
    }
}
