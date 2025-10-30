import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
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
    DollarSign,
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

interface AdminDashboardProps {
    stats: AdminStats;
}

export default function AdminDashboard({ stats }: AdminDashboardProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(price);
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
                    <div className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <Users className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">User Management</h3>
                                <p className="text-sm text-white/60">Manage user accounts and permissions</p>
                            </div>
                        </div>
                        <p className="text-sm text-white/70 mb-6 leading-relaxed">
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
                    <div className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                                <Clock className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Transaction Management</h3>
                                <p className="text-sm text-white/60">Monitor and manage transactions</p>
                            </div>
                        </div>
                        <p className="text-sm text-white/70 mb-6 leading-relaxed">
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
                    <div className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                <DollarSign className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Commission Management</h3>
                                <p className="text-sm text-white/60">Track platform earnings</p>
                            </div>
                        </div>
                        <p className="text-sm text-white/70 mb-6 leading-relaxed">
                            Monitor commission earnings, generate reports, and track financial performance.
                        </p>
                        <div className="space-y-3">
                            <Link href="/admin/commissions">
                                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 rounded-xl py-3 font-semibold transition-all duration-300 hover:shadow-lg">
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    View Commissions
                                </Button>
                            </Link>
                            <Link href="/admin/commissions/report">
                                <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl py-3 font-semibold transition-all duration-300">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Generate Report
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">Recent Activity</h3>
                            <p className="text-white/60">Latest system and user activity</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center h-40">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Activity className="h-10 w-10 text-white/40" />
                            </div>
                            <p className="text-xl font-semibold text-white mb-2">No recent activity</p>
                            <p className="text-white/60">Activity will appear here as users interact with the platform.</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">Quick Actions</h3>
                            <p className="text-white/60">Common administrative tasks</p>
                        </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        <Button className="h-24 flex-col bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-2xl transition-all duration-300 hover:scale-105">
                            <UserCheck className="h-8 w-8 mb-3" />
                            <span className="font-semibold">Verify Users</span>
                        </Button>
                        <Button className="h-24 flex-col bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-2xl transition-all duration-300 hover:scale-105">
                            <Shield className="h-8 w-8 mb-3" />
                            <span className="font-semibold">Security Audit</span>
                        </Button>
                        <Button className="h-24 flex-col bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-2xl transition-all duration-300 hover:scale-105">
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
