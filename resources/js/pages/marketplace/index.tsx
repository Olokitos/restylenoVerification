import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { formatPrice } from '@/utils/price';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Search, 
    Plus, 
    Star,
    Eye,
    ShoppingBag,
    ArrowRight,
    Filter,
    Heart,
    ShoppingCart,
    ChevronDown,
    Grid,
    List,
    SortAsc,
    MessageCircle,
    ChevronLeft,
    ChevronRight,
    Edit,
    Tag
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Marketplace',
        href: '/marketplace',
    },
];

interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    condition: string;
    size: string | null;
    brand: string | null;
    color: string | null;
    images: string[];
    views: number;
    is_featured: boolean;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
    category: {
        id: number;
        name: string;
    };
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface MarketplacePageProps {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: Category[];
    featuredProducts: Product[];
    filters: {
        category?: string;
        search?: string;
        min_price?: string;
        max_price?: string;
        condition?: string;
        size?: string;
        color?: string;
    };
}

export default function MarketplaceIndex({ 
    products, 
    categories, 
    featuredProducts, 
    filters 
}: MarketplacePageProps) {
    const { auth } = usePage().props as { auth: { user: { id: number; name: string } } };
    const [favorites, setFavorites] = useState<number[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('recommended');
    const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({});
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedColor, setSelectedColor] = useState<string>(filters?.color || '');

    // Check if current user is the seller
    const isOwnProduct = (product: Product) => {
        return auth?.user && product.user.id === auth.user.id;
    };

    // Handle search functionality
    const handleSearch = (searchTerm: string) => {
        router.get('/marketplace', { search: searchTerm }, { preserveState: true });
    };

    // Handle filter changes
    const handleFilterChange = (filterType: string, value: string) => {
        const newFilters = { ...filters, [filterType]: value };
        // Remove empty filters
        Object.keys(newFilters).forEach(key => {
            if (newFilters[key as keyof typeof newFilters] === '' || newFilters[key as keyof typeof newFilters] === undefined) {
                delete newFilters[key as keyof typeof newFilters];
            }
        });
        router.get('/marketplace', newFilters, { preserveState: true });
    };

    // Handle size filter toggle
    const handleSizeToggle = (size: string, checked: boolean) => {
        let newSizes: string[];
        if (checked) {
            newSizes = [...selectedSizes, size];
        } else {
            newSizes = selectedSizes.filter(s => s !== size);
        }
        setSelectedSizes(newSizes);
        
        const sizeFilter = newSizes.length > 0 ? newSizes.join(',') : '';
        handleFilterChange('size', sizeFilter);
    };

    // Handle color filter change
    const handleColorChange = (color: string) => {
        setSelectedColor(color);
        handleFilterChange('color', color);
    };

    // Handle favorite toggle
    const toggleFavorite = (productId: number) => {
        setFavorites(prev => 
            prev.includes(productId) 
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
        // TODO: Implement backend favorite functionality
    };

    // Handle contact seller
    const contactSeller = (productId: number, sellerId: number, productTitle: string) => {
        router.get('/messages/conversation/get', {
            user_id: sellerId,
            product_id: productId
        });
    };

    // Handle sort change
    const handleSortChange = (sortValue: string) => {
        setSortBy(sortValue);
        router.get('/marketplace', { sort: sortValue }, { preserveState: true });
    };

    // Image navigation functions
    const nextImage = (productId: number, totalImages: number) => {
        setCurrentImageIndex(prev => ({
            ...prev,
            [productId]: ((prev[productId] || 0) + 1) % totalImages
        }));
    };

    const prevImage = (productId: number, totalImages: number) => {
        setCurrentImageIndex(prev => ({
            ...prev,
            [productId]: ((prev[productId] || 0) - 1 + totalImages) % totalImages
        }));
    };

    const getImageCount = (product: Product): number => {
        return product.images && product.images.length > 0 ? product.images.length : 0;
    };

    const getCurrentImage = (product: Product): string | null => {
        if (!product.images || product.images.length === 0) return null;
        const index = currentImageIndex[product.id] || 0;
        return product.images[index];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Marketplace" />
            
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-green-800/20">
                {/* Header Section */}
                <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo */}
                            <div className="flex-shrink-0">
                                <Link href="/dashboard" className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    RESTYLE
                                </Link>
                            </div>
                            
                            {/* Search Bar */}
                            <div className="flex-1 max-w-lg mx-8">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search for sustainable fashion..."
                                        className="pl-10 pr-4 py-2 w-full border-gray-300 dark:border-gray-600 rounded-lg"
                                        defaultValue={filters?.search || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value.length >= 2 || value.length === 0) {
                                                handleSearch(value);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            
                            {/* Right Actions */}
                            <div className="flex items-center space-x-4">
                                <Button variant="ghost" size="sm">
                                    <Heart className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                    <ShoppingCart className="h-5 w-5" />
                                </Button>
                                <Link href="/marketplace/create">
                                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Sell Item
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center space-x-8 py-3">
                            <Link href="/marketplace" className="text-sm font-medium text-gray-900 dark:text-white hover:text-green-600">
                                All Items
                            </Link>
                            <Link href="/marketplace?featured=true" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-green-600">
                                Featured
                            </Link>
                            <Link href="/marketplace?new=true" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-green-600">
                                New In
                            </Link>
                            <Link href="/marketplace?sale=true" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-green-600">
                                Sale
                            </Link>
                            {categories?.slice(0, 8).map((category) => (
                                <Link 
                                    key={category.id} 
                                    href={`/marketplace?category=${category.id}`}
                                    className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-green-600"
                                >
                                    {category.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Breadcrumbs */}
                <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                        <nav className="text-sm text-gray-500 dark:text-gray-400">
                            <Link href="/dashboard" className="hover:text-green-600">Home</Link>
                            <span className="mx-2">/</span>
                            <span className="text-gray-900 dark:text-white">Marketplace</span>
                        </nav>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex gap-6">
                        {/* Left Sidebar - Filters */}
                        <div className="w-64 flex-shrink-0">
                            <Card className="border-gray-200 dark:border-gray-700">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center">
                                            <Filter className="mr-2 h-4 w-4" />
                                            Filters
                                        </CardTitle>
                                        {(filters?.category || filters?.condition || filters?.size || filters?.color) && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedSizes([]);
                                                    setSelectedColor('');
                                                    router.get('/marketplace');
                                                }}
                                                className="text-xs text-red-600 hover:text-red-700"
                                            >
                                                Clear All
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Category Filter */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Category</h3>
                                        <RadioGroup 
                                            value={filters?.category || ''} 
                                            onValueChange={(value) => handleFilterChange('category', value)}
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="" id="all-categories" />
                                                    <Label htmlFor="all-categories" className="text-sm">All Categories</Label>
                                                </div>
                                                {categories?.map((category) => (
                                                    <div key={category.id} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={category.id.toString()} id={`category-${category.id}`} />
                                                        <Label htmlFor={`category-${category.id}`} className="text-sm">{category.name}</Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {/* Size Filter */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Size</h3>
                                        <div className="space-y-2">
                                            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                                                <div key={size} className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id={`size-${size}`} 
                                                        checked={selectedSizes.includes(size)}
                                                        onCheckedChange={(checked) => handleSizeToggle(size, checked as boolean)}
                                                    />
                                                    <Label htmlFor={`size-${size}`} className="text-sm cursor-pointer">{size}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Color Filter */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Color</h3>
                                        <RadioGroup 
                                            value={selectedColor} 
                                            onValueChange={handleColorChange}
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="" id="all-colors" />
                                                    <Label htmlFor="all-colors" className="text-sm cursor-pointer">All Colors</Label>
                                                </div>
                                                {['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Gray'].map((color) => (
                                                    <div key={color} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={color.toLowerCase()} id={`color-${color}`} />
                                                        <Label htmlFor={`color-${color}`} className="text-sm cursor-pointer">{color}</Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {/* Condition Filter */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Condition</h3>
                                        <RadioGroup 
                                            value={filters?.condition || ''} 
                                            onValueChange={(value) => handleFilterChange('condition', value)}
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="" id="all-conditions" />
                                                    <Label htmlFor="all-conditions" className="text-sm">All Conditions</Label>
                                                </div>
                                                {['new', 'like_new', 'good', 'fair', 'poor'].map((condition) => (
                                                    <div key={condition} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={condition} id={`condition-${condition}`} />
                                                        <Label htmlFor={`condition-${condition}`} className="text-sm capitalize">
                                                            {condition.replace('_', ' ')}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Sort and View Options */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {products?.total || 0} items found
                                    </span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <SortAsc className="h-4 w-4 text-gray-400" />
                                        <select 
                                            className="text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={sortBy}
                                            onChange={(e) => handleSortChange(e.target.value)}
                                        >
                                            <option value="recommended">Sort by: Recommended</option>
                                            <option value="price_low">Price: Low to High</option>
                                            <option value="price_high">Price: High to Low</option>
                                            <option value="newest">Newest First</option>
                                            <option value="popular">Most Popular</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button 
                                            variant={viewMode === 'grid' ? 'default' : 'outline'} 
                                            size="sm"
                                            onClick={() => setViewMode('grid')}
                                        >
                                            <Grid className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant={viewMode === 'list' ? 'default' : 'outline'} 
                                            size="sm"
                                            onClick={() => setViewMode('list')}
                                        >
                                            <List className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Products Grid */}
                            {!products || !products.data || products.data.length === 0 ? (
                                <Card className="border-gray-200 dark:border-gray-700">
                                    <CardContent className="p-12 text-center">
                                        <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No products found
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            Try adjusting your filters or be the first to list an item
                                        </p>
                                        <Link href="/marketplace/create">
                                            <Button className="bg-green-600 hover:bg-green-700 text-white">
                                                <Plus className="mr-2 h-4 w-4" />
                                                List First Item
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {products.data.map((product) => (
                                        <Card 
                                            key={product.id} 
                                            className="group border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                                        >
                                            <CardContent className="p-0">
                                                {/* Product Image */}
                                                <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden group">
                                                    {getCurrentImage(product) ? (
                                                        <>
                                                            <img 
                                                                src={`/storage/${getCurrentImage(product)}`} 
                                                                alt={product.title}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                            />
                                                            
                                                            {/* Image Navigation - Only show if multiple images */}
                                                            {getImageCount(product) > 1 && (
                                                                <>
                                                                    {/* Navigation Arrows */}
                                                                    <div className="absolute inset-0 flex items-center justify-between px-2 z-20 pointer-events-none">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                prevImage(product.id, getImageCount(product));
                                                                            }}
                                                                            className="bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 transform hover:scale-110 transition-all shadow-lg pointer-events-auto opacity-0 group-hover:opacity-100"
                                                                            aria-label="Previous image"
                                                                        >
                                                                            <ChevronLeft className="h-4 w-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                nextImage(product.id, getImageCount(product));
                                                                            }}
                                                                            className="bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 transform hover:scale-110 transition-all shadow-lg pointer-events-auto opacity-0 group-hover:opacity-100"
                                                                            aria-label="Next image"
                                                                        >
                                                                            <ChevronRight className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                    
                                                                    {/* Dots Indicator */}
                                                                    <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center gap-1.5 z-10">
                                                                        {Array.from({ length: getImageCount(product) }).map((_, index) => (
                                                                            <button
                                                                                key={index}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setCurrentImageIndex(prev => ({
                                                                                        ...prev,
                                                                                        [product.id]: index
                                                                                    }));
                                                                                }}
                                                                                className={`rounded-full transition-all ${
                                                                                    (currentImageIndex[product.id] || 0) === index 
                                                                                        ? 'bg-white w-2 h-2 scale-125 shadow-lg' 
                                                                                        : 'bg-white/60 hover:bg-white/80 w-1.5 h-1.5'
                                                                                }`}
                                                                                aria-label={`Go to image ${index + 1}`}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ShoppingBag className="h-12 w-12 text-gray-400" />
                                                        </div>
                                                    )}
                                                    
                                                    {/* Your Listing Badge */}
                                                    {isOwnProduct(product) && (
                                                        <Badge className="absolute top-2 left-2 bg-blue-600 text-white z-10">
                                                            Your Listing
                                                        </Badge>
                                                    )}
                                                    
                                                    {/* Discount Badge */}
                                                    {product.condition === 'new' && !isOwnProduct(product) && (
                                                        <Badge className="absolute top-2 left-2 bg-red-500 text-white z-10">
                                                            New
                                                        </Badge>
                                                    )}
                                                    
                                                    {/* Featured Badge */}
                                                    {product.is_featured && (
                                                        <Badge className="absolute top-2 right-2 bg-yellow-500 text-white z-10">
                                                            <Star className="h-3 w-3 mr-1" />
                                                            Featured
                                                        </Badge>
                                                    )}
                                                    
                                                    {/* Quick Actions Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-end justify-center pb-12 z-10">
                                                        <div className="flex space-x-2">
                                                            {isOwnProduct(product) ? (
                                                                <>
                                                                    {/* Own Product - Show Edit and Mark as Sold */}
                                                                    <Button 
                                                                        size="sm" 
                                                                        variant="secondary" 
                                                                        className="bg-white/95 hover:bg-white shadow-lg"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            router.get(`/marketplace/${product.id}/edit`);
                                                                        }}
                                                                        title="Edit listing"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button 
                                                                        size="sm" 
                                                                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (confirm('Mark this item as sold?')) {
                                                                                router.patch(`/marketplace/${product.id}/mark-sold`);
                                                                            }
                                                                        }}
                                                                        title="Mark as sold"
                                                                    >
                                                                        <Tag className="h-4 w-4" />
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {/* Other's Product - Show Favorite and Contact */}
                                                                    <Button 
                                                                        size="sm" 
                                                                        variant="secondary" 
                                                                        className={`bg-white/95 hover:bg-white ${favorites.includes(product.id) ? 'text-red-500' : ''} shadow-lg`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            toggleFavorite(product.id);
                                                                        }}
                                                                        title="Add to favorites"
                                                                    >
                                                                        <Heart className={`h-4 w-4 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                                                                    </Button>
                                                                    <Button 
                                                                        size="sm" 
                                                                        className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            contactSeller(product.id, product.user.id, product.title);
                                                                        }}
                                                                        title="Contact seller"
                                                                    >
                                                                        <MessageCircle className="h-4 w-4" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Product Info */}
                                                <div className="p-4">
                                                    {/* Brand/Style Tag */}
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {product.brand || 'RESTYLE'}
                                                        </Badge>
                                                        <div className="flex items-center text-xs text-gray-500">
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            {product.views}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Product Title */}
                                                    <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                                                        {product.title}
                                                    </h3>
                                                    
                                                    {/* Seller */}
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                        by {product.user.name}
                                                    </p>
                                                    
                                                    {/* Price and Condition */}
                                                    <div className="flex items-center justify-between mb-2">
                                                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                        {formatPrice(product.price)}
                                                    </span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {product.condition.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                    
                                                    {/* Size and Color */}
                                                    {(product.size || product.color) && (
                                                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                            {product.size && <span>Size: {product.size}</span>}
                                                            {product.color && <span>• Color: {product.color}</span>}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Action Button */}
                                                    <button 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            console.log('Navigating to product:', product.id);
                                                            console.log('Product data:', product);
                                                            router.get(`/marketplace/${product.id}`, {}, {
                                                                onStart: () => console.log('Navigation started'),
                                                                onFinish: () => console.log('Navigation finished'),
                                                                onError: (errors) => console.log('Navigation error:', errors)
                                                            });
                                                        }}
                                                        className="w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded text-sm font-medium flex items-center justify-center"
                                                    >
                                                        View Details
                                                        <ArrowRight className="ml-1 h-3 w-3" />
                                                    </button>
                                                </div>
                                            </CardContent>
                                        </Card>
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