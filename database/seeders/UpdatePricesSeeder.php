<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class UpdatePricesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Update all products with realistic Philippine peso prices
        $products = Product::all();
        
        $priceUpdates = [
            // Sarah's products
            'Vintage Denim Jacket' => 850.00,
            'Sustainable Cotton T-Shirt' => 350.00,
            'Floral Summer Dress' => 650.00,
            
            // Mike's products
            'High-Waisted Jeans' => 750.00,
            'Leather Ankle Boots' => 1200.00,
            'Canvas Sneakers' => 800.00,
            
            // Emma's products
            'Vintage Silk Scarf' => 450.00,
            'Yoga Leggings' => 550.00,
            'Knit Sweater' => 650.00,
            
            // Alex's products
            'Retro Blazer' => 1100.00,
            'Designer Handbag' => 1800.00,
            'Casual Button-Up Shirt' => 500.00,
        ];

        foreach ($products as $product) {
            if (isset($priceUpdates[$product->title])) {
                $product->update([
                    'price' => $priceUpdates[$product->title]
                ]);
            } else {
                // For any other products, set a random price between 200-1500 pesos
                $product->update([
                    'price' => rand(200, 1500)
                ]);
            }
        }

        $this->command->info('Product prices updated to Philippine Pesos!');
        $this->command->info('Price range: ₱200 - ₱1,800');
    }
}