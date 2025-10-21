<?php

namespace App\Http\Controllers;

use App\Models\WardrobeItem;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class WardrobeController extends Controller
{
    public function index(): Response
    {
        $wardrobeItems = WardrobeItem::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('wardrobe', [
            'wardrobeItems' => $wardrobeItems,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'brand' => 'required|string|max:50',
            'category' => 'required|string|max:50',
            'color' => 'required|string|max:20',
            'size' => 'required|string|max:10',
            'description' => 'nullable|string|max:200',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $wardrobeItem = new WardrobeItem([
            'user_id' => auth()->id(),
            'name' => $request->name,
            'brand' => $request->brand,
            'category' => $request->category,
            'color' => $request->color,
            'size' => $request->size,
            'description' => $request->description,
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            try {
                $image = $request->file('image');
                
                // Validate image size and type
                if ($image->getSize() > 2048 * 1024) { // 2MB limit
                    return redirect()->back()->withErrors(['image' => 'Image size must be less than 2MB.']);
                }

                $imagePath = $image->store('wardrobe', 'public');
                $wardrobeItem->image_path = $imagePath;
                
            } catch (\Exception $e) {
                \Log::error('Image upload failed: ' . $e->getMessage());
                return redirect()->back()->withErrors(['image' => 'Failed to upload image. Please try again.']);
            }
        }

        $wardrobeItem->save();

        return redirect()->route('wardrobe.index')->with('success', 'Wardrobe item added successfully!');
    }

    public function update(Request $request, $id): RedirectResponse
    {
        // Find the wardrobe item
        $wardrobeItem = WardrobeItem::findOrFail($id);
        
        // Debug: Log the request
        \Log::info('Update request received', [
            'wardrobeItem' => $wardrobeItem->id,
            'user_id' => auth()->id(),
            'request_data' => $request->all(),
            'has_file' => $request->hasFile('image')
        ]);

        // Ensure user can only update their own items
        if ($wardrobeItem->user_id != auth()->id()) { // Use != for type coercion
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:100',
            'brand' => 'required|string|max:50',
            'category' => 'required|string|max:50',
            'color' => 'required|string|max:20',
            'size' => 'required|string|max:10',
            'description' => 'nullable|string|max:200',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        // Update basic fields
        $wardrobeItem->update([
            'name' => $request->name,
            'brand' => $request->brand,
            'category' => $request->category,
            'color' => $request->color,
            'size' => $request->size,
            'description' => $request->description,
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            try {
                $image = $request->file('image');
                
                // Validate image size and type
                if ($image->getSize() > 2048 * 1024) { // 2MB limit
                    return redirect()->back()->withErrors(['image' => 'Image size must be less than 2MB.']);
                }

                // Delete old image if exists
                if ($wardrobeItem->image_path) {
                    Storage::disk('public')->delete($wardrobeItem->image_path);
                }

                $imagePath = $image->store('wardrobe', 'public');
                
                // Update image path
                $wardrobeItem->update(['image_path' => $imagePath]);
                
                \Log::info('Image updated successfully', [
                    'item_id' => $wardrobeItem->id,
                    'image_path' => $imagePath
                ]);
                
            } catch (\Exception $e) {
                \Log::error('Image upload failed: ' . $e->getMessage());
                return redirect()->back()->withErrors(['image' => 'Failed to upload image. Please try again.']);
            }
        }

        \Log::info('Wardrobe item updated successfully', [
            'item_id' => $wardrobeItem->id,
            'user_id' => auth()->id()
        ]);

        return redirect()->route('wardrobe.index')->with('success', 'Wardrobe item updated successfully!');
    }

    public function destroy($id): RedirectResponse
    {
        // Find the wardrobe item
        $wardrobeItem = WardrobeItem::findOrFail($id);
        
        // Debug: Log the request
        \Log::info('Delete request received', [
            'wardrobeItem' => $wardrobeItem->id,
            'user_id' => auth()->id()
        ]);

        // Ensure user can only delete their own items
        if ($wardrobeItem->user_id != auth()->id()) { // Use != for type coercion
            abort(403);
        }

        // Delete image if exists
        if ($wardrobeItem->image_path) {
            Storage::disk('public')->delete($wardrobeItem->image_path);
        }

        $wardrobeItem->delete();

        return redirect()->route('wardrobe.index')->with('success', 'Wardrobe item deleted successfully!');
    }

    public function create(): Response
    {
        return Inertia::render('Wardrobe');
    }

    public function show($id): Response
    {
        // Find the wardrobe item
        $wardrobeItem = WardrobeItem::findOrFail($id);
        
        // Ensure user can only view their own items
        if ($wardrobeItem->user_id != auth()->id()) { // Use != for type coercion
            abort(403);
        }

        return Inertia::render('wardrobe', [
            'wardrobeItems' => [$wardrobeItem],
        ]);
    }

    public function edit($id): Response
    {
        // Find the wardrobe item
        $wardrobeItem = WardrobeItem::findOrFail($id);
        
        // Ensure user can only edit their own items
        if ($wardrobeItem->user_id != auth()->id()) { // Use != for type coercion
            abort(403);
        }

        return Inertia::render('wardrobe', [
            'wardrobeItems' => [$wardrobeItem],
        ]);
    }
}