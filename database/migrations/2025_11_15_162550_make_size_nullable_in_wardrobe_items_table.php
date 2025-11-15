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
            // Make size column nullable for Hat and Accessories categories
            $table->string('size', 10)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wardrobe_items', function (Blueprint $table) {
            // Revert size column to not nullable (requires default value)
            // Note: This might fail if there are NULL values in the database
            $table->string('size', 10)->nullable(false)->default('')->change();
        });
    }
};
