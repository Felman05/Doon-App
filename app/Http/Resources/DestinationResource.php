<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DestinationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'address' => $this->address,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'price_min' => $this->price_min,
            'price_max' => $this->price_max,
            'price_label' => $this->price_label,
            'avg_rating' => $this->avg_rating,
            'total_reviews' => $this->total_reviews,
            'avg_duration_hours' => $this->avg_duration_hours,
            'is_active' => $this->is_active,
            'is_verified' => $this->is_verified,
            'province' => $this->whenLoaded('province', fn () => [
                'id' => $this->province?->id,
                'code' => $this->province?->code,
                'name' => $this->province?->name,
            ]),
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category?->id,
                'name' => $this->category?->name,
                'slug' => $this->category?->slug,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
