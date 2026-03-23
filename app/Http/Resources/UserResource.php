<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'avatar' => $this->avatar,
            'is_active' => (bool) $this->is_active,
            'data_privacy_consent' => (bool) $this->data_privacy_consent,
            'consent_given_at' => $this->consent_given_at,
            'tourist_profile' => $this->touristProfile ? [
                'generational_profile' => $this->touristProfile->generational_profile,
                'preferred_budget' => $this->touristProfile->preferred_budget,
                'preferred_themes' => $this->touristProfile->preferred_themes,
                'preferred_provinces' => $this->touristProfile->preferred_provinces,
                'travel_style' => $this->touristProfile->travel_style,
                'location_tracking_consent' => (bool) $this->touristProfile->location_tracking_consent,
            ] : null,
            'created_at' => $this->created_at,
        ];
    }
}
