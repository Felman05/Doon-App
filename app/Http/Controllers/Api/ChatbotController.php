<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ChatbotRequest;
use App\Services\AnalyticsLogger;
use App\Services\ChatbotService;
use App\Services\WeatherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ChatbotController extends Controller
{
    public function __construct(
        private readonly ChatbotService $chatbotService,
        private readonly AnalyticsLogger $analyticsLogger,
    ) {}

    public function store(ChatbotRequest $request): JsonResponse
    {
        $message = $request->string('message')->toString();
        $sessionToken = $request->string('session_token')->toString() ?: null;
        $user = $request->user()?->load([
            'touristProfile',
            'itineraries.items.destination.province',
            'favorites.destination.province',
            'reviews.destination.province',
        ]);
        $weatherService = app(WeatherService::class);
        $weatherData = $weatherService->getAllProvinces();
        $forecastData = $weatherService->getAllForecastsForChatbot();

        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        try {
            $payload = $this->chatbotService->sendMessage($message, $sessionToken, $user, $weatherData, $forecastData);
        } catch (\Throwable $e) {
            Log::warning('Chatbot fallback mode', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);

            return response()->json([
                'reply' => 'Doon AI is temporarily unavailable. You can still plan your trip now: tell me your target province, budget range, and number of days, and I can suggest a practical itinerary template.',
                'session_token' => $sessionToken ?: Str::uuid()->toString(),
                'fallback' => true,
            ]);
        }

        $this->analyticsLogger->log(
            eventType: 'chatbot_query',
            userId: $request->user()?->id,
            sessionId: $request->session()->getId(),
            destinationId: null,
            provinceId: null,
            metadata: ['message_length' => strlen($message)],
            request: $request,
        );

        return response()->json([
            'reply' => $payload['reply'] ?? '',
            'session_token' => $payload['session_token'] ?? null,
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $token = $request->query('session');

        if (! is_string($token) || $token === '') {
            return response()->json(['messages' => []]);
        }

        try {
            $messages = $this->chatbotService->history(
                userId: $request->user()?->id,
                authSessionId: $request->session()->getId(),
                sessionToken: $token,
            );
        } catch (\Throwable) {
            $messages = [];
        }

        return response()->json(['messages' => $messages]);
    }
}
