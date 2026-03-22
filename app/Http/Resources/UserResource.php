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
            'created_at' => $this->created_at,
        ];
    }
}
