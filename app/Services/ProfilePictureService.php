<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ProfilePictureService
{
    /**
     * Image dimensions for different sizes
     */
    const SIZES = [
        'thumbnail' => 100,  // For small avatars
        'medium' => 300,     // For profile pages
        'large' => 800,      // For full view
    ];

    /**
     * JPEG quality for compression (0-100)
     */
    const QUALITY = 85;

    /**
     * Maximum file size in KB before upload (client-side check backup)
     */
    const MAX_SIZE_KB = 2048; // 2MB

    protected ImageManager $manager;

    public function __construct()
    {
        // Initialize image manager with GD driver
        $this->manager = new ImageManager(new Driver());
    }

    /**
     * Upload and process profile picture
     * 
     * @param UploadedFile $file
     * @param int $userId
     * @param string|null $oldPicturePath
     * @return string Path to the main profile picture
     */
    public function uploadProfilePicture(UploadedFile $file, int $userId, ?string $oldPicturePath = null): string
    {
        // Validate file
        $this->validateFile($file);

        // Generate unique filename
        $filename = $this->generateFilename($userId);

        // Delete old profile pictures if exists
        if ($oldPicturePath) {
            $this->deleteProfilePictures($oldPicturePath);
        }

        // Process and save images in different sizes
        $this->processAndSaveImages($file, $filename);

        // Return the main profile picture path (medium size)
        return "profile-pictures/{$filename}-medium.jpg";
    }

    /**
     * Validate uploaded file
     * 
     * @param UploadedFile $file
     * @throws \Exception
     */
    protected function validateFile(UploadedFile $file): void
    {
        // Check file size
        if ($file->getSize() > (self::MAX_SIZE_KB * 1024)) {
            throw new \Exception("File size exceeds " . self::MAX_SIZE_KB . "KB limit.");
        }

        // Check file type
        $allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!in_array($file->getMimeType(), $allowedMimes)) {
            throw new \Exception("Only JPEG and PNG images are allowed.");
        }

        // Check if file is a valid image
        try {
            $image = $this->manager->read($file->getRealPath());
            
            // Optional: Check minimum dimensions
            if ($image->width() < 100 || $image->height() < 100) {
                throw new \Exception("Image dimensions must be at least 100x100 pixels.");
            }
            
            // Optional: Check maximum dimensions (prevent extremely large images)
            if ($image->width() > 5000 || $image->height() > 5000) {
                throw new \Exception("Image dimensions must not exceed 5000x5000 pixels.");
            }
        } catch (\Exception $e) {
            throw new \Exception("Invalid image file: " . $e->getMessage());
        }
    }

    /**
     * Generate unique filename for user
     * 
     * @param int $userId
     * @return string
     */
    protected function generateFilename(int $userId): string
    {
        return 'user-' . $userId . '-' . time();
    }

    /**
     * Process and save images in multiple sizes
     * 
     * @param UploadedFile $file
     * @param string $filename
     */
    protected function processAndSaveImages(UploadedFile $file, string $filename): void
    {
        $image = $this->manager->read($file->getRealPath());

        foreach (self::SIZES as $size => $dimension) {
            // Create a copy of the image
            $processedImage = clone $image;

            // Resize image (cover mode - maintains aspect ratio and crops)
            $processedImage->cover($dimension, $dimension);

            // Convert to JPEG and compress
            $encoded = $processedImage->toJpeg(quality: self::QUALITY);

            // Save to storage
            Storage::disk('public')->put(
                "profile-pictures/{$filename}-{$size}.jpg",
                (string) $encoded
            );
        }
    }

    /**
     * Delete all profile picture variants
     * 
     * @param string $picturePath
     */
    public function deleteProfilePictures(string $picturePath): void
    {
        // Extract base filename from path
        // Example: "profile-pictures/user-1-123456-medium.jpg" -> "user-1-123456"
        $baseFilename = preg_replace('/-\w+\.jpg$/', '', basename($picturePath));

        // Delete all size variants
        foreach (array_keys(self::SIZES) as $size) {
            $filePath = "profile-pictures/{$baseFilename}-{$size}.jpg";
            
            if (Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
            }
        }
    }

    /**
     * Get profile picture URL for specific size
     * 
     * @param string|null $picturePath
     * @param string $size (thumbnail, medium, large)
     * @return string|null
     */
    public static function getProfilePictureUrl(?string $picturePath, string $size = 'medium'): ?string
    {
        if (!$picturePath) {
            return null;
        }

        // Replace size in path
        $path = preg_replace('/-\w+\.jpg$/', "-{$size}.jpg", $picturePath);

        return Storage::disk('public')->url($path);
    }

    /**
     * Get all profile picture sizes for a user
     * 
     * @param string|null $picturePath
     * @return array
     */
    public static function getAllSizes(?string $picturePath): array
    {
        if (!$picturePath) {
            return [
                'thumbnail' => null,
                'medium' => null,
                'large' => null,
            ];
        }

        return [
            'thumbnail' => self::getProfilePictureUrl($picturePath, 'thumbnail'),
            'medium' => self::getProfilePictureUrl($picturePath, 'medium'),
            'large' => self::getProfilePictureUrl($picturePath, 'large'),
        ];
    }
}

