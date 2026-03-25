<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DestinationResource;
use App\Http\Resources\UserResource;
use App\Models\Destination;
use App\Models\LguMonthlyReport;
use App\Models\LocalProviderProfile;
use App\Models\ProviderListing;
use App\Models\Province;
use App\Models\RecommendationRequest;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $userCounts = User::selectRaw('role, COUNT(*) as count')
            ->groupBy('role')
            ->pluck('count', 'role');

        $totalUsers = User::count();
        $tourists = $userCounts->get('tourist', 0);
        $providers = $userCounts->get('local', 0);

        $destStats = Destination::selectRaw('is_active, is_verified, COUNT(*) as count')
            ->groupBy('is_active', 'is_verified')
            ->get()
            ->keyBy(fn ($row) => "{$row->is_active}.{$row->is_verified}");

        $destinations = $destStats->get('1.1')?->count ?? 0;
        $pendingDest = $destStats->get('1.0')?->count ?? 0;

        $providerStats = LocalProviderProfile::selectRaw('is_verified, COUNT(*) as count')
            ->groupBy('is_verified')
            ->pluck('count', 'is_verified');

        $activeProviders = $providerStats->get(1, 0);
        $unverifiedProviders = $providerStats->get(0, 0);

        $monthlyReqs = RecommendationRequest::whereMonth('created_at', now()->month)
            ->selectRaw('COUNT(*) as total, AVG(response_time_ms) as avg_time')
            ->first();

        $pendingListings = ProviderListing::where('status', 'pending')->count();
        $flaggedReviews = Review::where('is_published', false)->count();

        return response()->json([
            'kpis' => [
                'total_users' => $totalUsers,
                'tourists' => $tourists,
                'providers' => $providers,
                'destinations' => $destinations,
                'pending_destinations' => $pendingDest,
                'active_providers' => $activeProviders,
                'unverified_providers' => $unverifiedProviders,
                'monthly_requests' => $monthlyReqs->total ?? 0,
                'avg_response_ms' => round($monthlyReqs->avg_time ?? 0),
                'pending_listings' => $pendingListings,
                'flagged_reviews' => $flaggedReviews,
            ],
        ]);
    }

    public function alerts(): JsonResponse
    {
        $counts = DB::table('provider_listings')
            ->selectRaw('COUNT(CASE WHEN status = "pending" THEN 1 END) as pending_listings')
            ->selectRaw('COUNT(CASE WHEN status IN ("active", "inactive") THEN 1 END) as review_count')
            ->first();

        $flaggedReviews = Review::where('is_published', false)->count();
        $unverifiedProviders = LocalProviderProfile::where('is_verified', false)->count();

        return response()->json([
            'alerts' => [
                [
                    'type' => 'warning',
                    'message' => ($counts->pending_listings ?? 0) . ' listings pending approval',
                ],
                [
                    'type' => 'error',
                    'message' => $flaggedReviews . ' reviews flagged for moderation',
                ],
                [
                    'type' => 'info',
                    'message' => $unverifiedProviders . ' providers awaiting verification',
                ],
                [
                    'type' => 'success',
                    'message' => 'Monthly report auto-generated',
                ],
            ],
        ]);
    }

    public function provinceTraffic(): JsonResponse
    {
        $monthStart = now()->startOfMonth()->toDateString();
        $reports = LguMonthlyReport::where('report_month', '>=', $monthStart)
            ->with('province:id,name')
            ->orderBy('report_month', 'desc')
            ->get(['province_id', 'total_visitors', 'visitor_demographics'])
            ->map(function ($report) {
                $demo = $report->visitor_demographics ?? [];
                return [
                    'province' => $report->province->name ?? 'Unknown',
                    'visitors' => (int) $report->total_visitors,
                    'gen_z' => (int) ($demo['gen_z'] ?? 0),
                    'millennial' => (int) ($demo['millennial'] ?? 0),
                    'gen_x' => (int) ($demo['gen_x'] ?? 0),
                ];
            });

        return response()->json(['data' => $reports]);
    }

    public function topDestinations(): JsonResponse
    {
        $destinations = Destination::where('is_active', true)
            ->with('province:id,name', 'category:id,name')
            ->select('id', 'name', 'view_count', 'avg_rating', 'province_id', 'category_id')
            ->orderBy('view_count', 'desc')
            ->take(5)
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'name' => $d->name,
                'province' => $d->province->name ?? '',
                'views' => (int) $d->view_count,
                'avg_rating' => (float) ($d->avg_rating ?? 0),
            ]);

        return response()->json(['data' => $destinations]);
    }

    public function users(Request $request): JsonResponse
    {
        $query = User::select('id', 'name', 'email', 'role', 'is_active', 'created_at');

        if ($request->filled('role') && $request->string('role')->toString() !== 'all') {
            $query->where('role', $request->string('role')->toString());
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        $status = $request->query('status');
        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate(15));
    }

    public function toggleActive(int $id): JsonResponse
    {
        $user = User::select('id', 'is_active')->findOrFail($id);
        $newStatus = !$user->is_active;
        $user->update(['is_active' => $newStatus]);

        return response()->json([
            'is_active' => $newStatus,
            'message' => $newStatus ? 'User activated' : 'User deactivated',
        ]);
    }

    public function approvals(Request $request): JsonResponse
    {
        $status = $request->query('status', 'pending');

        $listings = ProviderListing::where('status', $status)
            ->with([
                'provider:id,user_id,business_name',
                'provider.user:id,name,email',
                'destination:id,name,province_id',
            ])
            ->select('id', 'provider_id', 'destination_id', 'listing_title', 'listing_type', 'status', 'created_at')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($listings);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $listing = ProviderListing::findOrFail($id);
        $listing->update([
            'status' => 'active',
            'rejection_reason' => null,
            'reviewed_by' => $request->user()?->id,
            'reviewed_at' => now(),
        ]);

        if ($listing->destination_id) {
            Destination::where('id', $listing->destination_id)
                ->update(['is_verified' => true]);
        }

        return response()->json([
            'message' => 'Listing approved',
        ]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $listing = ProviderListing::findOrFail($id);
        $listing->update([
            'status' => 'rejected',
            'rejection_reason' => (string) $request->input('reason', ''),
            'reviewed_by' => $request->user()?->id,
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Listing rejected',
        ]);
    }

    public function approvalQueue(): JsonResponse
    {
        request()->merge(['status' => 'pending']);

        return $this->approvals(request());
    }

    public function approveListing(Request $request, ProviderListing $providerListing): JsonResponse
    {
        return $this->approve($request, $providerListing->id);
    }

    public function rejectListing(Request $request, ProviderListing $providerListing): JsonResponse
    {
        return $this->reject($request, $providerListing->id);
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
        $stats = DB::table('analytics_events')
            ->select('province_id', DB::raw('COUNT(*) as total'))
            ->whereNotNull('province_id')
            ->groupBy('province_id')
            ->get();

        return response()->json(['data' => $stats]);
    }
}
