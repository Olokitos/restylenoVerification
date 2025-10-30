<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommissionRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'seller_id',
        'product_id',
        'user_id',
        'amount',
        'rate',
        'status',
        'paid_at',
        'collected_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'rate' => 'decimal:2',
        'paid_at' => 'datetime',
        'collected_at' => 'datetime',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get commissions for a specific seller
     */
    public function scopeForSeller($query, $sellerId)
    {
        return $query->where('user_id', $sellerId);
    }

    /**
     * Scope to get pending commissions
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get paid commissions
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }
}