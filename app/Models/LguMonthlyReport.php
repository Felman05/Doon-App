<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LguMonthlyReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'province_id',
        'report_month',
        'total_visitors',
        'unique_visitors',
        'top_destinations',
        'visitor_demographics',
        'avg_budget_label',
        'total_itineraries_created',
        'total_reviews',
        'avg_destination_rating',
        'generated_at',
        'generated_by',
    ];

    protected function casts(): array
    {
        return [
            'report_month' => 'date',
            'top_destinations' => 'array',
            'visitor_demographics' => 'array',
            'avg_destination_rating' => 'decimal:2',
            'generated_at' => 'datetime',
        ];
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    public function generator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}
