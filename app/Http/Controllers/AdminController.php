<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Booking;
use App\Models\Destination;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function dashboardStats()
    {
        return response()->json([
            'data' => [
                'total_users' => User::count(),
                'total_bookings' => Booking::count(),
                'total_revenue' => Booking::sum('total_price'),
                'avg_rating' => Review::avg('rating') ?? 0,
            ]
        ]);
    }

    public function dashboardChart()
    {
        $bookings = Booking::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'data' => $bookings->map(fn($b) => [
                'name' => $b->date,
                'Bookings' => $b->count,
            ])
        ]);
    }

    public function listUsers(Request $request)
    {
        $query = User::where('role', '!=', 'admin');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
        }

        return response()->json([
            'data' => [
                'data' => $query->paginate(10),
                'total' => $query->count(),
                'last_page' => $query->paginate(10)->lastPage(),
            ]
        ]);
    }

    public function updateUserRole(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update(['role' => $request->role]);
        return response()->json(['message' => 'User updated', 'data' => $user]);
    }

    public function deleteUser($id)
    {
        User::destroy($id);
        return response()->json(['message' => 'User deleted']);
    }

    public function listBookings(Request $request)
    {
        $query = Booking::with(['user', 'destination']);

        if ($request->status && $request->status != 'all') {
            $query->where('status', $request->status);
        }

        return response()->json([
            'data' => [
                'data' => $query->paginate(10),
                'total' => $query->count(),
                'last_page' => $query->paginate(10)->lastPage(),
            ]
        ]);
    }

    public function updateBookingStatus(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);
        $booking->update(['status' => $request->status]);
        return response()->json(['message' => 'Booking updated', 'data' => $booking]);
    }

    public function listDestinations(Request $request)
    {
        $query = Destination::query();

        return response()->json([
            'data' => [
                'data' => $query->paginate(10),
                'total' => $query->count(),
                'last_page' => $query->paginate(10)->lastPage(),
            ]
        ]);
    }

    public function deleteDestination($id)
    {
        Destination::destroy($id);
        return response()->json(['message' => 'Destination deleted']);
    }

    public function listReviews(Request $request)
    {
        $query = Review::with(['user', 'destination']);

        if ($request->status && $request->status != 'all') {
            $query->where('status', $request->status);
        }

        return response()->json([
            'data' => [
                'data' => $query->paginate(10),
                'total' => $query->count(),
                'last_page' => $query->paginate(10)->lastPage(),
            ]
        ]);
    }

    public function approveReview($id)
    {
        $review = Review::findOrFail($id);
        $review->update(['status' => 'approved']);
        return response()->json(['message' => 'Review approved', 'data' => $review]);
    }

    public function deleteReview($id)
    {
        Review::destroy($id);
        return response()->json(['message' => 'Review deleted']);
    }

    public function getSettings()
    {
        $settings = [
            'app_name' => config('app.name'),
            'app_email' => config('mail.from.address'),
            'app_phone' => Cache::get('app_phone'),
            'app_address' => Cache::get('app_address'),
            'maintenance_mode' => config('app.maintenance_mode'),
        ];

        return response()->json(['data' => $settings]);
    }

    public function updateSettings(Request $request)
    {
        Cache::put('app_phone', $request->app_phone);
        Cache::put('app_address', $request->app_address);

        return response()->json(['message' => 'Settings updated']);
    }

    public function getReports(Request $request)
    {
        $startDate = $request->start_date;
        $endDate = $request->end_date;
        $type = $request->type ?? 'bookings';

        $data = match($type) {
            'bookings' => [
                'total_bookings' => Booking::whereBetween('created_at', [$startDate, $endDate])->count(),
                'confirmed' => Booking::where('status', 'confirmed')->whereBetween('created_at', [$startDate, $endDate])->count(),
                'pending' => Booking::where('status', 'pending')->whereBetween('created_at', [$startDate, $endDate])->count(),
            ],
            'revenue' => [
                'total_revenue' => Booking::whereBetween('created_at', [$startDate, $endDate])->sum('total_price'),
                'average_booking_value' => Booking::whereBetween('created_at', [$startDate, $endDate])->avg('total_price'),
            ],
            'users' => [
                'new_users' => User::whereBetween('created_at', [$startDate, $endDate])->count(),
                'total_users' => User::count(),
            ],
            default => []
        };

        return response()->json(['data' => $data]);
    }

    public function getActivityLogs(Request $request)
    {
        // This would typically read from an activity_logs table
        $logs = collect([]);

        return response()->json([
            'data' => [
                'data' => $logs->paginate(10),
                'total' => count($logs),
                'last_page' => 1,
            ]
        ]);
    }

    public function getSystemHealth()
    {
        return response()->json([
            'data' => [
                'database' => [
                    'status' => 'healthy',
                    'response_time' => 5,
                    'connections' => 2,
                    'max_connections' => 100,
                ],
                'server' => [
                    'status' => 'healthy',
                    'cpu_usage' => 25,
                    'memory_usage' => 45,
                    'disk_usage' => 60,
                ],
                'cache' => [
                    'status' => 'healthy',
                    'driver' => 'redis',
                    'hit_rate' => 85,
                ],
                'queue' => [
                    'status' => 'healthy',
                    'pending_jobs' => 5,
                    'failed_jobs' => 0,
                ],
                'email' => [
                    'status' => 'healthy',
                    'service' => 'smtp',
                    'last_check' => now(),
                ],
                'storage' => [
                    'status' => 'healthy',
                    'used_space' => 250,
                    'total_space' => 1000,
                    'file_count' => 1234,
                ],
                'last_update' => now(),
            ]
        ]);
    }
}

    public function listCategories()
    {
        $categories = Cache::get('categories', []);
        return response()->json(['data' => $categories]);
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $categories = Cache::get('categories', []);
        $category = array_merge($validated, ['id' => uniqid()]);
        $categories[] = $category;
        Cache::put('categories', $categories);

        return response()->json(['message' => 'Category created', 'data' => $category]);
    }

    public function updateCategory(Request $request, $id)
    {
        $categories = Cache::get('categories', []);
        $index = array_search($id, array_column($categories, 'id'));
        if ($index !== false) {
            $categories[$index] = array_merge($categories[$index], $request->all());
            Cache::put('categories', $categories);
            return response()->json(['message' => 'Category updated', 'data' => $categories[$index]]);
        }
        return response()->json(['error' => 'Category not found'], 404);
    }

    public function deleteCategory($id)
    {
        $categories = Cache::get('categories', []);
        $categories = array_filter($categories, fn($c) => $c['id'] !== $id);
        Cache::put('categories', $categories);
        return response()->json(['message' => 'Category deleted']);
    }

    public function listPromoCodes(Request $request)
    {
        $codes = Cache::get('promo_codes', []);
        return response()->json([
            'data' => [
                'data' => array_slice($codes, ($request->page - 1) * 10, 10),
                'total' => count($codes),
                'last_page' => ceil(count($codes) / 10),
            ]
        ]);
    }

    public function storePromoCode(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|unique:promo_codes',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric',
        ]);

        $codes = Cache::get('promo_codes', []);
        $code = array_merge($validated, [
            'id' => uniqid(),
            'uses_count' => 0,
            'max_uses' => $request->max_uses,
            'expiry_date' => $request->expiry_date,
            'created_at' => now(),
        ]);
        $codes[] = $code;
        Cache::put('promo_codes', $codes);

        return response()->json(['message' => 'Promo code created', 'data' => $code]);
    }

    public function deletePromoCode($id)
    {
        $codes = Cache::get('promo_codes', []);
        $codes = array_filter($codes, fn($c) => $c['id'] !== $id);
        Cache::put('promo_codes', $codes);
        return response()->json(['message' => 'Promo code deleted']);
    }

    public function listMedia(Request $request)
    {
        $files = Cache::get('media_files', []);
        return response()->json([
            'data' => [
                'data' => array_slice($files, ($request->page - 1) * 10, 10),
                'total' => count($files),
                'last_page' => ceil(count($files) / 10),
            ]
        ]);
    }

    public function uploadMedia(Request $request)
    {
        $request->validate(['files' => 'required|array']);

        $files = Cache::get('media_files', []);
        foreach ($request->file('files', []) as $file) {
            $path = $file->store('media', 'public');
            $files[] = [
                'id' => uniqid(),
                'filename' => $file->getClientOriginalName(),
                'url' => asset("storage/$path"),
                'size' => $file->getSize(),
                'created_at' => now(),
            ];
        }
        Cache::put('media_files', $files);

        return response()->json(['message' => 'Files uploaded']);
    }

    public function deleteMedia($id)
    {
        $files = Cache::get('media_files', []);
        $files = array_filter($files, fn($f) => $f['id'] !== $id);
        Cache::put('media_files', $files);
        return response()->json(['message' => 'File deleted']);
    }

    public function listNotifications(Request $request)
    {
        $notifications = Cache::get('notifications', []);
        return response()->json([
            'data' => [
                'data' => array_slice($notifications, ($request->page - 1) * 10, 10),
                'total' => count($notifications),
                'last_page' => ceil(count($notifications) / 10),
            ]
        ]);
    }

    public function sendNotification(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'message' => 'required|string',
            'recipient_type' => 'required|in:all,admins,users',
            'send_email' => 'boolean',
        ]);

        $notifications = Cache::get('notifications', []);
        $notification = array_merge($validated, [
            'id' => uniqid(),
            'sent_count' => 0,
            'sent_at' => now(),
            'created_at' => now(),
        ]);
        $notifications[] = $notification;
        Cache::put('notifications', $notifications);

        return response()->json(['message' => 'Notification sent', 'data' => $notification]);
    }

    public function exportReport(Request $request)
    {
        $data = $this->getReports($request)->getData()->data;

        $csv = "Metric,Value\n";
        foreach ($data as $key => $value) {
            $csv .= "$key," . (is_array($value) ? json_encode($value) : $value) . "\n";
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="report.csv"',
        ]);
    }
