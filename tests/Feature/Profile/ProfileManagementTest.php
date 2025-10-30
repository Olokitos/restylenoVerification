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
    
    it('rejects name with numbers', function () {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->patch(route('settings.profile.update'), [
            'name' => 'John123', // Name with numbers
            'email' => $user->email
        ]);
        
        $response->assertSessionHasErrors('name');
        
        $user->refresh();
        expect($user->name)->not->toBe('John123');
    });
    
    it('rejects name with special characters', function () {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->patch(route('settings.profile.update'), [
            'name' => 'John@Doe!', // Name with special characters
            'email' => $user->email
        ]);
        
        $response->assertSessionHasErrors('name');
        
        $user->refresh();
        expect($user->name)->not->toBe('John@Doe!');
    });
    
    it('accepts valid name with letters and spaces only', function () {
        $user = User::factory()->create([
            'name' => 'Old Name'
        ]);
        
        $response = $this->actingAs($user)->patch(route('settings.profile.update'), [
            'name' => 'John Doe Smith', // Valid name with spaces
            'email' => $user->email
        ]);
        
        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
        
        $user->refresh();
        expect($user->name)->toBe('John Doe Smith');
    });
    
    // Case-016: User uploads invalid file type
    // Only PNG and JPEG files are allowed, all other formats should be rejected with error message
    it('fails when user uploads PDF file', function () {
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
    
    it('fails when user uploads GIF file', function () {
        Storage::fake('public');
        $user = User::factory()->create();
        
        $gifFile = UploadedFile::fake()->image('image.gif');
        
        $response = $this->actingAs($user)->patch(route('settings.profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'profile_picture' => $gifFile
        ]);
        
        $response->assertSessionHasErrors('profile_picture');
    });
    
    it('fails when user uploads WEBP file', function () {
        Storage::fake('public');
        $user = User::factory()->create();
        
        $webpFile = UploadedFile::fake()->create('image.webp', 100, 'image/webp');
        
        $response = $this->actingAs($user)->patch(route('settings.profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'profile_picture' => $webpFile
        ]);
        
        $response->assertSessionHasErrors('profile_picture');
    });
    
    it('accepts PNG file as valid profile picture', function () {
        Storage::fake('public');
        $user = User::factory()->create([
            'name' => 'Jane Smith' // Ensure valid name
        ]);
        
        // Create image with proper dimensions (minimum 100x100)
        $pngFile = UploadedFile::fake()->image('profile.png', 500, 500);
        
        $response = $this->actingAs($user)->patch(route('settings.profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'profile_picture' => $pngFile
        ]);
        
        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
        
        // Verify file is stored with new naming (user-{id}-{timestamp}-medium.jpg)
        $files = Storage::disk('public')->files('profile-pictures');
        expect($files)->toHaveCount(3); // thumbnail, medium, large
        
        // Verify database is updated with file path
        $user->refresh();
        expect($user->profile_picture)->toContain('profile-pictures/user-' . $user->id);
        expect($user->profile_picture)->toContain('-medium.jpg');
    });
    
    it('accepts JPEG file as valid profile picture', function () {
        Storage::fake('public');
        $user = User::factory()->create([
            'name' => 'John Doe' // Ensure valid name
        ]);
        
        // Create image with proper dimensions (minimum 100x100)
        $jpegFile = UploadedFile::fake()->image('profile.jpg', 500, 500);
        
        $response = $this->actingAs($user)->patch(route('settings.profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'profile_picture' => $jpegFile
        ]);
        
        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
        
        // Verify file is stored with new naming (user-{id}-{timestamp}-medium.jpg)
        $files = Storage::disk('public')->files('profile-pictures');
        expect($files)->toHaveCount(3); // thumbnail, medium, large
        
        // Verify database is updated with file path
        $user->refresh();
        expect($user->profile_picture)->toContain('profile-pictures/user-' . $user->id);
        expect($user->profile_picture)->toContain('-medium.jpg');
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

