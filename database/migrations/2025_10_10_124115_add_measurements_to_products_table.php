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
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('shoulder', 5, 1)->nullable()->after('color');
            $table->decimal('length', 5, 1)->nullable()->after('shoulder');
            $table->decimal('sleeve_length', 5, 1)->nullable()->after('length');
            $table->decimal('bust', 5, 1)->nullable()->after('sleeve_length');
            $table->decimal('cuff', 5, 1)->nullable()->after('bust');
            $table->decimal('bicep_length', 5, 1)->nullable()->after('cuff');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'shoulder',
                'length', 
                'sleeve_length',
                'bust',
                'cuff',
                'bicep_length'
            ]);
        });
    }
};