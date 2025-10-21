<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SavedOutfit>
 */
class SavedOutfitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $occasions = ['casual', 'formal', 'party', 'business', 'date', 'workout'];
        
        return [
            'user_id' => User::factory(),
            'name' => fake()->words(3, true),
            'occasion' => fake()->randomElement($occasions),
            'items' => json_encode([]), // Empty array, should be populated with wardrobe item IDs
        ];
    }
}

