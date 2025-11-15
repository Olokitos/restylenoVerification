<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'buyer_id',
        'seller_id',
        'amount',
        'sale_price',
        'commission_amount',
        'seller_earnings',
        'status',
        'payment_method',
        'payment_proof_path',
        'shipping_proof_path',
        'delivery_proof_path',
        'gcash_reference',
        'payment_collected_by_platform',
        'platform_payment_reference',
        'platform_payment_collected_at',
        'seller_paid',
        'seller_payout_reference',
        'seller_paid_at',
        'seller_payout_amount',
        'shipped_at',
        'delivered_at',
        'released_at',
        'notes',
        'completed_at',
        'payout_proof_path',
        'seller_payout_details',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'seller_earnings' => 'decimal:2',
        'payment_collected_by_platform' => 'boolean',
        'platform_payment_collected_at' => 'datetime',
        'seller_paid' => 'boolean',
        'seller_paid_at' => 'datetime',
        'seller_payout_amount' => 'decimal:2',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'released_at' => 'datetime',
        'completed_at' => 'datetime',
        'seller_payout_details' => 'array',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending_payment');
    }

    public function commissionRecord()
    {
        return $this->hasOne(CommissionRecord::class);
    }

    /**
     * Rating associated with this transaction, if any.
     */
    public function rating()
    {
        return $this->hasOne(Rating::class);
    }

    /**
     * Calculate 2% commission from sale price
     */
    public function calculateCommission()
    {
        return $this->sale_price * 0.02;
    }

    /**
     * Calculate 98% seller earnings from sale price
     */
    public function calculateSellerEarnings()
    {
        return $this->sale_price * 0.98;
    }

    /**
     * Check if transaction can be shipped (payment verified)
     */
    public function canShip()
    {
        // REQUIRE payment verification before shipping - prevents bypass
        return $this->status === 'payment_verified' && $this->payment_collected_by_platform;
    }

    /**
     * Check if transaction can be completed (delivered)
     */
    public function canComplete()
    {
        return $this->status === 'delivered';
    }

    /**
     * Get human-readable status label
     */
    public function getStatusLabel()
    {
        return match($this->status) {
            'pending_payment' => 'Pending Payment',
            'payment_submitted' => 'Payment Submitted',
            'payment_verified' => 'Payment Verified',
            'shipped' => 'Shipped',
            'delivered' => 'Delivered',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
            'refunded' => 'Refunded',
            default => 'Unknown'
        };
    }

    /**
     * Get status color for UI
     */
    public function getStatusColor()
    {
        return match($this->status) {
            'pending_payment' => 'yellow',
            'payment_submitted' => 'blue',
            'payment_verified' => 'green',
            'shipped' => 'purple',
            'delivered' => 'green',
            'completed' => 'green',
            'cancelled' => 'red',
            'refunded' => 'red',
            default => 'gray'
        };
    }
}