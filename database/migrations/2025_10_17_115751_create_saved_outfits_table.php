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
        Schema::create('saved_outfits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('wardrobe_item_ids'); // Array of wardrobe item IDs
            $table->string('occasion')->nullable(); // casual, formal, work, party, etc.
            $table->json('weather_context')->nullable(); // Store weather data when saved
            $table->json('outfit_metadata')->nullable(); // Additional metadata like colors, styles
            $table->boolean('is_favorite')->default(false);
            $table->timestamps();
            
            $table->index(['user_id', 'created_at']);
            $table->index(['user_id', 'occasion']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saved_outfits');
    }
};