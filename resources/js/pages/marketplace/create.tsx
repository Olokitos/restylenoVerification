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
import { useState } from 'react';

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

const defaultCategories = [
  'T-shirt',
  'Polo',
  'Pants',
  'Shorts',
  'Dress',
  'Jacket',
  'Shoes',
  'Hat',
  'Accessories',
  'Outerwear'
];

export default function SellItem({ categories }: SellItemPageProps) {
    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const effectiveCategories: string[] = Array.from(
      new Set([
        ...(categories && categories.length > 0 ? categories.map((cat: any) => cat.name) : []),
        ...defaultCategories,
      ])
    );

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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newImages = [...images, ...files].slice(0, 5); // Max 5 images
        setImages(newImages);
        
        // Create preview URLs
        const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
        setPreviewUrls(newPreviewUrls);
        
        setData('images', newImages);
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
        
        setImages(newImages);
        setPreviewUrls(newPreviewUrls);
        setData('images', newImages);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/marketplace', {
            forceFormData: true,
            onSuccess: () => {
                // Redirect to marketplace after listing the item
                window.location.href = '/marketplace';
            }
        });
    };

    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
    const conditions = [
        { value: 'new', label: 'New' },
        { value: 'like_new', label: 'Like New' },
        { value: 'good', label: 'Good' },
        { value: 'fair', label: 'Fair' },
        { value: 'poor', label: 'Poor' },
    ];

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
                                                            className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
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
                                                onChange={(e) => setData('price', e.target.value)}
                                                placeholder="0"
                                                className="mt-1"
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
                                        <div>
                                            <Label>Size *</Label>
                                            <RadioGroup value={data.size} onValueChange={(value) => setData('size', value)} className="mt-2">
                                                <div className="grid grid-cols-4 gap-2">
                                                    {sizes.map((size) => (
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
                                {processing ? 'Listing Item...' : 'List Item'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
