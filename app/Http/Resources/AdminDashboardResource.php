<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminDashboardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'stats' => data_get($this->resource, 'stats', []),
            'system_alerts' => data_get($this->resource, 'system_alerts', []),
            'traffic_by_province' => data_get($this->resource, 'traffic_by_province', []),
        ];
    }
}
