<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SavedOutfit extends Model
{
    protected $table = 'saved_outfits';
    
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'wardrobe_item_ids',
        'occasion',
        'weather_context',
        'outfit_metadata',
        'is_favorite',
    ];

    protected $casts = [
        'wardrobe_item_ids' => 'array',
        'weather_context' => 'array',
        'outfit_metadata' => 'array',
        'is_favorite' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(OutfitFeedback::class);
    }

    public function wardrobeItems(): BelongsToMany
    {
        return $this->belongsToMany(WardrobeItem::class, 'saved_outfit_wardrobe_items', 'saved_outfit_id', 'wardrobe_item_id');
    }

    // Helper method to get wardrobe items by IDs
    public function getWardrobeItemsAttribute()
    {
        if (empty($this->wardrobe_item_ids)) {
            return collect();
        }
        
        return WardrobeItem::whereIn('id', $this->wardrobe_item_ids)
            ->where('user_id', $this->user_id)
            ->get();
    }

    // Helper method to get outfit summary
    public function getOutfitSummaryAttribute()
    {
        $items = $this->getWardrobeItemsAttribute();
        if ($items->isEmpty()) {
            return 'No items';
        }

        $categories = $items->pluck('category')->unique()->implode(', ');
        $colors = $items->pluck('color')->unique()->implode(', ');
        
        return "{$categories} in {$colors}";
    }

    // Helper method to get total feedback count
    public function getTotalFeedbackCountAttribute()
    {
        return $this->feedback()->count();
    }

    // Helper method to get positive feedback count
    public function getPositiveFeedbackCountAttribute()
    {
        return $this->feedback()
            ->whereIn('feedback_type', ['liked', 'wore_this', 'saved'])
            ->count();
    }
}