<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ProviderListingStoreRequest;
use App\Http\Requests\Api\ProviderListingUpdateRequest;
use App\Http\Resources\ProviderListingResource;
use App\Models\ProviderListing;
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
}
