<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CommissionRecord>
 */
class CommissionRecordFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $rate = 10; // 10% commission rate
        $productPrice = fake()->numberBetween(1000, 10000);
        $amount = ($productPrice * $rate) / 100;
        
        return [
            'product_id' => Product::factory(),
            'user_id' => User::factory(),
            'amount' => $amount,
            'rate' => $rate,
            'status' => 'pending',
        ];
    }
    
    /**
     * Indicate that the commission has been paid.
     */
    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'paid',
            'paid_at' => now(),
        ]);
    }
}

