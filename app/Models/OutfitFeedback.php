<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OutfitFeedback extends Model
{
    protected $table = 'outfit_feedback';
    
    protected $fillable = [
        'user_id',
        'saved_outfit_id',
        'feedback_type',
        'recommendation_context',
        'rating',
        'notes',
    ];

    protected $casts = [
        'recommendation_context' => 'array',
        'rating' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function savedOutfit(): BelongsTo
    {
        return $this->belongsTo(SavedOutfit::class);
    }

    // Helper method to check if feedback is positive
    public function getIsPositiveAttribute()
    {
        return in_array($this->feedback_type, ['liked', 'wore_this', 'saved']);
    }

    // Helper method to get feedback type label
    public function getFeedbackTypeLabelAttribute()
    {
        $labels = [
            'liked' => 'Liked',
            'wore_this' => 'Wore This',
            'not_for_me' => 'Not For Me',
            'saved' => 'Saved',
            'shared' => 'Shared',
        ];

        return $labels[$this->feedback_type] ?? ucfirst($this->feedback_type);
    }
}