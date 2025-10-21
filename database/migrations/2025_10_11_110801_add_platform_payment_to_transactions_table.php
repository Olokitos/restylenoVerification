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
        Schema::table('transactions', function (Blueprint $table) {
            // Platform payment tracking
            $table->boolean('payment_collected_by_platform')->default(false)->after('payment_proof_path');
            $table->string('platform_payment_reference')->nullable()->after('payment_collected_by_platform');
            $table->timestamp('platform_payment_collected_at')->nullable()->after('platform_payment_reference');
            
            // Seller payout tracking
            $table->boolean('seller_paid')->default(false)->after('platform_payment_collected_at');
            $table->string('seller_payout_reference')->nullable()->after('seller_paid');
            $table->timestamp('seller_paid_at')->nullable()->after('seller_payout_reference');
            $table->decimal('seller_payout_amount', 10, 2)->nullable()->after('seller_paid_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn([
                'payment_collected_by_platform',
                'platform_payment_reference',
                'platform_payment_collected_at',
                'seller_paid',
                'seller_payout_reference',
                'seller_paid_at',
                'seller_payout_amount'
            ]);
        });
    }
};
