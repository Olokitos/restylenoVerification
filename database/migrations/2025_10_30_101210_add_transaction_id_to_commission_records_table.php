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
        Schema::table('commission_records', function (Blueprint $table) {
            // Add transaction_id foreign key after id column
            $table->foreignId('transaction_id')
                  ->after('id')
                  ->constrained('transactions')
                  ->onDelete('cascade');
            
            // Add indexes for better query performance
            $table->index('transaction_id');
            
            // Add seller_id and collected_at columns that are used in controller
            $table->foreignId('seller_id')
                  ->after('transaction_id')
                  ->constrained('users')
                  ->onDelete('cascade');
            
            $table->timestamp('collected_at')->nullable()->after('paid_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commission_records', function (Blueprint $table) {
            // Drop foreign keys first
            $table->dropForeign(['transaction_id']);
            $table->dropForeign(['seller_id']);
            
            // Drop columns
            $table->dropColumn(['transaction_id', 'seller_id', 'collected_at']);
        });
    }
};
