<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Models\Product;

class ChatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get users and products
        $users = User::all();
        $products = Product::all();
        
        if ($users->count() < 2) {
            $this->command->info('Need at least 2 users to create conversations.');
            return;
        }
        
        if ($products->count() < 1) {
            $this->command->info('Need at least 1 product to create conversations.');
            return;
        }

        // Create sample conversations
        $conversations = [
            [
                'user1_id' => $users[0]->id,
                'user2_id' => $users[1]->id,
                'product_id' => $products[0]->id,
                'subject' => 'Interested in this item',
                'last_message_at' => now()->subHours(2),
            ],
            [
                'user1_id' => $users[0]->id,
                'user2_id' => $users[1]->id,
                'product_id' => $products[1]->id ?? $products[0]->id,
                'subject' => 'Price negotiation',
                'last_message_at' => now()->subHours(1),
            ],
        ];

        foreach ($conversations as $conversationData) {
            $conversation = Conversation::create($conversationData);

            // Create sample messages
            $messages = [
                [
                    'conversation_id' => $conversation->id,
                    'sender_id' => $conversation->user1_id,
                    'message' => 'Hi! I\'m interested in this item. Is it still available?',
                    'created_at' => now()->subHours(3),
                ],
                [
                    'conversation_id' => $conversation->id,
                    'sender_id' => $conversation->user2_id,
                    'message' => 'Yes, it\'s still available! Would you like to see more photos?',
                    'created_at' => now()->subHours(2, 30),
                ],
                [
                    'conversation_id' => $conversation->id,
                    'sender_id' => $conversation->user1_id,
                    'message' => 'That would be great! Also, is the price negotiable?',
                    'created_at' => now()->subHours(2),
                ],
                [
                    'conversation_id' => $conversation->id,
                    'sender_id' => $conversation->user2_id,
                    'message' => 'I can offer a 10% discount if you\'re serious about buying.',
                    'created_at' => now()->subHours(1, 30),
                ],
                [
                    'conversation_id' => $conversation->id,
                    'sender_id' => $conversation->user1_id,
                    'message' => 'That sounds fair! When can we meet to exchange?',
                    'created_at' => now()->subHours(1),
                ],
            ];

            foreach ($messages as $messageData) {
                Message::create($messageData);
            }
        }

        $this->command->info('Sample conversations and messages created successfully!');
    }
}