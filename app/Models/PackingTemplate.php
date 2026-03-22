<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PackingTemplate extends Model
{
    use HasFactory;

    protected $fillable = ['category_id', 'label', 'items', 'weather_condition', 'season'];

    protected function casts(): array
    {
        return ['items' => 'array'];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ActivityCategory::class, 'category_id');
    }
}
