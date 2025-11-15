import React, { useEffect, useState, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Eye, 
  CheckCircle, 
  XCircle,
  Package,
  User,
  CreditCard,
  Wallet,
  Building2,
  RefreshCw
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Transaction {
  id: number;
  sale_price: number;
  commission_amount: number;
  seller_earnings: number;
  platform_payment_reference: string;
  payment_proof_path: string;
  shipping_proof_path?: string | null;
  delivery_proof_path?: string | null;
  payout_proof_path?: string | null;
  payment_collected_by_platform?: boolean;
  status: string;
  created_at: string;
  product: {
    id: number;
    title: string;
    images: string[];
  };
  buyer: {
    id: number;
    name: string;
    gcash_number?: string | null;
    bank_name?: string | null;
    bank_account_number?: string | null;
    bank_account_name?: string | null;
  };
  seller: {
    id: number;
    name: string;
    gcash_number?: string | null;
    bank_name?: string | null;
    bank_account_number?: string | null;
    bank_account_name?: string | null;
  };
}

interface PendingPaymentsProps {
  transactions: {
    data: Transaction[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export default function PendingPayments({ transactions: initialTransactions }: PendingPaymentsProps) {
  const page = usePage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPageVisibleRef = useRef(true);
  
  // Get transactions from page props (updates automatically with Inertia)
  const transactions = (page.props as any).transactions || initialTransactions;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const { flash, errors } = page.props as {
    flash?: { success?: string; error?: string };
    errors?: Record<string, string>;
  };

  // Auto-refresh function
  const refreshTransactions = async (showLoading = false) => {
    if (showLoading) {
      setIsRefreshing(true);
    }
    
    try {
      const currentPage = transactions.current_page || 1;
      const url = `/admin/transactions/pending-payments${currentPage > 1 ? `?page=${currentPage}` : ''}`;
      
      router.get(url, {}, {
        preserveState: true,
        preserveScroll: true,
        only: ['transactions'],
        onSuccess: () => {
          setLastRefresh(new Date());
        },
        onFinish: () => {
          if (showLoading) {
            setIsRefreshing(false);
          }
        },
      });
    } catch (error) {
      console.error('Error refreshing transactions:', error);
      if (showLoading) {
        setIsRefreshing(false);
      }
    }
  };

  // Set up auto-refresh polling
  useEffect(() => {
    // Refresh every 30 seconds when page is visible
    const startPolling = () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      refreshIntervalRef.current = setInterval(() => {
        if (isPageVisibleRef.current) {
          refreshTransactions(false);
        }
      }, 30000); // 30 seconds
    };

    startPolling();

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      isPageVisibleRef.current = !document.hidden;
      
      if (!document.hidden) {
        // Page became visible, refresh immediately and restart polling
        refreshTransactions(false);
        startPolling();
      } else {
        // Page is hidden, clear interval to save resources
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [transactions.current_page]);


  const handleVerifyPayment = (transactionId: number) => {
    if (confirm('Are you sure you want to verify this payment? This will mark the payment as collected by the platform.')) {
      router.post(`/admin/transactions/${transactionId}/verify-payment`);
    }
  };

  const handleUploadPayoutProof = (transactionId: number, file: File) => {
    const formData = new FormData();
    formData.append('payout_proof', file);

    router.post(`/admin/transactions/${transactionId}/upload-payout-proof`, formData, {
      forceFormData: true,
    });
  };

  return (
    <AppLayout>
      <Head title="Pending Payment Verifications" />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-green-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Clock className="mr-3 h-8 w-8" />
                    Pending Payment Verifications
                  </h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => refreshTransactions(true)}
                    disabled={isRefreshing}
                    className="h-8 w-8"
                    title="Refresh transactions"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-gray-600 dark:text-gray-400">
                    Review and verify customer payments to platform
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Last refreshed: {lastRefresh.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <Link href="/admin/commissions">
                <Button variant="outline">
                  Back to Commissions
                </Button>
              </Link>
            </div>
          </div>

          {(flash?.success || flash?.error || errors?.error) && (
            <div className="mb-6 space-y-3">
              {flash?.success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-900/30 dark:text-emerald-200">
                  {flash.success}
                </div>
              )}
              {(flash?.error || errors?.error) && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-900/30 dark:text-red-200">
                  {flash?.error || errors?.error}
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Verifications</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {transactions.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(transactions.data.reduce((sum, t) => sum + t.sale_price, 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Commission to Collect</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPrice(transactions.data.reduce((sum, t) => sum + t.commission_amount, 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions List */}
          <div className="space-y-4">
            {transactions.data.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Pending Payments
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    All payments have been verified. Great job!
                  </p>
                </CardContent>
              </Card>
            ) : (
              transactions.data.map((transaction) => (
                <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {transaction.product.images[0] ? (
                            <img
                              src={transaction.product.images[0].startsWith('/storage')
                                ? transaction.product.images[0]
                                : `/storage/${transaction.product.images[0]}`}
                              alt={transaction.product.title}
                              className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <Package className="h-7 w-7 sm:h-8 sm:w-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Transaction Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {transaction.product.title}
                            </h3>
                            <Badge className={
                              transaction.status === 'payment_submitted' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : transaction.status === 'payment_verified'
                                ? 'bg-blue-100 text-blue-800'
                                : transaction.status === 'shipped'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-green-100 text-green-800'
                            }>
                              {transaction.status === 'payment_submitted' ? (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span className="hidden sm:inline">PENDING VERIFICATION</span>
                                  <span className="sm:hidden">PENDING</span>
                                </>
                              ) : transaction.status === 'payment_verified' ? (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span className="hidden sm:inline">READY TO COMPLETE</span>
                                  <span className="sm:hidden">READY</span>
                                </>
                              ) : transaction.status === 'shipped' ? (
                                <>
                                  <Package className="h-3 w-3 mr-1" />
                                  <span className="hidden sm:inline">SHIPPED - READY TO COMPLETE</span>
                                  <span className="sm:hidden">SHIPPED</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  <span className="hidden sm:inline">DELIVERED - READY FOR PAYOUT</span>
                                  <span className="sm:hidden">DELIVERED</span>
                                </>
                              )}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="truncate">Buyer: {transaction.buyer.name}</span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="truncate">Seller: {transaction.seller.name}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm">
                              <div className="flex items-center space-x-1">
                                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                                <span className="font-semibold">{formatPrice(transaction.sale_price)}</span>
                              </div>
                              <span className="hidden sm:inline text-gray-600 dark:text-gray-400">•</span>
                              <div className="flex items-center space-x-1">
                                <span className="text-gray-600 dark:text-gray-400">Commission:</span>
                                <span className="font-semibold text-green-600">{formatPrice(transaction.commission_amount)}</span>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm">
                              <div className="flex items-center space-x-1 min-w-0">
                                <span className="text-gray-600 dark:text-gray-400">Ref:</span>
                                <span className="font-mono text-blue-600 truncate">{transaction.platform_payment_reference}</span>
                              </div>
                              <span className="hidden sm:inline text-gray-600 dark:text-gray-400">•</span>
                              <span className="text-gray-600 dark:text-gray-400">{formatDate(transaction.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Information */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Buyer Payment Info */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              Buyer Payment Details
                            </h4>
                            <div className="pl-6 space-y-1.5 text-xs sm:text-sm">
                              {transaction.buyer.gcash_number ? (
                                <div className="flex items-center space-x-2">
                                  <Wallet className="h-3.5 w-3.5 text-green-600" />
                                  <span className="text-gray-600 dark:text-gray-400">GCash:</span>
                                  <span className="font-mono font-semibold text-gray-900 dark:text-white">
                                    {transaction.buyer.gcash_number}
                                  </span>
                                </div>
                              ) : null}
                              {transaction.buyer.bank_name && transaction.buyer.bank_account_number ? (
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <Building2 className="h-3.5 w-3.5 text-blue-600" />
                                    <span className="text-gray-600 dark:text-gray-400">Bank:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                      {transaction.buyer.bank_name}
                                    </span>
                                  </div>
                                  <div className="pl-5 space-y-0.5">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-gray-500 dark:text-gray-500">Account #:</span>
                                      <span className="font-mono font-semibold text-gray-900 dark:text-white">
                                        {transaction.buyer.bank_account_number}
                                      </span>
                                    </div>
                                    {transaction.buyer.bank_account_name && (
                                      <div className="flex items-center space-x-2">
                                        <span className="text-gray-500 dark:text-gray-500">Account Name:</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                          {transaction.buyer.bank_account_name}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : null}
                              {!transaction.buyer.gcash_number && !transaction.buyer.bank_account_number && (
                                <p className="text-gray-500 dark:text-gray-400 italic">No payment details available</p>
                              )}
                            </div>
                          </div>

                          {/* Seller Payment Info */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              Seller Payment Details
                            </h4>
                            <div className="pl-6 space-y-1.5 text-xs sm:text-sm">
                              {transaction.seller.gcash_number ? (
                                <div className="flex items-center space-x-2">
                                  <Wallet className="h-3.5 w-3.5 text-green-600" />
                                  <span className="text-gray-600 dark:text-gray-400">GCash:</span>
                                  <span className="font-mono font-semibold text-gray-900 dark:text-white">
                                    {transaction.seller.gcash_number}
                                  </span>
                                </div>
                              ) : null}
                              {transaction.seller.bank_name && transaction.seller.bank_account_number ? (
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <Building2 className="h-3.5 w-3.5 text-blue-600" />
                                    <span className="text-gray-600 dark:text-gray-400">Bank:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                      {transaction.seller.bank_name}
                                    </span>
                                  </div>
                                  <div className="pl-5 space-y-0.5">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-gray-500 dark:text-gray-500">Account #:</span>
                                      <span className="font-mono font-semibold text-gray-900 dark:text-white">
                                        {transaction.seller.bank_account_number}
                                      </span>
                                    </div>
                                    {transaction.seller.bank_account_name && (
                                      <div className="flex items-center space-x-2">
                                        <span className="text-gray-500 dark:text-gray-500">Account Name:</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                          {transaction.seller.bank_account_name}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : null}
                              {!transaction.seller.gcash_number && !transaction.seller.bank_account_number && (
                                <p className="text-gray-500 dark:text-gray-400 italic">No payment details available</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 lg:justify-end">
                        {transaction.status === 'payment_submitted' && (
                          <Button
                            onClick={() => handleVerifyPayment(transaction.id)}
                            size="sm"
                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Verify Payment</span>
                            <span className="sm:hidden">Verify</span>
                          </Button>
                        )}
                        {(transaction.status === 'payment_verified' || transaction.status === 'shipped' || transaction.status === 'delivered') && !transaction.payment_collected_by_platform && (
                          <Button
                            onClick={() => {
                              if (confirm('Mark payment as collected by the platform?')) {
                                router.post(`/admin/transactions/${transaction.id}/collect-payment`, undefined, {
                                  preserveScroll: true,
                                });
                              }
                            }}
                            size="sm"
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Mark Payment Collected</span>
                            <span className="sm:hidden">Mark Collected</span>
                          </Button>
                        )}
                        {(transaction.status === 'payment_verified' || transaction.status === 'shipped' || transaction.status === 'delivered') && (
                          <Button
                            onClick={() => {
                              if (!transaction.payment_collected_by_platform) {
                                alert('Collect the payment first before completing this transaction.');
                                return;
                              }
                              if (confirm('Complete this transaction and process seller payout? This will record the commission and finalize the sale.')) {
                                router.post(`/admin/transactions/${transaction.id}/admin-complete`, undefined, {
                                  preserveScroll: true,
                                });
                              }
                            }}
                            size="sm"
                            className={`w-full sm:w-auto ${transaction.status === 'delivered' 
                              ? 'bg-green-600 hover:bg-green-700 text-white' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                            disabled={!transaction.payment_collected_by_platform}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">
                              {transaction.status === 'delivered' ? 'Process Seller Payout' : 'Complete Transaction'}
                            </span>
                            <span className="sm:hidden">
                              {transaction.status === 'delivered' ? 'Process Payout' : 'Complete'}
                            </span>
                          </Button>
                        )}
                        <Link href={`/transactions/${transaction.id}`} className="w-full sm:w-auto">
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            <Eye className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">Details</span>
                          </Button>
                        </Link>
                        <div className="relative w-full sm:w-auto">
                          <input
                            id={`payout-proof-${transaction.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) {
                                handleUploadPayoutProof(transaction.id, file);
                                event.target.value = '';
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!transaction.payment_collected_by_platform}
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => {
                              const input = document.getElementById(`payout-proof-${transaction.id}`) as HTMLInputElement | null;
                              input?.click();
                            }}
                          >
                            <span className="hidden sm:inline">Upload Payout Proof</span>
                            <span className="sm:hidden">Upload Proof</span>
                          </Button>
                          {!transaction.payment_collected_by_platform && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Enable after platform collects payment.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Payment Proof Preview */}
                    {transaction.payment_proof_path && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Payment Proof:</p>
                        <img
                          src={`/storage/${transaction.payment_proof_path}`}
                          alt="Payment proof"
                          className="w-full max-w-md rounded-lg border cursor-pointer"
                          onClick={() => window.open(`/storage/${transaction.payment_proof_path}`, '_blank')}
                        />
                      </div>
                    )}

                    {/* Shipping Proof Preview */}
                    {transaction.shipping_proof_path && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Shipping Proof:</p>
                        <img
                          src={transaction.shipping_proof_path.startsWith('/storage')
                            ? transaction.shipping_proof_path
                            : `/storage/${transaction.shipping_proof_path}`}
                          alt="Shipping proof"
                          className="w-full max-w-md rounded-lg border cursor-pointer"
                          onClick={() => window.open(
                            transaction.shipping_proof_path.startsWith('/storage')
                              ? transaction.shipping_proof_path
                              : `/storage/${transaction.shipping_proof_path}`,
                            '_blank'
                          )}
                        />
                      </div>
                    )}

                    {/* Delivery Proof Preview */}
                    {transaction.delivery_proof_path && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Delivery Proof:</p>
                        <img
                          src={transaction.delivery_proof_path.startsWith('/storage')
                            ? transaction.delivery_proof_path
                            : `/storage/${transaction.delivery_proof_path}`}
                          alt="Delivery proof"
                          className="w-full max-w-md rounded-lg border cursor-pointer"
                          onClick={() => window.open(
                            transaction.delivery_proof_path.startsWith('/storage')
                              ? transaction.delivery_proof_path
                              : `/storage/${transaction.delivery_proof_path}`,
                            '_blank'
                          )}
                        />
                      </div>
                    )}

                    {/* Payout Proof Preview */}
                    {transaction.payout_proof_path && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Seller Payout Proof:</p>
                        <img
                          src={transaction.payout_proof_path.startsWith('/storage')
                            ? transaction.payout_proof_path
                            : `/storage/${transaction.payout_proof_path}`}
                          alt="Seller payout proof"
                          className="w-full max-w-md rounded-lg border cursor-pointer"
                          onClick={() => window.open(
                            transaction.payout_proof_path.startsWith('/storage')
                              ? transaction.payout_proof_path
                              : `/storage/${transaction.payout_proof_path}`,
                            '_blank'
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {transactions.last_page > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                {Array.from({ length: transactions.last_page }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === transactions.current_page ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      router.get(`/admin/transactions/pending-payments?page=${page}`);
                    }}
                  >
                    {page}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
