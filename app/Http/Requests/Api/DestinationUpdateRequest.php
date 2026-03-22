<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DestinationUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $destinationId = (int) $this->route('destination')->id;

        return [
            'province_id' => ['sometimes', 'exists:provinces,id'],
            'municipality_id' => ['nullable', 'exists:municipalities,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('destinations', 'slug')->ignore($destinationId)],
            'category_id' => ['sometimes', 'exists:activity_categories,id'],
            'description' => ['nullable', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'address' => ['nullable', 'string'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'price_min' => ['nullable', 'numeric'],
            'price_max' => ['nullable', 'numeric'],
            'price_label' => ['nullable', 'in:free,budget,mid_range,luxury'],
            'images' => ['nullable', 'array'],
            'open_days' => ['nullable', 'array'],
            'tags' => ['nullable', 'array'],
            'generational_appeal' => ['nullable', 'array'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'is_verified' => ['sometimes', 'boolean'],
        ];
    }
}
