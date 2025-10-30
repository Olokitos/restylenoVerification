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
            
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/50 dark:via-emerald-950/30 dark:to-teal-950/50">
                {/* Updated header: clean, minimalist, like wardrobe */}
                <div className="border-b border-green-200/60 dark:border-green-800/50 bg-white/40 dark:bg-green-950/30 backdrop-blur-sm shadow-none">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-4 h-20">
                            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-400 rounded-xl flex items-center justify-center shadow-lg">
                                <Package className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-green-900 dark:text-white">My Shop Profile</h1>
                                <p className="text-green-800/70 dark:text-green-300/80 text-xs md:text-sm">Manage your items and track performance</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Row - lighter, pill-style cards */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                    <Card className="border-green-200 dark:border-green-800 bg-white/70 dark:bg-green-950/50 shadow-none">
                      <CardContent className="py-4 text-center">
                        <div className="text-xl font-bold text-green-600 dark:text-emerald-300">{stats.totalItems}</div>
                        <div className="text-xs text-gray-700 dark:text-gray-200">Total Items</div>
                      </CardContent>
                    </Card>
                    <Card className="border-green-200 dark:border-green-800 bg-white/70 dark:bg-green-950/50 shadow-none">
                      <CardContent className="py-4 text-center">
                        <div className="text-xl font-bold text-green-600 dark:text-emerald-300">{stats.activeItems}</div>
                        <div className="text-xs text-gray-700 dark:text-gray-200">Active</div>
                      </CardContent>
                    </Card>
                    <Card className="border-green-200 dark:border-green-800 bg-white/70 dark:bg-green-950/50 shadow-none">
                      <CardContent className="py-4 text-center">
                        <div className="text-xl font-bold text-green-600 dark:text-emerald-300">{stats.totalViews}</div>
                        <div className="text-xs text-gray-700 dark:text-gray-200">Views</div>
                      </CardContent>
                    </Card>
                    <Card className="border-green-200 dark:border-green-800 bg-white/70 dark:bg-green-950/50 shadow-none">
                      <CardContent className="py-4 text-center">
                        <div className="text-xl font-bold text-green-600 dark:text-emerald-300">{stats.totalSold}</div>
                        <div className="text-xs text-gray-700 dark:text-gray-200">Sold</div>
                      </CardContent>
                    </Card>
                    <Card className="border-green-200 dark:border-green-800 bg-white/70 dark:bg-green-950/50 shadow-none">
                      <CardContent className="py-4 text-center">
                        <div className="text-xl font-bold text-green-600 dark:text-emerald-300">₱{stats.totalValue.toLocaleString()}</div>
                        <div className="text-xs text-gray-700 dark:text-gray-200">Inventory Value</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Products Grid - wardrobe style */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                    {products.map((product) => (
                      <Card key={product.id} className="border-green-200 dark:border-green-800 bg-white/95 dark:bg-green-950/70 rounded-xl shadow hover:shadow-lg transition duration-200 p-2">
                        <CardContent className="px-2 pt-2 pb-2">
                          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-2 flex items-center justify-center">
                            <img
                              src={`/storage/${product.images[0]}`}
                              alt={product.title}
                              className="object-cover w-full h-full rounded-lg"
                              style={{ maxHeight: 220 }}
                            />
                          </div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-semibold text-green-800 dark:text-emerald-300 line-clamp-1">{product.title}</span>
                            <Badge className={`text-xs ml-2 border-none ${conditionColors[product.condition]}`}>{conditionLabels[product.condition]}</Badge>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-200 mb-1 line-clamp-1">{product.brand} {product.size}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{product.category?.name}</div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-lg font-bold text-green-600 dark:text-emerald-200">₱{product.price.toLocaleString()}</span>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(product)} title="Edit">
                                <Edit className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} title="Delete">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
            </div>
        </AppLayout>
    );
}