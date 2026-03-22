<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TouristProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'generational_profile',
        'preferred_budget',
        'preferred_themes',
        'preferred_provinces',
        'travel_style',
        'location_tracking_consent',
        'last_known_lat',
        'last_known_lng',
    ];

    protected function casts(): array
    {
        return [
            'preferred_themes' => 'array',
            'preferred_provinces' => 'array',
            'location_tracking_consent' => 'boolean',
            'last_known_lat' => 'decimal:8',
            'last_known_lng' => 'decimal:8',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
