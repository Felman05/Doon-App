<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class ProviderListingStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'provider_id' => ['required', 'exists:local_provider_profiles,id'],
            'destination_id' => ['nullable', 'exists:destinations,id'],
            'listing_title' => ['required', 'string', 'max:255'],
            'listing_type' => ['required', 'in:accommodation,tour_package,restaurant,transport,event,other'],
            'description' => ['nullable', 'string'],
            'images' => ['nullable', 'array'],
            'price' => ['nullable', 'numeric'],
            'price_label' => ['nullable', 'in:free,budget,mid_range,luxury'],
            'capacity' => ['nullable', 'integer'],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'availability' => ['nullable', 'array'],
            'status' => ['nullable', 'in:pending,active,inactive,rejected'],
        ];
    }
}
