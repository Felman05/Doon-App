<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItineraryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'itinerary_id',
        'destination_id',
        'day_number',
        'order_index',
        'custom_title',
        'custom_address',
        'custom_lat',
        'custom_lng',
        'arrival_time',
        'departure_time',
        'estimated_cost',
        'notes',
        'transport_mode',
        'travel_time_minutes',
    ];

    protected function casts(): array
    {
        return [
            'custom_lat' => 'decimal:8',
            'custom_lng' => 'decimal:8',
            'estimated_cost' => 'decimal:2',
        ];
    }

    public function itinerary(): BelongsTo
    {
        return $this->belongsTo(Itinerary::class);
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class);
    }
}
