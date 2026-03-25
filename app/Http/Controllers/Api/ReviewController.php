<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ReviewStoreRequest;
use App\Http\Requests\Api\ReviewUpdateRequest;
use App\Http\Resources\ReviewResource;
use App\Models\ProviderListing;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Review::query()->with(['destination.province', 'user']);

        if ($request->boolean('mine')) {
            $query->where('user_id', $request->user()->id);
        }

        $providerFilter = $request->query('provider');
        if ($providerFilter === 'me' || ($request->boolean('provider') && $request->boolean('mine'))) {
            $provider = $request->user()?->localProviderProfile;
            if ($provider) {
                $destinationIds = ProviderListing::where('provider_id', $provider->id)
                    ->whereNotNull('destination_id')
                    ->pluck('destination_id');

                $query->whereIn('destination_id', $destinationIds);
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        $reviews = $query->latest('created_at')->get();

        return response()->json([
            'data' => $reviews->map(fn (Review $review) => (new ReviewResource($review))->toArray($request)),
        ]);
    }

    public function store(ReviewStoreRequest $request): JsonResponse
    {
        $review = Review::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'is_published' => true,
        ]);

        return response()->json(new ReviewResource($review->load(['destination.province'])), 201);
    }

    public function update(ReviewUpdateRequest $request, Review $review): JsonResponse
    {
        if ($review->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $review->update($request->validated());

        return response()->json(new ReviewResource($review->load(['destination.province'])));
    }

    public function destroy(Request $request, Review $review): JsonResponse
    {
        if ($review->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $review->delete();

        return response()->json(status: 204);
    }

    public function providerReviews(Request $request): JsonResponse
    {
        $user = $request->user();
        $provider = $user->localProviderProfile;

        if (! $provider) {
            return response()->json(['data' => [], 'avg' => 0, 'total' => 0, 'breakdown' => []]);
        }

        $destinationIds = ProviderListing::where('provider_id', $provider->id)
            ->pluck('destination_id')
            ->filter();

        $reviews = Review::whereIn('destination_id', $destinationIds)
            ->with('destination', 'user')
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate rating breakdown
        $totalReviews = $reviews->count();
        $avgRating = $reviews->avg('rating');
        $breakdown = [];
        for ($i = 5; $i >= 1; $i--) {
            $count = $reviews->where('rating', $i)->count();
            $breakdown[$i] = [
                'count' => $count,
                'percent' => $totalReviews > 0
                    ? round(($count / $totalReviews) * 100)
                    : 0,
            ];
        }

        return response()->json([
            'data' => $reviews,
            'avg' => round($avgRating ?? 0, 1),
            'total' => $totalReviews,
            'breakdown' => $breakdown,
        ]);
    }
}
