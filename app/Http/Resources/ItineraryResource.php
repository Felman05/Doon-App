<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItineraryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'province_id' => $this->province_id,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'total_days' => $this->total_days,
            'budget_amount' => $this->budget_amount,
            'budget_label' => $this->budget_label,
            'number_of_people' => $this->number_of_people,
            'travel_theme' => $this->travel_theme,
            'generational_profile' => $this->generational_profile,
            'status' => $this->status,
            'is_ai_generated' => $this->is_ai_generated,
            'items' => ItineraryItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at,
        ];
    }
}
