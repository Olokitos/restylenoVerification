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
            // Add new images column to store multiple image paths as JSON
            $table->json('images')->nullable()->after('image_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wardrobe_items', function (Blueprint $table) {
            $table->dropColumn('images');
        });
    }
};