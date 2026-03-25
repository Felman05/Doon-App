<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\AnalyticsMonthlyReportRequest;
use App\Http\Resources\AnalyticsReportResource;
use App\Models\AnalyticsEvent;
use App\Models\Destination;
use App\Models\LguMonthlyReport;
use App\Models\Province;
use App\Services\AnalyticsService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function __construct(private readonly AnalyticsService $analyticsService) {}

    public function provinceStats(): JsonResponse
    {
        $stats = AnalyticsEvent::query()
            ->select('province_id', DB::raw('COUNT(*) as total'))
            ->whereNotNull('province_id')
            ->groupBy('province_id')
            ->get();

        return response()->json(['data' => $stats]);
    }

    public function monthlyReport(AnalyticsMonthlyReportRequest $request): JsonResponse
    {
        $month = $request->filled('month')
            ? Carbon::createFromFormat('Y-m', $request->string('month')->toString())
            : now();

        $report = $this->analyticsService->generateProvinceMonthlyReport(
            provinceId: $request->integer('province_id'),
            month: $month,
            generatedBy: $request->user()?->id,
        );

        return response()->json(new AnalyticsReportResource($report));
    }

    public function generateReport(Request $request): JsonResponse
    {
        $request->validate([
            'province_id' => 'required|exists:provinces,id',
            'month' => 'required|date_format:Y-m',
        ]);

        $reportMonth = $request->string('month')->toString() . '-01';
        $province = Province::findOrFail($request->integer('province_id'));

        $startDate = Carbon::parse($reportMonth)->startOfMonth();
        $endDate = Carbon::parse($reportMonth)->endOfMonth();

        $events = AnalyticsEvent::whereBetween('created_at', [$startDate, $endDate])
            ->where('province_id', $request->integer('province_id'))
            ->get();

        $totalVisitors = $events->count();
        $uniqueVisitors = $events->unique('user_id')->count();

        $topDestinations = Destination::where('province_id', $request->integer('province_id'))
            ->orderBy('view_count', 'desc')
            ->take(5)
            ->get()
            ->map(fn ($d) => [
                'name' => $d->name,
                'views' => $d->view_count,
            ])
            ->values()
            ->all();

        $report = LguMonthlyReport::updateOrCreate(
            [
                'province_id' => $request->integer('province_id'),
                'report_month' => $reportMonth,
            ],
            [
                'total_visitors' => $totalVisitors,
                'unique_visitors' => $uniqueVisitors,
                'top_destinations' => $topDestinations,
                'generated_at' => now(),
                'generated_by' => $request->user()?->id,
            ],
        );

        return response()->json([
            'message' => 'Report generated for ' . $province->name . ' - ' . Carbon::parse($reportMonth)->format('F Y'),
            'report' => $report,
        ]);
    }

    public function provinceMonthly(Request $request, int $id): JsonResponse
    {
        $month = $request->query('month', now()->format('Y-m'));
        $reportMonth = $month . '-01';

        $report = LguMonthlyReport::where('province_id', $id)
            ->where('report_month', $reportMonth)
            ->with('province')
            ->first();

        if (! $report) {
            return response()->json([
                'data' => null,
                'message' => 'No report for this period yet',
            ]);
        }

        return response()->json(['data' => $report]);
    }
}
