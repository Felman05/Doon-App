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
    public function store(ReviewStoreRequest $request): JsonResponse
    {
        $review = Review::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'is_published' => true,
        ]);

        return response()->json(new ReviewResource($review), 201);
    }

    public function update(ReviewUpdateRequest $request, Review $review): JsonResponse
    {
        if ($review->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $review->update($request->validated());

        return response()->json(new ReviewResource($review));
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
