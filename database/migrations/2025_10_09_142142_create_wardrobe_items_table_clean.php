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
        // Drop existing table if it exists
        Schema::dropIfExists('wardrobe_items');
        
        // Create clean wardrobe_items table
        Schema::create('wardrobe_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name', 100);
            $table->string('brand', 50);
            $table->string('category', 50);
            $table->string('color', 20);
            $table->string('size', 10);
            $table->string('description', 200)->nullable();
            $table->string('image_path')->nullable();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['user_id', 'category']);
            $table->index(['user_id', 'color']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wardrobe_items');
    }
};
