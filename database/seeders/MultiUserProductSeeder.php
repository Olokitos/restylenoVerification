<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\User;
use App\Models\Category;

class MultiUserProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get categories
        $categories = Category::all();
        
        // Get users (excluding admin)
        $users = User::where('is_admin', false)->get();
        
        if ($users->isEmpty()) {
            $this->command->error('No users found. Please run UserSeeder first.');
            return;
        }

        $products = [
            // Sarah's products
            [
                'user_email' => 'sarah@example.com',
                'title' => 'Vintage Denim Jacket',
                'description' => 'Classic vintage denim jacket in excellent condition. Perfect for layering and adding a timeless touch to any outfit. Made from high-quality denim with authentic vintage styling.',
                'price' => 45.00,
                'condition' => 'like_new',
                'size' => 'M',
                'brand' => 'Levi\'s',
                'color' => 'Blue',
                'images' => ['products/denim-jacket-1.jpg', 'products/denim-jacket-2.jpg'],
                'is_featured' => true,
                'views' => 127,
                'category' => 'outerwear',
            ],
            [
                'user_email' => 'sarah@example.com',
                'title' => 'Sustainable Cotton T-Shirt',
                'description' => 'Soft, organic cotton t-shirt in a relaxed fit. Made from 100% organic cotton, this shirt is perfect for everyday wear and sustainable fashion enthusiasts.',
                'price' => 18.50,
                'condition' => 'new',
                'size' => 'L',
                'brand' => 'EcoWear',
                'color' => 'White',
                'images' => ['products/cotton-tshirt-1.jpg'],
                'is_featured' => true,
                'views' => 89,
                'category' => 'tops',
            ],
            [
                'user_email' => 'sarah@example.com',
                'title' => 'Floral Summer Dress',
                'description' => 'Beautiful floral summer dress perfect for warm weather. Lightweight fabric with a flattering silhouette. Great for casual outings or summer events.',
                'price' => 28.75,
                'condition' => 'like_new',
                'size' => 'M',
                'brand' => 'Zara',
                'color' => 'Floral',
                'images' => ['products/dress-1.jpg'],
                'is_featured' => true,
                'views' => 203,
                'category' => 'dresses',
            ],

            // Mike's products
            [
                'user_email' => 'mike@example.com',
                'title' => 'High-Waisted Jeans',
                'description' => 'Trendy high-waisted jeans with a flattering fit. Great condition with minimal wear. Perfect for creating stylish outfits while embracing sustainable fashion.',
                'price' => 32.00,
                'condition' => 'good',
                'size' => 'S',
                'brand' => 'H&M',
                'color' => 'Dark Blue',
                'images' => ['products/jeans-1.jpg', 'products/jeans-2.jpg'],
                'is_featured' => false,
                'views' => 156,
                'category' => 'bottoms',
            ],
            [
                'user_email' => 'mike@example.com',
                'title' => 'Leather Ankle Boots',
                'description' => 'Stylish leather ankle boots in great condition. Perfect for autumn and winter outfits. Made from genuine leather with comfortable sole.',
                'price' => 65.00,
                'condition' => 'good',
                'size' => '8',
                'brand' => 'Clarks',
                'color' => 'Brown',
                'images' => ['products/boots-1.jpg', 'products/boots-2.jpg'],
                'is_featured' => false,
                'views' => 94,
                'category' => 'shoes',
            ],
            [
                'user_email' => 'mike@example.com',
                'title' => 'Canvas Sneakers',
                'description' => 'Comfortable canvas sneakers perfect for everyday wear. Eco-friendly materials and classic design. Great for sustainable fashion enthusiasts.',
                'price' => 35.00,
                'condition' => 'good',
                'size' => '9',
                'brand' => 'Converse',
                'color' => 'White',
                'images' => ['products/sneakers-1.jpg'],
                'is_featured' => false,
                'views' => 145,
                'category' => 'shoes',
            ],

            // Emma's products
            [
                'user_email' => 'emma@example.com',
                'title' => 'Vintage Silk Scarf',
                'description' => 'Elegant vintage silk scarf with beautiful pattern. Perfect accessory for adding a touch of sophistication to any outfit. Made from high-quality silk.',
                'price' => 22.00,
                'condition' => 'fair',
                'size' => 'One Size',
                'brand' => 'Vintage',
                'color' => 'Multi-color',
                'images' => ['products/scarf-1.jpg'],
                'is_featured' => false,
                'views' => 67,
                'category' => 'accessories',
            ],
            [
                'user_email' => 'emma@example.com',
                'title' => 'Yoga Leggings',
                'description' => 'Comfortable yoga leggings perfect for workouts or casual wear. Made from breathable, stretchy fabric. Great for active lifestyle and sustainable fashion.',
                'price' => 24.50,
                'condition' => 'new',
                'size' => 'M',
                'brand' => 'Lululemon',
                'color' => 'Black',
                'images' => ['products/leggings-1.jpg'],
                'is_featured' => true,
                'views' => 178,
                'category' => 'activewear',
            ],
            [
                'user_email' => 'emma@example.com',
                'title' => 'Knit Sweater',
                'description' => 'Cozy knit sweater perfect for cooler weather. Soft, warm fabric with a relaxed fit. Great for layering and creating comfortable outfits.',
                'price' => 29.99,
                'condition' => 'like_new',
                'size' => 'S',
                'brand' => 'Uniqlo',
                'color' => 'Cream',
                'images' => ['products/sweater-1.jpg'],
                'is_featured' => true,
                'views' => 98,
                'category' => 'tops',
            ],

            // Alex's products
            [
                'user_email' => 'alex@example.com',
                'title' => 'Retro Blazer',
                'description' => 'Stylish retro blazer perfect for professional or semi-formal occasions. Classic cut with modern appeal. Great condition with minimal wear.',
                'price' => 55.00,
                'condition' => 'like_new',
                'size' => 'L',
                'brand' => 'Vintage',
                'color' => 'Navy',
                'images' => ['products/blazer-1.jpg', 'products/blazer-2.jpg'],
                'is_featured' => false,
                'views' => 112,
                'category' => 'outerwear',
            ],
            [
                'user_email' => 'alex@example.com',
                'title' => 'Designer Handbag',
                'description' => 'Elegant designer handbag in excellent condition. Perfect for special occasions or everyday use. Made from high-quality materials.',
                'price' => 85.00,
                'condition' => 'like_new',
                'size' => 'One Size',
                'brand' => 'Coach',
                'color' => 'Black',
                'images' => ['products/handbag-1.jpg'],
                'is_featured' => true,
                'views' => 234,
                'category' => 'accessories',
            ],
            [
                'user_email' => 'alex@example.com',
                'title' => 'Casual Button-Up Shirt',
                'description' => 'Versatile button-up shirt perfect for both casual and semi-formal occasions. Made from comfortable cotton blend fabric.',
                'price' => 25.00,
                'condition' => 'good',
                'size' => 'M',
                'brand' => 'Gap',
                'color' => 'Light Blue',
                'images' => ['products/shirt-1.jpg'],
                'is_featured' => false,
                'views' => 76,
                'category' => 'tops',
            ],
        ];

        foreach ($products as $productData) {
            $user = User::where('email', $productData['user_email'])->first();
            $category = $categories->where('slug', $productData['category'])->first();
            
            if ($user && $category) {
                Product::create([
                    'user_id' => $user->id,
                    'category_id' => $category->id,
                    'title' => $productData['title'],
                    'description' => $productData['description'],
                    'price' => $productData['price'],
                    'condition' => $productData['condition'],
                    'size' => $productData['size'],
                    'brand' => $productData['brand'],
                    'color' => $productData['color'],
                    'images' => $productData['images'],
                    'is_featured' => $productData['is_featured'],
                    'views' => $productData['views'],
                    'status' => 'active',
                ]);
            }
        }

        $this->command->info('Multi-user products created successfully!');
        $this->command->info('Products created by different users:');
        $this->command->info('- Sarah Johnson: 3 products');
        $this->command->info('- Mike Chen: 3 products');
        $this->command->info('- Emma Wilson: 3 products');
        $this->command->info('- Alex Rodriguez: 3 products');
    }
}