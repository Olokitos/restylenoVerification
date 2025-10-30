import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ShoppingBag, 
  User, 
  Calendar, 
  Package, 
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  CreditCard,
  AlertCircle,
  Upload,
  FileText
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { usePage } from '@inertiajs/react';
import { useRef } from 'react';

interface Transaction {
  id: number;
  sale_price: number;
  commission_amount: number;
  seller_earnings: number;
  status: string;
  payment_method: string;
  payment_proof_path?: string;
  gcash_reference?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  product: {
    id: number;
    title: string;
    price: number;
    images: string[];
    user: {
      name: string;
    };
  };
  buyer: {
    id: number;
    name: string;
  };
  seller: {
    id: number;
    name: string;
  };
  shipping_proof_path?: string;
}

interface TransactionShowProps {
  transaction: Transaction;
  canAct: {
    canSubmitPayment: boolean;
    canVerifyPayment: boolean;
    canShip: boolean;
    canConfirmDelivery: boolean;
    canComplete: boolean;
    canCancel: boolean;
  };
}

export default function TransactionShow({ transaction, canAct }: TransactionShowProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [deliveryProof, setDeliveryProof] = useState<File | null>(null);
  const { auth } = usePage().props as { auth: { user: { is_admin?: boolean } } };
  const isAdmin = !!auth?.user?.is_admin;
  const [cancelReason, setCancelReason] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'payment_submitted':
        return <Upload className="h-5 w-5 text-blue-500" />;
      case 'payment_verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <Package className="h-5 w-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'payment_submitted':
        return 'bg-blue-100 text-blue-800';
      case 'payment_verified':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCancel = () => {
    router.post(`/transactions/${transaction.id}/cancel`, {
      reason: cancelReason,
    });
  };

  return (
    <>
      <AppLayout>
        <Head title={`Transaction #${transaction.id}`} />
        
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-green-800/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                {isAdmin ? (
                  <Link href="/admin/transactions/pending-payments">
                    <Button variant="outline" size="sm">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Pending Payments
                    </Button>
                  </Link>
                ) : (
                  <Link href="/transactions/buyer">
                    <Button variant="outline" size="sm">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Transactions
                    </Button>
                  </Link>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Transaction #{transaction.id}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {transaction.product.title}
                  </p>
                </div>
              </div>
              
              <Badge className={`${getStatusColor(transaction.status)} px-3 py-1`}>
                {getStatusIcon(transaction.status)}
                <span className="ml-2">{transaction.status.replace('_', ' ').toUpperCase()}</span>
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Transaction Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Transaction Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${transaction.status === 'pending_payment' ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div>
                          <p className="font-medium">Transaction Created</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      {transaction.payment_proof_path && (
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${['payment_submitted', 'payment_verified', 'shipped', 'delivered', 'completed'].includes(transaction.status) ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <div>
                            <p className="font-medium">Payment Submitted</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {transaction.payment_proof_path && 'Payment proof uploaded'}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {transaction.shipped_at && (
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${['shipped', 'delivered', 'completed'].includes(transaction.status) ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <div>
                            <p className="font-medium">Product Shipped</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(transaction.shipped_at)}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {transaction.delivered_at && (
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${['delivered', 'completed'].includes(transaction.status) ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <div>
                            <p className="font-medium">Delivery Confirmed</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(transaction.delivered_at)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Product Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Package className="mr-2 h-5 w-5" />
                      Product Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-4">
                      {transaction.product.images[0] && (
                        <img
                          src={transaction.product.images[0].startsWith('/storage') ? transaction.product.images[0] : `/storage/${transaction.product.images[0]}`}
                          alt={transaction.product.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{transaction.product.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Sold by: {transaction.product.user.name}
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          {formatPrice(transaction.product.price)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                {transaction.payment_proof_path && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CreditCard className="mr-2 h-5 w-5" />
                        Payment Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Method</p>
                          <p className="capitalize">{transaction.payment_method}</p>
                        </div>
                        
                        {transaction.platform_payment_reference && (
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Platform Payment Reference</p>
                            <p className="font-mono">{transaction.platform_payment_reference}</p>
                          </div>
                        )}

                        {transaction.payment_collected_by_platform && (
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-semibold text-green-900 dark:text-green-100">Payment Collected by Platform</p>
                                <p className="text-sm text-green-800 dark:text-green-200">
                                  Your payment has been verified and is being held in escrow
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {transaction.seller_paid && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <Package className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="font-semibold text-blue-900 dark:text-blue-100">Seller Payout Processed</p>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                  Payout Reference: {transaction.seller_payout_reference}
                                </p>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                  Amount: {formatPrice(transaction.seller_payout_amount || transaction.seller_earnings)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Proof</p>
                          <img
                            src={`/storage/${transaction.payment_proof_path}`}
                            alt="Payment proof"
                            className="mt-2 w-full max-w-md rounded-lg border"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Buyer Delivery Confirmation with Photo */}
                {canAct.canConfirmDelivery && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Truck className="mr-2 h-5 w-5" />
                        Confirm Delivery
                      </CardTitle>
                      <CardDescription>Optionally upload a photo of the item you received.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData();
                          if (deliveryProof) formData.append('delivery_proof', deliveryProof);
                          router.post(`/transactions/${transaction.id}/confirm-delivery`, formData, {
                            forceFormData: true,
                          });
                        }}
                        className="space-y-3"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setDeliveryProof(e.target.files?.[0] || null)}
                          className="block w-full text-sm"
                        />
                        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Confirm Delivery
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Seller Shipping Proof Upload: now visible during 'payment_submitted' status */}
                {transaction.status === 'payment_submitted' && transaction.seller && auth.user && transaction.seller.id === auth.user.id && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Truck className="mr-2 h-5 w-5" />
                        Mark as Shipped
                      </CardTitle>
                      <CardDescription>
                        Upload a photo of the shipment. This will be visible to the admin for verification and to the buyer after approval.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          const formData = new FormData();
                          const fileInput = e.currentTarget.elements.namedItem('shipping_proof');
                          if (fileInput && fileInput.files && fileInput.files[0]) {
                            formData.append('shipping_proof', fileInput.files[0]);
                            router.post(`/transactions/${transaction.id}/mark-shipped`, formData, { forceFormData: true })
                          }
                        }}
                        className="space-y-3"
                      >
                        <input
                          name="shipping_proof"
                          type="file"
                          accept="image/*"
                          className="block w-full text-sm"
                          required
                        />
                        <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                          <Truck className="mr-2 h-4 w-4" />
                          Mark as Shipped
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Display shipping proof image after shipped (any user) */}
                {transaction.shipping_proof_path && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Truck className="mr-2 h-5 w-5" />
                        Shipping Proof
                      </CardTitle>
                      <CardDescription>
                        Shipment photo uploaded by seller (visible to buyer and admin for validation)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <img
                        src={transaction.shipping_proof_path.startsWith('/storage') ? transaction.shipping_proof_path : `/storage/${transaction.shipping_proof_path}`}
                        alt="Shipping Proof"
                        className="mt-2 w-full max-w-md rounded-lg border"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {canAct.canSubmitPayment && (
                        <Link href={`/transactions/${transaction.id}/submit-payment`}>
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Upload className="mr-2 h-4 w-4" />
                            Submit Payment Proof
                          </Button>
                        </Link>
                      )}
                      
                      {canAct.canVerifyPayment && (
                        <Button
                          onClick={() => router.post(`/admin/transactions/${transaction.id}/verify-payment`)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Verify Payment
                        </Button>
                      )}
                      
                      {canAct.canShip && (
                        <Button
                          onClick={() => router.post(`/transactions/${transaction.id}/mark-shipped`)}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Mark as Shipped
                        </Button>
                      )}
                      
                      {canAct.canConfirmDelivery && (
                        <Button
                          onClick={() => router.post(`/transactions/${transaction.id}/confirm-delivery`)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Confirm Delivery
                        </Button>
                      )}
                      
                      {canAct.canCancel && (
                        <Button
                          onClick={() => setShowCancelModal(true)}
                          variant="destructive"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel Transaction
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Transaction Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Escrow Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Paid by Buyer</span>
                        <span className="font-semibold">{formatPrice(transaction.sale_price)}</span>
                      </div>
                      {isAdmin && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Platform Commission (2%)</span>
                        <span className="text-red-600">-{formatPrice(transaction.commission_amount)}</span>
                      </div>
                      )}
                      <hr />
                      <div className="flex justify-between">
                        <span className="font-semibold">Seller Receives (98%)</span>
                        <span className="font-bold text-green-600">{formatPrice(transaction.seller_earnings)}</span>
                      </div>
                      
                      {transaction.payment_collected_by_platform && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">
                              Payment held in escrow by platform
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Participants */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Participants
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Buyer</p>
                        <p className="font-semibold">{transaction.buyer.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Seller</p>
                        <p className="font-semibold">{transaction.seller.name}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">Cancel Transaction</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Are you sure you want to cancel this transaction? This action cannot be undone.
                  </p>
                  <div className="space-y-3">
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Reason for cancellation (optional)"
                      className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      rows={3}
                    />
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleCancel}
                        variant="destructive"
                        className="flex-1"
                      >
                        Cancel Transaction
                      </Button>
                      <Button
                        onClick={() => setShowCancelModal(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Keep Transaction
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </>
  );
}
