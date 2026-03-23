<?php

namespace App\Services;

use App\Models\AnalyticsEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AnalyticsLogger
{
    public function log(
        string $eventType,
        ?int $userId,
        ?string $sessionId,
        ?int $destinationId,
        ?int $provinceId,
        array $metadata,
        ?Request $request = null,
    ): AnalyticsEvent {
        $payload = [
            'user_id' => $userId,
            'session_id' => $sessionId,
            'event_type' => $eventType,
            'destination_id' => $destinationId,
            'province_id' => $provinceId,
            'metadata' => $metadata,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'created_at' => now(),
        ];

        try {
            return AnalyticsEvent::create($payload);
        } catch (\Throwable $e) {
            Log::warning('Analytics event persistence skipped', [
                'event_type' => $eventType,
                'error' => $e->getMessage(),
            ]);

            return new AnalyticsEvent($payload);
        }
    }
}
