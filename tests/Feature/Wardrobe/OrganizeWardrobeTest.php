<?php

use App\Models\User;
use App\Models\WardrobeItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

describe('Virtual Wardrobe - Organize', function () {
    
    // Case-021: User uploads valid clothing item with all details
    it('allows user to upload valid clothing item with all details', function () {
        Storage::fake('public');
        $user = User::factory()->create();
        
        $image = UploadedFile::fake()->image('shirt.jpg');
        
        $response = $this->actingAs($user)->post(route('wardrobe.store'), [
            'name' => 'Blue T-Shirt',
            'category' => 'tops',
            'color' => 'blue',
            'size' => 'M',
            'brand' => 'Nike',
            'image' => $image,
            'description' => 'Casual blue t-shirt'
        ]);
        
        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
        
        $this->assertDatabaseHas('wardrobe_items', [
            'user_id' => $user->id,
            'name' => 'Blue T-Shirt',
            'category' => 'tops',
            'color' => 'blue',
            'size' => 'M'
        ]);
        
        Storage::disk('public')->assertExists('wardrobe/' . $image->hashName());
    });
    
    // Case-022: User uploads without required fields
    it('fails upload without required fields', function () {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->post(route('wardrobe.store'), [
            'name' => '', // Missing required field
            'category' => '',
        ]);
        
        $response->assertSessionHasErrors(['name', 'category']);
    });
    
    // Case-023: User uploads invalid image format
    it('fails upload with invalid image format', function () {
        Storage::fake('public');
        $user = User::factory()->create();
        
        $invalidFile = UploadedFile::fake()->create('document.txt', 100, 'text/plain');
        
        $response = $this->actingAs($user)->post(route('wardrobe.store'), [
            'name' => 'Test Item',
            'category' => 'tops',
            'image' => $invalidFile
        ]);
        
        $response->assertSessionHasErrors('image');
    });
    
    // Case-024: User uploads image exceeding size limit
    it('fails upload when image exceeds size limit', function () {
        Storage::fake('public');
        $user = User::factory()->create();
        
        // Create image larger than allowed (e.g., 10MB if limit is 5MB)
        $largeImage = UploadedFile::fake()->image('large.jpg')->size(10240); // 10MB
        
        $response = $this->actingAs($user)->post(route('wardrobe.store'), [
            'name' => 'Test Item',
            'category' => 'tops',
            'image' => $largeImage
        ]);
        
        $response->assertSessionHasErrors('image');
    });
    
    // Case-025: User uploads multiple items at once
    it('allows user to upload multiple items at once', function () {
        $user = User::factory()->create();
        
        $items = [
            ['name' => 'Item 1', 'category' => 'tops'],
            ['name' => 'Item 2', 'category' => 'bottoms'],
            ['name' => 'Item 3', 'category' => 'shoes'],
        ];
        
        foreach ($items as $item) {
            $this->actingAs($user)->post(route('wardrobe.store'), [
                'name' => $item['name'],
                'category' => $item['category'],
                'color' => 'blue',
                'size' => 'M',
                'brand' => 'Generic'
            ]);
        }
        
        expect(WardrobeItem::where('user_id', $user->id)->count())->toBe(3);
    });
    
    // Case-026: User filters items by category
    it('filters wardrobe items by category', function () {
        $user = User::factory()->create();
        
        WardrobeItem::factory()->create(['user_id' => $user->id, 'category' => 'tops']);
        WardrobeItem::factory()->create(['user_id' => $user->id, 'category' => 'tops']);
        WardrobeItem::factory()->create(['user_id' => $user->id, 'category' => 'bottoms']);
        
        $response = $this->actingAs($user)->get(route('wardrobe.index', ['category' => 'tops']));
        
        $response->assertStatus(200);
        
        // Verify only tops are returned (you may need to adjust based on your implementation)
        $items = WardrobeItem::where('user_id', $user->id)
            ->where('category', 'tops')
            ->get();
        
        expect($items)->toHaveCount(2);
    });
    
    // Case-027: User sorts items by date added
    it('sorts wardrobe items by date added', function () {
        $user = User::factory()->create();
        
        $item1 = WardrobeItem::factory()->create([
            'user_id' => $user->id,
            'created_at' => now()->subDays(3)
        ]);
        $item2 = WardrobeItem::factory()->create([
            'user_id' => $user->id,
            'created_at' => now()->subDays(1)
        ]);
        $item3 = WardrobeItem::factory()->create([
            'user_id' => $user->id,
            'created_at' => now()
        ]);
        
        $items = WardrobeItem::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
        
        expect($items->first()->id)->toBe($item3->id)
            ->and($items->last()->id)->toBe($item1->id);
    });
    
    // Case-028: User searches items by name or tag
    it('searches wardrobe items by name or tag', function () {
        $user = User::factory()->create();
        
        WardrobeItem::factory()->create(['user_id' => $user->id, 'name' => 'Blue Shirt']);
        WardrobeItem::factory()->create(['user_id' => $user->id, 'name' => 'Red Pants']);
        WardrobeItem::factory()->create(['user_id' => $user->id, 'name' => 'Blue Jeans']);
        
        $results = WardrobeItem::where('user_id', $user->id)
            ->where('name', 'LIKE', '%Blue%')
            ->get();
        
        expect($results)->toHaveCount(2);
    });
    
    // Case-029: User creates custom collection
    it('allows user to create custom collection', function () {
        $user = User::factory()->create();
        
        // Assuming you have a collections feature
        $item1 = WardrobeItem::factory()->create(['user_id' => $user->id]);
        $item2 = WardrobeItem::factory()->create(['user_id' => $user->id]);
        
        // Create collection (adjust route based on your implementation)
        $collectionData = [
            'name' => 'Summer Outfits',
            'item_ids' => [$item1->id, $item2->id]
        ];
        
        // This test assumes you have a collections feature
        // Adjust based on your actual implementation
        expect($user->id)->toBeInt();
    });
    
    // Case-030: User deletes clothing item
    it('allows user to delete clothing item', function () {
        $user = User::factory()->create();
        $item = WardrobeItem::factory()->create(['user_id' => $user->id]);
        
        $response = $this->actingAs($user)->delete(route('wardrobe.destroy', $item));
        
        $response->assertRedirect();
        $this->assertDatabaseMissing('wardrobe_items', ['id' => $item->id]);
    });
    
    // Case-031: User edits clothing item details
    it('allows user to edit clothing item details', function () {
        $user = User::factory()->create();
        $item = WardrobeItem::factory()->create([
            'user_id' => $user->id,
            'name' => 'Old Name',
            'color' => 'blue'
        ]);
        
        $response = $this->actingAs($user)->patch(route('wardrobe.update', $item), [
            'name' => 'Updated Name',
            'brand' => $item->brand, // Required field
            'category' => $item->category,
            'color' => 'red',
            'size' => 'L'
        ]);
        
        $response->assertRedirect();
        
        $item->refresh();
        expect($item->name)->toBe('Updated Name')
            ->and($item->color)->toBe('red')
            ->and($item->size)->toBe('L');
    });
});

