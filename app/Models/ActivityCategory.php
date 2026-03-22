<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ActivityCategory extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'icon', 'color', 'description'];

    public function destinations(): HasMany
    {
        return $this->hasMany(Destination::class, 'category_id');
    }

    public function packingTemplates(): HasMany
    {
        return $this->hasMany(PackingTemplate::class, 'category_id');
    }
}
