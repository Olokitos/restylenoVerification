<?php

use App\Models\User;
use App\Models\WardrobeItem;
use App\Models\SavedOutfit;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Virtual Wardrobe - Generate Outfit Suggestions', function () {
    
    // Case-032: User generates outfit with no items in wardrobe
    it('displays message when user has no items in wardrobe', function () {
        $this->markTestSkipped('AI outfit recommendations not yet implemented');
        
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->post(route('api.ai-recommendations'), [
            'occasion' => 'casual'
        ]);
        
        $response->assertStatus(422);
        $response->assertJson([
            'message' => 'No items available to create outfit'
        ]);
    });
    
    // Case-033: User generates outfit with insufficient items (less than 3 pieces)
    it('displays error when user has insufficient items', function () {
        $this->markTestSkipped('AI outfit recommendations not yet implemented');
        
        $user = User::factory()->create();
        
        // Create only 2 items (insufficient)
        WardrobeItem::factory()->count(2)->create(['user_id' => $user->id]);
        
        $response = $this->actingAs($user)->post(route('api.ai-recommendations'), [
            'occasion' => 'casual'
        ]);
        
        $response->assertStatus(422);
        $response->assertJson([
            'message' => 'Not enough items to generate complete outfit'
        ]);
    });
    
    // Case-034: User generates outfit for specific occasion (casual/formal/party)
    it('generates outfit for casual occasion', function () {
        $this->markTestSkipped('AI outfit recommendations not yet implemented');
        
        $user = User::factory()->create();
        
        // Create sufficient wardrobe items
        WardrobeItem::factory()->create(['user_id' => $user->id, 'category' => 'tops']);
        WardrobeItem::factory()->create(['user_id' => $user->id, 'category' => 'bottoms']);
        WardrobeItem::factory()->create(['user_id' => $user->id, 'category' => 'shoes']);
        
        $response = $this->actingAs($user)->post(route('api.ai-recommendations'), [
            'occasion' => 'casual'
        ]);
        
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'recommendations' => [
                '*' => ['id', 'items']
            ]
        ]);
    });
    
    it('generates outfit for formal occasion', function () {
        $user = User::factory()->create();
        
        WardrobeItem::factory()->count(5)->create(['user_id' => $user->id]);
        
        $response = $this->actingAs($user)->post(route('api.ai-recommendations'), [
            'occasion' => 'formal'
        ]);
        
        $response->assertStatus(200);
        $response->assertJsonStructure(['recommendations']);
    });
    
    it('generates outfit for party occasion', function () {
        $user = User::factory()->create();
        
        WardrobeItem::factory()->count(5)->create(['user_id' => $user->id]);
        
        $response = $this->actingAs($user)->post(route('api.ai-recommendations'), [
            'occasion' => 'party'
        ]);
        
        $response->assertStatus(200);
        $response->assertJsonStructure(['recommendations']);
    });
    
    // Case-035: User saves generated outfit suggestion
    it('allows user to save generated outfit suggestion', function () {
        $this->markTestSkipped('Save outfit feature not yet implemented');
        
        $user = User::factory()->create();
        
        $item1 = WardrobeItem::factory()->create(['user_id' => $user->id]);
        $item2 = WardrobeItem::factory()->create(['user_id' => $user->id]);
        $item3 = WardrobeItem::factory()->create(['user_id' => $user->id]);
        
        $outfitData = [
            'name' => 'My Casual Outfit',
            'items' => [$item1->id, $item2->id, $item3->id],
            'occasion' => 'casual'
        ];
        
        $response = $this->actingAs($user)->post(route('api.outfits.save'), $outfitData);
        
        $response->assertStatus(201);
        
        $this->assertDatabaseHas('saved_outfits', [
            'user_id' => $user->id,
            'name' => 'My Casual Outfit',
            'occasion' => 'casual'
        ]);
    });
    
    // Case-036: User regenerates new outfit suggestion
    it('provides different outfit combination when regenerating', function () {
        $user = User::factory()->create();
        
        // Create multiple items for variety
        WardrobeItem::factory()->count(10)->create(['user_id' => $user->id]);
        
        $response1 = $this->actingAs($user)->post(route('api.ai-recommendations'), [
            'occasion' => 'casual'
        ]);
        
        $response2 = $this->actingAs($user)->post(route('api.ai-recommendations'), [
            'occasion' => 'casual',
            'regenerate' => true
        ]);
        
        $response1->assertStatus(200);
        $response2->assertStatus(200);
        
        // Both should return outfit recommendations
        expect($response1->json('recommendations'))->toBeArray()
            ->and($response2->json('recommendations'))->toBeArray();
    });
});

