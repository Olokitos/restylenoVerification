<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('wardrobe_items', function (Blueprint $table) {
            // Add images column to store multiple image paths as JSON
            // Only add if it doesn't already exist
            if (!Schema::hasColumn('wardrobe_items', 'images')) {
                $table->json('images')->nullable()->after('image_path');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wardrobe_items', function (Blueprint $table) {
            if (Schema::hasColumn('wardrobe_items', 'images')) {
                $table->dropColumn('images');
            }
        });
    }
};
