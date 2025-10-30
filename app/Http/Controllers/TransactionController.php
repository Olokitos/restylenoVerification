<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Product;
use App\Models\CommissionRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

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
        // Check if user is involved in this transaction
        if ($transaction->buyer_id !== auth()->id() && $transaction->seller_id !== auth()->id()) {
            abort(403);
        }

        $transaction->load(['product.user', 'buyer', 'seller', 'commissionRecord']);

        return Inertia::render('transactions/show', [
            'transaction' => $transaction,
            'canAct' => [
                'canSubmitPayment' => $transaction->status === 'pending_payment' && $transaction->buyer_id === auth()->id(),
                'canVerifyPayment' => $transaction->status === 'payment_submitted' && auth()->user()->is_admin,
                'canShip' => $transaction->canShip() && $transaction->seller_id === auth()->id(),
                'canConfirmDelivery' => $transaction->status === 'shipped' && $transaction->buyer_id === auth()->id(),
                'canComplete' => $transaction->canComplete() && auth()->user()->is_admin,
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
            ->whereIn('status', ['payment_submitted', 'payment_verified', 'shipped'])
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

        \Log::info('Platform payment verified and collected', [
            'transaction_id' => $transaction->id,
            'amount_collected' => $transaction->sale_price,
            'commission' => $transaction->commission_amount,
            'seller_earnings' => $transaction->seller_earnings
        ]);

        return redirect()->back()->with('success', 'Payment verified and collected by platform successfully!');
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

        $transaction->update([
            'status' => 'shipped',
            'shipped_at' => now(),
        ]);

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

        $transaction->update([
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);

        // Auto-complete transaction
        $this->complete($transaction);

        return redirect()->back()->with('success', 'Delivery confirmed! Transaction completed successfully.');
    }

    /**
     * Complete transaction, record commission, and process seller payout
     */
    public function complete(Transaction $transaction)
    {
        if (!auth()->user()->is_admin && !$transaction->canComplete()) {
            abort(403);
        }

        // Verify platform has collected payment
        if (!$transaction->payment_collected_by_platform) {
            return redirect()->back()->withErrors(['error' => 'Payment must be collected by platform before completing transaction.']);
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
        $transactions = Transaction::with(['product', 'seller'])
            ->where('buyer_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

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
}