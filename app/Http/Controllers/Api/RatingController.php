<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RatingResource;
use App\Models\Rating;
use App\Models\Transaction;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RatingController extends Controller
{
    /**
     * Store a new rating for a completed transaction.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'transaction_id' => ['required', 'integer', 'exists:transactions,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:255'],
        ]);

        $transaction = Transaction::with(['seller', 'buyer', 'rating'])
            ->where('id', $validated['transaction_id'])
            ->where('buyer_id', $request->user()->id)
            ->firstOrFail();

        if ($transaction->status !== 'completed') {
            throw ValidationException::withMessages([
                'transaction_id' => 'Only completed transactions can be rated.',
            ]);
        }

        if ($transaction->rating) {
            throw ValidationException::withMessages([
                'transaction_id' => 'You have already rated this transaction.',
            ]);
        }

        $rating = Rating::create([
            'transaction_id' => $transaction->id,
            'buyer_id' => $transaction->buyer_id,
            'seller_id' => $transaction->seller_id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        // Notify seller about the new rating
        NotificationService::rating(
            $transaction->seller,
            'New Rating Received',
            "You received a {$validated['rating']}-star rating from {$transaction->buyer->name} for '{$transaction->product->title}'.",
            $rating,
            "/marketplace/{$transaction->product_id}"
        );

        $sellerStats = $this->buildSellerStats($transaction->seller);

        return response()->json([
            'message' => 'Thank you! Your review has been recorded.',
            'rating' => new RatingResource($rating->load('buyer')),
            'seller' => $sellerStats,
        ], 201);
    }

    /**
     * Get ratings for a specific seller along with summary metrics.
     */
    public function sellerRatings(Request $request, User $seller): JsonResponse
    {
        $ratingsQuery = Rating::with(['buyer'])
            ->forSeller($seller->id)
            ->latest();

        $ratings = $ratingsQuery->get();

        $summary = $this->buildSellerStats($seller, $ratings);

        $canRate = false;
        $eligibleTransactions = [];

        if ($request->user()) {
            $eligibleTransactions = Transaction::with('product')
                ->where('buyer_id', $request->user()->id)
                ->where('seller_id', $seller->id)
                ->where('status', 'completed')
                ->whereDoesntHave('rating')
                ->latest()
                ->get()
                ->map(fn ($transaction) => [
                    'id' => $transaction->id,
                    'label' => sprintf(
                        '#%d · %s · %s',
                        $transaction->id,
                        $transaction->product->title ?? 'Order',
                        optional($transaction->completed_at)->diffForHumans()
                    ),
                    'product_title' => $transaction->product->title ?? 'Order',
                ])
                ->values();

            $canRate = $eligibleTransactions->isNotEmpty();
        }

        return response()->json([
            'seller' => $summary,
            'ratings' => RatingResource::collection($ratings),
            'can_rate' => $canRate,
            'eligible_transactions' => $eligibleTransactions,
        ]);
    }

    /**
     * Build seller rating summary data.
     */
    protected function buildSellerStats(User $seller, $ratings = null): array
    {
        $ratings = $ratings ?? Rating::forSeller($seller->id)->get();

        $average = $ratings->avg('rating') ?: 0;
        $count = $ratings->count();

        return [
            'seller_id' => $seller->id,
            'seller_name' => $seller->name,
            'average_rating' => round($average, 1),
            'review_count' => $count,
        ];
    }
}

