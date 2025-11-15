<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MarketplaceController extends Controller
{
    /**
     * Display the marketplace index page
     */
    public function index(Request $request)
    {
        $query = Product::with(['user', 'category'])
            ->active()
            ->latest();

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%");
            });
        }

        // Filter by price range
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter by condition
        if ($request->filled('condition')) {
            $query->where('condition', $request->condition);
        }

        // Filter by size (supports multiple sizes separated by comma)
        if ($request->filled('size')) {
            $sizes = explode(',', $request->size);
            $query->whereIn('size', $sizes);
        }

        // Filter by color
        if ($request->filled('color')) {
            $query->where('color', 'like', '%' . $request->color . '%');
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        if ($request->boolean('new')) {
            $query->where('created_at', '>=', now()->subDays(14));
        }

        $favoriteProductIds = [];

        if ($request->user()) {
            $favoriteProductIds = $request->user()
                ->favoriteProducts()
                ->pluck('products.id')
                ->toArray();

            if ($request->boolean('favorites')) {
                if (!empty($favoriteProductIds)) {
                    $query->whereIn('id', $favoriteProductIds);
                } else {
                    // No favorites yet, return empty result set
                    $query->whereRaw('0 = 1');
                }
            }
        } elseif ($request->boolean('favorites')) {
            $query->whereRaw('0 = 1');
        }

        // Handle sorting
        if ($request->filled('sort')) {
            switch ($request->sort) {
                case 'price_low':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_high':
                    $query->orderBy('price', 'desc');
                    break;
                case 'newest':
                    $query->latest();
                    break;
                case 'popular':
                    $query->orderBy('views', 'desc');
                    break;
                default:
                    $query->latest();
            }
        }

        $products = $query->paginate(12);
        
        // Add rating data to products
        $products->getCollection()->transform(function ($product) {
            $ratingAverage = round($product->user->receivedRatings()->avg('rating') ?? 0, 1);
            $ratingCount = $product->user->receivedRatings()->count();
            $product->seller_rating = [
                'average' => $ratingAverage,
                'count' => $ratingCount,
            ];
            return $product;
        });
        
        $categories = Category::where(function ($query) {
                $query->where('is_active', true)
                    ->orWhereNull('is_active');
            })
            ->orderBy('name')
            ->get();
        $featuredProducts = Product::with(['user', 'category'])
            ->active()
            ->featured()
            ->latest()
            ->take(6)
            ->get();
        
        // Add rating data to featured products
        $featuredProducts->transform(function ($product) {
            $ratingAverage = round($product->user->receivedRatings()->avg('rating') ?? 0, 1);
            $ratingCount = $product->user->receivedRatings()->count();
            $product->seller_rating = [
                'average' => $ratingAverage,
                'count' => $ratingCount,
            ];
            return $product;
        });

        $filters = $request->only([
            'category',
            'search',
            'min_price',
            'max_price',
            'condition',
            'size',
            'color',
            'sort',
        ]);
        $filters['favorites'] = $request->boolean('favorites') ? '1' : null;
        $filters['featured'] = $request->boolean('featured') ? '1' : null;
        $filters['new'] = $request->boolean('new') ? '1' : null;

        return Inertia::render('marketplace/index', [
            'products' => $products,
            'categories' => $categories,
            'featuredProducts' => $featuredProducts,
            'filters' => $filters,
            'favoriteProductIds' => $favoriteProductIds,
        ]);
    }

    /**
     * Display a specific product
     */
    public function show(Product $product)
    {
        try {
            // Load relationships first
            $product->load(['user', 'category']);
            
            // Check if required relationships exist
            if (!$product->user) {
                \Log::error('Product ' . $product->id . ' has no user relationship');
                return redirect()->route('marketplace.index')->with('error', 'Product not found or invalid.');
            }
            
            if (!$product->category) {
                \Log::error('Product ' . $product->id . ' has no category relationship');
                return redirect()->route('marketplace.index')->with('error', 'Product not found or invalid.');
            }
            
            // Increment view count safely
            try {
                $product->increment('views');
            } catch (\Exception $e) {
                // Log error but don't fail the request
                \Log::warning('Failed to increment views for product ' . $product->id . ': ' . $e->getMessage());
            }
            
            // Get related products from the same category
            $relatedProducts = Product::with(['user', 'category'])
                ->active()
                ->where('category_id', $product->category_id)
                ->where('id', '!=', $product->id)
                ->take(4)
                ->get();

            $ratingAverage = round($product->user->receivedRatings()->avg('rating') ?? 0, 1);
            $ratingCount = $product->user->receivedRatings()->count();

            $eligibleTransactions = [];
            if (auth()->check()) {
                $eligibleTransactions = Transaction::with(['product', 'rating'])
                    ->where('buyer_id', auth()->id())
                    ->where('seller_id', $product->user_id)
                    ->where('status', 'completed')
                    ->whereDoesntHave('rating')
                    ->latest('completed_at')
                    ->get()
                    ->map(fn ($transaction) => [
                        'id' => $transaction->id,
                        'label' => sprintf(
                            '#%d · %s',
                            $transaction->id,
                            optional($transaction->completed_at)->diffForHumans() ?? 'recently'
                        ),
                        'product_title' => $transaction->product->title ?? 'Order',
                    ])
                    ->values()
                    ->toArray();
            }

            return Inertia::render('marketplace/show', [
                'product' => $product,
                'relatedProducts' => $relatedProducts,
                'sellerRatingSummary' => [
                    'average' => $ratingAverage,
                    'count' => $ratingCount,
                ],
                'ratingContext' => [
                    'eligibleTransactions' => $eligibleTransactions,
                    'canRate' => !empty($eligibleTransactions),
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in marketplace show: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return redirect()->route('marketplace.index')->with('error', 'An error occurred while loading the product.');
        }
    }

    /**
     * Show the form for creating a new product
     */
    public function create()
    {
        $categories = Category::where(function ($query) {
                $query->where('is_active', true)
                    ->orWhereNull('is_active');
            })
            ->orderBy('name')
            ->get();
        
        return Inertia::render('marketplace/create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created product
     */
    public function store(Request $request)
    {
        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => ['required', 'numeric', 'min:0.01', 'max:99999999.99'],
            'condition' => 'required|in:new,like_new,good,fair,poor',
            'brand' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
            'category' => 'required|string|max:100', // Accept category name
            'images' => 'required|array|min:1|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:10240', // 10MB max
        ];
        
        // Size is optional for Accessories and Hat
        $normalizedCategory = strtolower($request->category ?? '');
        if (!in_array($normalizedCategory, ['accessories', 'hat', 'hats'])) {
            $rules['size'] = 'required|string|max:20';
        } else {
            $rules['size'] = 'nullable|string|max:20';
        }
        
        $validated = $request->validate($rules);

        // Find or create category by name
        $category = Category::firstOrCreate(
            ['name' => $request->category],
            [
                'slug' => \Str::slug($request->category),
                'is_active' => true
            ]
        );

        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('products', 'public');
                $imagePaths[] = $path;
            }
        }

        $product = Product::create([
            'user_id' => auth()->id(),
            'category_id' => $category->id,
            'title' => $request->title,
            'description' => $request->description,
            'price' => (float) $validated['price'],
            'condition' => $request->condition,
            'size' => $request->size,
            'brand' => $request->brand,
            'color' => $request->color,
            'images' => $imagePaths,
            'status' => 'active',
        ]);

        return redirect()->route('marketplace.index')
            ->with('success', 'Product listed successfully! You can now view it in the marketplace.');
    }

    /**
     * Show the form for editing a product
     */
    public function edit(Product $marketplace)
    {
        // Ensure user can only edit their own products
        if ($marketplace->user_id != auth()->id()) {
            abort(403, 'You can only edit your own products.');
        }
        
        $product = $marketplace; // Alias for readability
        $categories = Category::where(function ($query) {
                $query->where('is_active', true)
                    ->orWhereNull('is_active');
            })
            ->orderBy('name')
            ->get();
        
        return Inertia::render('marketplace/edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    /**
     * Update an existing product
     */
    public function update(Request $request, Product $marketplace) // Parameter name must match route {marketplace}
    {
        // Ensure user can only update their own products
        if ($marketplace->user_id != auth()->id()) { // Use != instead of !== for type coercion
            abort(403, 'You can only update your own products.');
        }
        
        $product = $marketplace; // Alias for readability

        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => ['required', 'numeric', 'min:0.01', 'max:99999999.99'],
            'condition' => 'required|in:new,like_new,good,fair,poor',
            'brand' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
            'category' => 'required|string|max:100',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:10240',
            'existing_images' => 'nullable|array',
        ];
        
        // Size is optional for Accessories and Hat
        $normalizedCategory = strtolower($request->category ?? '');
        if (!in_array($normalizedCategory, ['accessories', 'hat', 'hats'])) {
            $rules['size'] = 'required|string|max:20';
        } else {
            $rules['size'] = 'nullable|string|max:20';
        }
        
        $validated = $request->validate($rules);

        // Find or create category by name
        $category = Category::firstOrCreate(
            ['name' => $request->category],
            [
                'slug' => \Str::slug($request->category),
                'is_active' => true
            ]
        );

        // Handle images - combine existing and new
        $imagePaths = $request->input('existing_images', []);
        
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('products', 'public');
                $imagePaths[] = $path;
            }
        }

        $updateData = [
            'title' => $request->title,
            'description' => $request->description,
            'price' => (float) $validated['price'],
            'condition' => $request->condition,
            'size' => $request->size,
            'brand' => $request->brand,
            'color' => $request->color,
            'category_id' => $category->id,
            'images' => $imagePaths,
        ];

        $product->update($updateData);

        return redirect()->route('marketplace.index')
            ->with('success', 'Product updated successfully!');
    }

    /**
     * Mark a product as sold
     */
    public function markAsSold(Product $product)
    {
        // Ensure user can only mark their own products as sold
        if ($product->user_id != auth()->id()) { // Use != instead of !== for type coercion
            abort(403, 'You can only mark your own products as sold.');
        }

        // Ensure product is currently active
        if ($product->status !== 'active') {
            return redirect()->back()->with('error', 'Only active products can be marked as sold.');
        }

        $product->update(['status' => 'sold']);

        return redirect()->back()->with('success', 'Product marked as sold successfully!');
    }


    /**
     * Get marketplace statistics for dashboard
     */
    public function stats()
    {
        $stats = [
            'total_products' => Product::active()->count(),
            'total_categories' => Category::where('is_active', true)->count(),
            'featured_products' => Product::active()->featured()->count(),
            'recent_products' => Product::active()->where('created_at', '>=', now()->subDays(7))->count(),
        ];

        return response()->json($stats);
    }
}