<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    // If user is authenticated, redirect to appropriate dashboard
    if (auth()->check()) {
        if (auth()->user()->is_admin) {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('dashboard');
    }
    
    return Inertia::render('welcome');
})->name('home');

// Test route to check if Inertia is working
Route::get('/test', function () {
    return Inertia::render('welcome');
});

// Simple test route with minimal data
Route::get('/simple-test', function () {
    return response()->json([
        'message' => 'Backend is working',
        'timestamp' => now(),
        'user_authenticated' => auth()->check(),
        'user_id' => auth()->id(),
    ]);
});

// Simple dashboard test route
Route::get('/simple-dashboard', function () {
    return Inertia::render('simple-dashboard', [
        'debug' => [
            'user_id' => auth()->id(),
            'user_name' => auth()->user()->name ?? 'Unknown',
            'timestamp' => now()->toISOString(),
        ]
    ]);
});

// Ultra simple test route - no authentication required
Route::get('/ultra-simple', function () {
    return Inertia::render('simple-dashboard', [
        'debug' => [
            'user_id' => 0,
            'user_name' => 'Test User',
            'timestamp' => now()->toISOString(),
        ]
    ]);
});

// Raw HTML test route - no Inertia, no Vite
Route::get('/raw-html-test', function () {
    return response()->view('raw-test');
});

// Minimal Inertia test route
Route::get('/minimal-inertia', function () {
    return Inertia::render('simple-dashboard', [
        'debug' => [
            'user_id' => 0,
            'user_name' => 'Minimal Test',
            'timestamp' => now()->toISOString(),
        ]
    ])->rootView('app-minimal');
});

Route::get('/terms-of-service', function () {
    return Inertia::render('terms-of-service');
})->name('terms-of-service');

Route::get('/privacy-policy', function () {
    return Inertia::render('privacy-policy');
})->name('privacy-policy');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        // Redirect admin users to admin dashboard
        if (auth()->user()->is_admin) {
            return redirect()->route('admin.dashboard');
        }
        
        try {
            // Get wardrobe statistics
            $wardrobeCount = \App\Models\WardrobeItem::where('user_id', auth()->id())->count();
            
            // For now, we'll set outfits and trades to 0 since we don't have those features yet
            $outfitsCreated = 0; // TODO: Implement outfits feature
            $itemsTraded = 0; // TODO: Implement marketplace feature
            
            // Get marketplace statistics
            $marketplaceStats = [
                'totalProducts' => \App\Models\Product::where('status', 'active')->count(),
                'totalCategories' => \App\Models\Category::where('is_active', true)->count(),
                'featuredProducts' => \App\Models\Product::where('status', 'active')->where('is_featured', true)->count(),
                'recentProducts' => \App\Models\Product::where('status', 'active')->where('created_at', '>=', now()->subDays(7))->count(),
            ];
            
            return Inertia::render('dashboard', [
                'stats' => [
                    'wardrobeItems' => $wardrobeCount,
                    'outfitsCreated' => $outfitsCreated,
                    'itemsTraded' => $itemsTraded,
                    'marketplaceStats' => $marketplaceStats,
                ],
                'debug' => [
                    'user_id' => auth()->id(),
                    'user_name' => auth()->user()->name ?? 'Unknown',
                    'timestamp' => now()->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            // If there's an error, return a simple response for debugging
            return response()->json(['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
        }
    })->name('dashboard');
    
    Route::resource('wardrobe', App\Http\Controllers\WardrobeController::class);
    Route::resource('marketplace', App\Http\Controllers\MarketplaceController::class)->except(['show']);
    Route::get('marketplace/{product}', [App\Http\Controllers\MarketplaceController::class, 'show'])->name('marketplace.show');
    Route::patch('marketplace/{product}/mark-sold', [App\Http\Controllers\MarketplaceController::class, 'markAsSold'])->name('marketplace.mark-sold');
    
    // Shop Profile Routes
    Route::get('shop-profile', [App\Http\Controllers\ShopProfileController::class, 'index'])->name('shop-profile.index');
    Route::get('shop-profile/{product}/edit', [App\Http\Controllers\ShopProfileController::class, 'edit'])->name('shop-profile.edit');
    Route::patch('shop-profile/{product}', [App\Http\Controllers\ShopProfileController::class, 'update'])->name('shop-profile.update');
    Route::delete('shop-profile/{product}', [App\Http\Controllers\ShopProfileController::class, 'destroy'])->name('shop-profile.destroy');
    Route::patch('shop-profile/{product}/toggle-status', [App\Http\Controllers\ShopProfileController::class, 'toggleStatus'])->name('shop-profile.toggle-status');
    
    // Message Routes
    Route::get('messages', [App\Http\Controllers\MessageController::class, 'index'])->name('messages.index');
    Route::get('messages/{conversation}', [App\Http\Controllers\MessageController::class, 'show'])->name('messages.show');
    Route::post('messages/start', [App\Http\Controllers\MessageController::class, 'start'])->name('messages.start');
    Route::post('messages/{conversation}', [App\Http\Controllers\MessageController::class, 'store'])->name('messages.store');
    Route::get('messages/conversation/get', [App\Http\Controllers\MessageController::class, 'getConversation'])->name('messages.get-conversation');
    
    // Transaction Routes
    // Buyer routes
    Route::post('transactions/initiate/{product}', [App\Http\Controllers\TransactionController::class, 'initiate'])->name('transactions.initiate');
    Route::get('transactions/{transaction}/submit-payment', [App\Http\Controllers\TransactionController::class, 'showSubmitPayment'])->name('transactions.show-submit-payment');
    Route::post('transactions/{transaction}/submit-payment', [App\Http\Controllers\TransactionController::class, 'submitPayment'])->name('transactions.submit-payment');
    Route::post('transactions/{transaction}/confirm-delivery', [App\Http\Controllers\TransactionController::class, 'confirmDelivery'])->name('transactions.confirm-delivery');
    Route::get('transactions/buyer', [App\Http\Controllers\TransactionController::class, 'buyerTransactions'])->name('transactions.buyer');
    
    // Seller routes
    Route::post('transactions/{transaction}/mark-shipped', [App\Http\Controllers\TransactionController::class, 'markShipped'])->name('transactions.mark-shipped');
    Route::get('transactions/seller', [App\Http\Controllers\TransactionController::class, 'sellerTransactions'])->name('transactions.seller');
    
    // Shared routes
    Route::get('transactions/{transaction}', [App\Http\Controllers\TransactionController::class, 'show'])->name('transactions.show');
    Route::post('transactions/{transaction}/cancel', [App\Http\Controllers\TransactionController::class, 'cancel'])->name('transactions.cancel');
    
    // Debug route for testing
    Route::get('debug/product/{id}', function($id) {
        $product = \App\Models\Product::with(['user', 'category'])->find($id);
        if (!$product) {
            return response()->json(['error' => 'Product not found']);
        }
        return response()->json([
            'id' => $product->id,
            'title' => $product->title,
            'user' => $product->user ? $product->user->name : 'No user',
            'category' => $product->category ? $product->category->name : 'No category',
            'has_user' => $product->user ? true : false,
            'has_category' => $product->category ? true : false,
        ]);
    });
    
    // Debug route for testing transaction initiation
    Route::get('debug/transaction-test/{product}', function($productId) {
        $product = \App\Models\Product::find($productId);
        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }
        
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }
        
        return response()->json([
            'product' => $product,
            'user' => $user,
            'can_buy' => $product->user_id !== $user->id,
            'product_status' => $product->status,
            'is_active' => $product->status === 'active'
        ]);
    });
    
    // AI Recommender API Routes
    Route::prefix('api')->group(function () {
        Route::post('ai-recommendations', [App\Http\Controllers\AIRecommenderController::class, 'getRecommendations'])->name('api.ai-recommendations');
        Route::post('outfits/save', [App\Http\Controllers\AIRecommenderController::class, 'saveOutfit'])->name('api.outfits.save');
        Route::get('outfits/saved', [App\Http\Controllers\AIRecommenderController::class, 'getSavedOutfits'])->name('api.outfits.saved');
        Route::post('outfits/feedback', [App\Http\Controllers\AIRecommenderController::class, 'submitFeedback'])->name('api.outfits.feedback');
        Route::get('user-preferences', [App\Http\Controllers\AIRecommenderController::class, 'getUserPreferences'])->name('api.user-preferences');
        Route::post('user-preferences', [App\Http\Controllers\AIRecommenderController::class, 'saveUserPreferences'])->name('api.user-preferences.save');
        
        // Test Dashboard API Routes
        Route::post('run-tests', [App\Http\Controllers\TestDashboardController::class, 'runTests'])->name('api.run-tests');
        Route::get('test-results', [App\Http\Controllers\TestDashboardController::class, 'getResults'])->name('api.test-results');
    });
    
    // Test Dashboard UI Route
    Route::get('test-dashboard', [App\Http\Controllers\TestDashboardController::class, 'index'])->name('test-dashboard');
});

// Test route without authentication (for Postman testing)
Route::post('/api/test/ai-recommendations', [App\Http\Controllers\AIRecommenderController::class, 'getRecommendationsTest'])->name('api.test.ai-recommendations');

// Standalone Test Runner (No Auth Required)
Route::get('/test-runner', function () {
    return view('test-runner');
})->name('test-runner');

// Test API endpoint (No Auth Required for Development)
Route::post('/api/run-tests', [App\Http\Controllers\TestDashboardController::class, 'runTests'])->name('api.public.run-tests');

// Admin routes
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', function () {
        // Get admin statistics
        $totalUsers = \App\Models\User::where('is_admin', false)->count();
        $activeUsers = \App\Models\User::where('is_admin', false)
            ->where('email_verified_at', '!=', null)
            ->count();
        $newThisWeek = \App\Models\User::where('is_admin', false)
            ->where('created_at', '>=', now()->subWeek())
            ->count();
        $totalWardrobeItems = \App\Models\WardrobeItem::count();
        $totalProducts = \App\Models\Product::count();
        $activeProducts = \App\Models\Product::where('status', 'active')->count();
        $totalTransactions = \App\Models\Transaction::count();
        $pendingPayments = \App\Models\Transaction::where('status', 'payment_submitted')->count();
        $completedTransactions = \App\Models\Transaction::where('status', 'completed')->count();
        $totalCommissions = \App\Models\CommissionRecord::sum('amount');
        $thisMonthCommissions = \App\Models\CommissionRecord::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount');

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'activeUsers' => $activeUsers,
                'newThisWeek' => $newThisWeek,
                'totalWardrobeItems' => $totalWardrobeItems,
                'totalProducts' => $totalProducts,
                'activeProducts' => $activeProducts,
                'totalTransactions' => $totalTransactions,
                'pendingPayments' => $pendingPayments,
                'completedTransactions' => $completedTransactions,
                'totalCommissions' => $totalCommissions,
                'thisMonthCommissions' => $thisMonthCommissions,
            ]
        ]);
    })->name('dashboard');
    
    Route::resource('users', App\Http\Controllers\Admin\UserController::class);
    Route::post('users/{user}/reset-password', [App\Http\Controllers\Admin\UserController::class, 'resetPassword'])->name('users.reset-password');
    
    // Transaction admin routes
    Route::post('transactions/{transaction}/verify-payment', [App\Http\Controllers\TransactionController::class, 'verifyPayment'])->name('transactions.verify-payment');
    Route::post('transactions/{transaction}/admin-complete', [App\Http\Controllers\TransactionController::class, 'adminComplete'])->name('transactions.admin-complete');
    Route::patch('transactions/{transaction}/update-payout-info', [App\Http\Controllers\TransactionController::class, 'updateSellerPayoutInfo'])->name('admin.transactions.update-payout-info');
    
    // Commission routes
    Route::get('commissions', [App\Http\Controllers\Admin\CommissionController::class, 'index'])->name('commissions.index');
    Route::get('commissions/report', [App\Http\Controllers\Admin\CommissionController::class, 'report'])->name('commissions.report');
    Route::get('commissions/export', [App\Http\Controllers\Admin\CommissionController::class, 'export'])->name('commissions.export');
    
    // Transaction management routes
    Route::get('transactions/pending-payments', [App\Http\Controllers\TransactionController::class, 'adminPendingPayments'])->name('transactions.pending-payments');
    Route::post('transactions/{transaction}/upload-payout-proof', [App\Http\Controllers\TransactionController::class, 'uploadPayoutProof'])->name('admin.transactions.upload-payout-proof');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
