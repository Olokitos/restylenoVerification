<?php

use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\WardrobeItem;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// Sample tests to demonstrate the test dashboard

it('can create a user', function () {
    $user = User::factory()->create([
        'name' => 'Test User',
        'email' => 'test@example.com'
    ]);
    
    expect($user->name)->toBe('Test User')
        ->and($user->email)->toBe('test@example.com')
        ->and($user->is_admin)->toBeFalse();
});

it('can create a category', function () {
    $category = Category::factory()->create([
        'name' => 'Shirts',
        'description' => 'All types of shirts'
    ]);
    
    expect($category->name)->toBe('Shirts')
        ->and($category->is_active)->toBeTrue();
});

it('can create a wardrobe item', function () {
    $user = User::factory()->create();
    
    $item = WardrobeItem::factory()->create([
        'user_id' => $user->id,
        'name' => 'Blue T-Shirt',
        'category' => 'tops'
    ]);
    
    expect($item->user_id)->toBe($user->id)
        ->and($item->name)->toBe('Blue T-Shirt')
        ->and($item->category)->toBe('tops');
});

it('can create a product with relationships', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    
    $product = Product::factory()->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'title' => 'Vintage Jeans',
        'price' => 1500
    ]);
    
    expect($product->title)->toBe('Vintage Jeans')
        ->and($product->price)->toBe(1500)
        ->and($product->user)->toBeInstanceOf(User::class)
        ->and($product->category)->toBeInstanceOf(Category::class);
});

it('validates product belongs to user', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['user_id' => $user->id]);
    
    expect($product->user->id)->toBe($user->id)
        ->and($product->user->name)->toBe($user->name);
});

it('checks user can have multiple products', function () {
    $user = User::factory()->create();
    
    Product::factory()->count(3)->create(['user_id' => $user->id]);
    
    expect($user->products)->toHaveCount(3);
});

it('checks category can have multiple products', function () {
    $category = Category::factory()->create();
    
    Product::factory()->count(5)->create(['category_id' => $category->id]);
    
    expect($category->products)->toHaveCount(5);
});

it('validates user email is unique', function () {
    User::factory()->create(['email' => 'unique@example.com']);
    
    $this->expectException(\Illuminate\Database\QueryException::class);
    
    User::factory()->create(['email' => 'unique@example.com']);
});

it('checks product has default status', function () {
    $product = Product::factory()->create();
    
    expect($product->status)->toBe('active');
});

it('validates wardrobe item belongs to correct user', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    
    $item = WardrobeItem::factory()->create(['user_id' => $user1->id]);
    
    expect($item->user_id)->toBe($user1->id)
        ->and($item->user_id)->not->toBe($user2->id);
});

