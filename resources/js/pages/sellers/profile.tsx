import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Star, 
  User, 
  ArrowLeft,
  MessageCircle,
  Package,
  CheckCircle,
  Clock
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Rating {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  buyer: {
    id: number;
    name: string;
  };
  transaction?: {
    id: number;
    product: {
      title: string;
    };
  };
}

interface EligibleTransaction {
  id: number;
  label: string;
}

interface SellerProfileProps {
  seller: {
    id: number;
    name: string;
    email: string;
  };
  ratings: Rating[];
  average_rating: number;
  review_count: number;
  eligible_transactions: EligibleTransaction[];
  can_rate: boolean;
}

export default function SellerProfile({ 
  seller, 
  ratings, 
  average_rating, 
  review_count,
  eligible_transactions,
  can_rate 
}: SellerProfileProps) {
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);

  const { data, setData, errors, reset } = useForm({
    transaction_id: 0,
    rating: 0,
    comment: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransactionId || !data.rating || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          transaction_id: selectedTransactionId,
          rating: data.rating,
          comment: data.comment || null,
        }),
      });

      if (response.ok) {
        reset();
        setIsRatingDialogOpen(false);
        setSelectedTransactionId(null);
        router.reload();
      } else {
        const errorData = await response.json();
        console.error('Rating submission error:', errorData);
        alert(errorData.message || 'Failed to submit rating. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('An error occurred while submitting your rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <AppLayout>
      <Head title={`${seller.name} - Seller Profile`} />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-green-800/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link href="/transactions/buyer">
              <Button variant="outline" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to My Purchases
              </Button>
            </Link>
            
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold">
                  {seller.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {seller.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Seller Profile
                  </p>
                </div>
              </div>
              
              {can_rate && (
                <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => setIsRatingDialogOpen(true)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Rate Seller
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rate {seller.name}</DialogTitle>
                      <DialogDescription>
                        Share your experience with this seller
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRatingSubmit} className="space-y-4">
                      <div>
                        <Label>Select Transaction</Label>
                        <select
                          value={selectedTransactionId || ''}
                          onChange={(e) => {
                            const transactionId = parseInt(e.target.value);
                            setSelectedTransactionId(transactionId);
                            setData('transaction_id', transactionId);
                          }}
                          className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        >
                          <option value="">Select a transaction...</option>
                          {eligible_transactions.map((transaction) => (
                            <option key={transaction.id} value={transaction.id}>
                              {transaction.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label>Rating *</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setData('rating', star)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-8 w-8 ${
                                  star <= data.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                } hover:text-yellow-400 transition-colors`}
                              />
                            </button>
                          ))}
                        </div>
                        {errors.rating && (
                          <p className="text-sm text-red-600 mt-1">{errors.rating}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="comment">Comment (Optional)</Label>
                        <Textarea
                          id="comment"
                          value={data.comment}
                          onChange={(e) => setData('comment', e.target.value)}
                          placeholder="Share your experience..."
                          rows={4}
                          maxLength={255}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {data.comment.length}/255 characters
                        </p>
                        {errors.comment && (
                          <p className="text-sm text-red-600 mt-1">{errors.comment}</p>
                        )}
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsRatingDialogOpen(false);
                            reset();
                            setSelectedTransactionId(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting || !data.rating || !selectedTransactionId}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Rating Summary Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-400 fill-yellow-400" />
                Seller Ratings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    {average_rating.toFixed(1)}
                  </div>
                  <div className="mt-1">
                    {renderStars(Math.round(average_rating), 'md')}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {review_count} {review_count === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
                
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratings.filter(r => r.rating === star).length;
                    const percentage = review_count > 0 ? (count / review_count) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center space-x-2 mb-2">
                        <span className="text-sm w-12">{star} star</span>
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>
                What other buyers are saying about {seller.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ratings.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No reviews yet. Be the first to rate this seller!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ratings.map((rating) => (
                    <div
                      key={rating.id}
                      className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-semibold">
                            {rating.buyer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {rating.buyer.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(rating.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <div>
                          {renderStars(rating.rating, 'sm')}
                        </div>
                      </div>
                      {rating.comment && (
                        <p className="text-gray-700 dark:text-gray-300 mt-2">
                          {rating.comment}
                        </p>
                      )}
                      {rating.transaction && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          For: {rating.transaction.product.title}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

