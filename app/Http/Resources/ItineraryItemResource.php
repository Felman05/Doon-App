<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItineraryItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'day_number' => $this->day_number,
            'order_index' => $this->order_index,
            'destination_id' => $this->destination_id,
            'custom_title' => $this->custom_title,
            'custom_address' => $this->custom_address,
            'estimated_cost' => $this->estimated_cost,
            'travel_time_minutes' => $this->travel_time_minutes,
            'transport_mode' => $this->transport_mode,
            'destination' => $this->whenLoaded('destination', fn () => [
                'id' => $this->destination?->id,
                'name' => $this->destination?->name,
            ]),
        ];
    }
}
