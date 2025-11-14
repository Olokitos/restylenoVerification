import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { formatPrice } from '@/utils/price';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
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
    seller_rating?: {
        average: number;
        count: number;
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
        sort?: string;
        favorites?: string | boolean;
        featured?: string | boolean;
        new?: string | boolean;
    };
    favoriteProductIds: number[];
}

type MarketplacePageOptionalFilters = Omit<MarketplacePageProps, 'filters' | 'favoriteProductIds'> & {
    filters?: MarketplacePageProps['filters'];
    favoriteProductIds?: number[];
};

export default function MarketplaceIndex({ 
    products, 
    categories, 
    featuredProducts, 
    filters,
    favoriteProductIds = []
}: MarketplacePageOptionalFilters) {
    const { auth } = usePage().props as { auth: { user: { id: number; name: string } } };
    const normalizedFilters = filters ?? {};
    const parseSizes = (value?: string) => (value ? value.split(',').filter(Boolean) : []);
    const safeCategories = Array.isArray(categories)
        ? [...categories].sort((a, b) => a.name.localeCompare(b.name))
        : [];
    const safeProducts = products ?? {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0,
    };

    const [favorites, setFavorites] = useState<number[]>(favoriteProductIds);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const deriveSort = (value: unknown) =>
        typeof value === 'string' && value.trim().length > 0 ? value : 'recommended';
    const [sortBy, setSortBy] = useState(deriveSort(normalizedFilters.sort));
    const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({});
    const [selectedSizes, setSelectedSizes] = useState<string[]>(() => parseSizes(normalizedFilters.size));
    const [selectedColor, setSelectedColor] = useState<string>(normalizedFilters.color || '');
    const isFavoritesView =
        normalizedFilters.favorites === '1' ||
        normalizedFilters.favorites === 'true' ||
        normalizedFilters.favorites === true;
    const isFeaturedView =
        normalizedFilters.featured === '1' ||
        normalizedFilters.featured === 'true' ||
        normalizedFilters.featured === true;
    const isNewView =
        normalizedFilters.new === '1' ||
        normalizedFilters.new === 'true' ||
        normalizedFilters.new === true;
    const activeCategory =
        typeof normalizedFilters.category === 'string' ? normalizedFilters.category : '';
    const navCategories = safeCategories;

    const buildCleanFilters = (overrides: Partial<MarketplacePageProps['filters']> = {}) => {
        const merged = { ...normalizedFilters, ...overrides };
        if (
            merged === null ||
            typeof merged !== 'object' ||
            Array.isArray(merged)
        ) {
            return {};
        }
        const cleaned: Record<string, string> = {};
        Object.entries(merged).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                cleaned[key] = value;
            }
        });
        return cleaned;
    };

    const navigateWithFilters = (overrides: Partial<MarketplacePageProps['filters']> = {}) => {
        const params = buildCleanFilters(overrides);
        router.get('/marketplace', params, { preserveState: true, preserveScroll: true });
    };

    useEffect(() => {
        setSelectedSizes(parseSizes(normalizedFilters.size));
        setSelectedColor(normalizedFilters.color || '');
        setSortBy(deriveSort(normalizedFilters.sort));
    }, [normalizedFilters.size, normalizedFilters.color, normalizedFilters.sort]);

    useEffect(() => {
        setFavorites(Array.isArray(favoriteProductIds) ? favoriteProductIds : []);
    }, [favoriteProductIds]);

    // Check if current user is the seller
    const isOwnProduct = (product: Product) => {
        return auth?.user && product.user.id === auth.user.id;
    };

    // Handle search functionality
    const handleSearch = (searchTerm: string) => {
        navigateWithFilters({ search: searchTerm });
    };

    // Handle filter changes
    const handleFilterChange = (filterType: keyof MarketplacePageProps['filters'], value: string) => {
        navigateWithFilters({ [filterType]: value || undefined });
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
        navigateWithFilters({ size: sizeFilter || undefined });
    };

    // Handle color filter change
    const handleColorChange = (color: string) => {
        setSelectedColor(color);
        navigateWithFilters({ color: color || undefined });
    };

    // Handle favorite toggle
    const toggleFavorite = (productId: number) => {
        if (!auth?.user) {
            router.get('/login');
            return;
        }

        const isFavorited = favorites.includes(productId);
        setFavorites(prev =>
            isFavorited ? prev.filter(id => id !== productId) : [...prev, productId]
        );

        const onError = () => {
            setFavorites(Array.isArray(favoriteProductIds) ? favoriteProductIds : []);
        };

        if (isFavorited) {
            router.delete(`/favorites/${productId}`, {
                preserveScroll: true,
                preserveState: true,
                onError,
            });
        } else {
            router.post(
                '/favorites',
                { product_id: productId },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onError,
                },
            );
        }
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
        navigateWithFilters({ sort: sortValue });
    };

    const goToFavorites = () => {
        if (!auth?.user) {
            router.get('/login');
            return;
        }

        if (isFavoritesView) {
            applyQuickFilters({ favorites: undefined });
        } else {
            applyQuickFilters({ favorites: '1' });
        }
    };

    const hasActiveFilters = Boolean(
        normalizedFilters.category ||
            normalizedFilters.condition ||
            normalizedFilters.size ||
            normalizedFilters.color ||
            isFavoritesView ||
            isFeaturedView ||
            isNewView,
    );

    const applyQuickFilters = (overrides: Partial<MarketplacePageProps['filters']>) => {
        navigateWithFilters({
            category: undefined,
            featured: undefined,
            new: undefined,
            favorites: undefined,
            ...overrides,
        });
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
                                <button
                                    type="button"
                                    onClick={goToFavorites}
                                    className={`rounded-full p-2 transition-colors ${
                                        isFavoritesView
                                            ? 'text-red-500 bg-white/10 hover:bg-white/20'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-white/10'
                                    }`}
                                    aria-pressed={isFavoritesView}
                                    title={isFavoritesView ? 'Show all items' : 'View favorites'}
                                >
                                    <Heart className={`h-5 w-5 ${isFavoritesView ? 'fill-current' : ''}`} />
                                </button>
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
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            <button
                                type="button"
                                className={cn(
                                    'whitespace-nowrap hover:text-green-600 transition-colors',
                                    !isFeaturedView &&
                                        !isNewView &&
                                        !activeCategory &&
                                        !isFavoritesView
                                        ? 'text-gray-900 dark:text-white'
                                        : undefined,
                                )}
                                onClick={() =>
                                    applyQuickFilters({
                                        category: undefined,
                                        featured: undefined,
                                        new: undefined,
                                        favorites: undefined,
                                    })
                                }
                            >
                                All Items
                            </button>
                            <button
                                type="button"
                                className={cn(
                                    'whitespace-nowrap hover:text-green-600 transition-colors',
                                    isFeaturedView ? 'text-gray-900 dark:text-white' : undefined,
                                )}
                                onClick={() =>
                                    applyQuickFilters({
                                        featured: '1',
                                    })
                                }
                            >
                                Featured
                            </button>
                            <button
                                type="button"
                                className={cn(
                                    'whitespace-nowrap hover:text-green-600 transition-colors',
                                    isNewView ? 'text-gray-900 dark:text-white' : undefined,
                                )}
                                onClick={() =>
                                    applyQuickFilters({
                                        new: '1',
                                    })
                                }
                            >
                                New Products
                            </button>
                            {navCategories.map((category) => (
                                <button
                                    type="button"
                                    key={category.id}
                                    className={cn(
                                        'whitespace-nowrap hover:text-green-600 transition-colors',
                                        activeCategory === category.id.toString()
                                            ? 'text-gray-900 dark:text-white'
                                            : undefined,
                                    )}
                                    onClick={() =>
                                        applyQuickFilters({
                                            category: category.id.toString(),
                                        })
                                    }
                                >
                                    {category.name}
                                </button>
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
                                        {hasActiveFilters && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedSizes([]);
                                                    setSelectedColor('');
                                                    setFavorites(Array.isArray(favoriteProductIds) ? favoriteProductIds : []);
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
                                            onValueChange={(value) =>
                                                applyQuickFilters({
                                                    category: value || undefined,
                                                })
                                            }
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="" id="all-categories" />
                                                    <Label htmlFor="all-categories" className="text-sm">All Categories</Label>
                                                </div>
                                                {safeCategories.map((category) => (
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
                                                {['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Gray', 'Denim'].map((color) => (
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
                                        {safeProducts.total ?? safeProducts.data.length ?? 0} items found
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
                            {!Array.isArray(safeProducts.data) || safeProducts.data.length === 0 ? (
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
                                    {safeProducts.data
                                        .filter(product => !isOwnProduct(product))
                                        .map((product) => (
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
                                                                    className="w-full h-full object-contain bg-white dark:bg-gray-900 transition-transform duration-200"
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
                                                                            title={
                                                                                favorites.includes(product.id)
                                                                                    ? 'Remove from favorites'
                                                                                    : 'Add to favorites'
                                                                            }
                                                                            aria-pressed={favorites.includes(product.id)}
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
                                                            <div className="min-h-[24px]">
                                                                {product.brand && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {product.brand}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center text-xs text-gray-500">
                                                                <Eye className="h-3 w-3 mr-1" />
                                                                {product.views}
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Product Title */}
                                                        <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                                                            {product.title}
                                                        </h3>
                                                        
                                                        {/* Seller and Rating */}
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                by {product.user.name}
                                                            </p>
                                                            {product.seller_rating && product.seller_rating.count > 0 && (
                                                                <div className="flex items-center gap-1 text-xs">
                                                                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                                                        {product.seller_rating.average.toFixed(1)}
                                                                    </span>
                                                                    <span className="text-gray-500 dark:text-gray-400">
                                                                        ({product.seller_rating.count})
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
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