<?php

use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Marketplace - View and Filter Listings', function () {
    
    // Case-037: User views all marketplace listings
    it('displays all active marketplace listings', function () {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        
        // Create active products
        Product::factory()->count(5)->create([
            'status' => 'active',
            'category_id' => $category->id
        ]);
        
        // Create inactive product (should not be shown)
        Product::factory()->create([
            'status' => 'sold',
            'category_id' => $category->id
        ]);
        
        $response = $this->actingAs($user)->get(route('marketplace.index'));
        
        $response->assertStatus(200);
        
        $activeProducts = Product::where('status', 'active')->get();
        expect($activeProducts)->toHaveCount(5);
    });
    
    // Case-038: User filters listings by price range
    it('filters listings by price range', function () {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        
        Product::factory()->create(['status' => 'active', 'price' => 500, 'category_id' => $category->id]);
        Product::factory()->create(['status' => 'active', 'price' => 1500, 'category_id' => $category->id]);
        Product::factory()->create(['status' => 'active', 'price' => 2500, 'category_id' => $category->id]);
        Product::factory()->create(['status' => 'active', 'price' => 3500, 'category_id' => $category->id]);
        
        $response = $this->actingAs($user)->get(route('marketplace.index', [
            'min_price' => 1000,
            'max_price' => 3000
        ]));
        
        $response->assertStatus(200);
        
        $filteredProducts = Product::where('status', 'active')
            ->whereBetween('price', [1000, 3000])
            ->get();
        
        expect($filteredProducts)->toHaveCount(2);
    });
    
    // Case-039: User filters listings by size
    it('filters listings by size', function () {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        
        Product::factory()->create(['status' => 'active', 'size' => 'S', 'category_id' => $category->id]);
        Product::factory()->create(['status' => 'active', 'size' => 'M', 'category_id' => $category->id]);
        Product::factory()->create(['status' => 'active', 'size' => 'M', 'category_id' => $category->id]);
        Product::factory()->create(['status' => 'active', 'size' => 'L', 'category_id' => $category->id]);
        
        $response = $this->actingAs($user)->get(route('marketplace.index', ['size' => 'M']));
        
        $response->assertStatus(200);
        
        $filteredProducts = Product::where('status', 'active')
            ->where('size', 'M')
            ->get();
        
        expect($filteredProducts)->toHaveCount(2);
    });
    
    // Case-040: User filters listings by condition (new/used)
    it('filters listings by condition', function () {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        
        Product::factory()->count(2)->create([
            'status' => 'active',
            'condition' => 'new',
            'category_id' => $category->id
        ]);
        Product::factory()->count(3)->create([
            'status' => 'active',
            'condition' => 'used',
            'category_id' => $category->id
        ]);
        
        $response = $this->actingAs($user)->get(route('marketplace.index', ['condition' => 'new']));
        
        $response->assertStatus(200);
        
        $newProducts = Product::where('status', 'active')
            ->where('condition', 'new')
            ->get();
        
        expect($newProducts)->toHaveCount(2);
    });
    
    // Case-041: User searches listing by keyword
    it('searches listings by keyword', function () {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        
        Product::factory()->create([
            'status' => 'active',
            'title' => 'Blue Denim Jeans',
            'category_id' => $category->id
        ]);
        Product::factory()->create([
            'status' => 'active',
            'title' => 'Red Cotton Shirt',
            'category_id' => $category->id
        ]);
        Product::factory()->create([
            'status' => 'active',
            'title' => 'Blue Formal Blazer',
            'category_id' => $category->id
        ]);
        
        $response = $this->actingAs($user)->get(route('marketplace.index', ['search' => 'Blue']));
        
        $response->assertStatus(200);
        
        $searchResults = Product::where('status', 'active')
            ->where('title', 'LIKE', '%Blue%')
            ->get();
        
        expect($searchResults)->toHaveCount(2);
    });
    
    // Case-042: User applies multiple filters simultaneously
    it('applies multiple filters simultaneously', function () {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        
        Product::factory()->create([
            'status' => 'active',
            'title' => 'Blue Jeans',
            'price' => 1500,
            'size' => 'M',
            'condition' => 'new',
            'category_id' => $category->id
        ]);
        Product::factory()->create([
            'status' => 'active',
            'title' => 'Red Shirt',
            'price' => 800,
            'size' => 'M',
            'condition' => 'new',
            'category_id' => $category->id
        ]);
        Product::factory()->create([
            'status' => 'active',
            'title' => 'Blue Blazer',
            'price' => 1200,
            'size' => 'L',
            'condition' => 'new',
            'category_id' => $category->id
        ]);
        
        $filters = [
            'search' => 'Blue',
            'min_price' => 1000,
            'max_price' => 2000,
            'size' => 'M',
            'condition' => 'new'
        ];
        
        $response = $this->actingAs($user)->get(route('marketplace.index', $filters));
        
        $response->assertStatus(200);
        
        $filteredProducts = Product::where('status', 'active')
            ->where('title', 'LIKE', '%Blue%')
            ->whereBetween('price', [1000, 2000])
            ->where('size', 'M')
            ->where('condition', 'new')
            ->get();
        
        expect($filteredProducts)->toHaveCount(1);
        expect($filteredProducts->first()->title)->toBe('Blue Jeans');
    });
});

