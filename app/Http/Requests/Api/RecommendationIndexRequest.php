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
            'number_of_people' => ['nullable', 'integer', 'min:1'],
            'trip_duration' => ['nullable', 'integer', 'min:1'],
            'province_id' => ['nullable', 'exists:provinces,id'],
            'generational_profile' => ['nullable', 'in:gen_z,millennial,gen_x,boomer'],
        ];
    }
}
