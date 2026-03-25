<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatbotController;
use App\Http\Controllers\Api\DestinationController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\ItineraryController;
use App\Http\Controllers\Api\PackingController;
use App\Http\Controllers\Api\ProvinceController;
use App\Http\Controllers\Api\ProviderListingController;
use App\Http\Controllers\Api\RecommendationController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\StatsController;
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
        Route::post('/preferences', [AuthController::class, 'savePreferences']);
    });
});

Route::get('/weather', [WeatherController::class, 'index']);
Route::get('/weather/forecast', [WeatherController::class, 'forecast']);
Route::get('/stats', [StatsController::class, 'index']);
Route::get('/provinces', [ProvinceController::class, 'index']);
Route::get('/destinations', [DestinationController::class, 'index']);
Route::get('/destinations/{destination}', [DestinationController::class, 'show']);
Route::get('/packing', [PackingController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/chatbot', [ChatbotController::class, 'store']);
    Route::get('/chatbot/history', [ChatbotController::class, 'history']);

    Route::post('/favorites/{destination}', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{destination}', [FavoriteController::class, 'destroy']);
    Route::get('/favorites', [FavoriteController::class, 'index']);

    Route::middleware('tourist')->group(function () {
        Route::get('/recommendations', [RecommendationController::class, 'index']);

        Route::get('/itineraries', [ItineraryController::class, 'index']);
        Route::post('/itineraries', [ItineraryController::class, 'store']);
        Route::get('/itineraries/{itinerary}', [ItineraryController::class, 'show']);
        Route::put('/itineraries/{itinerary}', [ItineraryController::class, 'update']);
        Route::delete('/itineraries/{itinerary}', [ItineraryController::class, 'destroy']);
        Route::post('/itineraries/{itinerary}/add-stop', [ItineraryController::class, 'addStop']);
        Route::delete('/itineraries/{itinerary}/stops/{stop}', [ItineraryController::class, 'destroyStop']);
    });

    Route::middleware('local')->group(function () {
        Route::apiResource('provider-listings', ProviderListingController::class);
        Route::get('/provider/stats', [ProviderListingController::class, 'stats']);
        Route::get('/provider/listings', [ProviderListingController::class, 'myListings']);
        Route::get('/provider/analytics', [ProviderListingController::class, 'myAnalytics']);
        Route::get('/provider/profile', [ProviderListingController::class, 'profile']);
        Route::put('/provider/profile', [ProviderListingController::class, 'updateProfile']);
        Route::get('/provider/reviews', [ReviewController::class, 'providerReviews']);
    });

    Route::middleware('admin')->group(function () {
        Route::post('/destinations', [DestinationController::class, 'store']);
        Route::put('/destinations/{destination}', [DestinationController::class, 'update']);
        Route::delete('/destinations/{destination}', [DestinationController::class, 'destroy']);
    });

    Route::get('/reviews', [ReviewController::class, 'index']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);

    Route::middleware('local')->group(function () {
        Route::get('/analytics/province-stats', [AnalyticsController::class, 'provinceStats']);
        Route::get('/analytics/monthly-report', [AnalyticsController::class, 'monthlyReport']);
    });

    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/alerts', [AdminController::class, 'alerts']);
        Route::get('/province-traffic', [AdminController::class, 'provinceTraffic']);
        Route::get('/top-destinations', [AdminController::class, 'topDestinations']);

        Route::get('/users', [AdminController::class, 'users']);
        Route::put('/users/{id}/toggle-active', [AdminController::class, 'toggleActive']);

        Route::get('/approvals', [AdminController::class, 'approvals']);
        Route::post('/approvals/{id}/approve', [AdminController::class, 'approve']);
        Route::post('/approvals/{id}/reject', [AdminController::class, 'reject']);

        Route::get('/approval-queue', [AdminController::class, 'approvalQueue']);
        Route::post('/approval-queue/{providerListing}/approve', [AdminController::class, 'approveListing']);
        Route::post('/approval-queue/{providerListing}/reject', [AdminController::class, 'rejectListing']);
        Route::get('/destinations', [AdminController::class, 'destinations']);
        Route::get('/reports', [AdminController::class, 'reports']);
        Route::get('/province-stats', [AdminController::class, 'provinceStats']);
    });

    Route::middleware('admin')->group(function () {
        Route::post('/analytics/reports/generate', [AnalyticsController::class, 'generateReport']);
        Route::get('/analytics/provinces/{id}/monthly', [AnalyticsController::class, 'provinceMonthly']);
    });
});
