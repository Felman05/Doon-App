<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\AdminController as ComprehensiveAdminController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatbotController;
use App\Http\Controllers\Api\DestinationController;
use App\Http\Controllers\Api\ItineraryController;
use App\Http\Controllers\Api\ProviderListingController;
use App\Http\Controllers\Api\RecommendationController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\WeatherController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/ping', fn () => response()->json(['message' => 'ok']));

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/weather', [WeatherController::class, 'index']);
    Route::post('/chatbot', [ChatbotController::class, 'store']);

    Route::apiResource('destinations', DestinationController::class);
    Route::apiResource('itineraries', ItineraryController::class);

    Route::middleware('local')->group(function () {
        Route::apiResource('provider-listings', ProviderListingController::class);
    });

    Route::middleware('tourist')->group(function () {
        Route::get('/recommendations', [RecommendationController::class, 'index']);
    });

    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);

    Route::middleware('local')->group(function () {
        Route::get('/analytics/province-stats', [AnalyticsController::class, 'provinceStats']);
        Route::get('/analytics/monthly-report', [AnalyticsController::class, 'monthlyReport']);
    });

    Route::middleware('admin')->prefix('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard/stats', [ComprehensiveAdminController::class, 'dashboardStats']);
        Route::get('/dashboard/chart', [ComprehensiveAdminController::class, 'dashboardChart']);

        // Users
        Route::get('/users', [ComprehensiveAdminController::class, 'listUsers']);
        Route::patch('/users/{id}', [ComprehensiveAdminController::class, 'updateUserRole']);
        Route::delete('/users/{id}', [ComprehensiveAdminController::class, 'deleteUser']);

        // Bookings
        Route::get('/bookings', [ComprehensiveAdminController::class, 'listBookings']);
        Route::patch('/bookings/{id}', [ComprehensiveAdminController::class, 'updateBookingStatus']);

        // Destinations
        Route::get('/destinations', [ComprehensiveAdminController::class, 'listDestinations']);
        Route::delete('/destinations/{id}', [ComprehensiveAdminController::class, 'deleteDestination']);

        // Reviews
        Route::get('/reviews', [ComprehensiveAdminController::class, 'listReviews']);
        Route::patch('/reviews/{id}', [ComprehensiveAdminController::class, 'approveReview']);
        Route::delete('/reviews/{id}', [ComprehensiveAdminController::class, 'deleteReview']);

        // Settings
        Route::get('/settings', [ComprehensiveAdminController::class, 'getSettings']);
        Route::post('/settings', [ComprehensiveAdminController::class, 'updateSettings']);

        // Reports
        Route::get('/reports', [ComprehensiveAdminController::class, 'getReports']);
        Route::get('/reports/export', [ComprehensiveAdminController::class, 'exportReport']);

        // Activity Logs
        Route::get('/activity-logs', [ComprehensiveAdminController::class, 'getActivityLogs']);

        // System Health
        Route::get('/system/health', [ComprehensiveAdminController::class, 'getSystemHealth']);

        // Categories
        Route::get('/categories', [ComprehensiveAdminController::class, 'listCategories']);
        Route::post('/categories', [ComprehensiveAdminController::class, 'storeCategory']);
        Route::patch('/categories/{id}', [ComprehensiveAdminController::class, 'updateCategory']);
        Route::delete('/categories/{id}', [ComprehensiveAdminController::class, 'deleteCategory']);

        // Promo Codes
        Route::get('/promo-codes', [ComprehensiveAdminController::class, 'listPromoCodes']);
        Route::post('/promo-codes', [ComprehensiveAdminController::class, 'storePromoCode']);
        Route::delete('/promo-codes/{id}', [ComprehensiveAdminController::class, 'deletePromoCode']);

        // Media
        Route::get('/media', [ComprehensiveAdminController::class, 'listMedia']);
        Route::post('/media/upload', [ComprehensiveAdminController::class, 'uploadMedia']);
        Route::delete('/media/{id}', [ComprehensiveAdminController::class, 'deleteMedia']);

        // Notifications
        Route::get('/notifications', [ComprehensiveAdminController::class, 'listNotifications']);
        Route::post('/notifications/send', [ComprehensiveAdminController::class, 'sendNotification']);
    });
});
