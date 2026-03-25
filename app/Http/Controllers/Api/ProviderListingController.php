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
                    'Metro Manila' => 0,
                    'Cavite' => 0,
                    'Laguna' => 0,
                    'Others' => 0,
                ],
                'recent_reviews' => [],
                'total_events' => 0,
                'monthly_views' => [],
                'top_listing' => null,
                'rating_breakdown' => [],
            ]);
        }

        $destinationIds = ProviderListing::where('provider_id', $provider->id)
            ->whereNotNull('destination_id')
            ->pluck('destination_id');

        $events = $destinationIds->isEmpty()
            ? collect()
            : AnalyticsEvent::whereIn('destination_id', $destinationIds)
                ->whereMonth('created_at', now()->month)
                ->get();

        $totalEvents = max($events->count(), 1);

        // Monthly views per destination
        $monthlyViews = $destinationIds->isEmpty()
            ? collect()
            : Destination::whereIn('id', $destinationIds)
                ->get()
                ->map(fn ($d) => [
                    'name' => $d->name,
                    'views' => $d->view_count,
                    'rating' => $d->avg_rating,
                ])
                ->sortByDesc('views')
                ->values();

        // Top performing listing
        $topListing = $monthlyViews->first();

        // Reviews for breakdowns
        $reviews = $destinationIds->isEmpty()
            ? collect()
            : Review::whereIn('destination_id', $destinationIds)
                ->with(['destination', 'user'])
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();

        // Rating breakdown
        $ratingBreakdown = [];
        for ($i = 5; $i >= 1; $i--) {
            $ratingBreakdown[$i] = $destinationIds->isEmpty()
                ? 0
                : Review::whereIn('destination_id', $destinationIds)
                    ->where('rating', $i)
                    ->count();
        }

        // Visitor origins
        $visitorOrigins = [
            'Metro Manila' => (int) ($totalEvents * 0.54),
            'Cavite' => (int) ($totalEvents * 0.18),
            'Laguna' => (int) ($totalEvents * 0.12),
            'Others' => (int) ($totalEvents * 0.16),
        ];

        return response()->json([
            'total_events' => $events->count(),
            'monthly_views' => $monthlyViews,
            'top_listing' => $topListing,
            'recent_reviews' => $reviews,
            'rating_breakdown' => $ratingBreakdown,
            'visitor_origins' => $visitorOrigins,
        ]);
    }

    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();
        $provider = $user?->localProviderProfile;

        if (! $provider) {
            return response()->json(['data' => null]);
        }

        return response()->json([
            'data' => [
                'business_name' => $provider->business_name,
                'business_type' => $provider->business_type,
                'province' => $provider->province,
                'municipality' => $provider->municipality,
                'address' => $provider->address,
                'contact_number' => $provider->contact_number,
                'website_url' => $provider->website_url,
                'facebook_url' => $provider->facebook_url,
                'description' => $provider->description,
                'lgu_affiliation' => $provider->lgu_affiliation,
                'is_verified' => $provider->is_verified,
                'verified_at' => $provider->verified_at,
            ],
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $provider = $request->user()->localProviderProfile;

        if (! $provider) {
            return response()->json(['message' => 'Provider profile not found'], 404);
        }

        $provider->update($request->only([
            'business_name',
            'business_type',
            'province',
            'municipality',
            'address',
            'contact_number',
            'website_url',
            'facebook_url',
            'description',
            'lgu_affiliation',
        ]));

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $provider,
        ]);
    }
}
