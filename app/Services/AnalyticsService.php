<?php

namespace App\Services;

use App\Models\AnalyticsEvent;
use App\Models\Itinerary;
use App\Models\LguMonthlyReport;
use App\Models\Review;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    public function generateProvinceMonthlyReport(int $provinceId, Carbon $month, ?int $generatedBy = null): LguMonthlyReport
    {
        $start = $month->copy()->startOfMonth();
        $end = $month->copy()->endOfMonth();

        $events = AnalyticsEvent::query()
            ->where('province_id', $provinceId)
            ->whereBetween('created_at', [$start, $end]);

        $totalVisitors = (clone $events)->count();
        $uniqueVisitors = (clone $events)->distinct('user_id')->count('user_id');

        $topDestinations = (clone $events)
            ->select('destination_id', DB::raw('COUNT(*) as views'))
            ->whereNotNull('destination_id')
            ->groupBy('destination_id')
            ->orderByDesc('views')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'destination_id' => $row->destination_id,
                'views' => (int) $row->views,
            ])
            ->values()
            ->all();

        $itineraryCount = Itinerary::query()
            ->where('province_id', $provinceId)
            ->whereBetween('created_at', [$start, $end])
            ->count();

        $reviewCount = Review::query()
            ->whereHas('destination', fn ($q) => $q->where('province_id', $provinceId))
            ->whereBetween('created_at', [$start, $end])
            ->count();

        return LguMonthlyReport::query()->updateOrCreate(
            [
                'province_id' => $provinceId,
                'report_month' => $start->toDateString(),
            ],
            [
                'total_visitors' => $totalVisitors,
                'unique_visitors' => $uniqueVisitors,
                'top_destinations' => $topDestinations,
                'visitor_demographics' => ['gen_z' => 0, 'millennial' => 0, 'gen_x' => 0, 'boomer' => 0],
                'total_itineraries_created' => $itineraryCount,
                'total_reviews' => $reviewCount,
                'generated_at' => now(),
                'generated_by' => $generatedBy,
            ],
        );
    }
}
