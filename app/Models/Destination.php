<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Destination extends Model
{
    use HasFactory;

    protected $fillable = [
        'province_id',
        'municipality_id',
        'name',
        'slug',
        'category_id',
        'description',
        'short_description',
        'address',
        'latitude',
        'longitude',
        'cover_image',
        'images',
        'price_min',
        'price_max',
        'price_label',
        'opening_time',
        'closing_time',
        'open_days',
        'contact_number',
        'email',
        'website_url',
        'facebook_url',
        'capacity_per_day',
        'avg_duration_hours',
        'tags',
        'generational_appeal',
        'is_featured',
        'is_active',
        'is_verified',
        'submitted_by',
        'approved_by',
        'approved_at',
        'avg_rating',
        'total_reviews',
        'view_count',
    ];

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'open_days' => 'array',
            'tags' => 'array',
            'generational_appeal' => 'array',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'is_verified' => 'boolean',
            'approved_at' => 'datetime',
            'price_min' => 'decimal:2',
            'price_max' => 'decimal:2',
            'avg_duration_hours' => 'decimal:2',
            'avg_rating' => 'decimal:2',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ActivityCategory::class, 'category_id');
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function itineraryItems(): HasMany
    {
        return $this->hasMany(ItineraryItem::class);
    }

    public function recommendationResults(): HasMany
    {
        return $this->hasMany(RecommendationResult::class);
    }

    public function providerListings(): HasMany
    {
        return $this->hasMany(ProviderListing::class);
    }
}
