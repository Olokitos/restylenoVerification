<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            ['name' => 'Tops', 'description' => 'T-shirts, blouses, shirts'],
            ['name' => 'Bottoms', 'description' => 'Pants, jeans, skirts'],
            ['name' => 'Dresses', 'description' => 'All types of dresses'],
            ['name' => 'Outerwear', 'description' => 'Jackets, coats, blazers'],
            ['name' => 'Shoes', 'description' => 'All types of footwear'],
            ['name' => 'Accessories', 'description' => 'Bags, belts, jewelry'],
            ['name' => 'Activewear', 'description' => 'Sports and gym clothing'],
        ];
        
        $category = fake()->randomElement($categories);
        $name = $category['name'] . ' ' . fake()->unique()->numberBetween(1, 10000);
        
        return [
            'name' => $name,
            'slug' => \Illuminate\Support\Str::slug($name),
            'description' => $category['description'],
            'is_active' => true,
        ];
    }
    
    /**
     * Indicate that the category is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}

