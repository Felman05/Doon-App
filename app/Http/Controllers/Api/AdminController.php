<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdminDashboardResource;
use App\Http\Resources\DestinationResource;
use App\Http\Resources\ProviderListingResource;
use App\Http\Resources\UserResource;
use App\Models\AnalyticsEvent;
use App\Models\Destination;
use App\Models\LguMonthlyReport;
use App\Models\ProviderListing;
use App\Models\Province;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $resource = new AdminDashboardResource([
            'stats' => [
                'users' => User::count(),
                'destinations' => Destination::count(),
                'providers' => User::query()->where('role', 'local')->count(),
                'monthly_ai_requests' => AnalyticsEvent::query()->where('event_type', 'recommendation_generated')->count(),
            ],
            'system_alerts' => [
                'pending_listings' => ProviderListing::query()->where('status', 'pending')->count(),
            ],
            'traffic_by_province' => Province::query()
                ->leftJoin('analytics_events', 'provinces.id', '=', 'analytics_events.province_id')
                ->select('provinces.id', 'provinces.name', DB::raw('COUNT(analytics_events.id) as events'))
                ->groupBy('provinces.id', 'provinces.name')
                ->get(),
        ]);

        return response()->json($resource);
    }

    public function users(Request $request): JsonResponse
    {
        $query = User::query()->latest();

        if ($request->filled('role')) {
            $query->where('role', $request->string('role')->toString());
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'data' => UserResource::collection($query->paginate(15)),
        ]);
    }

    public function approvalQueue(): JsonResponse
    {
        $queue = ProviderListing::query()
            ->where('status', 'pending')
            ->with(['provider', 'destination'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => ProviderListingResource::collection($queue),
        ]);
    }

    public function approveListing(Request $request, ProviderListing $providerListing): JsonResponse
    {
        $providerListing->update([
            'status' => 'approved',
            'rejection_reason' => null,
            'reviewed_by' => $request->user()?->id,
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Listing approved.',
            'data' => new ProviderListingResource($providerListing->fresh(['provider', 'destination'])),
        ]);
    }

    public function rejectListing(Request $request, ProviderListing $providerListing): JsonResponse
    {
        $providerListing->update([
            'status' => 'rejected',
            'rejection_reason' => (string) $request->input('reason', 'Rejected by admin'),
            'reviewed_by' => $request->user()?->id,
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Listing rejected.',
            'data' => new ProviderListingResource($providerListing->fresh(['provider', 'destination'])),
        ]);
    }

    public function destinations(): JsonResponse
    {
        $items = Destination::query()->with(['province', 'category'])->latest()->paginate(15);

        return response()->json([
            'data' => DestinationResource::collection($items),
        ]);
    }

    public function reports(): JsonResponse
    {
        $items = LguMonthlyReport::query()->with('province')->latest('report_month')->paginate(15);

        return response()->json([
            'data' => $items,
        ]);
    }

    public function provinceStats(): JsonResponse
    {
        $stats = AnalyticsEvent::query()
            ->select('province_id', DB::raw('COUNT(*) as total'))
            ->whereNotNull('province_id')
            ->groupBy('province_id')
            ->get();

        return response()->json(['data' => $stats]);
    }
}
