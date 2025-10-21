<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

describe('Profile Management - Edit Profile', function () {
    
    // Case-013: User updates profile with valid information
    it('allows user to update profile with valid information', function () {
        $user = User::factory()->create([
            'name' => 'Old Name',
            'email' => 'old@example.com'
        ]);
        
        $response = $this->actingAs($user)->patch(route('settings.profile.update'), [
            'name' => 'New Name',
            'email' => 'new@example.com'
        ]);
        
        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
        
        $user->refresh();
        expect($user->name)->toBe('New Name')
            ->and($user->email)->toBe('new@example.com');
    });
    
    // Case-014: User attempts to update email to existing email
    it('prevents user from updating email to existing email', function () {
        $existingUser = User::factory()->create(['email' => 'existing@example.com']);
        $user = User::factory()->create(['email' => 'user@example.com']);
        
        $response = $this->actingAs($user)->patch(route('settings.profile.update'), [
            'name' => $user->name,
            'email' => 'existing@example.com'
        ]);
        
        $response->assertSessionHasErrors('email');
        
        $user->refresh();
        expect($user->email)->toBe('user@example.com');
    });
    
    // Case-015: User inputs invalid data format
    it('shows validation error for invalid data format', function () {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->patch(route('settings.profile.update'), [
            'name' => '', // Empty name
            'email' => 'invalid-email' // Invalid email format
        ]);
        
        $response->assertSessionHasErrors(['name', 'email']);
    });
    
    // Case-016: User uploads invalid file type
    it('fails when user uploads invalid file type for profile picture', function () {
        Storage::fake('public');
        $user = User::factory()->create();
        
        $invalidFile = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');
        
        $response = $this->actingAs($user)->patch(route('settings.profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'profile_picture' => $invalidFile
        ]);
        
        $response->assertSessionHasErrors('profile_picture');
    });
});

describe('Profile Management - Delete Account', function () {
    
    // Case-017: User deletes account with confirmation and valid password
    it('allows user to delete account with valid password and confirmation', function () {
        $user = User::factory()->create([
            'password' => bcrypt('password123')
        ]);
        
        $response = $this->actingAs($user)->delete(route('settings.account.destroy'), [
            'password' => 'password123',
            'confirmation' => true
        ]);
        
        $response->assertRedirect('/');
        $this->assertGuest();
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    });
    
    // Case-018: User attempts to delete without confirmation
    it('prevents account deletion without confirmation', function () {
        $user = User::factory()->create([
            'password' => bcrypt('password123')
        ]);
        
        $response = $this->actingAs($user)->delete(route('settings.account.destroy'), [
            'password' => 'password123',
            'confirmation' => false
        ]);
        
        $response->assertSessionHasErrors('confirmation');
        $this->assertDatabaseHas('users', ['id' => $user->id]);
    });
    
    // Case-019: User enters wrong password for deletion
    it('fails account deletion with wrong password', function () {
        $user = User::factory()->create([
            'password' => bcrypt('password123')
        ]);
        
        $response = $this->actingAs($user)->delete(route('settings.account.destroy'), [
            'password' => 'wrongpassword',
            'confirmation' => true
        ]);
        
        $response->assertSessionHasErrors('password');
        $this->assertDatabaseHas('users', ['id' => $user->id]);
    });
    
    // Case-020: Verify data removal after account deletion
    it('removes all user data from database after account deletion', function () {
        $user = User::factory()->create([
            'password' => bcrypt('password123')
        ]);
        
        // Create related data
        $wardrobeItem = \App\Models\WardrobeItem::factory()->create(['user_id' => $user->id]);
        $product = \App\Models\Product::factory()->create(['user_id' => $user->id]);
        
        $userId = $user->id;
        
        $response = $this->actingAs($user)->delete(route('settings.account.destroy'), [
            'password' => 'password123',
            'confirmation' => true
        ]);
        
        // Verify user is deleted
        $this->assertDatabaseMissing('users', ['id' => $userId]);
        
        // Verify related data is deleted (cascade)
        $this->assertDatabaseMissing('wardrobe_items', ['user_id' => $userId]);
        $this->assertDatabaseMissing('products', ['user_id' => $userId]);
    });
});

