import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  BarChart3, 
  Download, 
  Search, 
  Filter,
  Calendar,
  User,
  Package,
  DollarSign
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface CommissionRecord {
  id: number;
  amount: number;
  collected_at: string;
  transaction: {
    id: number;
    sale_price: number;
    seller_earnings: number;
    status: string;
    product: {
      title: string;
    };
  };
  seller: {
    id: number;
    name: string;
  };
}

interface CommissionReportProps {
  commissions: {
    data: CommissionRecord[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  sellers: Array<{
    id: number;
    name: string;
  }>;
  filters: {
    start_date?: string;
    end_date?: string;
    seller_id?: string;
    status?: string;
  };
  summary: {
    total_amount: number;
    total_transactions: number;
    average_commission: number;
  };
}

export default function CommissionReport({ commissions, sellers, filters, summary }: CommissionReportProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [localFilters, setLocalFilters] = useState(filters);

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

  const applyFilters = () => {
    router.get('/admin/commissions/report', localFilters, {
      preserveState: true,
      replace: true,
    });
  };

  const clearFilters = () => {
    setLocalFilters({});
    router.get('/admin/commissions/report', {}, {
      preserveState: true,
      replace: true,
    });
  };

  const exportData = () => {
    const params = new URLSearchParams(localFilters);
    window.open(`/admin/commissions/export?${params.toString()}`, '_blank');
  };

  const filteredCommissions = commissions.data.filter(commission => {
    const matchesSearch = commission.transaction.product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.seller.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <AppLayout>
      <Head title="Commission Report" />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-green-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/admin/commissions">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                    <BarChart3 className="mr-3 h-8 w-8" />
                    Commission Report
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Detailed breakdown of all platform commissions
                  </p>
                </div>
              </div>
              <Button onClick={exportData} className="bg-green-600 hover:bg-green-700 text-white">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Commission</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(summary.total_amount)}
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {summary.total_transactions}
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
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Commission</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatPrice(summary.average_commission)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={localFilters.start_date || ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, start_date: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={localFilters.end_date || ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, end_date: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Seller
                  </label>
                  <select
                    value={localFilters.seller_id || ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, seller_id: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Sellers</option>
                    {sellers.map((seller) => (
                      <option key={seller.id} value={seller.id}>
                        {seller.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={localFilters.status || ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-4">
                <Button onClick={applyFilters} className="bg-green-600 hover:bg-green-700 text-white">
                  <Search className="mr-2 h-4 w-4" />
                  Apply Filters
                </Button>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by product or seller..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Commission Records Table */}
          <Card>
            <CardHeader>
              <CardTitle>Commission Records</CardTitle>
              <CardDescription>
                Detailed breakdown of all commission transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Transaction ID</th>
                      <th className="text-left py-3 px-4 font-semibold">Seller</th>
                      <th className="text-left py-3 px-4 font-semibold">Product</th>
                      <th className="text-right py-3 px-4 font-semibold">Sale Price</th>
                      <th className="text-right py-3 px-4 font-semibold">Commission</th>
                      <th className="text-right py-3 px-4 font-semibold">Seller Earnings</th>
                      <th className="text-center py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCommissions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-gray-600 dark:text-gray-400">
                          No commission records found
                        </td>
                      </tr>
                    ) : (
                      filteredCommissions.map((commission) => (
                        <tr key={commission.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-4 text-sm">
                            {formatDate(commission.collected_at)}
                          </td>
                          <td className="py-3 px-4 text-sm font-mono">
                            #{commission.transaction.id}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {commission.seller.name}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {commission.transaction.product.title}
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-semibold">
                            {formatPrice(commission.transaction.sale_price)}
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-bold text-green-600">
                            {formatPrice(commission.amount)}
                          </td>
                          <td className="py-3 px-4 text-sm text-right">
                            {formatPrice(commission.transaction.seller_earnings)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              commission.transaction.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {commission.transaction.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {commissions.last_page > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                {Array.from({ length: commissions.last_page }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === commissions.current_page ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const params = { ...localFilters, page };
                      router.get('/admin/commissions/report', params, {
                        preserveState: true,
                        replace: true,
                      });
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
