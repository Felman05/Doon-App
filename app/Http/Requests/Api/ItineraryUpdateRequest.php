<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class ItineraryUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'province_id' => ['nullable', 'exists:provinces,id'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'total_days' => ['nullable', 'integer', 'min:1'],
            'budget_amount' => ['nullable', 'numeric'],
            'budget_label' => ['nullable', 'in:free,budget,mid_range,luxury'],
            'number_of_people' => ['nullable', 'integer', 'min:1'],
            'travel_theme' => ['nullable', 'string', 'max:100'],
            'generational_profile' => ['nullable', 'in:gen_z,millennial,gen_x,boomer'],
            'is_ai_generated' => ['sometimes', 'boolean'],
            'is_public' => ['sometimes', 'boolean'],
            'status' => ['nullable', 'in:draft,planned,ongoing,completed'],
        ];
    }
}
