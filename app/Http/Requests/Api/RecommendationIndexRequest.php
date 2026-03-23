<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class RecommendationIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'budget' => ['nullable', 'in:free,budget,mid_range,luxury'],
            'budget_amount' => ['nullable', 'numeric'],
            'theme' => ['nullable', 'string'],
            'people' => ['nullable', 'integer', 'min:1'],
            'duration' => ['nullable', 'integer', 'min:1'],
            'number_of_people' => ['nullable', 'integer', 'min:1'],
            'trip_duration' => ['nullable', 'integer', 'min:1'],
            'province_id' => ['nullable', 'exists:provinces,id'],
            'province_ids' => ['nullable', 'array'],
            'province_ids.*' => ['integer', 'exists:provinces,id'],
            'min_rating' => ['nullable', 'numeric', 'min:1', 'max:5'],
            'generational_profile' => ['nullable', 'in:gen_z,millennial,gen_x,boomer'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $merged = [];

        if ($this->filled('people') && ! $this->filled('number_of_people')) {
            $merged['number_of_people'] = $this->input('people');
        }

        if ($this->filled('duration') && ! $this->filled('trip_duration')) {
            $merged['trip_duration'] = $this->input('duration');
        }

        if ($merged !== []) {
            $this->merge($merged);
        }
    }
}
