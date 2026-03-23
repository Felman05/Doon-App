<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use App\Models\Favorite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $favorites = Favorite::query()
            ->with(['destination.province', 'destination.category'])
            ->where('user_id', $request->user()->id)
            ->latest('created_at')
            ->get();

        return response()->json([
            'data' => $favorites->map(fn (Favorite $favorite) => [
                'id' => $favorite->id,
                'destination_id' => $favorite->destination_id,
                'destination' => [
                    'id' => $favorite->destination?->id,
                    'name' => $favorite->destination?->name,
                    'province' => $favorite->destination?->province?->name,
                    'category' => $favorite->destination?->category?->name,
                    'category_slug' => $favorite->destination?->category?->slug,
                    'category_color' => $favorite->destination?->category?->color,
                    'avg_rating' => $favorite->destination?->avg_rating,
                ],
                'created_at' => $favorite->created_at,
            ]),
        ]);
    }

    public function store(Request $request, Destination $destination): JsonResponse
    {
        $favorite = Favorite::query()->firstOrCreate([
            'user_id' => $request->user()->id,
            'destination_id' => $destination->id,
        ], [
            'created_at' => now(),
        ]);

        return response()->json(['data' => $favorite], 201);
    }

    public function destroy(Request $request, Destination $destination): JsonResponse
    {
        Favorite::query()
            ->where('user_id', $request->user()->id)
            ->where('destination_id', $destination->id)
            ->delete();

        return response()->json(status: 204);
    }
}
