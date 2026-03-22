<?php

namespace App\Services;

use App\Models\AnalyticsEvent;
use Illuminate\Http\Request;

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
        return AnalyticsEvent::create([
            'user_id' => $userId,
            'session_id' => $sessionId,
            'event_type' => $eventType,
            'destination_id' => $destinationId,
            'province_id' => $provinceId,
            'metadata' => $metadata,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'created_at' => now(),
        ]);
    }
}
