<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (! Schema::hasColumn('users', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        Schema::table('destinations', function (Blueprint $table): void {
            if (! Schema::hasColumn('destinations', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        Schema::table('reviews', function (Blueprint $table): void {
            if (! Schema::hasColumn('reviews', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (Schema::hasColumn('users', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });

        Schema::table('destinations', function (Blueprint $table): void {
            if (Schema::hasColumn('destinations', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });

        Schema::table('reviews', function (Blueprint $table): void {
            if (Schema::hasColumn('reviews', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};
