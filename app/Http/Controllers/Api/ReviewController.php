<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ReviewStoreRequest;
use App\Http\Requests\Api\ReviewUpdateRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Review::query()->with(['destination.province']);

        if ($request->boolean('mine')) {
            $query->where('user_id', $request->user()->id);
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
}
