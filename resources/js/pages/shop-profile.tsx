import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Plus, 
    Edit, 
    Trash2, 
    Eye, 
    MoreVertical,
    Package,
    TrendingUp,
    Users,
    DollarSign,
    Star,
    Heart,
    Share2,
    Settings,
    BarChart3,
    Calendar,
    Tag,
    Image as ImageIcon,
    Grid3X3,
    List,
    Filter,
    Search
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    condition: string;
    size: string;
    brand: string;
    color: string;
    images: string[];
    views: number;
    status: string;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
    category: {
        id: number;
        name: string;
    };
}

interface ShopStats {
    totalItems: number;
    activeItems: number;
    soldItems: number;
    inactiveItems: number;
    totalViews: number;
    totalValue: number;
    soldValue: number;
}

interface Props {
    products: Product[];
    stats: ShopStats;
}

export default function ShopProfile({ products, stats }: Props) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');

    const conditionLabels = {
        new: 'Brand New',
        like_new: 'Like New',
        good: 'Good',
        fair: 'Fair',
        poor: 'Poor'
    };

    const conditionColors = {
        new: 'bg-green-100 text-green-800 border-green-200',
        like_new: 'bg-blue-100 text-blue-800 border-blue-200',
        good: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        fair: 'bg-orange-100 text-orange-800 border-orange-200',
        poor: 'bg-red-100 text-red-800 border-red-200'
    };

    const handleDelete = (productId: number) => {
        if (confirm('Are you sure you want to delete this item?')) {
            router.delete(`/shop-profile/${productId}`);
        }
    };

    const handleToggleStatus = (productId: number, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        router.patch(`/shop-profile/${productId}`, { status: newStatus });
    };

    const handleMarkAsSold = (productId: number) => {
        if (confirm('Mark this item as sold? This will remove it from the marketplace.')) {
            router.patch(`/marketplace/${productId}/mark-sold`);
        }
    };


    const formatPrice = (price: number) => {
        return `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout>
            <Head title="Shop Profile - Manage Your Items" />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950">
                {/* Modern Header */}
                <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-20">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <Package className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white">My Shop Profile</h1>
                                    <p className="text-white/60 text-sm">Manage your items and track performance</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="text-right">
                                    <p className="text-white/60 text-sm">Shop Status</p>
                                    <p className="text-white font-semibold">Active Seller</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page Title */}
                    <div className="text-center space-y-6 mb-12">
                        <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
                            <Package className="h-6 w-6 text-blue-400" />
                            <h2 className="text-3xl font-bold text-white">Shop Management</h2>
                        </div>
                        <p className="text-lg text-white/70 max-w-4xl mx-auto leading-relaxed">
                            Track your inventory, manage sales, and monitor your shop performance with comprehensive analytics and controls.
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                        <div className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                    <Package className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-white">{stats.totalItems}</div>
                                    <div className="text-sm text-white/60">Total Items</div>
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                        </div>

                        <div className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-white">{stats.activeItems}</div>
                                    <div className="text-sm text-white/60">Active Items</div>
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                        </div>

                        <div className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                    <Eye className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-white">{stats.totalViews}</div>
                                    <div className="text-sm text-white/60">Total Views</div>
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                        </div>

                        <div className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-white">{stats.soldItems}</div>
                                    <div className="text-sm text-white/60">Sold Items</div>
                                </div>
                            </div>
                            <div className="text-xs text-white/70 mt-2">{formatPrice(stats.soldValue)} earned</div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
                        </div>

                        <div className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-white">{formatPrice(stats.totalValue)}</div>
                                    <div className="text-sm text-white/60">Active Value</div>
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-8">
                        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search your items..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filter
                                </Button>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center bg-white/10 rounded-xl p-1">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className={`h-8 w-8 p-0 ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
                                    >
                                        <Grid3X3 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className={`h-8 w-8 p-0 ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
                                    >
                                        <List className="w-4 h-4" />
                                    </Button>
                                </div>
                                
                                <Link href="/marketplace/create">
                                    <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-xl px-6 py-2 font-semibold transition-all duration-300 hover:scale-105">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add New Item
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Items Management */}
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Your Items</h3>
                                <p className="text-white/70">
                                    Manage your listed items. You can edit, activate/deactivate, mark as sold, or delete them.
                                </p>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-white/60">
                                <span>{filteredProducts.length} items</span>
                                <span>•</span>
                                <span>{products.filter(p => p.status === 'active').length} active</span>
                                <span>•</span>
                                <span>{products.filter(p => p.status === 'sold').length} sold</span>
                            </div>
                        </div>
                        <div>
                            {filteredProducts.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Package className="h-12 w-12 text-blue-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">No items yet</h3>
                                    <p className="text-white/70 mb-6 max-w-md mx-auto">
                                        Start building your shop by adding your first item. Showcase your products to the community!
                                    </p>
                                    <Link href="/marketplace/create">
                                        <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-xl px-8 py-3 font-semibold transition-all duration-300 hover:scale-105">
                                            <Plus className="w-5 h-5 mr-2" />
                                            Add Your First Item
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className={viewMode === 'grid' 
                                    ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                                    : "space-y-4"
                                }>
                                    {filteredProducts.map((product) => (
                                        <div key={product.id} className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105">
                                            {/* Product Image */}
                                            <div className="relative aspect-square bg-gradient-to-br from-white/5 to-white/10 rounded-t-2xl overflow-hidden">
                                                {product.images && product.images.length > 0 ? (
                                                    <img 
                                                        src={`/storage/${product.images[0]}`} 
                                                        alt={product.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <div className="text-center">
                                                            <ImageIcon className="h-12 w-12 text-white/40 mx-auto mb-2" />
                                                            <p className="text-sm text-white/60">No image</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Overlay with actions */}
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <div className="flex space-x-2">
                                                        <Button size="sm" className="bg-white/90 hover:bg-white text-gray-900">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" className="bg-white/90 hover:bg-white text-gray-900">
                                                            <Heart className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" className="bg-white/90 hover:bg-white text-gray-900">
                                                            <Share2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                
                                                {/* Status Badge */}
                                                <div className="absolute top-3 left-3">
                                                    <Badge className={
                                                        product.status === 'active' 
                                                            ? 'bg-green-500/20 text-green-400 border-green-400/30 backdrop-blur-sm'
                                                            : product.status === 'sold'
                                                            ? 'bg-orange-500/20 text-orange-400 border-orange-400/30 backdrop-blur-sm'
                                                            : 'bg-white/20 text-white/80 border-white/30 backdrop-blur-sm'
                                                    }>
                                                        {product.status}
                                                    </Badge>
                                                </div>
                                                
                                                {/* Featured Badge */}
                                                {product.is_featured && (
                                                    <Badge className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 backdrop-blur-sm">
                                                        <Star className="h-3 w-3 mr-1" />
                                                        Featured
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            {/* Product Info */}
                                            <div className="p-5">
                                                <div className="flex items-center justify-between mb-3">
                                                    <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-400/30 backdrop-blur-sm">
                                                        <Tag className="h-3 w-3 mr-1" />
                                                        {product.category.name}
                                                    </Badge>
                                                    <div className="flex items-center text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        {product.views}
                                                    </div>
                                                </div>
                                                
                                                <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                                                    {product.title}
                                                </h3>
                                                
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-xl font-bold text-blue-400">
                                                        {formatPrice(product.price)}
                                                    </span>
                                                    <Badge className={
                                                        product.condition === 'new' 
                                                            ? 'bg-green-500/20 text-green-400 border-green-400/30 backdrop-blur-sm'
                                                            : product.condition === 'like_new'
                                                            ? 'bg-blue-500/20 text-blue-400 border-blue-400/30 backdrop-blur-sm'
                                                            : product.condition === 'good'
                                                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30 backdrop-blur-sm'
                                                            : product.condition === 'fair'
                                                            ? 'bg-orange-500/20 text-orange-400 border-orange-400/30 backdrop-blur-sm'
                                                            : 'bg-red-500/20 text-red-400 border-red-400/30 backdrop-blur-sm'
                                                    }>
                                                        {conditionLabels[product.condition as keyof typeof conditionLabels]}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="text-xs text-white/60 mb-4 space-y-1">
                                                    <div className="flex items-center">
                                                        <span className="font-medium">Size:</span>
                                                        <span className="ml-2">{product.size}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="font-medium">Color:</span>
                                                        <span className="ml-2">{product.color || 'N/A'}</span>
                                                    </div>
                                                    {product.brand && (
                                                        <div className="flex items-center">
                                                            <span className="font-medium">Brand:</span>
                                                            <span className="ml-2">{product.brand}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                    
                                                {/* Action Buttons */}
                                                <div className="space-y-2">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            className="text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
                                                            onClick={() => setSelectedProduct(product)}
                                                        >
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            View
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            className="text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
                                                            onClick={() => router.get(`/shop-profile/${product.id}/edit`)}
                                                        >
                                                            <Edit className="h-3 w-3 mr-1" />
                                                            Edit
                                                        </Button>
                                                    </div>
                                                    
                                                    {/* Status-specific actions */}
                                                    {product.status === 'active' && (
                                                        <Button 
                                                            size="sm" 
                                                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 rounded-xl text-xs font-semibold transition-all duration-300 hover:scale-105"
                                                            onClick={() => handleMarkAsSold(product.id)}
                                                        >
                                                            <DollarSign className="h-3 w-3 mr-1" />
                                                            Mark as Sold
                                                        </Button>
                                                    )}
                                                    
                                                    {product.status === 'sold' && (
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            className="w-full bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400/30 text-red-400 hover:bg-red-500/30 text-xs font-semibold transition-all duration-300 hover:scale-105"
                                                            onClick={() => handleDelete(product.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3 mr-1" />
                                                            Delete
                                                        </Button>
                                                    )}
                                                    
                                                    {product.status !== 'sold' && (
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                className="text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
                                                                onClick={() => handleToggleStatus(product.id, product.status)}
                                                            >
                                                                {product.status === 'active' ? 'Hide' : 'Show'}
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                onClick={() => handleDelete(product.id)}
                                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/20 border-red-400/30 text-xs bg-red-500/10"
                                                            >
                                                                <Trash2 className="h-3 w-3 mr-1" />
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}