import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
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
  CreditCard
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Transaction {
  id: number;
  sale_price: number;
  commission_amount: number;
  seller_earnings: number;
  platform_payment_reference: string;
  payment_proof_path: string;
  created_at: string;
  product: {
    id: number;
    title: string;
    images: string[];
  };
  buyer: {
    id: number;
    name: string;
  };
  seller: {
    id: number;
    name: string;
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

export default function PendingPayments({ transactions }: PendingPaymentsProps) {
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

  const handleVerifyPayment = (transactionId: number) => {
    if (confirm('Are you sure you want to verify this payment? This will mark the payment as collected by the platform.')) {
      router.post(`/admin/transactions/${transactionId}/verify-payment`);
    }
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Clock className="mr-3 h-8 w-8" />
                  Pending Payment Verifications
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Review and verify customer payments to platform
                </p>
              </div>
              <Link href="/admin/commissions">
                <Button variant="outline">
                  Back to Commissions
                </Button>
              </Link>
            </div>
          </div>

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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {transaction.product.images[0] ? (
                            <img
                              src={transaction.product.images[0]}
                              alt={transaction.product.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Transaction Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {transaction.product.title}
                            </h3>
                            <Badge className={
                              transaction.status === 'payment_submitted' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : transaction.status === 'payment_verified'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }>
                              <Clock className="h-3 w-3 mr-1" />
                              {transaction.status === 'payment_submitted' 
                                ? 'PENDING VERIFICATION'
                                : transaction.status === 'payment_verified'
                                ? 'READY TO COMPLETE'
                                : 'SHIPPED - READY TO COMPLETE'
                              }
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>Buyer: {transaction.buyer.name}</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>Seller: {transaction.seller.name}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                              <span className="font-semibold">{formatPrice(transaction.sale_price)}</span>
                              <span className="text-gray-600 dark:text-gray-400">•</span>
                              <span className="text-gray-600 dark:text-gray-400">Commission:</span>
                              <span className="font-semibold text-green-600">{formatPrice(transaction.commission_amount)}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Reference:</span>
                              <span className="font-mono text-blue-600">{transaction.platform_payment_reference}</span>
                              <span className="text-gray-600 dark:text-gray-400">•</span>
                              <span className="text-gray-600 dark:text-gray-400">{formatDate(transaction.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {transaction.status === 'payment_submitted' ? (
                          <Button
                            onClick={() => handleVerifyPayment(transaction.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Verify Payment
                          </Button>
                        ) : (transaction.status === 'payment_verified' || transaction.status === 'shipped') ? (
                          <Button
                            onClick={() => {
                              if (confirm('Complete this transaction? This will record the commission and finalize the sale.')) {
                                router.post(`/admin/transactions/${transaction.id}/admin-complete`);
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Complete Transaction
                          </Button>
                        ) : null}
                        <Link href={`/transactions/${transaction.id}`}>
                          <Button variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </Link>
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
