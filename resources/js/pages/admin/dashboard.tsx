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
            
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950">
                <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-8">
                {/* Modern Header */}
                <div className="flex items-center justify-end">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Crown className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-right">
                            <p className="text-white/60 text-sm">Admin Panel</p>
                            <p className="text-white font-semibold">System Control</p>
                        </div>
                    </div>
                </div>

                {/* Modern Page Title */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
                        <Shield className="h-6 w-6 text-yellow-400" />
                        <h1 className="text-3xl font-bold text-white">Administrative Control Center</h1>
                    </div>
                    <p className="text-lg text-white/70 max-w-4xl mx-auto leading-relaxed">
                        Comprehensive platform management with advanced analytics and user control systems. 
                        Monitor performance, manage resources, and maintain system integrity.
                    </p>
                </div>

                {/* Modern Stats Grid */}
                <div className="grid gap-6 md:grid-cols-4">
                    <div className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
                                <div className="text-sm text-white/60">Total Users</div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                    </div>
                    
                    <div className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                <UserCheck className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">{stats.activeUsers}</div>
                                <div className="text-sm text-white/60">Active Users</div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                    </div>
                    
                    <div className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">{stats.newThisWeek}</div>
                                <div className="text-sm text-white/60">New This Week</div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
                    </div>
                    
                    <div className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                <Package className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">{stats.totalWardrobeItems}</div>
                                <div className="text-sm text-white/60">Wardrobe Items</div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                    </div>
                </div>

                {/* Additional Modern Stats */}
                <div className="grid gap-6 md:grid-cols-4">
                    <div className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                                <ShoppingBag className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">{stats.totalProducts}</div>
                                <div className="text-sm text-white/60">Total Products</div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-600"></div>
                    </div>
                    
                    <div className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                                <Activity className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">{stats.activeProducts}</div>
                                <div className="text-sm text-white/60">Active Products</div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-600"></div>
                    </div>
                    
                    <div className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">{stats.totalTransactions}</div>
                                <div className="text-sm text-white/60">Total Transactions</div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-pink-600"></div>
                    </div>
                    
                    <div className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                                <Clock className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">{stats.pendingPayments}</div>
                                <div className="text-sm text-white/60">Pending Payments</div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                    </div>
                </div>

                {/* Financial Stats */}
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="group relative overflow-hidden bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6 hover:from-emerald-500/30 hover:to-green-500/30 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">{formatPrice(stats.totalCommissions)}</div>
                                <div className="text-sm text-white/60">Total Commissions</div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500"></div>
                    </div>
                    
                    <div className="group relative overflow-hidden bg-gradient-to-r from-green-500/20 to-teal-500/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 hover:from-green-500/30 hover:to-teal-500/30 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">{formatPrice(stats.thisMonthCommissions)}</div>
                                <div className="text-sm text-white/60">This Month</div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-teal-500"></div>
                    </div>
                    
                    <div className="group relative overflow-hidden bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 hover:from-blue-500/30 hover:to-indigo-500/30 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">{stats.completedTransactions}</div>
                                <div className="text-sm text-white/60">Completed Sales</div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                    </div>
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
