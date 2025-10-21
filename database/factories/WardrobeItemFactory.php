<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WardrobeItem>
 */
class WardrobeItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['tops', 'bottoms', 'shoes', 'outerwear', 'accessories'];
        $colors = ['black', 'white', 'blue', 'red', 'green', 'gray', 'brown', 'navy'];
        $sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        
        return [
            'user_id' => User::factory(),
            'name' => fake()->words(3, true),
            'category' => fake()->randomElement($categories),
            'color' => fake()->randomElement($colors),
            'size' => fake()->randomElement($sizes),
            'brand' => fake()->randomElement(['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Gap']),
            'image_path' => 'wardrobe/' . fake()->uuid() . '.jpg',
            'description' => fake()->sentence(),
        ];
    }
}

