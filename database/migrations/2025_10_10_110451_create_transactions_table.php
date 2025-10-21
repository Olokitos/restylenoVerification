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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('buyer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            $table->decimal('amount', 10, 2); // Keep for backward compatibility
            $table->decimal('sale_price', 10, 2); // Original product price
            $table->decimal('commission_amount', 10, 2)->default(0); // 2% commission
            $table->decimal('seller_earnings', 10, 2)->default(0); // 98% seller receives
            $table->enum('status', ['pending_payment', 'payment_submitted', 'payment_verified', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'])->default('pending_payment');
            $table->enum('payment_method', ['manual', 'gcash'])->nullable();
            $table->string('payment_proof_path')->nullable(); // Screenshot upload path
            $table->string('gcash_reference')->nullable(); // GCash reference number
            $table->timestamp('shipped_at')->nullable(); // When seller marks as shipped
            $table->timestamp('delivered_at')->nullable(); // When buyer confirms delivery
            $table->timestamp('released_at')->nullable(); // When payment released to seller
            $table->text('notes')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->index(['buyer_id', 'status']);
            $table->index(['seller_id', 'status']);
            $table->index(['product_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};