import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { formatPrice } from '@/utils/price';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MessageCircle, 
  Eye, 
  Star,
  Shield,
  Truck,
  RotateCcw,
  User,
  Calendar,
  Tag,
  Package,
  ShoppingBag
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

interface Props {
  product: Product;
  relatedProducts: any[];
}

export default function ProductShow({ product, relatedProducts }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const { auth } = usePage().props as { auth: { user: any } };

  if (!product) {
    return (
      <AppLayout>
        <Head title="Product Not Found" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600">The product you're looking for doesn't exist.</p>
            <Link href="/marketplace">
              <Button className="mt-4">Back to Marketplace</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

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


  return (
    <AppLayout>
      <Head title={`${product.title} - Marketplace`} />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-green-800/20">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/dashboard" className="hover:text-green-600">Home</Link>
              <span>/</span>
              <Link href="/marketplace" className="hover:text-green-600">Marketplace</Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-white truncate">{product.title}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Column - Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={`/storage/${product.images[selectedImage]}`}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-24 w-24 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${
                        selectedImage === index 
                          ? 'border-green-500' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <img
                        src={`/storage/${image}`}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    <Tag className="h-3 w-3 mr-1" />
                    {product.category?.name || 'Uncategorized'}
                  </Badge>
                  {product.is_featured && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {product.title}
                </h1>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>by {product.user?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{product.views} views</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(product.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Price and Condition */}
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {formatPrice(product.price)}
                </div>
                <Badge className={conditionColors[product.condition as keyof typeof conditionColors]}>
                  {conditionLabels[product.condition as keyof typeof conditionLabels]}
                </Badge>
              </div>

              {/* Product Details */}
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Size:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{product.size}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Color:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{product.color || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Brand:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{product.brand || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Category:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{product.category?.name || 'Unknown'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-4">
                {auth.user && auth.user.id === product.user.id ? (
                  /* Own Product - Show Management Options */
                  <>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
                        This is your listing
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-300">
                        Manage your product below
                      </p>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => {
                          router.get(`/marketplace/${product.id}/edit`);
                        }}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Edit Listing
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          if (confirm('Mark this item as sold? This will remove it from the marketplace.')) {
                            router.patch(`/marketplace/${product.id}/mark-sold`);
                          }
                        }}
                      >
                        Mark as Sold
                      </Button>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button variant="outline" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  /* Other's Product - Show Buy/Contact Options */
                  <>
                    <div className="flex space-x-3">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                        onClick={() => {
                          // Check if user is logged in
                          if (!auth.user) {
                            alert('Please log in to purchase items');
                            return;
                          }
                          
                          // Check if product is active
                          if (product.status !== 'active') {
                            alert('This product is no longer available');
                            return;
                          }
                          
                          router.post(`/transactions/initiate/${product.id}`, {
                            payment_method: 'manual'
                          }, {
                            onSuccess: (page) => {
                              // Transaction will be created and user redirected to transaction page
                            },
                            onError: (errors) => {
                              alert('Failed to initiate transaction. Please try again.');
                            }
                          });
                        }}
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Buy Now
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setIsFavorited(!isFavorited)}
                      >
                        <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          router.get('/messages/conversation/get', {
                            user_id: product.user?.id,
                            product_id: product.id
                          });
                        }}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact Seller
                      </Button>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Shield className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Secure Payment</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Truck className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Fast Shipping</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <RotateCcw className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Easy Returns</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Products</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <Card key={relatedProduct.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                    <CardContent className="p-0">
                      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
                        {relatedProduct.images && relatedProduct.images.length > 0 ? (
                          <img 
                            src={`/storage/${relatedProduct.images[0]}`} 
                            alt={relatedProduct.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">
                          {relatedProduct.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {formatPrice(relatedProduct.price)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {relatedProduct.condition.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="mt-8">
            <Link href="/marketplace">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}