<?php

use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

describe('Marketplace - Post Listing', function () {
    
    // Case-043: User posts listing with all required fields
    it('creates listing successfully with all required fields', function () {
        Storage::fake('public');
        $user = User::factory()->create();
        $category = Category::factory()->create();
        
        $image = UploadedFile::fake()->image('product.jpg');
        
        $productData = [
            'title' => 'Vintage Leather Jacket',
            'description' => 'Beautiful vintage leather jacket in excellent condition',
            'price' => 2500,
            'category_id' => $category->id,
            'size' => 'M',
            'condition' => 'good',
            'brand' => 'Levi\'s',
            'color' => 'brown',
            'images' => [$image]
        ];
        
        $response = $this->actingAs($user)->post(route('marketplace.store'), $productData);
        
        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
        
        $this->assertDatabaseHas('products', [
            'user_id' => $user->id,
            'title' => 'Vintage Leather Jacket',
            'price' => 2500,
            'category_id' => $category->id,
            'status' => 'active'
        ]);
        
        Storage::disk('public')->assertExists('products/' . $image->hashName());
    });
    
    // Case-044: User posts listing without required fields
    it('displays validation error for missing required fields', function () {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->post(route('marketplace.store'), [
            'title' => '', // Missing required
            'description' => '',
            'price' => null,
            'category_id' => null
        ]);
        
        $response->assertSessionHasErrors(['title', 'price', 'category_id']);
    });
    
    // Case-045: User uploads invalid image format for listing
    it('fails when user uploads invalid image format', function () {
        Storage::fake('public');
        $user = User::factory()->create();
        $category = Category::factory()->create();
        
        $invalidFile = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');
        
        $response = $this->actingAs($user)->post(route('marketplace.store'), [
            'title' => 'Test Product',
            'description' => 'Test description',
            'price' => 1000,
            'condition' => 'good',
            'size' => 'M',
            'category_id' => $category->id,
            'images' => [$invalidFile]
        ]);
        
        $response->assertSessionHasErrors('images.0'); // Error on first image
    });
    
    // Case-046: User sets invalid price (negative or zero)
    it('displays error when price is negative', function () {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $image = UploadedFile::fake()->image('product.jpg');
        
        $response = $this->actingAs($user)->post(route('marketplace.store'), [
            'title' => 'Test Product',
            'description' => 'Test description',
            'price' => -100,
            'condition' => 'good',
            'size' => 'M',
            'category_id' => $category->id,
            'images' => [$image]
        ]);
        
        $response->assertSessionHasErrors('price');
    });
    
    it('displays error when price is zero', function () {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $image = UploadedFile::fake()->image('product.jpg');
        
        $response = $this->actingAs($user)->post(route('marketplace.store'), [
            'title' => 'Test Product',
            'description' => 'Test description',
            'price' => 0,
            'condition' => 'good',
            'size' => 'M',
            'category_id' => $category->id,
            'images' => [$image]
        ]);
        
        $response->assertSessionHasErrors('price');
    });
    
    // Case-047: User saves listing as draft
    it('saves listing as draft', function () {
        Storage::fake('public');
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $image = UploadedFile::fake()->image('draft.jpg');
        
        $response = $this->actingAs($user)->post(route('marketplace.store'), [
            'title' => 'Draft Product',
            'description' => 'This is a draft',
            'price' => 1500,
            'condition' => 'good',
            'size' => 'L',
            'category_id' => $category->id,
            'images' => [$image],
            'status' => 'draft'
        ]);
        
        $response->assertRedirect();
        
        $this->assertDatabaseHas('products', [
            'user_id' => $user->id,
            'title' => 'Draft Product',
            'status' => 'draft'
        ]);
    });
    
    it('can edit and publish draft listing later', function () {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        
        // Create product directly with explicit user_id to avoid factory creating new user
        $draftProduct = Product::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Draft Product',
            'description' => 'Test draft description',
            'price' => 1000,
            'condition' => 'good',
            'size' => 'M',
            'brand' => 'Test Brand',
            'color' => 'blue',
            'images' => json_encode(['test.jpg']),
            'status' => 'draft'
        ]);
        
        $response = $this->actingAs($user)->patch(route('marketplace.update', $draftProduct), [
            'title' => 'Published Product',
            'description' => $draftProduct->description,
            'price' => $draftProduct->price,
            'condition' => $draftProduct->condition,
            'size' => $draftProduct->size,
            'category_id' => $category->id,
            'status' => 'active'
        ]);
        
        $response->assertRedirect();
        
        $draftProduct->refresh();
        expect($draftProduct->status)->toBe('active')
            ->and($draftProduct->title)->toBe('Published Product');
    });
});

