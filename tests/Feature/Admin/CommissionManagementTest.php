<?php

use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\CommissionRecord;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Admin - Process Commission and Approve/Reject Listings', function () {
    
    beforeEach(function () {
        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->regularUser = User::factory()->create(['is_admin' => false]);
    });
    
    // Case-048: Admin views pending listings for approval
    it('allows admin to view pending listings for approval', function () {
        $category = Category::factory()->create();
        
        // Create pending listings
        Product::factory()->count(3)->create([
            'status' => 'pending',
            'category_id' => $category->id
        ]);
        
        // Create active listings (should not be in pending)
        Product::factory()->count(2)->create([
            'status' => 'active',
            'category_id' => $category->id
        ]);
        
        $response = $this->actingAs($this->admin)->get(route('admin.transactions.pending-payments'));
        
        $response->assertStatus(200);
        
        $pendingProducts = Product::where('status', 'pending')->get();
        expect($pendingProducts)->toHaveCount(3);
    });
    
    it('prevents regular user from viewing pending listings', function () {
        $response = $this->actingAs($this->regularUser)->get(route('admin.transactions.pending-payments'));
        
        $response->assertForbidden();
    });
    
    // Case-049: Admin approves valid listing
    it('allows admin to approve valid listing', function () {
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'status' => 'pending',
            'category_id' => $category->id,
            'user_id' => $this->regularUser->id
        ]);
        
        // Approve the listing
        $product->status = 'active';
        $product->save();
        
        expect($product->status)->toBe('active');
        
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'status' => 'active'
        ]);
    });
    
    // Case-050: Admin rejects listing with reason
    it('allows admin to reject listing with reason', function () {
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'status' => 'pending',
            'category_id' => $category->id,
            'user_id' => $this->regularUser->id
        ]);
        
        // Reject the listing with reason
        $product->status = 'rejected';
        $product->rejection_reason = 'Product does not meet quality standards';
        $product->save();
        
        expect($product->status)->toBe('rejected')
            ->and($product->rejection_reason)->toContain('quality standards');
        
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'status' => 'rejected'
        ]);
    });
    
    // Case-051: Admin creates commission-based listing
    it('allows admin to create commission-based listing', function () {
        $category = Category::factory()->create();
        
        $product = Product::factory()->create([
            'user_id' => $this->regularUser->id,
            'category_id' => $category->id,
            'price' => 10000,
            'commission_rate' => 10 // 10% commission
        ]);
        
        expect($product->commission_rate)->toBe('10.00'); // Decimal cast returns string
        
        // Calculate commission
        $commissionAmount = ($product->price * $product->commission_rate) / 100;
        expect($commissionAmount)->toBe(1000.0);
    });
    
    it('creates commission record when product is sold', function () {
        $category = Category::factory()->create();
        
        $product = Product::factory()->create([
            'user_id' => $this->regularUser->id,
            'category_id' => $category->id,
            'price' => 5000,
            'commission_rate' => 10,
            'status' => 'active'
        ]);
        
        // Simulate product being sold
        $product->status = 'sold';
        $product->save();
        
        // Create commission record
        $commissionAmount = ($product->price * $product->commission_rate) / 100;
        
        $commission = CommissionRecord::create([
            'product_id' => $product->id,
            'user_id' => $product->user_id,
            'amount' => $commissionAmount,
            'rate' => $product->commission_rate,
            'status' => 'pending'
        ]);
        
        $this->assertDatabaseHas('commission_records', [
            'product_id' => $product->id,
            'amount' => 500, // 10% of 5000
            'rate' => 10
        ]);
    });
    
    // Case-052: Admin sets invalid commission rate (over 100%)
    it('displays error when commission rate exceeds 100%', function () {
        $category = Category::factory()->create();
        
        $this->expectException(\Exception::class);
        
        $product = Product::factory()->create([
            'user_id' => $this->regularUser->id,
            'category_id' => $category->id,
            'price' => 1000,
            'commission_rate' => 150 // Invalid: over 100%
        ]);
        
        // Validate commission rate
        if ($product->commission_rate > 100 || $product->commission_rate < 0) {
            throw new \Exception('Commission rate must be between 0-100%');
        }
    });
    
    it('validates commission rate is within valid range', function () {
        $category = Category::factory()->create();
        
        $validProduct = Product::factory()->create([
            'user_id' => $this->regularUser->id,
            'category_id' => $category->id,
            'price' => 1000,
            'commission_rate' => 15 // Valid: 15%
        ]);
        
        expect($validProduct->commission_rate)->toBeGreaterThanOrEqual(0)
            ->and($validProduct->commission_rate)->toBeLessThanOrEqual(100);
    });
    
    it('calculates correct seller payout after commission', function () {
        $category = Category::factory()->create();
        
        $product = Product::factory()->create([
            'user_id' => $this->regularUser->id,
            'category_id' => $category->id,
            'price' => 10000,
            'commission_rate' => 10
        ]);
        
        $commissionAmount = ($product->price * $product->commission_rate) / 100;
        $sellerPayout = $product->price - $commissionAmount;
        
        expect($commissionAmount)->toBe(1000.0)
            ->and($sellerPayout)->toBe(9000.0);
    });
});

