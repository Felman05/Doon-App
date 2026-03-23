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
            ->with(['province', 'items'])
            ->withCount('items')
            ->withSum('items', 'estimated_cost')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return response()->json([
            'data' => $itineraries->getCollection()->map(function (Itinerary $itinerary): array {
                return [
                    'id' => $itinerary->id,
                    'title' => $itinerary->title,
                    'status' => $itinerary->status,
                    'start_date' => $itinerary->start_date,
                    'end_date' => $itinerary->end_date,
                    'total_days' => $itinerary->total_days,
                    'budget_label' => $itinerary->budget_label,
                    'number_of_people' => $itinerary->number_of_people,
                    'province' => $itinerary->province?->name,
                    'province_id' => $itinerary->province_id,
                    'items_count' => (int) ($itinerary->items_count ?? 0),
                    'stops_count' => $itinerary->items->count(),
                    'total_estimated_cost' => (float) ($itinerary->items_sum_estimated_cost ?? 0),
                    'created_at' => $itinerary->created_at,
                ];
            }),
            'total' => $itineraries->total(),
            'current_page' => $itineraries->currentPage(),
            'last_page' => $itineraries->lastPage(),
        ]);
    }

    public function store(ItineraryStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $itinerary = Itinerary::create([
            'title' => $validated['title'],
            'province_id' => $validated['province_id'] ?? null,
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
            'budget_label' => $validated['budget_label'] ?? null,
            'number_of_people' => $validated['number_of_people'] ?? 1,
            'user_id' => $request->user()->id,
            'share_token' => Str::random(48),
            'total_days' => $validated['total_days'] ?? 1,
            'status' => 'draft',
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

        $itinerary->load(['province', 'items.destination.province']);

        return response()->json([
            'data' => [
                'id' => $itinerary->id,
                'title' => $itinerary->title,
                'status' => $itinerary->status,
                'start_date' => $itinerary->start_date,
                'end_date' => $itinerary->end_date,
                'total_days' => $itinerary->total_days,
                'budget_label' => $itinerary->budget_label,
                'number_of_people' => $itinerary->number_of_people,
                'province' => $itinerary->province?->name,
                'items' => $itinerary->items
                    ->sortBy(['day_number', 'order_index'])
                    ->values()
                    ->map(fn (ItineraryItem $item) => [
                        'id' => $item->id,
                        'destination_name' => $item->destination?->name,
                        'province' => $item->destination?->province?->name,
                        'day_number' => $item->day_number,
                        'order_index' => $item->order_index,
                        'arrival_time' => $item->arrival_time,
                        'departure_time' => $item->departure_time,
                        'estimated_cost' => $item->estimated_cost,
                        'transport_mode' => $item->transport_mode,
                        'notes' => $item->notes,
                    ]),
            ],
        ]);
    }

    public function update(ItineraryUpdateRequest $request, Itinerary $itinerary): JsonResponse
    {
        if ($itinerary->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $itinerary->update($request->only([
            'title',
            'status',
            'start_date',
            'end_date',
            'budget_label',
            'number_of_people',
        ]));

        return response()->json(new ItineraryResource($itinerary->load(['items.destination'])));
    }

    public function addStop(Request $request, Itinerary $itinerary): JsonResponse
    {
        if ($itinerary->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'destination_id' => ['required', 'integer', 'exists:destinations,id'],
            'day_number' => ['nullable', 'integer', 'min:1'],
            'arrival_time' => ['nullable', 'date_format:H:i'],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'transport_mode' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        $dayNumber = (int) ($validated['day_number'] ?? 1);
        $nextOrder = (int) ItineraryItem::query()
            ->where('itinerary_id', $itinerary->id)
            ->where('day_number', $dayNumber)
            ->max('order_index') + 1;

        $stop = ItineraryItem::create([
            'itinerary_id' => $itinerary->id,
            'destination_id' => $validated['destination_id'],
            'day_number' => $dayNumber,
            'order_index' => $nextOrder,
            'arrival_time' => $validated['arrival_time'] ?? null,
            'estimated_cost' => $validated['estimated_cost'] ?? null,
            'transport_mode' => $validated['transport_mode'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json(['data' => $stop], 201);
    }

    public function destroyStop(Request $request, Itinerary $itinerary, ItineraryItem $stop): JsonResponse
    {
        if ($itinerary->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($stop->itinerary_id !== $itinerary->id) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $stop->delete();

        return response()->json(status: 204);
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
