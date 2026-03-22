<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ChatbotStoreRequest;
use App\Services\AnalyticsLogger;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;

class ChatbotController extends Controller
{
    public function __construct(
        private readonly ChatbotService $chatbotService,
        private readonly AnalyticsLogger $analyticsLogger,
    ) {}

    public function store(ChatbotStoreRequest $request): JsonResponse
    {
        $payload = $this->chatbotService->chat(
            userId: $request->user()?->id,
            sessionToken: $request->string('session_token')->toString() ?: null,
            message: $request->string('message')->toString(),
        );

        $this->analyticsLogger->log(
            eventType: 'chatbot_query',
            userId: $request->user()?->id,
            sessionId: $request->session()->getId(),
            destinationId: null,
            provinceId: null,
            metadata: ['message_length' => strlen($request->string('message')->toString())],
            request: $request,
        );

        return response()->json($payload);
    }
}
