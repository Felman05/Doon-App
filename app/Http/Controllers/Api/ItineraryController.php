<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ItineraryStoreRequest;
use App\Http\Requests\Api\ItineraryUpdateRequest;
use App\Http\Resources\ItineraryResource;
use App\Models\Itinerary;
use App\Models\ItineraryItem;
use App\Services\ItineraryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ItineraryController extends Controller
{
    public function __construct(private readonly ItineraryService $itineraryService) {}

    public function index(Request $request)
    {
        $itineraries = Itinerary::query()
            ->with(['items.destination'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return ItineraryResource::collection($itineraries);
    }

    public function store(ItineraryStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $itinerary = Itinerary::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'share_token' => Str::random(48),
            'total_days' => $validated['total_days'] ?? 1,
        ]);

        if (! empty($validated['destination_ids'])) {
            $generated = $this->itineraryService->generate($validated['destination_ids']);
            $itinerary->update([
                'total_days' => $generated['total_days'],
                'budget_amount' => $generated['total_estimated_cost'],
                'is_ai_generated' => true,
            ]);

            foreach ($generated['items'] as $item) {
                ItineraryItem::create([
                    'itinerary_id' => $itinerary->id,
                    ...$item,
                ]);
            }
        }

        return response()->json(new ItineraryResource($itinerary->load(['items.destination'])), 201);
    }

    public function show(Request $request, Itinerary $itinerary): JsonResponse
    {
        if ($itinerary->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json(new ItineraryResource($itinerary->load(['items.destination'])));
    }

    public function update(ItineraryUpdateRequest $request, Itinerary $itinerary): JsonResponse
    {
        if ($itinerary->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $itinerary->update($request->validated());

        return response()->json(new ItineraryResource($itinerary->load(['items.destination'])));
    }

    public function destroy(Request $request, Itinerary $itinerary): JsonResponse
    {
        if ($itinerary->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $itinerary->delete();

        return response()->json(status: 204);
    }
}
