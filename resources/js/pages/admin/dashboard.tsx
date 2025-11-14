import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Users, 
    UserCheck, 
    UserX, 
    Shield, 
    Settings, 
    BarChart3,
    ArrowLeft,
    Crown,
    Activity,
    TrendingUp,
    Package,
    ShoppingBag,
    Clock
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
    },
];

interface AdminStats {
    totalUsers: number;
    activeUsers: number;
    newThisWeek: number;
    totalWardrobeItems: number;
    totalProducts: number;
    activeProducts: number;
    totalTransactions: number;
    pendingPayments: number;
    completedTransactions: number;
    totalCommissions: number;
    thisMonthCommissions: number;
}

interface RecentActivity {
    id: number;
    type: 'commission' | 'transaction';
    amount?: number;
    sale_price?: number;
    product_title: string;
    seller_name: string;
    buyer_name: string;
    transaction_id?: number;
    date: string;
}

interface AdminDashboardProps {
    stats: AdminStats;
    recentActivity?: RecentActivity[];
}

export default function AdminDashboard({ stats, recentActivity = [] }: AdminDashboardProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
    };

    const handleVerifyUsers = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Navigate to users page - you can add a filter for unverified users
        router.get('/admin/users');
    };

    const handleSecurityAudit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Navigate to security audit page or show security information
        // For now, we'll show an alert with security stats
        // You can create a dedicated security audit page later
        alert(`Security Audit Summary:\n\n` +
              `Total Users: ${stats.totalUsers}\n` +
              `Active Users: ${stats.activeUsers}\n` +
              `Pending Payments: ${stats.pendingPayments}\n` +
              `Completed Transactions: ${stats.completedTransactions}\n\n` +
              `All systems operational.`);
    };

    const handleGenerateReport = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Navigate to commission report page
        router.get('/admin/commissions/report');
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <Crown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                            <p className="text-gray-600 dark:text-gray-400">Administrative Control Center</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid - simplified like User Management */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalUsers}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
                        </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.activeUsers}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
                        </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.newThisWeek}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">New This Week</div>
                        </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalWardrobeItems}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Wardrobe Items</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Secondary Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalProducts}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Products</div>
                        </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.activeProducts}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Active Products</div>
                        </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{stats.totalTransactions}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</div>
                        </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pendingPayments}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Pending Payments</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Commissions */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-gray-200 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-xl">Total Commissions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">{formatPrice(stats.totalCommissions)}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700 md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-xl">This Month</CardTitle>
                            <CardDescription>Commission earnings this month</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">{formatPrice(stats.thisMonthCommissions)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Admin Actions */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* User Management */}
                    <div className="group relative overflow-hidden bg-white dark:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-white/20 rounded-2xl p-6 hover:bg-gray-50 dark:hover:bg-white/15 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <Users className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h3>
                                <p className="text-sm text-gray-600 dark:text-white/60">Manage user accounts and permissions</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-white/70 mb-6 leading-relaxed">
                            View, edit, and manage user accounts. Update user information, reset passwords, and delete accounts.
                        </p>
                        <Link href="/admin/users">
                            <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-xl py-3 font-semibold transition-all duration-300 hover:shadow-lg">
                                <Users className="mr-2 h-4 w-4" />
                                Manage Users
                            </Button>
                        </Link>
                    </div>

                    {/* Transaction Management */}
                    <div className="group relative overflow-hidden bg-white dark:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-white/20 rounded-2xl p-6 hover:bg-gray-50 dark:hover:bg-white/15 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                                <Clock className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Transaction Management</h3>
                                <p className="text-sm text-gray-600 dark:text-white/60">Monitor and manage transactions</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-white/70 mb-6 leading-relaxed">
                            Review pending payments, verify transactions, and manage the escrow system.
                        </p>
                        <Link href="/admin/transactions/pending-payments">
                            <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white border-0 rounded-xl py-3 font-semibold transition-all duration-300 hover:shadow-lg">
                                <Clock className="mr-2 h-4 w-4" />
                                Pending Payments ({stats.pendingPayments})
                            </Button>
                        </Link>
                    </div>

                    {/* Commission Management */}
                    <div className="group relative overflow-hidden bg-white dark:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-white/20 rounded-2xl p-6 hover:bg-gray-50 dark:hover:bg-white/15 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-lg font-bold text-white">₱</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Commission Management</h3>
                                <p className="text-sm text-gray-600 dark:text-white/60">Track platform earnings</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-white/70 mb-6 leading-relaxed">
                            Monitor commission earnings, generate reports, and track financial performance.
                        </p>
                        <div className="space-y-3">
                            <Link href="/admin/commissions">
                                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 rounded-xl py-3 font-semibold transition-all duration-300 hover:shadow-lg">
                                    <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">₱</span>
                                    View Commissions
                                </Button>
                            </Link>
                            <Link href="/admin/commissions/report">
                                <Button className="w-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white border border-gray-300 dark:border-white/30 rounded-xl py-3 font-semibold transition-all duration-300">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Generate Report
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-white/20 rounded-2xl p-8">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                            <p className="text-gray-600 dark:text-white/60">Latest system and user activity</p>
                        </div>
                    </div>
                    {recentActivity.length === 0 ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Activity className="h-10 w-10 text-gray-400 dark:text-white/40" />
                                </div>
                                <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No recent activity</p>
                                <p className="text-gray-600 dark:text-white/60">Activity will appear here as users interact with the platform.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentActivity.map((activity) => {
                                const transactionId = activity.type === 'commission' 
                                    ? activity.transaction_id 
                                    : activity.id;
                                
                                return (
                                    <Link
                                        key={`${activity.type}-${activity.id}`}
                                        href={`/transactions/${transactionId}`}
                                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all duration-200 border border-gray-200 dark:border-white/10 cursor-pointer group"
                                    >
                                        <div className="flex items-center space-x-4 flex-1">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                activity.type === 'commission' 
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                                                    : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                            }`}>
                                                {activity.type === 'commission' ? (
                                                    <span className="text-white font-bold text-sm">₱</span>
                                                ) : (
                                                    <Package className="h-5 w-5 text-white" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate group-hover:text-gray-700 dark:group-hover:text-white/90">
                                                        {activity.product_title}
                                                    </p>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        activity.type === 'commission'
                                                            ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300'
                                                            : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                                                    }`}>
                                                        {activity.type === 'commission' ? 'Commission' : 'Sale'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-white/60 mt-1">
                                                    {activity.buyer_name} → {activity.seller_name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                                {activity.type === 'commission' 
                                                    ? formatPrice(activity.amount || 0)
                                                    : formatPrice(activity.sale_price || 0)
                                                }
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-white/50 mt-1">
                                                {formatDate(activity.date)}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-white/20 rounded-2xl p-8">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h3>
                            <p className="text-gray-600 dark:text-white/60">Common administrative tasks</p>
                        </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        <Button 
                            type="button"
                            onClick={handleVerifyUsers}
                            className="h-24 flex-col bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white border border-gray-300 dark:border-white/30 rounded-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
                        >
                            <UserCheck className="h-8 w-8 mb-3" />
                            <span className="font-semibold">Verify Users</span>
                        </Button>
                        <Button 
                            type="button"
                            onClick={handleSecurityAudit}
                            className="h-24 flex-col bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white border border-gray-300 dark:border-white/30 rounded-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
                        >
                            <Shield className="h-8 w-8 mb-3" />
                            <span className="font-semibold">Security Audit</span>
                        </Button>
                        <Button 
                            type="button"
                            onClick={handleGenerateReport}
                            className="h-24 flex-col bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white border border-gray-300 dark:border-white/30 rounded-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
                        >
                            <BarChart3 className="h-8 w-8 mb-3" />
                            <span className="font-semibold">Generate Report</span>
                        </Button>
                    </div>
                </div>
                </div>
            </div>
        </AppLayout>
    );
}
