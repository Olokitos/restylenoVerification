<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Product;
use App\Models\CommissionRecord;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class TransactionController extends Controller
{
    /**
     * Initiate a transaction for a product
     */
    public function initiate(Request $request, Product $product)
    {
        // Debug logging
        \Log::info('Transaction initiation attempt', [
            'product_id' => $product->id,
            'user_id' => auth()->id(),
            'product_status' => $product->status,
            'product_user_id' => $product->user_id
        ]);

        // Check if user can buy this product
        if ($product->user_id === auth()->id()) {
            \Log::warning('User trying to buy own product', ['product_id' => $product->id, 'user_id' => auth()->id()]);
            return redirect()->back()->withErrors(['error' => 'You cannot buy your own product.']);
        }

        // Check if product is still available
        if ($product->status !== 'active') {
            \Log::warning('Product not active', ['product_id' => $product->id, 'status' => $product->status]);
            return redirect()->back()->withErrors(['error' => 'This product is no longer available.']);
        }

        // Check if there's already a pending transaction for this product
        $existingTransaction = Transaction::where('product_id', $product->id)
            ->where('buyer_id', auth()->id())
            ->whereIn('status', ['pending_payment', 'payment_submitted', 'payment_verified', 'shipped'])
            ->first();

        if ($existingTransaction) {
            return redirect()->route('transactions.show', $existingTransaction)
                ->with('info', 'You already have a pending transaction for this product.');
        }

        // Calculate commission and earnings
        $salePrice = $product->price;
        $commissionAmount = $salePrice * 0.02; // 2% commission
        $sellerEarnings = $salePrice * 0.98; // 98% to seller

        // Create transaction
        try {
            $transaction = Transaction::create([
                'product_id' => $product->id,
                'buyer_id' => auth()->id(),
                'seller_id' => $product->user_id,
                'amount' => $salePrice, // Keep for backward compatibility
                'sale_price' => $salePrice,
                'commission_amount' => $commissionAmount,
                'seller_earnings' => $sellerEarnings,
                'status' => 'pending_payment',
                'payment_method' => $request->payment_method,
            ]);

            \Log::info('Transaction created successfully', [
                'transaction_id' => $transaction->id,
                'product_id' => $product->id,
                'buyer_id' => auth()->id(),
                'sale_price' => $salePrice,
                'commission_amount' => $commissionAmount
            ]);

            return redirect()->route('transactions.show', $transaction)
                ->with('success', 'Transaction initiated successfully! Please submit your payment.');
        } catch (\Exception $e) {
            \Log::error('Transaction creation failed', [
                'error' => $e->getMessage(),
                'product_id' => $product->id,
                'buyer_id' => auth()->id()
            ]);
            
            return redirect()->back()->withErrors(['error' => 'Failed to create transaction. Please try again.']);
        }
    }

    /**
     * Show submit payment form
     */
    public function showSubmitPayment(Transaction $transaction)
    {
        // Check if user can submit payment
        if ($transaction->buyer_id !== auth()->id() || $transaction->status !== 'pending_payment') {
            abort(403);
        }

        $transaction->load(['product.user', 'seller']);

        return Inertia::render('transactions/submit-payment', [
            'transaction' => $transaction,
        ]);
    }

    /**
     * Show transaction details
     */
    public function show(Transaction $transaction)
    {
        // Allow buyer, seller, or admin to view transaction
        if (!auth()->user()?->is_admin && $transaction->buyer_id !== auth()->id() && $transaction->seller_id !== auth()->id()) {
            abort(403);
        }

        $transaction->load(['product.user', 'buyer', 'seller', 'commissionRecord']);

        return Inertia::render('transactions/show', [
            'transaction' => $transaction,
            'canAct' => [
                'canSubmitPayment' => $transaction->status === 'pending_payment' && $transaction->buyer_id === auth()->id(),
                'canVerifyPayment' => $transaction->status === 'payment_submitted' && auth()->user()?->is_admin,
                'canShip' => $transaction->canShip() && $transaction->seller_id === auth()->id(),
                'canConfirmDelivery' => $transaction->status === 'shipped' && $transaction->buyer_id === auth()->id(),
                'canComplete' => $transaction->canComplete() && auth()->user()?->is_admin,
                'canCancel' => in_array($transaction->status, ['pending_payment', 'payment_submitted']) && 
                              ($transaction->buyer_id === auth()->id() || $transaction->seller_id === auth()->id()),
            ]
        ]);
    }

    /**
     * Submit payment proof and reference (Platform Payment)
     */
    public function submitPayment(Request $request, Transaction $transaction)
    {
        // Check if user can submit payment
        if ($transaction->buyer_id !== auth()->id() || $transaction->status !== 'pending_payment') {
            abort(403);
        }

        $request->validate([
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'platform_payment_reference' => 'required|string|max:255',
        ]);

        // Handle payment proof upload
        $imageName = time() . '_' . $request->file('payment_proof')->getClientOriginalName();
        $imagePath = $request->file('payment_proof')->storeAs('payment-proofs', $imageName, 'public');

        // Update transaction with platform payment details
        $transaction->update([
            'payment_proof_path' => $imagePath,
            'platform_payment_reference' => $request->platform_payment_reference,
            'status' => 'payment_submitted',
        ]);

        \Log::info('Platform payment proof submitted', [
            'transaction_id' => $transaction->id,
            'payment_reference' => $request->platform_payment_reference,
            'amount' => $transaction->sale_price
        ]);

        return redirect()->route('transactions.show', $transaction)
            ->with('success', 'Payment proof submitted successfully! Please wait for admin verification.');
    }

    /**
     * Admin view of pending payments for verification
     */
    public function adminPendingPayments()
    {
        if (!auth()->user()->is_admin) {
            abort(403);
        }

        $pendingTransactions = Transaction::with(['product', 'buyer', 'seller'])
            ->whereIn('status', ['payment_submitted', 'payment_verified', 'shipped', 'delivered'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('admin/transactions/pending-payments', [
            'transactions' => $pendingTransactions,
        ]);
    }

    /**
     * Admin verifies payment and marks as collected by platform
     */
    public function verifyPayment(Transaction $transaction)
    {
        if (!auth()->user()->is_admin || $transaction->status !== 'payment_submitted') {
            abort(403);
        }

        $transaction->update([
            'status' => 'payment_verified',
            'payment_collected_by_platform' => true,
            'platform_payment_collected_at' => now(),
        ]);

        // Notify seller that payment is verified and they can ship
        NotificationService::transaction(
            $transaction->seller,
            'Payment Verified',
            "Payment for your product '{$transaction->product->title}' has been verified. You can now ship the item.",
            $transaction
        );

        \Log::info('Platform payment verified and collected', [
            'transaction_id' => $transaction->id,
            'amount_collected' => $transaction->sale_price,
            'commission' => $transaction->commission_amount,
            'seller_earnings' => $transaction->seller_earnings
        ]);

        return redirect()->back()->with('success', 'Payment verified and collected by platform successfully!');
    }

    /**
     * Admin marks that the platform has collected payment (after verification)
     */
    public function collectPayment(Transaction $transaction)
    {
        if (!auth()->user()?->is_admin) {
            abort(403);
        }

        // Allow marking payment collected for verified, shipped, delivered, or completed transactions
        if (!in_array($transaction->status, ['payment_verified', 'shipped', 'delivered', 'completed'], true)) {
            return redirect()->back()->withErrors(['error' => 'Payment can only be marked collected after verification.']);
        }

        if ($transaction->payment_collected_by_platform) {
            return redirect()->back()->with('success', 'Payment already marked as collected.');
        }

        $transaction->update([
            'payment_collected_by_platform' => true,
            'platform_payment_collected_at' => now(),
        ]);

        \Log::info('Platform payment marked collected manually', [
            'transaction_id' => $transaction->id,
            'admin_id' => auth()->id(),
            'amount' => $transaction->sale_price,
        ]);

        return redirect()->back()->with('success', 'Payment marked as collected.');
    }

    /**
     * Admin manually completes transaction (for testing or dispute resolution)
     */
    public function adminComplete(Transaction $transaction)
    {
        if (!auth()->user()->is_admin) {
            abort(403);
        }

        // Verify platform has collected payment
        if (!$transaction->payment_collected_by_platform) {
            return redirect()->back()->withErrors(['error' => 'Payment must be collected by platform before completing transaction.']);
        }

        // Complete the transaction
        $this->complete($transaction);

        \Log::info('Transaction manually completed by admin', [
            'transaction_id' => $transaction->id,
            'admin_id' => auth()->id(),
            'commission_collected' => $transaction->commission_amount
        ]);

        return redirect()->back()->with('success', 'Transaction completed by admin! Commission recorded.');
    }

    /**
     * Seller marks product as shipped
     */
    public function markShipped(Transaction $transaction)
    {
        if ($transaction->seller_id !== auth()->id() || !$transaction->canShip()) {
            abort(403);
        }

        // ENFORCE: Payment must be verified before shipping
        if ($transaction->status !== 'payment_verified') {
            return redirect()->back()->withErrors([
                'error' => 'Payment must be verified by admin before you can ship the product.'
            ]);
        }

        if (!$transaction->payment_collected_by_platform) {
            return redirect()->back()->withErrors([
                'error' => 'Payment must be collected by platform before shipping.'
            ]);
        }

        // Require shipping proof image
        request()->validate([
            'shipping_proof' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
        ]);

        $imageName = time() . '_' . request()->file('shipping_proof')->getClientOriginalName();
        $imagePath = request()->file('shipping_proof')->storeAs('shipping-proofs', $imageName, 'public');

        $transaction->update([
            'status' => 'shipped',
            'shipped_at' => now(),
            'shipping_proof_path' => $imagePath,
        ]);

        // Notify buyer that product has been shipped
        NotificationService::transaction(
            $transaction->buyer,
            'Product Shipped',
            "Your order '{$transaction->product->title}' has been shipped!",
            $transaction
        );

        return redirect()->back()->with('success', 'Product marked as shipped successfully!');
    }

    /**
     * Buyer confirms delivery
     */
    public function confirmDelivery(Transaction $transaction)
    {
        if ($transaction->buyer_id !== auth()->id() || $transaction->status !== 'shipped') {
            abort(403);
        }

        // Optional delivery proof upload
        if (request()->hasFile('delivery_proof')) {
            request()->validate([
                'delivery_proof' => 'image|mimes:jpeg,png,jpg,gif,webp|max:4096',
            ]);

            $imageName = time() . '_' . request()->file('delivery_proof')->getClientOriginalName();
            $imagePath = request()->file('delivery_proof')->storeAs('delivery-proofs', $imageName, 'public');
            $transaction->delivery_proof_path = $imagePath;
        }

        $transaction->update([
            'status' => 'delivered',
            'delivered_at' => now(),
            'delivery_proof_path' => $transaction->delivery_proof_path ?? $transaction->delivery_proof_path,
        ]);

        // Notify admin that product is delivered and ready for payout
        $admin = \App\Models\User::where('is_admin', true)->first();
        if ($admin) {
            NotificationService::transaction(
                $admin,
                'Product Delivered Successfully',
                "Product '{$transaction->product->title}' has been delivered successfully. Ready for seller payout.",
                $transaction
            );
        }

        return redirect()->back()->with('success', 'Delivery confirmed! Admin will process the seller payout.');
    }

    /**
     * Complete transaction, record commission, and process seller payout
     */
    public function complete(Transaction $transaction)
    {
        if (!auth()->user()->is_admin && !$transaction->canComplete()) {
            abort(403);
        }

        // ENFORCE: Payment must be verified and collected
        if (!$transaction->payment_collected_by_platform) {
            return redirect()->back()->withErrors([
                'error' => 'Payment must be collected by platform before completing transaction.'
            ]);
        }

        // ENFORCE: Status must be delivered
        if ($transaction->status !== 'delivered') {
            return redirect()->back()->withErrors([
                'error' => 'Transaction must be delivered before completion.'
            ]);
        }

        // Update transaction
        $transaction->update([
            'status' => 'completed',
            'completed_at' => now(),
            'released_at' => now(),
            'seller_paid' => true,
            'seller_paid_at' => now(),
            'seller_payout_amount' => $transaction->seller_earnings,
            'seller_payout_reference' => 'PAYOUT-' . $transaction->id . '-' . time(),
        ]);

        // Create commission record
        CommissionRecord::create([
            'transaction_id' => $transaction->id,
            'seller_id' => $transaction->seller_id,
            'product_id' => $transaction->product_id,
            'user_id' => $transaction->seller_id, // Keep for backward compatibility
            'amount' => $transaction->commission_amount,
            'rate' => 2.00, // 2% commission rate
            'status' => 'paid', // Commission is automatically collected by platform
            'collected_at' => now(),
            'paid_at' => now(), // Platform keeps commission immediately
        ]);

        // Mark product as sold
        $transaction->product->update(['status' => 'sold']);

        // Notify seller that transaction is completed and payment released
        NotificationService::transaction(
            $transaction->seller,
            'Transaction Completed',
            "Your sale of '{$transaction->product->title}' is complete! Payment of ₱{$transaction->seller_earnings} has been released.",
            $transaction
        );

        // Notify buyer that transaction is completed
        NotificationService::transaction(
            $transaction->buyer,
            'Transaction Completed',
            "Your purchase of '{$transaction->product->title}' is complete! You can now rate the seller.",
            $transaction
        );

        \Log::info('Transaction completed with seller payout', [
            'transaction_id' => $transaction->id,
            'total_amount' => $transaction->sale_price,
            'commission_collected' => $transaction->commission_amount,
            'seller_payout' => $transaction->seller_earnings,
            'payout_reference' => $transaction->seller_payout_reference
        ]);

        return redirect()->back()->with('success', 'Transaction completed! Commission collected and seller payout processed.');
    }

    /**
     * Cancel transaction
     */
    public function cancel(Request $request, Transaction $transaction)
    {
        // Check if user can cancel
        $canCancel = in_array($transaction->status, ['pending_payment', 'payment_submitted']) && 
                     ($transaction->buyer_id === auth()->id() || $transaction->seller_id === auth()->id());

        if (!$canCancel) {
            abort(403);
        }

        $transaction->update([
            'status' => 'cancelled',
            'notes' => $request->reason ?? 'Transaction cancelled',
        ]);

        return redirect()->route('transactions.buyer')
            ->with('success', 'Transaction cancelled successfully.');
    }

    /**
     * Show buyer's transactions
     */
    public function buyerTransactions()
    {
        $transactions = Transaction::with(['product', 'seller', 'rating'])
            ->where('buyer_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        // Add rating status to each transaction
        $transactions->getCollection()->transform(function ($transaction) {
            $transaction->has_rating = $transaction->rating !== null;
            $transaction->can_rate = $transaction->status === 'completed' && $transaction->rating === null;
            return $transaction;
        });

        return Inertia::render('transactions/buyer', [
            'transactions' => $transactions,
        ]);
    }

    /**
     * Show seller's transactions with earnings breakdown
     */
    public function sellerTransactions()
    {
        $transactions = Transaction::with(['product', 'buyer'])
            ->where('seller_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        // Calculate total earnings
        $totalEarnings = Transaction::where('seller_id', auth()->id())
            ->where('status', 'completed')
            ->sum('seller_earnings');

        $totalCommissions = Transaction::where('seller_id', auth()->id())
            ->where('status', 'completed')
            ->sum('commission_amount');

        return Inertia::render('transactions/seller', [
            'transactions' => $transactions,
            'stats' => [
                'total_earnings' => $totalEarnings,
                'total_commissions' => $totalCommissions,
                'total_sales' => Transaction::where('seller_id', auth()->id())->where('status', 'completed')->count(),
            ]
        ]);
    }

    /**
     * Admin uploads payout proof image for seller payout
     */
    public function uploadPayoutProof(Request $request, Transaction $transaction)
    {
        if (!auth()->user()?->is_admin) abort(403);

        $request->validate([
            'payout_proof' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
        ]);

        $imageName = time() . '_' . $request->file('payout_proof')->getClientOriginalName();
        $imagePath = $request->file('payout_proof')->storeAs('payout-proofs', $imageName, 'public');

        $transaction->update(['payout_proof_path' => $imagePath]);

        return back()->with('success', 'Payout proof uploaded successfully.');
    }

    /**
     * Seller updates payout (GCash/Bank) info
     */
    public function updateSellerPayoutInfo(Request $request, Transaction $transaction)
    {
        if ($transaction->seller_id !== auth()->id()) abort(403);

        $validated = $request->validate([
            'gcash_number' => 'nullable|string|max:32',
            'bank_name' => 'nullable|string|max:64',
            'bank_account' => 'nullable|string|max:64',
            'other_details' => 'nullable|string|max:255',
        ]);

        $transaction->update([
            'seller_payout_details' => array_filter($validated),
        ]);

        return back()->with('success', 'Payout info updated!');
    }

    /**
     * Show seller profile with ratings
     */
    public function showSellerProfile(User $seller)
    {
        // Get seller ratings
        $ratings = \App\Models\Rating::with(['buyer', 'transaction.product'])
            ->where('seller_id', $seller->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($rating) {
                return [
                    'id' => $rating->id,
                    'rating' => $rating->rating,
                    'comment' => $rating->comment,
                    'created_at' => $rating->created_at->toISOString(),
                    'buyer' => [
                        'id' => $rating->buyer->id,
                        'name' => $rating->buyer->name,
                    ],
                    'transaction' => $rating->transaction ? [
                        'id' => $rating->transaction->id,
                        'product' => [
                            'title' => $rating->transaction->product->title,
                        ],
                    ] : null,
                ];
            });

        $averageRating = $ratings->avg('rating') ?? 0;
        $reviewCount = $ratings->count();

        // Get eligible transactions for rating (completed transactions without rating)
        $eligibleTransactions = [];
        $canRate = false;

        if (auth()->check()) {
            $eligibleTransactions = Transaction::with('product')
                ->where('buyer_id', auth()->id())
                ->where('seller_id', $seller->id)
                ->where('status', 'completed')
                ->whereDoesntHave('rating')
                ->orderBy('completed_at', 'desc')
                ->get()
                ->map(function ($transaction) {
                    return [
                        'id' => $transaction->id,
                        'label' => sprintf(
                            '#%d · %s · %s',
                            $transaction->id,
                            $transaction->product->title ?? 'Order',
                            $transaction->completed_at ? $transaction->completed_at->diffForHumans() : ''
                        ),
                    ];
                });

            $canRate = $eligibleTransactions->isNotEmpty();
        }

        return Inertia::render('sellers/profile', [
            'seller' => [
                'id' => $seller->id,
                'name' => $seller->name,
                'email' => $seller->email,
            ],
            'ratings' => $ratings,
            'average_rating' => round($averageRating, 1),
            'review_count' => $reviewCount,
            'eligible_transactions' => $eligibleTransactions,
            'can_rate' => $canRate,
        ]);
    }

    /**
     * Export buyer's purchase history as PDF
     */
    public function exportPurchaseHistory(Request $request)
    {
        $query = Transaction::with(['product', 'seller'])
            ->where('buyer_id', auth()->id());
        
        // Date range filter
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        
        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        $transactions = $query->orderBy('created_at', 'desc')->get();
        
        // Calculate summary statistics
        $summary = [
            'total_transactions' => $transactions->count(),
            'total_spent' => $transactions->sum('sale_price'),
            'completed_transactions' => $transactions->where('status', 'completed')->count(),
            'pending_transactions' => $transactions->whereIn('status', ['pending_payment', 'payment_submitted', 'payment_verified', 'shipped', 'delivered'])->count(),
            'average_order_value' => $transactions->count() > 0 ? $transactions->avg('sale_price') : 0,
        ];
        
        $filters = [
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'status' => $request->status,
        ];
        
        $user = auth()->user();
        
        // Convert logo to base64 for PDF embedding
        $logoPath = public_path('logo.svg');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $logoContent = file_get_contents($logoPath);
            $logoBase64 = 'data:image/svg+xml;base64,' . base64_encode($logoContent);
        }
        
        $generatedAt = Carbon::now(config('app.timezone'));
        $pdf = Pdf::loadView('transactions.purchase-history-pdf', [
            'generatedAt' => $generatedAt,
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $filters,
            'user' => $user,
            'logoBase64' => $logoBase64,
        ])->setPaper('a4', 'landscape')->setOptions([
            'defaultFont' => 'DejaVu Sans',
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
        ]);
        
        $filename = 'purchase_history_' . $generatedAt->format('Y-m-d_H-i-s') . '.pdf';
        
        return $pdf->download($filename);
    }

    /**
     * Export seller's sales history as PDF
     */
    public function exportSalesHistory(Request $request)
    {
        $query = Transaction::with(['product', 'buyer'])
            ->where('seller_id', auth()->id());
        
        // Date range filter
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        
        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        $transactions = $query->orderBy('created_at', 'desc')->get();
        
        // Calculate summary statistics
        $summary = [
            'total_transactions' => $transactions->count(),
            'total_sales' => $transactions->sum('sale_price'),
            'total_earnings' => $transactions->sum('seller_earnings'),
            'total_commissions' => $transactions->sum('commission_amount'),
            'completed_transactions' => $transactions->where('status', 'completed')->count(),
            'pending_transactions' => $transactions->whereIn('status', ['pending_payment', 'payment_submitted', 'payment_verified', 'shipped', 'delivered'])->count(),
            'average_sale_value' => $transactions->count() > 0 ? $transactions->avg('sale_price') : 0,
        ];
        
        $filters = [
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'status' => $request->status,
        ];
        
        $user = auth()->user();
        
        // Convert logo to base64 for PDF embedding
        $logoPath = public_path('logo.svg');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $logoContent = file_get_contents($logoPath);
            $logoBase64 = 'data:image/svg+xml;base64,' . base64_encode($logoContent);
        }
        
        $generatedAt = Carbon::now(config('app.timezone'));
        $pdf = Pdf::loadView('transactions.sales-history-pdf', [
            'generatedAt' => $generatedAt,
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $filters,
            'user' => $user,
            'logoBase64' => $logoBase64,
        ])->setPaper('a4', 'landscape')->setOptions([
            'defaultFont' => 'DejaVu Sans',
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
        ]);
        
        $filename = 'sales_history_' . $generatedAt->format('Y-m-d_H-i-s') . '.pdf';
        
        return $pdf->download($filename);
    }
}