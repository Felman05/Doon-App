<?php

namespace App\Services;

use App\Models\ChatbotMessage;
use App\Models\ChatbotSession;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ChatbotService
{
    private string $apiKey;
    private string $baseUrl;
    private string $model;

    public function __construct()
    {
        $this->apiKey  = (string) config('services.gemini.key', '');
        $this->baseUrl = (string) config('services.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta');
        $this->model   = (string) config('services.gemini.model', 'gemini-1.5-flash');
    }

    public function chat(?int $userId, ?string $sessionToken, string $message): array
    {
        // Resolve or create session
        $session = $this->resolveSession($userId, $sessionToken);

        // Load last 10 messages from DB for this session
        $history = ChatbotMessage::where('session_id', $session->id)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->reverse()
            ->map(fn($m) => [
                'role'    => $m->role,
                'content' => $m->content,
            ])
            ->values()
            ->toArray();

        // Store user message
        ChatbotMessage::create([
            'session_id' => $session->id,
            'role' => 'user',
            'content' => $message,
        ]);

        $contents = [];
        foreach ($history as $item) {
            $contents[] = [
                'role' => $item['role'] === 'assistant' ? 'model' : 'user',
                'parts' => [
                    ['text' => (string) $item['content']],
                ],
            ];
        }

        $contents[] = [
            'role' => 'user',
            'parts' => [
                ['text' => $message],
            ],
        ];

        if ($this->apiKey === '') {
            $reply = 'AI service is not configured yet. Please set GEMINI_API_KEY in the environment settings.';
        } else {
            $response = Http::timeout(25)
                ->retry(2, 300)
                ->asJson()
                ->post(
                    rtrim($this->baseUrl, '/') . '/models/' . $this->model . ':generateContent?key=' . urlencode($this->apiKey),
                    [
                        'systemInstruction' => [
                            'parts' => [
                                [
                                    'text' => 'You are Doon, a friendly and intelligent travel assistant specialized in CALABARZON, Philippines (Batangas, Laguna, Cavite, Rizal, Quezon). Give practical, accurate, and concise travel guidance. When suggesting destinations, include province, estimated budget in Philippine Pesos, ideal visiting time, and one local tip. Prefer itinerary-style answers for planning questions. If asked non-travel topics, politely redirect to travel help in CALABARZON.',
                                ],
                            ],
                        ],
                        'contents' => $contents,
                        'generationConfig' => [
                            'temperature' => 0.7,
                            'topP' => 0.9,
                            'maxOutputTokens' => 700,
                        ],
                    ]
                );

            if ($response->failed()) {
                $reply = 'I am having trouble reaching the AI service right now. Please try again in a moment.';
            } else {
                $reply = (string) ($response->json('candidates.0.content.parts.0.text') ?? 'Sorry, I could not generate a response. Please try again.');
            }
        }

        // Store assistant message
        ChatbotMessage::create([
            'session_id' => $session->id,
            'role' => 'assistant',
            'content' => $reply,
        ]);

        return [
            'reply' => trim($reply),
            'session_token' => $session->session_token,
        ];
    }

    private function resolveSession(?int $userId, ?string $token): ChatbotSession
    {
        if ($token) {
            $existing = ChatbotSession::where('session_token', $token)->first();
            if ($existing) {
                return $existing;
            }
        }

        return ChatbotSession::create([
            'user_id' => $userId,
            'session_token' => Str::uuid()->toString(),
            'context' => null,
        ]);
    }
}
