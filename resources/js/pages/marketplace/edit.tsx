import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft,
    Upload,
    X,
    Camera,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Marketplace',
        href: '/marketplace',
    },
    {
        title: 'Edit Item',
        href: '#',
    },
];

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    condition: string;
    size: string;
    brand: string | null;
    color: string | null;
    category: {
        id: number;
        name: string;
    };
    images: string[];
}

interface EditItemPageProps {
    product: Product;
    categories: Category[];
}

const defaultCategories = Array.from(new Set([
    'T-shirt',
    'Polo',
    'Pants',
    'Jeans',
    'Shorts',
    'Skirts',
    'Dress',
    'Shoes',
    'Sandals',
    'Boots',
    'Sweaters',
    'Long Sleeves',
    'Hoodie',
    'Hat',
    'Jacket',
    'Accessories',
]));

export default function EditItem({ product, categories }: EditItemPageProps) {
    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>(product.images.map(img => `/storage/${img}`));
    const [existingImages, setExistingImages] = useState<string[]>(product.images);

    // Use case-insensitive deduplication to prevent duplicate categories
    const categoryMap = new Map<string, string>();

    // First, add database categories (these are the source of truth)
    if (categories && categories.length > 0) {
        categories.forEach((cat: any) => {
            const normalized = cat.name.toLowerCase();
            if (!categoryMap.has(normalized)) {
                categoryMap.set(normalized, cat.name); // Store original case
            }
        });
    }

    // Then add default categories only if they don't already exist
    defaultCategories.forEach((cat: string) => {
        const normalized = cat.toLowerCase();
        if (!categoryMap.has(normalized)) {
            categoryMap.set(normalized, cat);
        }
    });

    const effectiveCategories: string[] = Array.from(categoryMap.values())
        .sort((a, b) => a.localeCompare(b));

    const { data, setData, put, processing, errors } = useForm({
        title: product.title,
        description: product.description,
        price: product.price.toString(),
        condition: product.condition,
        size: product.size,
        brand: product.brand || '',
        color: product.color || '',
        category: product.category.name,
        images: [] as File[],
        keep_existing_images: true,
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
            setData('price', '');
            return;
        }

        // Format to 2 decimal places
        const formatted = numeric.toFixed(2);
        setData('price', formatted);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const totalImages = existingImages.length + images.length + files.length;
        
        if (totalImages > 5) {
            alert('Maximum 5 images allowed');
            return;
        }
        
        const newImages = [...images, ...files];
        setImages(newImages);
        
        // Create preview URLs for new images
        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls([...previewUrls, ...newPreviewUrls]);
        
        setData('images', newImages);
    };

    const removeExistingImage = (index: number) => {
        const newExisting = existingImages.filter((_, i) => i !== index);
        const newPreviews = previewUrls.filter((_, i) => i !== index);
        
        setExistingImages(newExisting);
        setPreviewUrls(newPreviews);
    };

    const removeNewImage = (index: number) => {
        const actualIndex = index - existingImages.length;
        const newImages = images.filter((_, i) => i !== actualIndex);
        const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
        
        setImages(newImages);
        setPreviewUrls(newPreviewUrls);
        setData('images', newImages);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('price', data.price);
        formData.append('condition', data.condition);
        formData.append('size', data.size);
        formData.append('brand', data.brand);
        formData.append('color', data.color);
        formData.append('category', data.category);
        
        // Add existing images to keep
        existingImages.forEach((img, index) => {
            formData.append(`existing_images[${index}]`, img);
        });
        
        // Add new images
        images.forEach((img, index) => {
            formData.append(`images[${index}]`, img);
        });
        
        put(`/marketplace/${product.id}`, {
            data: formData as any,
            forceFormData: true,
            onSuccess: () => {
                window.location.href = '/marketplace';
            }
        });
    };

    const apparelSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
    const shoeSizes = ['US 5', 'US 6', 'US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'];
    const waistSizes = ['W24', 'W26', 'W28', 'W30', 'W32', 'W34', 'W36', 'W38', 'W40', 'W42'];
    const sizeOptions = useMemo(() => {
        const normalized = data.category?.toLowerCase();
        if (normalized === 'shoes' || normalized === 'boots' || normalized === 'sandals') {
            return shoeSizes;
        }
        if (['pants', 'jeans', 'shorts'].includes(normalized || '')) {
            return waistSizes;
        }
        if (normalized === 'accessories' || normalized === 'hat') {
            return [];
        }
        return apparelSizes;
    }, [data.category]);

    useEffect(() => {
        const normalized = data.category?.toLowerCase();
        if (normalized === 'accessories' || normalized === 'hat') {
            setData('size', '');
            return;
        }
        if (data.size && !sizeOptions.includes(data.size)) {
            setData('size', '');
        }
    }, [data.category, data.size, sizeOptions, setData]);
    const conditions = [
        { value: 'new', label: 'New' },
        { value: 'like_new', label: 'Like New' },
        { value: 'good', label: 'Good' },
        { value: 'fair', label: 'Fair' },
        { value: 'poor', label: 'Poor' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Item" />
            
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-green-800/20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <Link 
                                href="/marketplace"
                                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Back to Marketplace</span>
                            </Link>
                        </div>
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Your Item</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Update your marketplace listing
                            </p>
                        </div>
                        <div className="w-24"></div> {/* Spacer for centering */}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid gap-8 lg:grid-cols-2">
                            {/* Left Column - Images */}
                            <Card className="border-gray-200 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Camera className="mr-2 h-5 w-5" />
                                        Product Images
                                    </CardTitle>
                                    <CardDescription>
                                        Upload up to 5 images total. Current: {previewUrls.length}/5
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {/* Image Upload Area */}
                                    <div className="space-y-4">
                                        {/* Image Previews */}
                                        {previewUrls.length > 0 && (
                                            <div className="grid grid-cols-2 gap-4">
                                                {previewUrls.map((url, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={url}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-32 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (index < existingImages.length) {
                                                                    removeExistingImage(index);
                                                                } else {
                                                                    removeNewImage(index);
                                                                }
                                                            }}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                        {index < existingImages.length && (
                                                            <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                                                Existing
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Upload Button */}
                                        {previewUrls.length < 5 && (
                                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                    id="image-upload"
                                                />
                                                <label
                                                    htmlFor="image-upload"
                                                    className="cursor-pointer flex flex-col items-center space-y-2"
                                                >
                                                    <Upload className="h-8 w-8 text-gray-400" />
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        <span className="font-medium text-green-600 hover:text-green-500">
                                                            Click to upload
                                                        </span>
                                                        {' '}or drag and drop
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        PNG, JPG, GIF up to 10MB each
                                                    </p>
                                                </label>
                                            </div>
                                        )}

                                        {errors.images && (
                                            <p className="text-sm text-red-600">{errors.images}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Right Column - Product Details */}
                            <div className="space-y-6">
                                {/* Basic Information */}
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

                                {/* Category and Brand */}
                                <Card className="border-gray-200 dark:border-gray-700">
                                    <CardHeader>
                                        <CardTitle>Category & Brand</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Category */}
                                        <div>
                                            <Label htmlFor="category">Category *</Label>
                                            <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[100]">
                                                    {effectiveCategories.map((category: string) => (
                                                        <SelectItem key={category} value={category}>{category}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.category && (
                                                <p className="text-sm text-red-600 mt-1">{errors.category}</p>
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
                                        {data.category && data.category.toLowerCase() !== 'accessories' && data.category.toLowerCase() !== 'hat' && (
                                            <div>
                                                <Label>
                                                    {['pants', 'jeans', 'shorts'].includes(data.category?.toLowerCase() || '')
                                                        ? 'Waist Size *'
                                                        : ['shoes', 'boots'].includes(data.category?.toLowerCase() || '')
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
                                        )}

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

                                {/* Condition */}
                                <Card className="border-gray-200 dark:border-gray-700">
                                    <CardHeader>
                                        <CardTitle>Condition</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <RadioGroup value={data.condition} onValueChange={(value) => setData('condition', value)}>
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
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <Link href="/marketplace">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {processing ? 'Updating...' : 'Update Item'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

