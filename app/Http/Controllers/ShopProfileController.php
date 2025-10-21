<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopProfileController extends Controller
{
    /**
     * Display the user's shop profile
     */
    public function index()
    {
        $products = Product::with(['category'])
            ->where('user_id', auth()->id())
            ->latest()
            ->get();

        $stats = [
            'totalItems' => $products->count(),
            'activeItems' => $products->where('status', 'active')->count(),
            'soldItems' => $products->where('status', 'sold')->count(),
            'inactiveItems' => $products->where('status', 'inactive')->count(),
            'totalViews' => $products->sum('views'),
            'totalValue' => $products->where('status', 'active')->sum('price'),
            'soldValue' => $products->where('status', 'sold')->sum('price'),
        ];

        return Inertia::render('shop-profile', [
            'products' => $products,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for editing a product
     */
    public function edit(Product $product)
    {
        // Ensure user can only edit their own products
        if ($product->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $product->load(['category']);
        $categories = \App\Models\Category::where('is_active', true)->get();

        return Inertia::render('shop-profile/edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified product
     */
    public function update(Request $request, Product $product)
    {
        // Ensure user can only update their own products
        if ($product->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'condition' => 'required|in:new,like_new,good,fair,poor',
            'size' => 'required|string|in:XS,S,M,L,XL,XXL,One Size',
            'brand' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
            'category_id' => 'required|exists:categories,id',
            'status' => 'required|in:active,inactive,sold',
        ]);

        $product->update($request->only([
            'title',
            'description',
            'price',
            'condition',
            'size',
            'brand',
            'color',
            'category_id',
            'status',
        ]));

        return redirect()->route('shop-profile.index')
            ->with('success', 'Product updated successfully!');
    }

    /**
     * Remove the specified product
     */
    public function destroy(Product $product)
    {
        // Ensure user can only delete their own products
        if ($product->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $product->delete();

        return redirect()->route('shop-profile.index')
            ->with('success', 'Product deleted successfully!');
    }

    /**
     * Toggle product status
     */
    public function toggleStatus(Request $request, Product $product)
    {
        // Ensure user can only modify their own products
        if ($product->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'status' => 'required|in:active,inactive,sold',
        ]);

        $product->update(['status' => $request->status]);

        return response()->json(['success' => true]);
    }
}
