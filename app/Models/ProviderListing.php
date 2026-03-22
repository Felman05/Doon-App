<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProviderListing extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'destination_id',
        'listing_title',
        'listing_type',
        'description',
        'images',
        'price',
        'price_label',
        'capacity',
        'contact_number',
        'availability',
        'status',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'availability' => 'array',
            'price' => 'decimal:2',
            'reviewed_at' => 'datetime',
        ];
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(LocalProviderProfile::class, 'provider_id');
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
