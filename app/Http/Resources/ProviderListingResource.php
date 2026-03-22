<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProviderListingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'provider_id' => $this->provider_id,
            'destination_id' => $this->destination_id,
            'listing_title' => $this->listing_title,
            'listing_type' => $this->listing_type,
            'description' => $this->description,
            'images' => $this->images,
            'price' => $this->price,
            'price_label' => $this->price_label,
            'capacity' => $this->capacity,
            'status' => $this->status,
            'rejection_reason' => $this->rejection_reason,
            'created_at' => $this->created_at,
        ];
    }
}
