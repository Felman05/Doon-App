<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WeatherResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'province' => [
                'id' => data_get($this->resource, 'province.id'),
                'code' => data_get($this->resource, 'province.code'),
                'name' => data_get($this->resource, 'province.name'),
            ],
            'weather' => data_get($this->resource, 'weather'),
            'cached' => (bool) data_get($this->resource, 'cached', false),
            'error' => data_get($this->resource, 'error'),
        ];
    }
}
