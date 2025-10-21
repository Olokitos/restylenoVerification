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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->string('condition'); // new, like_new, good, fair, poor
            $table->string('size')->nullable();
            $table->string('brand')->nullable();
            $table->string('color')->nullable();
            $table->json('images'); // Store multiple image paths
            $table->enum('status', ['draft', 'pending', 'active', 'sold', 'rejected', 'inactive'])->default('draft');
            $table->decimal('commission_rate', 5, 2)->default(10.00); // Commission percentage
            $table->text('rejection_reason')->nullable(); // Reason for rejection by admin
            $table->boolean('is_featured')->default(false);
            $table->integer('views')->default(0);
            $table->timestamps();
            
            $table->index(['status', 'created_at']);
            $table->index(['category_id', 'status']);
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};