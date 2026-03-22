<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RecommendationRequest extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'session_id',
        'budget_amount',
        'budget_label',
        'theme',
        'number_of_people',
        'trip_duration_days',
        'province_id',
        'generational_profile',
        'results_count',
        'response_time_ms',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'budget_amount' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    public function results(): HasMany
    {
        return $this->hasMany(RecommendationResult::class, 'request_id');
    }
}
