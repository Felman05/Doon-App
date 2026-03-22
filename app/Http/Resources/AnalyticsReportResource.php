<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnalyticsReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'province_id' => $this->province_id,
            'report_month' => $this->report_month,
            'total_visitors' => $this->total_visitors,
            'unique_visitors' => $this->unique_visitors,
            'top_destinations' => $this->top_destinations,
            'visitor_demographics' => $this->visitor_demographics,
            'total_itineraries_created' => $this->total_itineraries_created,
            'total_reviews' => $this->total_reviews,
            'avg_destination_rating' => $this->avg_destination_rating,
            'generated_at' => $this->generated_at,
        ];
    }
}
