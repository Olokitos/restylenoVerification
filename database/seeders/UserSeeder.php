<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create multiple users for testing
        $users = [
            [
                'name' => 'Sarah Johnson',
                'email' => 'sarah@example.com',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'is_admin' => false,
            ],
            [
                'name' => 'Mike Chen',
                'email' => 'mike@example.com',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'is_admin' => false,
            ],
            [
                'name' => 'Emma Wilson',
                'email' => 'emma@example.com',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'is_admin' => false,
            ],
            [
                'name' => 'Alex Rodriguez',
                'email' => 'alex@example.com',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'is_admin' => false,
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }

        $this->command->info('Test users created successfully!');
        $this->command->info('Login credentials:');
        $this->command->info('sarah@example.com / password123');
        $this->command->info('mike@example.com / password123');
        $this->command->info('emma@example.com / password123');
        $this->command->info('alex@example.com / password123');
    }
}