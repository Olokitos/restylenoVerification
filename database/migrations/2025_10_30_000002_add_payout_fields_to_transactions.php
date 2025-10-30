<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('payout_proof_path')->nullable()->after('seller_payout_amount');
            $table->json('seller_payout_details')->nullable()->after('payout_proof_path');
        });
    }
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['payout_proof_path', 'seller_payout_details']);
        });
    }
};
