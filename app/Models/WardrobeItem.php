<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WardrobeItem extends Model
{
    use HasFactory;
    protected $table = 'wardrobe_items';
    
    protected $fillable = [
        'user_id',
        'name',
        'brand',
        'category',
        'color',
        'size',
        'description',
        'image_path',
        'images',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'images' => 'array',
    ];

    protected $appends = ['image_url', 'image_urls'];

    public function getRouteKeyName()
    {
        return 'id';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getImageUrlAttribute()
    {
        if ($this->image_path) {
            return asset('storage/' . $this->image_path);
        }

        return null;
    }

    public function getImageUrlsAttribute()
    {
        $urls = [];
        
        // Add images from images array if available
        if ($this->images && is_array($this->images) && count($this->images) > 0) {
            foreach ($this->images as $imagePath) {
                if ($imagePath) {
                    $urls[] = asset('storage/' . $imagePath);
                }
            }
        }
        
        // Fallback to single image_path if no images array
        if (empty($urls) && $this->image_path) {
            $urls[] = asset('storage/' . $this->image_path);
        }
        
        return $urls;
    }
}
