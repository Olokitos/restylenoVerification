<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\WardrobeItem;
use App\Models\User;

class FinalItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first user (admin user)
        $user = User::first();
        
        if (!$user) {
            $this->command->info('No users found. Please run AdminSeeder first.');
            return;
        }

        // Create sample wardrobe items
        $sampleItems = [
            [
                'name' => 'Classic White T-Shirt',
                'brand' => 'Uniqlo',
                'category' => 'Shirt',
                'color' => 'White',
                'size' => 'M',
                'description' => 'Perfect basic white tee for any outfit',
                'user_id' => $user->id,
            ],
            [
                'name' => 'Blue Jeans',
                'brand' => 'Levi\'s',
                'category' => 'Pants',
                'color' => 'Blue',
                'size' => '32',
                'description' => 'Classic straight fit jeans',
                'user_id' => $user->id,
            ],
            [
                'name' => 'Black Blazer',
                'brand' => 'Zara',
                'category' => 'Jacket',
                'color' => 'Black',
                'size' => 'L',
                'description' => 'Professional blazer for formal occasions',
                'user_id' => $user->id,
            ],
            [
                'name' => 'Summer Dress',
                'brand' => 'H&M',
                'category' => 'Dress',
                'color' => 'Floral',
                'size' => 'S',
                'description' => 'Light and breezy summer dress',
                'user_id' => $user->id,
            ],
            [
                'name' => 'Running Shoes',
                'brand' => 'Nike',
                'category' => 'Shoes',
                'color' => 'White',
                'size' => '9',
                'description' => 'Comfortable running shoes for workouts',
                'user_id' => $user->id,
            ],
        ];

        foreach ($sampleItems as $item) {
            WardrobeItem::create($item);
        }

        $this->command->info('Sample wardrobe items created successfully!');
    }
}
