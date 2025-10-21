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
        Schema::create('outfit_feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('saved_outfit_id')->nullable()->constrained('saved_outfits')->onDelete('cascade');
            $table->string('feedback_type'); // 'liked', 'wore_this', 'not_for_me', 'saved', 'shared'
            $table->json('recommendation_context')->nullable(); // Weather, occasion, etc. when feedback was given
            $table->integer('rating')->nullable(); // 1-5 star rating
            $table->text('notes')->nullable(); // Optional user notes
            $table->timestamps();
            
            $table->index(['user_id', 'feedback_type']);
            $table->index(['saved_outfit_id', 'feedback_type']);
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('outfit_feedback');
    }
};