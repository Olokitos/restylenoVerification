import React, { useEffect, useMemo, useState } from 'react';
import { Star, MessageSquare, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

/**
 * Render a single star icon with "filled" styling when active.
 */
const RatingStar = ({ filled, size = 'md' }) => {
  const sizeClass = size === 'lg' ? 'h-6 w-6' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <Star
      className={cn(
        sizeClass,
        filled ? 'text-yellow-400 fill-yellow-400 drop-shadow-md' : 'text-gray-300 dark:text-gray-600'
      )}
    />
  );
};

/**
 * Professional seller ratings widget.
 * - Displays average rating + review list
 * - Provides submission form for eligible buyers
 */
export default function SellerRatingSection({
  sellerId,
  sellerName,
  initialAverage = 0,
  initialCount = 0,
  initialCanRate = false,
  initialEligibleTransactions = [],
}) {
  const [summary, setSummary] = useState({
    average: initialAverage,
    count: initialCount,
  });
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [canRate, setCanRate] = useState(initialCanRate);
  const [eligibleTransactions, setEligibleTransactions] = useState(initialEligibleTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState(
    initialEligibleTransactions.length === 1 ? String(initialEligibleTransactions[0].id) : ''
  );
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState('');

  const csrfToken = useMemo(() => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
  }, []);

  /**
   * Fetch latest ratings for the seller.
   */
  const fetchRatings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/ratings/seller/${sellerId}`);
      if (!response.ok) {
        throw new Error('Unable to load ratings for this seller.');
      }

      const data = await response.json();
      setRatings(data.ratings ?? []);
      setSummary({
        average: data.seller?.average_rating ?? 0,
        count: data.seller?.review_count ?? 0,
      });
      setCanRate(data.can_rate ?? false);
      setEligibleTransactions(data.eligible_transactions ?? []);

      if ((data.eligible_transactions ?? []).length === 1) {
        setSelectedTransaction(String(data.eligible_transactions[0].id));
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong while fetching ratings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);

  /**
   * Convert numeric rating into an array for star rendering.
   */
  const renderStars = (value, size = 'md') => {
    return Array.from({ length: 5 }).map((_, index) => (
      <RatingStar key={index} filled={index < value} size={size} />
    ));
  };

  /**
   * Submit rating request to backend API.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedTransaction) {
      setError('Select which purchase you are reviewing.');
      return;
    }

    if (selectedRating < 1 || selectedRating > 5) {
      setError('Choose a star rating before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          transaction_id: Number(selectedTransaction),
          rating: selectedRating,
          comment: comment.trim() || null,
        }),
      });

      if (response.status === 422) {
        const data = await response.json();
        const messages = Object.values(data.errors ?? {}).flat();
        throw new Error(messages[0] ?? 'Validation failed. Please review your input.');
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message ?? 'Unable to submit rating at this time.');
      }

      const data = await response.json();
      setSuccess(data.message ?? 'Review submitted successfully.');
      setComment('');
      setSelectedRating(0);
      setCanRate(false);
      setEligibleTransactions([]);
      setSelectedTransaction('');
      fetchRatings();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong while sending your review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-gray-200/70 dark:border-gray-700/70 shadow-lg shadow-emerald-500/5">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-gray-900 dark:text-white">
            <MessageSquare className="h-6 w-6 text-emerald-500" />
            Ratings &amp; Reviews
          </CardTitle>
          <CardDescription className="max-w-xl text-sm text-gray-600 dark:text-gray-300">
            Hear from verified buyers about their experience with {sellerName}.
          </CardDescription>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-emerald-500/90 to-green-600/80 px-6 py-3 text-white shadow-lg">
          <div className="flex flex-col">
            <span className="text-3xl font-bold">{summary.average?.toFixed(1)}★</span>
            <span className="text-xs uppercase tracking-[0.2em]">Average Rating</span>
          </div>
          <div className="hidden h-10 w-px bg-white/40 sm:block" />
          <div className="flex flex-col text-sm leading-tight">
            <span className="font-semibold">{summary.count}</span>
            <span className="text-xs opacity-80">Total Reviews</span>
            <div className="mt-1 flex">{renderStars(Math.round(summary.average || 0), 'sm')}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-200">
            {success}
          </div>
        )}

        {/* Submission Form */}
        <div className="rounded-2xl border border-gray-200/60 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-900/60">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Share your experience</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your review helps other shoppers and keeps the ReStyle community safe and transparent.
          </p>

          {canRate ? (
            <form onSubmit={handleSubmit} className="mt-4 space-y-6">
              {eligibleTransactions.length > 1 && (
                <div className="space-y-2">
                  <Label htmlFor="transaction">Select Order</Label>
                  <Select value={selectedTransaction} onValueChange={setSelectedTransaction}>
                    <SelectTrigger id="transaction" className="bg-white/60 dark:bg-gray-900/60">
                      <SelectValue placeholder="Choose the transaction to review" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900">
                      {eligibleTransactions.map((order) => (
                        <SelectItem key={order.id} value={String(order.id)}>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              Order {order.label}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {eligibleTransactions.length === 1 && (
                <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                  Reviewing order {eligibleTransactions[0].label} • {eligibleTransactions[0].product_title}
                </div>
              )}

              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = index + 1;
                    const active = value <= selectedRating;
                    return (
                      <button
                        type="button"
                        key={value}
                        onClick={() => setSelectedRating(value)}
                        className={cn(
                          'rounded-full p-2 transition',
                          active
                            ? 'text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-300 dark:text-gray-600 dark:hover:text-yellow-300'
                        )}
                        aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                      >
                        <RatingStar filled={active} size="lg" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Comment (optional)</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  maxLength={255}
                  placeholder="What went well with this purchase? Mention product quality, communication, or shipping speed."
                  className="min-h-[120px] resize-none bg-white/60 dark:bg-gray-900/60"
                />
                <div className="text-right text-xs text-gray-400">
                  {comment.length}/255 characters
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-5 py-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
              {eligibleTransactions.length === 0
                ? "Complete an order with this seller to leave a review. Once your purchase is marked as completed, you'll be able to share feedback here."
                : "You've already shared your thoughts on this order. Thank you!"}
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Reviews
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="h-24 rounded-xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 animate-pulse"
                />
              ))}
            </div>
          ) : ratings.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              <Star className="mx-auto mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
              Be the first to share your experience with {sellerName}.
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl border border-gray-200/70 bg-white/95 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-700/70 dark:bg-gray-900/70"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {review.buyer?.name ?? 'Anonymous Buyer'}
                        </span>
                        <div className="flex">{renderStars(review.rating)}</div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        {review.comment || 'No comment provided.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{review.created_human}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

