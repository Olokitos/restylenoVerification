<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RemoveImagesColumnFromWardrobeItems extends Migration
{
    public function up()
    {
        Schema::table('wardrobe_items', function (Blueprint $table) {
            $table->dropColumn('images');
        });
    }

    public function down()
    {
        Schema::table('wardrobe_items', function (Blueprint $table) {
            $table->json('images')->nullable();
        });
    }
}

