<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Platform Payment Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for platform payment collection and seller payouts
    |
    */

    'payment' => [
        // Platform GCash details for payment collection
        'gcash' => [
            'number' => env('PLATFORM_GCASH_NUMBER', '09123456789'),
            'name' => env('PLATFORM_GCASH_NAME', 'Restyle Platform'),
        ],

        // Platform bank account details
        'bank_account' => [
            'bank_name' => env('PLATFORM_BANK_NAME', 'BPI'),
            'account_number' => env('PLATFORM_BANK_ACCOUNT', '1234567890'),
            'account_name' => env('PLATFORM_BANK_ACCOUNT_NAME', 'Restyle Platform'),
        ],

        // Commission rate (as decimal)
        'commission_rate' => 0.02, // 2%
    ],

    'payout' => [
        // Minimum payout amount
        'minimum_amount' => 100.00,
        
        // Payout processing days
        'processing_days' => 1,
    ],
];
