<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'destination_id' => $this->destination_id,
            'rating' => $this->rating,
            'title' => $this->title,
            'body' => $this->body,
            'images' => $this->images,
            'visit_date' => $this->visit_date,
            'helpful_count' => $this->helpful_count,
            'is_published' => $this->is_published,
            'destination' => $this->destination ? [
                'id' => $this->destination->id,
                'name' => $this->destination->name,
                'province' => $this->destination->province?->name,
            ] : null,
            'created_at' => $this->created_at,
        ];
    }
}
