<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AdminController;
use App\Http\Middleware\AdminMiddleware;

Route::middleware([AdminMiddleware::class])->group(function () {
    // Dashboard
    Route::get('/dashboard/stats', [AdminController::class, 'dashboardStats']);
    Route::get('/dashboard/chart', [AdminController::class, 'dashboardChart']);

    // Users
    Route::get('/users', [AdminController::class, 'listUsers']);
    Route::patch('/users/{id}', [AdminController::class, 'updateUserRole']);
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);

    // Bookings
    Route::get('/bookings', [AdminController::class, 'listBookings']);
    Route::patch('/bookings/{id}', [AdminController::class, 'updateBookingStatus']);

    // Destinations
    Route::get('/destinations', [AdminController::class, 'listDestinations']);
    Route::delete('/destinations/{id}', [AdminController::class, 'deleteDestination']);

    // Reviews
    Route::get('/reviews', [AdminController::class, 'listReviews']);
    Route::patch('/reviews/{id}', [AdminController::class, 'approveReview']);
    Route::delete('/reviews/{id}', [AdminController::class, 'deleteReview']);

    // Settings
    Route::get('/settings', [AdminController::class, 'getSettings']);
    Route::post('/settings', [AdminController::class, 'updateSettings']);

    // Reports
    Route::get('/reports', [AdminController::class, 'getReports']);
    Route::get('/reports/export', [AdminController::class, 'exportReport']);

    // Activity Logs
    Route::get('/activity-logs', [AdminController::class, 'getActivityLogs']);

    // System Health
    Route::get('/system/health', [AdminController::class, 'getSystemHealth']);

    // Categories
    Route::get('/categories', [AdminController::class, 'listCategories']);
    Route::post('/categories', [AdminController::class, 'storeCategory']);
    Route::patch('/categories/{id}', [AdminController::class, 'updateCategory']);
    Route::delete('/categories/{id}', [AdminController::class, 'deleteCategory']);

    // Promo Codes
    Route::get('/promo-codes', [AdminController::class, 'listPromoCodes']);
    Route::post('/promo-codes', [AdminController::class, 'storePromoCode']);
    Route::delete('/promo-codes/{id}', [AdminController::class, 'deletePromoCode']);

    // Media
    Route::get('/media', [AdminController::class, 'listMedia']);
    Route::post('/media/upload', [AdminController::class, 'uploadMedia']);
    Route::delete('/media/{id}', [AdminController::class, 'deleteMedia']);

    // Notifications
    Route::get('/notifications', [AdminController::class, 'listNotifications']);
    Route::post('/notifications/send', [AdminController::class, 'sendNotification']);
});
