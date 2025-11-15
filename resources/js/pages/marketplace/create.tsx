import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft,
    Upload,
    X,
    Camera,
    Plus,
    Minus
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

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
        title: 'Sell Item',
        href: '/marketplace/create',
    },
];

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface SellItemPageProps {
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

export default function SellItem({ categories }: SellItemPageProps) {
    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

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

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        price: '',
        condition: '',
        size: '',
        brand: '',
        color: '',
        category: '', // only field for category
        images: [] as File[],
    });

    // Validation function
    const validateField = (field: string, value: any): string => {
        const normalizedCategory = data.category?.toLowerCase();
        const requiresSize = normalizedCategory !== 'accessories' && normalizedCategory !== 'hat';

        switch (field) {
            case 'title':
                if (!value || !value.trim()) {
                    return 'Product title is required';
                }
                if (value.trim().length < 3) {
                    return 'Product title must be at least 3 characters';
                }
                if (value.trim().length > 255) {
                    return 'Product title must not exceed 255 characters';
                }
                return '';
            case 'description':
                if (!value || !value.trim()) {
                    return 'Product description is required';
                }
                if (value.trim().length < 10) {
                    return 'Product description must be at least 10 characters';
                }
                if (value.trim().length > 5000) {
                    return 'Product description must not exceed 5000 characters';
                }
                return '';
            case 'price':
                if (!value || value === '') {
                    return 'Price is required';
                }
                const priceNum = parseFloat(value);
                if (isNaN(priceNum) || priceNum < 0.01) {
                    return 'Price must be at least ₱0.01';
                }
                if (priceNum > 99999999.99) {
                    return 'Price must not exceed ₱99,999,999.99';
                }
                return '';
            case 'category':
                if (!value || value === '') {
                    return 'Category is required';
                }
                return '';
            case 'size':
                if (requiresSize && (!value || value === '')) {
                    return 'Size is required for this category';
                }
                return '';
            case 'condition':
                if (!value || value === '') {
                    return 'Condition is required';
                }
                return '';
            case 'images':
                if (!value || value.length === 0) {
                    return 'At least one product image is required';
                }
                if (value.length > 5) {
                    return 'Maximum 5 images allowed';
                }
                // Validate file sizes and types
                for (const file of value) {
                    if (file.size > 10 * 1024 * 1024) {
                        return 'Each image must be less than 10MB';
                    }
                    if (!file.type.startsWith('image/')) {
                        return 'Only image files are allowed';
                    }
                }
                return '';
            case 'brand':
                if (value && value.length > 100) {
                    return 'Brand name must not exceed 100 characters';
                }
                return '';
            case 'color':
                if (value && value.length > 50) {
                    return 'Color must not exceed 50 characters';
                }
                return '';
            default:
                return '';
        }
    };

    // Validate all fields
    const validateForm = (): { isValid: boolean; errors: Record<string, string> } => {
        const normalizedCategory = data.category?.toLowerCase();
        const requiresSize = normalizedCategory !== 'accessories' && normalizedCategory !== 'hat';
        
        const newErrors: Record<string, string> = {};
        
        newErrors.title = validateField('title', data.title);
        newErrors.description = validateField('description', data.description);
        newErrors.price = validateField('price', data.price);
        newErrors.category = validateField('category', data.category);
        if (requiresSize) {
            newErrors.size = validateField('size', data.size);
        }
        newErrors.condition = validateField('condition', data.condition);
        newErrors.images = validateField('images', images);
        newErrors.brand = validateField('brand', data.brand);
        newErrors.color = validateField('color', data.color);

        setClientErrors(newErrors);
        const isValid = !Object.values(newErrors).some(error => error !== '');
        return { isValid, errors: newErrors };
    };

    // Handle field blur
    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const error = validateField(field, field === 'images' ? images : data[field as keyof typeof data]);
        setClientErrors(prev => ({ ...prev, [field]: error }));
    };

    // Get error message for a field (client-side or server-side)
    const getFieldError = (field: string): string => {
        if (touched[field] && clientErrors[field]) {
            return clientErrors[field];
        }
        if (errors[field]) {
            return Array.isArray(errors[field]) ? errors[field][0] : errors[field];
        }
        return '';
    };

    // Check if field has error
    const hasError = (field: string): boolean => {
        return !!(touched[field] && clientErrors[field]) || !!errors[field];
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        // Mark images as touched
        setTouched(prev => ({ ...prev, images: true }));
        
        // Validate file types and sizes
        const validFiles: File[] = [];
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                setClientErrors(prev => ({ ...prev, images: 'Only image files are allowed' }));
                continue;
            }
            if (file.size > 10 * 1024 * 1024) {
                setClientErrors(prev => ({ ...prev, images: 'Each image must be less than 10MB' }));
                continue;
            }
            validFiles.push(file);
        }
        
        const newImages = [...images, ...validFiles].slice(0, 5); // Max 5 images
        setImages(newImages);
        
        // Create preview URLs
        const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
        setPreviewUrls(newPreviewUrls);
        
        setData('images', newImages);
        
        // Validate and clear error if images are valid
        const error = validateField('images', newImages);
        setClientErrors(prev => ({ ...prev, images: error }));
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
        
        setImages(newImages);
        setPreviewUrls(newPreviewUrls);
        setData('images', newImages);
        
        // Revalidate images after removal
        if (touched.images) {
            const error = validateField('images', newImages);
            setClientErrors(prev => ({ ...prev, images: error }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Mark all fields as touched
        const allFields = ['title', 'description', 'price', 'category', 'size', 'condition', 'images', 'brand', 'color'];
        const newTouched: Record<string, boolean> = {};
        allFields.forEach(field => {
            newTouched[field] = true;
        });
        setTouched(newTouched);
        
        // Validate form
        const { isValid, errors } = validateForm();
        
        if (!isValid) {
            // Scroll to first error
            setTimeout(() => {
                const firstErrorField = Object.keys(errors).find(key => errors[key]);
                if (firstErrorField) {
                    const element = document.getElementById(firstErrorField) || 
                                  document.querySelector(`[name="${firstErrorField}"]`) ||
                                  document.querySelector(`[aria-label*="${firstErrorField}"]`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        (element as HTMLElement).focus();
                    }
                }
            }, 100);
            return;
        }
        
        post('/marketplace', {
            forceFormData: true,
            onSuccess: () => {
                // Redirect to marketplace after listing the item
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

    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value;
        if (raw === '') {
            setData('price', '');
            setClientErrors(prev => ({ ...prev, price: '' }));
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
        
        // Clear error if valid
        const numeric = parseFloat(formatted);
        if (!Number.isNaN(numeric) && numeric >= 0.01 && numeric <= 99999999.99) {
            setClientErrors(prev => ({ ...prev, price: '' }));
        }
    };

    const handlePriceBlur = () => {
        handleBlur('price');
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sell Item" />
            {/* Display global server-side errors */}
            {errors && Object.keys(errors).length > 0 && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-800 rounded">
                    {Object.entries(errors).map(([field, message]) => (
                        <div key={field}>{message}</div>
                    ))}
                </div>
            )}
            
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
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sell Your Item</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                List your sustainable fashion items for the community
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
                                        Upload up to 5 images of your item. First image will be the main display image.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {/* Image Upload Area */}
                                    <div className="space-y-4">
                                        {/* Upload Button */}
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
                                                            onClick={() => removeImage(index)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {getFieldError('images') && (
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-2">{getFieldError('images')}</p>
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
                                                onChange={(e) => {
                                                    setData('title', e.target.value);
                                                    if (touched.title) {
                                                        const error = validateField('title', e.target.value);
                                                        setClientErrors(prev => ({ ...prev, title: error }));
                                                    }
                                                }}
                                                onBlur={() => handleBlur('title')}
                                                placeholder="e.g., Vintage Denim Jacket"
                                                className={`mt-1 ${hasError('title') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                            />
                                            {getFieldError('title') && (
                                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{getFieldError('title')}</p>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <Label htmlFor="description">Description *</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => {
                                                    setData('description', e.target.value);
                                                    if (touched.description) {
                                                        const error = validateField('description', e.target.value);
                                                        setClientErrors(prev => ({ ...prev, description: error }));
                                                    }
                                                }}
                                                onBlur={() => handleBlur('description')}
                                                placeholder="Describe your item in detail..."
                                                className={`mt-1 min-h-[100px] ${hasError('description') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {data.description.length}/5000 characters
                                            </p>
                                            {getFieldError('description') && (
                                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{getFieldError('description')}</p>
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
                                                className={`mt-1 ${hasError('price') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                min={0.01}
                                                step={0.01}
                                                inputMode="decimal"
                                            />
                                            {getFieldError('price') && (
                                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{getFieldError('price')}</p>
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
                                            <Select 
                                                value={data.category} 
                                                onValueChange={(value) => {
                                                    setData('category', value);
                                                    if (touched.category) {
                                                        const error = validateField('category', value);
                                                        setClientErrors(prev => ({ ...prev, category: error }));
                                                    }
                                                }}
                                                onOpenChange={(open) => {
                                                    if (!open) {
                                                        handleBlur('category');
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className={`mt-1 ${hasError('category') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[100]">
                                                    {effectiveCategories.map((category: string) => (
                                                        <SelectItem key={category} value={category}>{category}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {getFieldError('category') && (
                                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{getFieldError('category')}</p>
                                            )}
                                        </div>

                                        {/* Brand */}
                                        <div>
                                            <Label htmlFor="brand">Brand (Optional)</Label>
                                            <Input
                                                id="brand"
                                                value={data.brand}
                                                onChange={(e) => {
                                                    setData('brand', e.target.value);
                                                    if (touched.brand) {
                                                        const error = validateField('brand', e.target.value);
                                                        setClientErrors(prev => ({ ...prev, brand: error }));
                                                    }
                                                }}
                                                onBlur={() => handleBlur('brand')}
                                                placeholder="e.g., Levi's, H&M, Zara"
                                                className={`mt-1 ${hasError('brand') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                            />
                                            {getFieldError('brand') && (
                                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{getFieldError('brand')}</p>
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
                                                <div>
                                                <RadioGroup 
                                                    value={data.size} 
                                                    onValueChange={(value) => {
                                                        setData('size', value);
                                                        setTouched(prev => ({ ...prev, size: true }));
                                                        const error = validateField('size', value);
                                                        setClientErrors(prev => ({ ...prev, size: error }));
                                                    }}
                                                    className={`mt-2 ${hasError('size') ? 'border-red-500' : ''}`}
                                                >
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
                                                {getFieldError('size') && (
                                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{getFieldError('size')}</p>
                                                )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Color */}
                                        <div>
                                            <Label htmlFor="color">Color (Optional)</Label>
                                            <Input
                                                id="color"
                                                value={data.color}
                                                onChange={(e) => {
                                                    setData('color', e.target.value);
                                                    if (touched.color) {
                                                        const error = validateField('color', e.target.value);
                                                        setClientErrors(prev => ({ ...prev, color: error }));
                                                    }
                                                }}
                                                onBlur={() => handleBlur('color')}
                                                placeholder="e.g., Blue, Red, Black"
                                                className={`mt-1 ${hasError('color') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                            />
                                            {getFieldError('color') && (
                                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{getFieldError('color')}</p>
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
                                        <RadioGroup 
                                            value={data.condition} 
                                            onValueChange={(value) => {
                                                setData('condition', value);
                                                setTouched(prev => ({ ...prev, condition: true }));
                                                const error = validateField('condition', value);
                                                setClientErrors(prev => ({ ...prev, condition: error }));
                                            }}
                                            className={hasError('condition') ? 'border-red-500' : ''}
                                        >
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
                                        {getFieldError('condition') && (
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-2">{getFieldError('condition')}</p>
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
                                {processing ? 'Listing Item...' : 'List Item'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
