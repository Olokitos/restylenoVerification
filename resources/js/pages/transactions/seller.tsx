import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DollarSign, 
  Eye, 
  Truck, 
  Package,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Award
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Transaction {
  id: number;
  sale_price: number;
  commission_amount: number;
  seller_earnings: number;
  status: string;
  created_at: string;
  shipped_at?: string;
  product: {
    id: number;
    title: string;
    images: string[];
    price: number;
  };
  buyer: {
    id: number;
    name: string;
  };
}

interface SellerTransactionsProps {
  transactions: {
    data: Transaction[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats: {
    total_earnings: number;
    total_commissions: number;
    total_sales: number;
  };
}

export default function SellerTransactions({ transactions, stats }: SellerTransactionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'payment_submitted':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'payment_verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'delivered':
        return <Package className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
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
      month: 'short',
      day: 'numeric',
    });
  };

  const getActionButton = (transaction: Transaction) => {
    switch (transaction.status) {
      case 'payment_verified':
        return (
          <Button 
            size="sm" 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => {
              router.post(`/transactions/${transaction.id}/mark-shipped`, {}, {
                onSuccess: () => {
                  // Transaction status will be updated
                },
                onError: (errors) => {
                  console.error('Failed to mark as shipped:', errors);
                }
              });
            }}
          >
            <Truck className="mr-2 h-4 w-4" />
            Mark as Shipped
          </Button>
        );
      default:
        return (
          <Link href={`/transactions/${transaction.id}`}>
            <Button size="sm" variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </Link>
        );
    }
  };

  const filteredTransactions = transactions.data.filter(transaction => {
    const matchesSearch = transaction.product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.buyer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <Head title="My Sales" />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-green-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                  <DollarSign className="mr-3 h-8 w-8" />
                  My Sales
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Track your sales and earnings with commission breakdown
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(stats.total_earnings)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Commissions</p>
                    <p className="text-2xl font-bold text-red-600">
                      -{formatPrice(stats.total_commissions)}
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
                      <Award className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Sales</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.total_sales}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by product or buyer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending_payment">Pending Payment</option>
                    <option value="payment_submitted">Payment Submitted</option>
                    <option value="payment_verified">Payment Verified</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No sales found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'You haven\'t made any sales yet.'}
                  </p>
                  <Link href="/marketplace/create">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      List a Product
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              filteredTransactions.map((transaction) => (
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
                            <Badge className={`${getStatusColor(transaction.status)} px-2 py-1 text-xs`}>
                              {getStatusIcon(transaction.status)}
                              <span className="ml-1">{getStatusLabel(transaction.status)}</span>
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>Sold to: {transaction.buyer.name}</span>
                            <span>•</span>
                            <span>{formatDate(transaction.created_at)}</span>
                          </div>
                          
                          {/* Earnings Breakdown */}
                          <div className="mt-2 flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-600 dark:text-gray-400">Sale Price:</span>
                              <span className="font-semibold">{formatPrice(transaction.sale_price)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-600 dark:text-gray-400">Commission (2%):</span>
                              <span className="font-semibold text-red-600">-{formatPrice(transaction.commission_amount)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-600 dark:text-gray-400">Your Earnings:</span>
                              <span className="font-bold text-green-600">{formatPrice(transaction.seller_earnings)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {getActionButton(transaction)}
                        <Link href={`/transactions/${transaction.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            Details
                          </Button>
                        </Link>
                      </div>
                    </div>
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
                      // This would handle pagination
                      console.log('Navigate to page:', page);
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
