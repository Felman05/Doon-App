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
        $totalUsers = User::count();
        $tourists = User::where('role', 'tourist')->count();
        $providers = User::where('role', 'local')->count();
        $destinations = Destination::where('is_active', true)->count();
        $pendingDest = Destination::where('is_verified', false)->count();
        $activeProviders = LocalProviderProfile::where('is_verified', true)->count();
        $unverifiedProviders = LocalProviderProfile::where('is_verified', false)->count();
        $monthlyRequests = RecommendationRequest::whereMonth('created_at', now()->month)->count();
        $avgResponseMs = RecommendationRequest::whereMonth('created_at', now()->month)->avg('response_time_ms');
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
                'monthly_requests' => $monthlyRequests,
                'avg_response_ms' => round($avgResponseMs ?? 0),
                'pending_listings' => $pendingListings,
                'flagged_reviews' => $flaggedReviews,
            ],
        ]);
    }

    public function alerts(): JsonResponse
    {
        return response()->json([
            'alerts' => [
                [
                    'type' => 'warning',
                    'message' => ProviderListing::where('status', 'pending')->count() . ' listings pending approval',
                ],
                [
                    'type' => 'error',
                    'message' => Review::where('is_published', false)->count() . ' reviews flagged for moderation',
                ],
                [
                    'type' => 'info',
                    'message' => LocalProviderProfile::where('is_verified', false)->count() . ' providers awaiting verification',
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
        $provinces = Province::with(['analyticsEvents' => function ($q) {
            $q->whereMonth('created_at', now()->month);
        }])->get()->map(function ($province) {
            $events = $province->analyticsEvents;

            return [
                'province' => $province->name,
                'visitors' => $events->count(),
                'gen_z' => $events->filter(fn ($event) => data_get($event->metadata, 'gen') === 'gen_z')->count(),
                'millennial' => $events->filter(fn ($event) => data_get($event->metadata, 'gen') === 'millennial')->count(),
                'gen_x' => $events->filter(fn ($event) => data_get($event->metadata, 'gen') === 'gen_x')->count(),
            ];
        });

        if ($provinces->sum('visitors') === 0) {
            $reports = LguMonthlyReport::where('report_month', now()->startOfMonth()->toDateString())
                ->with('province')
                ->get()
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

        return response()->json(['data' => $provinces]);
    }

    public function topDestinations(): JsonResponse
    {
        $destinations = Destination::where('is_active', true)
            ->orderBy('view_count', 'desc')
            ->take(5)
            ->with('province', 'category')
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'name' => $d->name,
                'province' => $d->province->name ?? '',
                'views' => $d->view_count,
                'avg_rating' => $d->avg_rating,
            ]);

        return response()->json(['data' => $destinations]);
    }

    public function users(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('role')) {
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
        $user = User::findOrFail($id);
        $user->update(['is_active' => ! $user->is_active]);

        return response()->json([
            'is_active' => $user->is_active,
            'message' => $user->is_active ? 'User activated' : 'User deactivated',
        ]);
    }

    public function approvals(Request $request): JsonResponse
    {
        $status = $request->query('status', 'pending');

        $listings = ProviderListing::where('status', $status)
            ->with(['provider.user', 'destination'])
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
