import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Users, 
  BarChart3,
  Eye,
  Download,
  ArrowRight,
  Package
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Transaction {
  id: number;
  sale_price: number;
  commission_amount: number;
  seller_earnings: number;
  completed_at: string;
  product: {
    title: string;
  };
  buyer: {
    name: string;
  };
  seller: {
    name: string;
  };
}

interface CommissionStats {
  total_commissions: number;
  this_month_commissions: number;
  today_commissions: number;
  total_transactions: number;
  average_commission: number;
}

interface CommissionIndexProps {
  stats: CommissionStats;
  recentTransactions: Transaction[];
  chartData: Array<{
    date: string;
    amount: number;
  }>;
}

export default function CommissionIndex({ stats, recentTransactions, chartData }: CommissionIndexProps) {
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

  return (
    <AppLayout>
      <Head title="Commission Dashboard" />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-green-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                  <DollarSign className="mr-3 h-8 w-8" />
                  Commission Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Track platform commissions and transaction analytics
                </p>
              </div>
              <div className="flex space-x-3">
                <Link href="/admin/commissions/report">
                  <Button variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Report
                  </Button>
                </Link>
                <Link href="/admin/commissions/export">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Commissions</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(stats.total_commissions)}
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
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPrice(stats.this_month_commissions)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatPrice(stats.today_commissions)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.total_transactions}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Commission Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Commission Trend (Last 30 Days)
                </CardTitle>
                <CardDescription>
                  Daily commission earnings over the past month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-1">
                  {chartData.map((day, index) => {
                    const maxAmount = Math.max(...chartData.map(d => d.amount));
                    const height = (day.amount / maxAmount) * 200;
                    
                    return (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div
                          className="bg-green-500 w-full rounded-t"
                          style={{ height: `${height}px` }}
                          title={`${day.date}: ${formatPrice(day.amount)}`}
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 transform -rotate-45">
                          {day.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Average Daily Commission: {formatPrice(stats.average_commission)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Recent Transactions
                  </div>
                  <Link href="/admin/commissions/report">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardTitle>
                <CardDescription>
                  Latest completed transactions with commissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No transactions yet</p>
                    </div>
                  ) : (
                    recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <div>
                              <p className="font-semibold text-sm">{transaction.product.title}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {transaction.buyer.name} → {transaction.seller.name}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {formatPrice(transaction.commission_amount)}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {formatDate(transaction.completed_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks for commission management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/commissions/report">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    <span>Detailed Report</span>
                  </Button>
                </Link>
                
                <Link href="/admin/commissions/export">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                    <Download className="h-6 w-6 mb-2" />
                    <span>Export Data</span>
                  </Button>
                </Link>
                
                <Link href="/admin/dashboard">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                    <Eye className="h-6 w-6 mb-2" />
                    <span>Admin Dashboard</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
