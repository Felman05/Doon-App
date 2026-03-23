<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Province;
use Illuminate\Http\JsonResponse;

class ProvinceController extends Controller
{
    public function index(): JsonResponse
    {
        $provinces = Province::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json(['data' => $provinces]);
    }
}
