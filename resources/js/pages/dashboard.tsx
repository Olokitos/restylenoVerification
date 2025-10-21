import AppLayoutTemplate from '@/layouts/app/app-header-layout';
import { dashboard } from '@/routes';
import { edit } from '@/routes/profile';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { User, Shirt, Store, ArrowRight, Settings, ShoppingBag, Heart, RefreshCw } from 'lucide-react';
import { useAuthNavigation } from '@/hooks/use-auth-navigation';

import { Button } from '@/components/ui/button';

interface DashboardStats {
    wardrobeItems: number;
    outfitsCreated: number;
    itemsTraded: number;
    marketplaceStats: {
        totalProducts: number;
        totalCategories: number;
        featuredProducts: number;
        recentProducts: number;
    };
}

interface DashboardProps {
    stats: DashboardStats;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({ stats }: DashboardProps) {
    useAuthNavigation();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshStats = () => {
        setIsRefreshing(true);
        router.reload({ 
            only: ['stats'],
            onFinish: () => setIsRefreshing(false)
        });
    };

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-green-800/20">
                <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-6">
                {/* Welcome Section */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                        Welcome to Restyle
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Transform your wardrobe, reduce waste, and discover sustainable fashion. 
                        Manage your profile, organize your wardrobe, and explore the marketplace.
                    </p>
                </div>

                {/* Main Feature Cards */}
                <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto w-full">
                    {/* Manage Profile Card */}
                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-800/40 dark:to-green-700/30 border border-gray-200 dark:border-green-600/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="p-8 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                                <User className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                                Manage Profile
                            </h3>
                            <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
                                Update your personal information, preferences, and manage account settings.
                            </p>
                            <Link href={edit()}>
                                <Button className="w-full bg-green-500 hover:bg-green-600 text-white group-hover:scale-105 transition-transform duration-200">
                                    <User className="mr-2 h-4 w-4" />
                                    Manage Profile
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Manage Wardrobe Card */}
                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-800/40 dark:to-green-700/30 border border-gray-200 dark:border-green-600/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="p-8 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                                <Shirt className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                                Manage Wardrobe
                            </h3>
                            <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
                                Organize your clothes, create outfits, and track your sustainable journey.
                            </p>
                            <Link href="/wardrobe">
                                <Button className="w-full bg-green-500 hover:bg-green-600 text-white group-hover:scale-105 transition-transform duration-200">
                                    <Shirt className="mr-2 h-4 w-4" />
                                    Manage Wardrobe
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Marketplace Card */}
                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-800/40 dark:to-green-700/30 border border-gray-200 dark:border-green-600/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="p-8 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                                <Store className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                                Marketplace
                            </h3>
                            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                                Buy and sell pre-loved items, discover new styles, connect with other users.
                            </p>
                            
                            {/* Marketplace Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                                <div className="bg-white/50 dark:bg-gray-800/70 rounded-lg p-3">
                                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                                        {stats.marketplaceStats?.totalProducts || 11}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Products</div>
                                </div>
                                <div className="bg-white/50 dark:bg-gray-800/70 rounded-lg p-3">
                                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                                        {stats.marketplaceStats?.featuredProducts || 5}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Personal</div>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Link href="/marketplace">
                                    <Button className="w-full bg-green-500 hover:bg-green-600 text-white group-hover:scale-105 transition-transform duration-200">
                                        <ShoppingBag className="mr-2 h-4 w-4" />
                                        Explore Marketplace
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                                <Link href="/marketplace/create">
                                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                        <Heart className="mr-2 h-4 w-4" />
                                        Sell Item
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
                    <div className="text-white">
                        <h2 className="text-lg font-semibold">
                            Your Sustainable Fashion Journey
                        </h2>
                    </div>
                    <Button
                        onClick={refreshStats}
                        size="sm"
                        disabled={isRefreshing}
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </Button>
                </div>
                </div>
            </div>
        </AppLayoutTemplate>
    );
}
