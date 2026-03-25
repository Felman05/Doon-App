<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ProviderListingStoreRequest;
use App\Http\Requests\Api\ProviderListingUpdateRequest;
use App\Http\Resources\ProviderListingResource;
use App\Models\AnalyticsEvent;
use App\Models\Destination;
use App\Models\ProviderListing;
use App\Models\RecommendationResult;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProviderListingController extends Controller
{
    public function index()
    {
        return ProviderListingResource::collection(
            ProviderListing::query()->latest()->paginate(12),
        );
    }

    public function store(ProviderListingStoreRequest $request): JsonResponse
    {
        if (! in_array($request->user()->role, ['local', 'admin'], true)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $listing = ProviderListing::create($request->validated());

        return response()->json(new ProviderListingResource($listing), 201);
    }

    public function show(ProviderListing $providerListing): JsonResponse
    {
        return response()->json(new ProviderListingResource($providerListing));
    }

    public function update(ProviderListingUpdateRequest $request, ProviderListing $providerListing): JsonResponse
    {
        if (! in_array($request->user()->role, ['local', 'admin'], true)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $providerListing->update($request->validated());

        return response()->json(new ProviderListingResource($providerListing));
    }

    public function destroy(Request $request, ProviderListing $providerListing): JsonResponse
    {
        if (! in_array($request->user()->role, ['local', 'admin'], true)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $providerListing->delete();

        return response()->json(status: 204);
    }

    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        $provider = $user?->localProviderProfile;

        if (! $provider) {
            return response()->json(['error' => 'Not a provider'], 403);
        }

        $listings = ProviderListing::where('provider_id', $provider->id);
        $destinationIds = (clone $listings)->whereNotNull('destination_id')->pluck('destination_id');

        $activeCount = (clone $listings)->where('status', 'active')->count();
        $pendingCount = (clone $listings)->where('status', 'pending')->count();
        $totalViews = $destinationIds->isEmpty()
            ? 0
            : Destination::whereIn('id', $destinationIds)->sum('view_count');
        $avgRating = $destinationIds->isEmpty()
            ? null
            : Review::whereIn('destination_id', $destinationIds)->avg('rating');
        $recAppearances = $destinationIds->isEmpty()
            ? 0
            : RecommendationResult::whereIn('destination_id', $destinationIds)
                ->whereMonth('created_at', now()->month)
                ->count();

        return response()->json([
            'provider_id' => $provider->id,
            'profile_views' => (int) $totalViews,
            'avg_rating' => round($avgRating ?? 0, 1),
            'active_listings' => $activeCount,
            'pending_listings' => $pendingCount,
            'rec_appearances' => $recAppearances,
        ]);
    }

    public function myListings(Request $request): JsonResponse
    {
        $provider = $request->user()?->localProviderProfile;
        if (! $provider) {
            return response()->json(['data' => []]);
        }

        $listings = ProviderListing::where('provider_id', $provider->id)
            ->with('destination')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $listings]);
    }

    public function myAnalytics(Request $request): JsonResponse
    {
        $provider = $request->user()?->localProviderProfile;
        if (! $provider) {
            return response()->json([
                'visitor_origins' => [
                    'metro_manila' => 0,
                    'cavite' => 0,
                    'laguna' => 0,
                    'others' => 0,
                ],
                'recent_reviews' => [],
                'total_events' => 0,
            ]);
        }

        $destinationIds = ProviderListing::where('provider_id', $provider->id)
            ->whereNotNull('destination_id')
            ->pluck('destination_id');

        $reviews = $destinationIds->isEmpty()
            ? collect()
            : Review::whereIn('destination_id', $destinationIds)
                ->with(['destination', 'user'])
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get();

        $events = $destinationIds->isEmpty()
            ? collect()
            : AnalyticsEvent::whereIn('destination_id', $destinationIds)
                ->whereMonth('created_at', now()->month)
                ->get();

        $originCounts = [
            'metro_manila' => 0,
            'cavite' => 0,
            'laguna' => 0,
            'others' => 0,
        ];

        foreach ($events as $event) {
            $origin = strtolower((string) data_get($event->metadata, 'origin', 'others'));
            if (array_key_exists($origin, $originCounts)) {
                $originCounts[$origin]++;
            } else {
                $originCounts['others']++;
            }
        }

        return response()->json([
            'visitor_origins' => $originCounts,
            'recent_reviews' => $reviews,
            'total_events' => $events->count(),
        ]);
    }
}
