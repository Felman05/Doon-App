<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\RecommendationIndexRequest;
use App\Http\Resources\DestinationResource;
use App\Services\AnalyticsLogger;
use App\Services\RecommendationService;
use Illuminate\Http\JsonResponse;

class RecommendationController extends Controller
{
    public function __construct(
        private readonly RecommendationService $recommendationService,
        private readonly AnalyticsLogger $analyticsLogger,
    ) {}

    public function index(RecommendationIndexRequest $request): JsonResponse
    {
        $payload = $this->recommendationService->recommend(
            $request->validated(),
            $request->user()?->id,
            $request->session()->getId(),
        );

        $paginator = $payload['results'];

        $this->analyticsLogger->log(
            eventType: 'recommendation_generated',
            userId: $request->user()?->id,
            sessionId: $request->session()->getId(),
            destinationId: null,
            provinceId: $request->integer('province_id') ?: null,
            metadata: ['filters' => $request->validated(), 'count' => $paginator->total()],
            request: $request,
        );

        return response()->json([
            'request_id' => $payload['request']?->id,
            'data' => DestinationResource::collection($paginator->items()),
            'total' => $paginator->total(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
        ]);
    }
}
