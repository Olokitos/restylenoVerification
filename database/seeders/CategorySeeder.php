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
                'name' => 'T-shirt',
                'slug' => 't-shirt',
                'description' => 'Casual t-shirts for everyday wear',
            ],
            [
                'name' => 'Polo',
                'slug' => 'polo',
                'description' => 'Classic polo shirts for casual to smart-casual outfits',
            ],
            [
                'name' => 'Pants',
                'slug' => 'pants',
                'description' => 'Standalone pants and trousers for every occasion',
            ],
            [
                'name' => 'Jeans',
                'slug' => 'jeans',
                'description' => 'Denim jeans in various styles and fits',
            ],
            [
                'name' => 'Shorts',
                'slug' => 'shorts',
                'description' => 'Short pants for warm weather and casual wear',
            ],
            [
                'name' => 'Skirts',
                'slug' => 'skirts',
                'description' => 'Skirts in various lengths and styles',
            ],
            [
                'name' => 'Dress',
                'slug' => 'dress',
                'description' => 'One-piece garments including casual and formal dresses',
            ],
            [
                'name' => 'Shoes',
                'slug' => 'shoes',
                'description' => 'Footwear including sneakers, heels, and casual shoes',
            ],
            [
                'name' => 'Sandals',
                'slug' => 'sandals',
                'description' => 'Open-toed footwear perfect for warm weather',
            ],
            [
                'name' => 'Boots',
                'slug' => 'boots',
                'description' => 'Footwear that covers the ankle and lower leg',
            ],
            [
                'name' => 'Sweaters',
                'slug' => 'sweaters',
                'description' => 'Warm knitted garments for cooler weather',
            ],
            [
                'name' => 'Long Sleeves',
                'slug' => 'long-sleeves',
                'description' => 'Shirts and tops with long sleeves',
            ],
            [
                'name' => 'Hoodie',
                'slug' => 'hoodie',
                'description' => 'Casual sweatshirt with a hood',
            ],
            [
                'name' => 'Hat',
                'slug' => 'hat',
                'description' => 'Caps, beanies, and headwear accessories',
            ],
            [
                'name' => 'Jacket',
                'slug' => 'jacket',
                'description' => 'Jackets, coats, blazers, and other outer garments',
            ],
            [
                'name' => 'Accessories',
                'slug' => 'accessories',
                'description' => 'Bags, jewelry, scarves, and other accessories',
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                array_merge($category, ['is_active' => true]),
            );
        }
    }
}