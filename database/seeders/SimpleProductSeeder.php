<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\User;
use App\Models\Category;

class SimpleProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create a test user
        $user = User::where('email', 'sarah@example.com')->first();
        if (!$user) {
            $user = User::create([
                'name' => 'Sarah Johnson',
                'email' => 'sarah@example.com',
                'password' => bcrypt('password123'),
                'email_verified_at' => now(),
            ]);
        }

        // Get a category
        $category = Category::where('slug', 'tops')->first();
        if (!$category) {
            $category = Category::first();
        }

        // Create one sample product
        Product::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Vintage Denim Jacket',
            'description' => 'Classic vintage denim jacket in excellent condition. Perfect for layering and adding a timeless touch to any outfit.',
            'price' => 45.00,
            'condition' => 'like_new',
            'size' => 'M',
            'brand' => 'Levi\'s',
            'color' => 'Blue',
            'images' => ['products/sample-jacket.jpg'],
            'is_featured' => true,
            'views' => 127,
            'status' => 'active',
        ]);

        $this->command->info('Sample product created successfully!');
        $this->command->info('Product: Vintage Denim Jacket by Sarah Johnson');
    }
}