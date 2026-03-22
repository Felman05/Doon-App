<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\DestinationStoreRequest;
use App\Http\Requests\Api\DestinationUpdateRequest;
use App\Http\Resources\DestinationResource;
use App\Models\Destination;
use App\Services\AnalyticsLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DestinationController extends Controller
{
    public function __construct(private readonly AnalyticsLogger $analyticsLogger) {}

    public function index(Request $request)
    {
        $query = Destination::query()->with(['province', 'category']);

        if ($request->filled('province_id')) {
            $query->where('province_id', $request->integer('province_id'));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return DestinationResource::collection($query->latest()->paginate(12));
    }

    public function store(DestinationStoreRequest $request): JsonResponse
    {
        $destination = Destination::create($request->validated());

        return response()->json(new DestinationResource($destination->load(['province', 'category'])), 201);
    }

    public function show(Request $request, Destination $destination): JsonResponse
    {
        $destination->increment('view_count');

        $this->analyticsLogger->log(
            eventType: 'destination_view',
            userId: $request->user()?->id,
            sessionId: $request->session()->getId(),
            destinationId: $destination->id,
            provinceId: $destination->province_id,
            metadata: ['source' => 'api_show_destination'],
            request: $request,
        );

        return response()->json(new DestinationResource($destination->load(['province', 'category'])));
    }

    public function update(DestinationUpdateRequest $request, Destination $destination): JsonResponse
    {
        $destination->update($request->validated());

        return response()->json(new DestinationResource($destination->load(['province', 'category'])));
    }

    public function destroy(Destination $destination): JsonResponse
    {
        $destination->delete();

        return response()->json(status: 204);
    }
}
