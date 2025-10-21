<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Tops',
                'slug' => 'tops',
                'description' => 'Shirts, blouses, t-shirts, and other upper body clothing',
                'is_active' => true,
            ],
            [
                'name' => 'Bottoms',
                'slug' => 'bottoms',
                'description' => 'Pants, jeans, skirts, and other lower body clothing',
                'is_active' => true,
            ],
            [
                'name' => 'Dresses',
                'slug' => 'dresses',
                'description' => 'One-piece garments including casual and formal dresses',
                'is_active' => true,
            ],
            [
                'name' => 'Outerwear',
                'slug' => 'outerwear',
                'description' => 'Jackets, coats, blazers, and other outer garments',
                'is_active' => true,
            ],
            [
                'name' => 'Shoes',
                'slug' => 'shoes',
                'description' => 'Footwear including sneakers, heels, boots, and sandals',
                'is_active' => true,
            ],
            [
                'name' => 'Accessories',
                'slug' => 'accessories',
                'description' => 'Bags, jewelry, scarves, hats, and other accessories',
                'is_active' => true,
            ],
            [
                'name' => 'Activewear',
                'slug' => 'activewear',
                'description' => 'Sportswear, gym clothes, and athletic apparel',
                'is_active' => true,
            ],
            [
                'name' => 'Vintage',
                'slug' => 'vintage',
                'description' => 'Vintage and retro clothing items',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}