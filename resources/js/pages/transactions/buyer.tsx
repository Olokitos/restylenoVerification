import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ShoppingBag, 
  Eye, 
  Upload, 
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  AlertCircle,
  Search,
  Filter,
  Download
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Transaction {
  id: number;
  sale_price: number;
  status: string;
  created_at: string;
  product: {
    id: number;
    title: string;
    images: string[];
    price: number;
  };
  seller: {
    id: number;
    name: string;
  };
}

interface BuyerTransactionsProps {
  transactions: {
    data: Transaction[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export default function BuyerTransactions({ transactions }: BuyerTransactionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'payment_submitted':
        return <Upload className="h-4 w-4 text-blue-500" />;
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
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
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
      case 'pending_payment':
        return (
          <Link href={`/transactions/${transaction.id}/submit-payment`} className="w-full sm:w-auto">
            <Button size="sm" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
              <Upload className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Submit Payment</span>
              <span className="sm:hidden">Submit</span>
            </Button>
          </Link>
        );
      case 'shipped':
        return (
          <Button 
            size="sm" 
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
            onClick={() => {
              router.post(`/transactions/${transaction.id}/confirm-delivery`, {}, {
                onSuccess: () => {
                  // Transaction will be completed automatically
                },
                onError: (errors) => {
                  console.error('Failed to confirm delivery:', errors);
                }
              });
            }}
          >
            <Package className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Confirm Delivery</span>
            <span className="sm:hidden">Confirm</span>
          </Button>
        );
      default:
        return (
          <Link href={`/transactions/${transaction.id}`} className="w-full sm:w-auto">
            <Button size="sm" variant="outline" className="w-full sm:w-auto">
              <Eye className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">Details</span>
            </Button>
          </Link>
        );
    }
  };

  const filteredTransactions = transactions.data.filter(transaction => {
    const matchesSearch = transaction.product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.seller.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <Head title="My Purchases" />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-green-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                  <ShoppingBag className="mr-3 h-8 w-8" />
                  My Purchases
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Track your purchase history and transaction status
                </p>
              </div>
              <div>
                <Button
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (statusFilter !== 'all') {
                      params.append('status', statusFilter);
                    }
                    if (startDate) {
                      params.append('start_date', startDate);
                    }
                    if (endDate) {
                      params.append('end_date', endDate);
                    }
                    const queryString = params.toString();
                    window.open(`/transactions/buyer/export${queryString ? '?' + queryString : ''}`, '_blank');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by product or seller..."
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
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="sm:w-48">
                    <Label htmlFor="start_date" className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                      Start Date
                    </Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="sm:w-48">
                    <Label htmlFor="end_date" className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                      End Date
                    </Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  {(startDate || endDate) && (
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setStartDate('');
                          setEndDate('');
                        }}
                      >
                        Clear Dates
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No transactions found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'You haven\'t made any purchases yet.'}
                  </p>
                  <Link href="/marketplace">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      Browse Marketplace
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              filteredTransactions.map((transaction) => (
                <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {transaction.product.images[0] ? (
                            <img
                              src={transaction.product.images[0].startsWith('/storage') ? transaction.product.images[0] : `/storage/${transaction.product.images[0]}`}
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
                            <Badge className={`${getStatusColor(transaction.status)} px-2 py-1 text-xs w-fit`}>
                              {getStatusIcon(transaction.status)}
                              <span className="ml-1 hidden sm:inline">{getStatusLabel(transaction.status)}</span>
                              <span className="ml-1 sm:hidden">{getStatusLabel(transaction.status).split(' ')[0]}</span>
                            </Badge>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span className="truncate">Sold by: {transaction.seller.name}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{formatDate(transaction.created_at)}</span>
                          </div>
                          
                          <div className="mt-1 sm:mt-2">
                            <span className="text-base sm:text-lg font-bold text-green-600">
                              {formatPrice(transaction.sale_price)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end sm:justify-start">
                        <div className="w-full sm:w-auto">
                          {getActionButton(transaction)}
                        </div>
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
              <div className="flex flex-wrap gap-2 justify-center">
                {Array.from({ length: transactions.last_page }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === transactions.current_page ? "default" : "outline"}
                    size="sm"
                    className="min-w-[2.5rem]"
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
