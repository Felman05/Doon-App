<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\AnalyticsMonthlyReportRequest;
use App\Http\Resources\AnalyticsReportResource;
use App\Models\AnalyticsEvent;
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
}
