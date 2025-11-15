import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Save, X } from 'lucide-react';
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
    category_id: number;
    status: string;
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

interface EditProductPageProps {
    product: Product;
    categories: Category[];
}

export default function EditProduct({ product, categories }: EditProductPageProps) {
    // Format price to 2 decimal places when initializing
    const formatPrice = (price: number | string | null | undefined): string => {
        if (price === null || price === undefined || price === '') {
            return '0.00';
        }
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        if (isNaN(numPrice)) {
            return '0.00';
        }
        return numPrice.toFixed(2);
    };

    const { data, setData, patch, processing, errors } = useForm({
        title: product.title,
        description: product.description,
        price: formatPrice(product.price),
        condition: product.condition,
        size: product.size || '',
        brand: product.brand || '',
        color: product.color || '',
        category_id: product.category_id.toString(),
        status: product.status,
    });

    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value;
        if (raw === '') {
            setData('price', '');
            return;
        }

        // Allow digits and one decimal point
        const cleaned = raw.replace(/[^\d.]/g, '');
        // Ensure only one decimal point
        const parts = cleaned.split('.');
        const formatted = parts.length > 2 
            ? parts[0] + '.' + parts.slice(1).join('')
            : cleaned;

        // Limit to 2 decimal places
        if (formatted.includes('.')) {
            const [integer, decimals] = formatted.split('.');
            const limited = decimals.length > 2 ? integer + '.' + decimals.substring(0, 2) : formatted;
            setData('price', limited);
        } else {
            setData('price', formatted);
        }
    };

    const handlePriceBlur = () => {
        if (!data.price) {
            return;
        }

        const numeric = parseFloat(data.price);
        if (Number.isNaN(numeric) || numeric < 0.01) {
            setData('price', formatPrice(product.price)); // Reset to original if invalid
            return;
        }

        // Format to 2 decimal places
        const formatted = numeric.toFixed(2);
        setData('price', formatted);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/shop-profile/${product.id}`, {
            onSuccess: () => {
                // Redirect handled by controller
            },
            onError: (errors) => {
                console.error('Update errors:', errors);
            }
        });
    };

    const apparelSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
    const shoeSizes = ['US 5', 'US 6', 'US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'];
    const waistSizes = ['W24', 'W26', 'W28', 'W30', 'W32', 'W34', 'W36', 'W38', 'W40', 'W42'];
    
    // Get current category name
    const currentCategory = categories.find(cat => cat.id.toString() === data.category_id);
    const categoryName = currentCategory?.name?.toLowerCase() || '';
    
    const sizeOptions = React.useMemo(() => {
        if (categoryName === 'shoes' || categoryName === 'boots') {
            return shoeSizes;
        }
        if (['pants', 'jeans', 'shorts'].includes(categoryName)) {
            return waistSizes;
        }
        if (categoryName === 'accessories' || categoryName === 'hat') {
            return [];
        }
        return apparelSizes;
    }, [categoryName]);

    // Update size when category changes
    React.useEffect(() => {
        if (categoryName === 'accessories' || categoryName === 'hat') {
            setData('size', '');
            return;
        }
        if (data.size && !sizeOptions.includes(data.size)) {
            setData('size', '');
        }
    }, [categoryName, data.size, sizeOptions, setData]);

    const conditions = [
        { value: 'new', label: 'New' },
        { value: 'like_new', label: 'Like New' },
        { value: 'good', label: 'Good' },
        { value: 'fair', label: 'Fair' },
        { value: 'poor', label: 'Poor' },
    ];

    return (
        <AppLayout>
            <Head title={`Edit ${product.title}`} />
            
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-green-800/20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <Link 
                                href="/shop-profile"
                                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Back to Shop Profile</span>
                            </Link>
                        </div>
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Product</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Update your product information
                            </p>
                        </div>
                        <div className="w-24"></div> {/* Spacer for centering */}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid gap-8 lg:grid-cols-2">
                            {/* Left Column - Basic Information */}
                            <Card className="border-gray-200 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Title */}
                                    <div>
                                        <Label htmlFor="title">Product Title *</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="e.g., Vintage Denim Jacket"
                                            className="mt-1"
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <Label htmlFor="description">Description *</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Describe your item in detail..."
                                            className="mt-1 min-h-[100px]"
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                                        )}
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <Label htmlFor="price">Price (₱) *</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            value={data.price}
                                            onChange={handlePriceChange}
                                            onBlur={handlePriceBlur}
                                            placeholder="0.00"
                                            className="mt-1"
                                            min={0.01}
                                            step={0.01}
                                            inputMode="decimal"
                                        />
                                        {errors.price && (
                                            <p className="text-sm text-red-600 mt-1">{errors.price}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Right Column - Category and Details */}
                            <div className="space-y-6">
                                {/* Category and Brand */}
                                <Card className="border-gray-200 dark:border-gray-700">
                                    <CardHeader>
                                        <CardTitle>Category & Brand</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Category */}
                                        <div>
                                            <Label htmlFor="category">Category *</Label>
                                            <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.category_id && (
                                                <p className="text-sm text-red-600 mt-1">{errors.category_id}</p>
                                            )}
                                        </div>

                                        {/* Brand */}
                                        <div>
                                            <Label htmlFor="brand">Brand (Optional)</Label>
                                            <Input
                                                id="brand"
                                                value={data.brand}
                                                onChange={(e) => setData('brand', e.target.value)}
                                                placeholder="e.g., Levi's, H&M, Zara"
                                                className="mt-1"
                                            />
                                            {errors.brand && (
                                                <p className="text-sm text-red-600 mt-1">{errors.brand}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Size and Color */}
                                <Card className="border-gray-200 dark:border-gray-700">
                                    <CardHeader>
                                        <CardTitle>Size & Color</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Size */}
                                        {categoryName !== 'accessories' && categoryName !== 'hat' ? (
                                            <div>
                                                <Label>
                                                    {['pants', 'jeans', 'shorts'].includes(categoryName)
                                                        ? 'Waist Size *'
                                                        : ['shoes', 'boots'].includes(categoryName)
                                                        ? 'Shoe Size *'
                                                        : 'Size *'}
                                                </Label>
                                                <RadioGroup value={data.size} onValueChange={(value) => setData('size', value)} className="mt-2">
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {sizeOptions.map((size) => (
                                                            <div key={size} className="flex items-center space-x-2">
                                                                <RadioGroupItem value={size} id={`size-${size}`} />
                                                                <Label htmlFor={`size-${size}`} className="text-sm">
                                                                    {size}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </RadioGroup>
                                                {errors.size && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.size}</p>
                                                )}
                                            </div>
                                        ) : null}

                                        {/* Color */}
                                        <div>
                                            <Label htmlFor="color">Color (Optional)</Label>
                                            <Input
                                                id="color"
                                                value={data.color}
                                                onChange={(e) => setData('color', e.target.value)}
                                                placeholder="e.g., Blue, Red, Black"
                                                className="mt-1"
                                            />
                                            {errors.color && (
                                                <p className="text-sm text-red-600 mt-1">{errors.color}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Condition and Status */}
                                <Card className="border-gray-200 dark:border-gray-700">
                                    <CardHeader>
                                        <CardTitle>Condition & Status</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Condition */}
                                        <div>
                                            <Label>Condition *</Label>
                                            <RadioGroup value={data.condition} onValueChange={(value) => setData('condition', value)} className="mt-2">
                                                <div className="space-y-3">
                                                    {conditions.map((condition) => (
                                                        <div key={condition.value} className="flex items-center space-x-2">
                                                            <RadioGroupItem value={condition.value} id={`condition-${condition.value}`} />
                                                            <Label htmlFor={`condition-${condition.value}`} className="text-sm">
                                                                {condition.label}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </RadioGroup>
                                            {errors.condition && (
                                                <p className="text-sm text-red-600 mt-2">{errors.condition}</p>
                                            )}
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <Label>Status *</Label>
                                            <RadioGroup value={data.status} onValueChange={(value) => setData('status', value)} className="mt-2">
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="active" id="status-active" />
                                                        <Label htmlFor="status-active" className="text-sm">Active (Visible in marketplace)</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="inactive" id="status-inactive" />
                                                        <Label htmlFor="status-inactive" className="text-sm">Inactive (Hidden from marketplace)</Label>
                                                    </div>
                                                </div>
                                            </RadioGroup>
                                            {errors.status && (
                                                <p className="text-sm text-red-600 mt-2">{errors.status}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <Link href="/shop-profile">
                                <Button type="button" variant="outline">
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                            </Link>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {processing ? 'Updating...' : 'Update Product'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}