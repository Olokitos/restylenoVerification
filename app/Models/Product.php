<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'description',
        'price',
        'condition',
        'size',
        'brand',
        'color',
        'images',
        'status',
        'commission_rate',
        'rejection_reason',
        'is_featured',
        'views',
        'shoulder',
        'length',
        'sleeve_length',
        'bust',
        'cuff',
        'bicep_length',
    ];

    protected $casts = [
        'images' => 'array',
        'is_featured' => 'boolean',
        'price' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'shoulder' => 'decimal:1',
        'length' => 'decimal:1',
        'sleeve_length' => 'decimal:1',
        'bust' => 'decimal:1',
        'cuff' => 'decimal:1',
        'bicep_length' => 'decimal:1',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeSold($query)
    {
        return $query->where('status', 'sold');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function incrementViews()
    {
        $this->increment('views');
    }
}