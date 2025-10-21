<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        $conditions = ['new', 'like_new', 'good', 'fair', 'used'];
        $colors = ['black', 'white', 'blue', 'red', 'green', 'gray', 'brown', 'navy'];
        
        return [
            'user_id' => User::factory(), // Will be overridden if provided in create()
            'category_id' => Category::factory(), // Will be overridden if provided in create()
            'title' => fake()->words(4, true),
            'description' => fake()->paragraph(),
            'price' => fake()->numberBetween(500, 5000),
            'size' => fake()->randomElement($sizes),
            'color' => fake()->randomElement($colors),
            'brand' => fake()->randomElement(['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Gap', 'Levi\'s']),
            'condition' => fake()->randomElement($conditions),
            'status' => 'active',
            'images' => json_encode(['products/' . fake()->uuid() . '.jpg']),
            'commission_rate' => 10.00, // Default 10% commission
            'is_featured' => fake()->boolean(20), // 20% chance of being featured
        ];
    }
    
    /**
     * Indicate that the product is pending approval.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }
    
    /**
     * Indicate that the product is sold.
     */
    public function sold(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'sold',
        ]);
    }
    
    /**
     * Indicate that the product is a draft.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
        ]);
    }
    
    /**
     * Indicate that the product is featured.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
        ]);
    }
}

