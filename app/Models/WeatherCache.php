<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WeatherCache extends Model
{
    use HasFactory;

    protected $table = 'weather_cache';

    protected $fillable = ['province_id', 'weather_data', 'fetched_at', 'expires_at'];

    protected function casts(): array
    {
        return [
            'weather_data' => 'array',
            'fetched_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }
}
