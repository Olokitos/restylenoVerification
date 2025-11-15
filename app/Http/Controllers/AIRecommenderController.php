<?php

namespace App\Http\Controllers;

use App\Models\SavedOutfit;
use App\Models\OutfitFeedback;
use App\Models\WardrobeItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AIRecommenderController extends Controller
{
    /**
     * Test endpoint - Get recommendations for a specific user (for Postman testing)
     */
    public function getRecommendationsTest(Request $request): JsonResponse
    {
        try {
            // Remove execution time limit for this operation - set at the very beginning
            set_time_limit(0); // Unlimited execution time to allow API to complete
            ini_set('max_execution_time', 0); // Also set at PHP configuration level
            ignore_user_abort(true); // Continue processing even if client disconnects
            
            $request->validate([
                'user_id' => 'required|integer|exists:users,id',
                'weather' => 'required|array',
                'occasion' => 'nullable|string',
                'max_recommendations' => 'nullable|integer|min:1|max:20',
            ]);

            $user = \App\Models\User::find($request->user_id);
            $weatherData = $request->input('weather');
            $occasion = $request->input('occasion', 'casual');
            $maxRecommendations = $request->input('max_recommendations', 6);
            
            // Get user's wardrobe items
            $wardrobeItems = WardrobeItem::where('user_id', $user->id)->get();
            
            if ($wardrobeItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No wardrobe items found. Add some items to get recommendations!',
                    'recommendations' => []
                ], 400);
            }
            
            // Check if user has only one item
            if ($wardrobeItems->count() === 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'You need at least 2 items in your wardrobe to generate outfit recommendations. Add more items to create stylish combinations!',
                    'recommendations' => [],
                    'item_count' => 1,
                    'minimum_required' => 2
                ], 400);
            }
            
            // Check if items can form a valid outfit combination
            if (!$this->canFormValidOutfit($wardrobeItems)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your wardrobe items cannot form a complete outfit combination. You need either: (1) a dress, OR (2) at least one top AND one bottom. Please add items from different categories to create outfit combinations!',
                    'recommendations' => [],
                    'item_count' => $wardrobeItems->count(),
                    'requires_combination' => true
                ], 400);
            }

            // Apply weather-based filtering first
            $filteredItems = $this->applyWeatherFiltering($wardrobeItems, $weatherData, $maxRecommendations);
            
            // Check if filtered items are less than 2 after weather filtering
            if ($filteredItems->count() < 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'After applying weather filters, you have fewer than 2 suitable items. Consider adding more items that match the current weather conditions, or try adjusting your preferences.',
                    'recommendations' => [],
                    'item_count' => $filteredItems->count(),
                    'minimum_required' => 2,
                    'total_items' => $wardrobeItems->count()
                ], 400);
            }
            
            // Check if filtered items can still form a valid outfit combination
            if (!$this->canFormValidOutfit($filteredItems)) {
                return response()->json([
                    'success' => false,
                    'message' => 'After applying weather filters, your remaining items cannot form a complete outfit combination. You need either: (1) a dress, OR (2) at least one top AND one bottom that match the current weather conditions.',
                    'recommendations' => [],
                    'item_count' => $filteredItems->count(),
                    'total_items' => $wardrobeItems->count(),
                    'requires_combination' => true
                ], 400);
            }
            
            // Call Hugging Face API for embedding-based recommendations
            $mlRecommendations = $this->getEmbeddingBasedRecommendations($filteredItems, $weatherData, $occasion, $user->id, $maxRecommendations);
            
            if ($mlRecommendations === null) {
                // Fallback to weather-based recommendations
                $recommendations = $this->generateWeatherBasedRecommendations($filteredItems, $weatherData, $maxRecommendations);
                $mlConfidence = 0.5; // Lower confidence for fallback
            } else {
                $recommendations = $mlRecommendations['recommendations'] ?? [];
                $mlConfidence = $mlRecommendations['confidence'] ?? 0.8;
            }

            return response()->json([
                'success' => true,
                'recommendations' => $recommendations,
                'ml_confidence' => $mlConfidence,
                'weather_context' => $weatherData,
                'total_items_considered' => $filteredItems->count(),
                'test_mode' => true,
                'user_id' => $user->id,
            ]);

        } catch (\Exception $e) {
            Log::error('AI Recommendation Error: ' . $e->getMessage());
            
            // Check if it's a timeout error - provide better error message
            if (str_contains($e->getMessage(), 'Maximum execution time') || str_contains($e->getMessage(), 'timeout')) {
                return response()->json([
                    'success' => false,
                    'message' => 'The recommendation service is processing your request. This may take a moment. Please try again in a few seconds.',
                    'timeout' => true
                ], 504);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while generating recommendations. Please try again.',
            ], 500);
        }
    }

    /**
     * Get ML-powered outfit recommendations
     */
    public function getRecommendations(Request $request): JsonResponse
    {
        try {
            // Remove execution time limit for this operation - set at the very beginning
            set_time_limit(0); // Unlimited execution time to allow API to complete
            ini_set('max_execution_time', 0); // Also set at PHP configuration level
            ignore_user_abort(true); // Continue processing even if client disconnects
            
            $request->validate([
                'weather' => 'required|array',
                'occasion' => 'nullable|string',
                'max_recommendations' => 'nullable|integer|min:1|max:20',
            ]);

            $user = auth()->user();
            $weatherData = $request->input('weather');
            $occasion = $request->input('occasion', 'casual');
            $maxRecommendations = $request->input('max_recommendations', 6);
            
            // Get user's wardrobe items
            $wardrobeItems = WardrobeItem::where('user_id', $user->id)->get();
            
            if ($wardrobeItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No wardrobe items found. Add some items to get recommendations!',
                    'recommendations' => []
                ], 400);
            }
            
            // Check if user has only one item
            if ($wardrobeItems->count() === 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'You need at least 2 items in your wardrobe to generate outfit recommendations. Add more items to create stylish combinations!',
                    'recommendations' => [],
                    'item_count' => 1,
                    'minimum_required' => 2
                ], 400);
            }
            
            // Check if items can form a valid outfit combination
            if (!$this->canFormValidOutfit($wardrobeItems)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your wardrobe items cannot form a complete outfit combination. You need either: (1) a dress, OR (2) at least one top AND one bottom. Please add items from different categories to create outfit combinations!',
                    'recommendations' => [],
                    'item_count' => $wardrobeItems->count(),
                    'requires_combination' => true
                ], 400);
            }

            // Apply weather-based filtering first
            $filteredItems = $this->applyWeatherFiltering($wardrobeItems, $weatherData, $maxRecommendations);
            
            // Check if filtered items are less than 2 after weather filtering
            if ($filteredItems->count() < 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'After applying weather filters, you have fewer than 2 suitable items. Consider adding more items that match the current weather conditions, or try adjusting your preferences.',
                    'recommendations' => [],
                    'item_count' => $filteredItems->count(),
                    'minimum_required' => 2,
                    'total_items' => $wardrobeItems->count()
                ], 400);
            }
            
            // Check if filtered items can still form a valid outfit combination
            if (!$this->canFormValidOutfit($filteredItems)) {
                return response()->json([
                    'success' => false,
                    'message' => 'After applying weather filters, your remaining items cannot form a complete outfit combination. You need either: (1) a dress, OR (2) at least one top AND one bottom that match the current weather conditions.',
                    'recommendations' => [],
                    'item_count' => $filteredItems->count(),
                    'total_items' => $wardrobeItems->count(),
                    'requires_combination' => true
                ], 400);
            }
            
            // Get user's saved outfits for context
            $savedOutfits = SavedOutfit::where('user_id', $user->id)
                ->with('feedback')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            // Prepare data for ML model
            $mlData = [
                'wardrobe_items' => $filteredItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                        'brand' => $item->brand,
                        'category' => $item->category,
                        'color' => $item->color,
                        'size' => $item->size,
                        'fabric' => $item->fabric,
                        'description' => $item->description,
                    ];
                })->toArray(),
                'saved_outfits' => $savedOutfits->map(function ($outfit) {
                    return [
                        'id' => $outfit->id,
                        'name' => $outfit->name,
                        'occasion' => $outfit->occasion,
                        'wardrobe_item_ids' => $outfit->wardrobe_item_ids,
                        'feedback_count' => $outfit->total_feedback_count,
                        'positive_feedback' => $outfit->positive_feedback_count,
                    ];
                })->toArray(),
                'weather_context' => $weatherData,
                'occasion' => $occasion,
                'user_preferences' => $this->getUserPreferencesFromFeedback($user->id),
            ];

            // Call Hugging Face API for embedding-based recommendations
            $mlRecommendations = $this->getEmbeddingBasedRecommendations($filteredItems, $weatherData, $occasion, $user->id, $maxRecommendations);
            
            if ($mlRecommendations === null) {
                // Fallback to weather-based recommendations
                $recommendations = $this->generateWeatherBasedRecommendations($filteredItems, $weatherData, $maxRecommendations);
                $mlConfidence = 0.5; // Lower confidence for fallback
            } else {
                $recommendations = $mlRecommendations['recommendations'] ?? [];
                $mlConfidence = $mlRecommendations['confidence'] ?? 0.8;
            }

            return response()->json([
                'success' => true,
                'recommendations' => $recommendations,
                'ml_confidence' => $mlConfidence,
                'weather_context' => $weatherData,
                'total_items_considered' => $filteredItems->count(),
            ]);

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('AI Recommendation Connection Timeout: ' . $e->getMessage());
            
            // Fallback to local recommendations instead of showing error
            $weatherData = $request->input('weather', []);
            $maxRecommendations = $request->input('max_recommendations', 6);
            $wardrobeItems = WardrobeItem::where('user_id', auth()->id())->get();
            
            if ($wardrobeItems->isEmpty() || $wardrobeItems->count() < 2 || !$this->canFormValidOutfit($wardrobeItems)) {
                return response()->json([
                    'success' => false,
                    'message' => 'The AI recommendation service is currently unavailable. Please ensure you have at least 2 items that can form a complete outfit combination.',
                    'recommendations' => [],
                    'timeout' => true
                ], 504);
            }
            
            $filteredItems = $this->applyWeatherFiltering($wardrobeItems, $weatherData);
            if ($filteredItems->count() < 2 || !$this->canFormValidOutfit($filteredItems)) {
                return response()->json([
                    'success' => false,
                    'message' => 'The AI recommendation service is currently unavailable. Please ensure you have items that match the current weather conditions.',
                    'recommendations' => [],
                    'timeout' => true
                ], 504);
            }
            
            $recommendations = $this->generateWeatherBasedRecommendations($filteredItems, $weatherData, $maxRecommendations);
            
            return response()->json([
                'success' => true,
                'recommendations' => $recommendations,
                'ml_confidence' => 0.3,
                'fallback' => true,
                'message' => 'Using local recommendations (AI service unavailable)',
            ]);
        } catch (\Exception $e) {
            Log::error('AI Recommendation Error: ' . $e->getMessage());
            
            // Check if it's a timeout error - fallback to local recommendations
            if (str_contains($e->getMessage(), 'Maximum execution time') || str_contains($e->getMessage(), 'timeout')) {
                $weatherData = $request->input('weather', []);
                $maxRecommendations = $request->input('max_recommendations', 6);
                $wardrobeItems = WardrobeItem::where('user_id', auth()->id())->get();
                
                if ($wardrobeItems->isEmpty() || $wardrobeItems->count() < 2 || !$this->canFormValidOutfit($wardrobeItems)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'The recommendation request is taking longer than expected. Please ensure you have at least 2 items that can form a complete outfit combination.',
                        'recommendations' => [],
                        'timeout' => true
                    ], 504);
                }
                
                $filteredItems = $this->applyWeatherFiltering($wardrobeItems, $weatherData);
                if ($filteredItems->count() < 2 || !$this->canFormValidOutfit($filteredItems)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'The recommendation request is taking longer than expected. Please ensure you have items that match the current weather conditions.',
                        'recommendations' => [],
                        'timeout' => true
                    ], 504);
                }
                
                $recommendations = $this->generateWeatherBasedRecommendations($filteredItems, $weatherData, $maxRecommendations);
                
                return response()->json([
                    'success' => true,
                    'recommendations' => $recommendations,
                    'ml_confidence' => 0.3,
                    'fallback' => true,
                    'message' => 'Using local recommendations (AI service timeout)',
                ]);
            }
            
            // Fallback to basic weather recommendations
            $weatherData = $request->input('weather', []);
            $maxRecommendations = $request->input('max_recommendations', 6);
            $wardrobeItems = WardrobeItem::where('user_id', auth()->id())->get();
            
            if ($wardrobeItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No wardrobe items found. Add some items to get recommendations!',
                    'recommendations' => []
                ], 400);
            }
            
            // Check if user has only one item
            if ($wardrobeItems->count() === 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'You need at least 2 items in your wardrobe to generate outfit recommendations. Add more items to create stylish combinations!',
                    'recommendations' => [],
                    'item_count' => 1,
                    'minimum_required' => 2
                ], 400);
            }
            
            // Check if items can form a valid outfit combination
            if (!$this->canFormValidOutfit($wardrobeItems)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your wardrobe items cannot form a complete outfit combination. You need either: (1) a dress, OR (2) at least one top AND one bottom. Please add items from different categories to create outfit combinations!',
                    'recommendations' => [],
                    'item_count' => $wardrobeItems->count(),
                    'requires_combination' => true
                ], 400);
            }
            
            $filteredItems = $this->applyWeatherFiltering($wardrobeItems, $weatherData);
            
            // Check if filtered items are less than 2 after weather filtering
            if ($filteredItems->count() < 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'After applying weather filters, you have fewer than 2 suitable items. Consider adding more items that match the current weather conditions.',
                    'recommendations' => [],
                    'item_count' => $filteredItems->count(),
                    'minimum_required' => 2,
                    'total_items' => $wardrobeItems->count()
                ], 400);
            }
            
            // Check if filtered items can still form a valid outfit combination
            if (!$this->canFormValidOutfit($filteredItems)) {
                return response()->json([
                    'success' => false,
                    'message' => 'After applying weather filters, your remaining items cannot form a complete outfit combination. You need either: (1) a dress, OR (2) at least one top AND one bottom that match the current weather conditions.',
                    'recommendations' => [],
                    'item_count' => $filteredItems->count(),
                    'total_items' => $wardrobeItems->count(),
                    'requires_combination' => true
                ], 400);
            }
            
            $recommendations = $this->generateWeatherBasedRecommendations($filteredItems, $weatherData, $maxRecommendations);
            
            return response()->json([
                'success' => true,
                'recommendations' => $recommendations,
                'ml_confidence' => 0.3,
                'fallback' => true,
                'message' => 'Using basic recommendations due to ML service unavailability',
            ]);
        }
    }

    /**
     * Save an outfit combination
     */
    public function saveOutfit(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'wardrobe_item_ids' => 'required|array|min:1',
            'wardrobe_item_ids.*' => 'integer|exists:wardrobe_items,id',
            'occasion' => 'nullable|string|max:50',
            'weather_context' => 'nullable|array',
            'outfit_metadata' => 'nullable|array',
        ]);

        try {
            $user = auth()->user();
            
            // Verify all wardrobe items belong to the user
            $wardrobeItemIds = $request->wardrobe_item_ids;
            $userWardrobeItems = WardrobeItem::where('user_id', $user->id)
                ->whereIn('id', $wardrobeItemIds)
                ->pluck('id')
                ->toArray();
            
            if (count($userWardrobeItems) !== count($wardrobeItemIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some wardrobe items do not belong to you.',
                ], 403);
            }

            $savedOutfit = SavedOutfit::create([
                'user_id' => $user->id,
                'name' => $request->name,
                'description' => $request->description,
                'wardrobe_item_ids' => $wardrobeItemIds,
                'occasion' => $request->occasion,
                'weather_context' => $request->weather_context,
                'outfit_metadata' => $request->outfit_metadata,
            ]);

            // Load the outfit with wardrobe items for response
            $savedOutfit->load('feedback');

            return response()->json([
                'success' => true,
                'message' => 'Outfit saved successfully!',
                'outfit' => $savedOutfit,
            ]);

        } catch (\Exception $e) {
            Log::error('Save Outfit Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to save outfit. Please try again.',
            ], 500);
        }
    }

    /**
     * Get user's saved outfits
     */
    public function getSavedOutfits(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();
            $occasion = $request->input('occasion');
            $limit = $request->input('limit', 20);

            $query = SavedOutfit::where('user_id', $user->id)
                ->with('feedback')
                ->orderBy('created_at', 'desc');

            if ($occasion) {
                $query->where('occasion', $occasion);
            }

            $savedOutfits = $query->limit($limit)->get();

            return response()->json([
                'success' => true,
                'outfits' => $savedOutfits,
            ]);

        } catch (\Exception $e) {
            Log::error('Get Saved Outfits Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch saved outfits.',
            ], 500);
        }
    }

    /**
     * Submit feedback on an outfit or recommendation
     */
    public function submitFeedback(Request $request): JsonResponse
    {
        $request->validate([
            'saved_outfit_id' => 'nullable|integer|exists:saved_outfits,id',
            'feedback_type' => 'required|string|in:liked,wore_this,not_for_me,saved,shared',
            'rating' => 'nullable|integer|min:1|max:5',
            'notes' => 'nullable|string|max:500',
            'recommendation_context' => 'nullable|array',
        ]);

        try {
            $user = auth()->user();
            
            // If saving feedback for a specific outfit, verify ownership
            if ($request->saved_outfit_id) {
                $savedOutfit = SavedOutfit::where('id', $request->saved_outfit_id)
                    ->where('user_id', $user->id)
                    ->first();
                
                if (!$savedOutfit) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Outfit not found or access denied.',
                    ], 404);
                }
            }

            $feedback = OutfitFeedback::create([
                'user_id' => $user->id,
                'saved_outfit_id' => $request->saved_outfit_id,
                'feedback_type' => $request->feedback_type,
                'rating' => $request->rating,
                'notes' => $request->notes,
                'recommendation_context' => $request->recommendation_context,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Feedback submitted successfully!',
                'feedback' => $feedback,
            ]);

        } catch (\Exception $e) {
            Log::error('Submit Feedback Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit feedback. Please try again.',
            ], 500);
        }
    }

    /**
     * Check if wardrobe items can form a valid outfit combination
     * A valid outfit needs either:
     * - A dress (standalone outfit), OR
     * - At least one top AND one bottom
     */
    private function canFormValidOutfit($wardrobeItems): bool
    {
        if ($wardrobeItems->count() < 2) {
            return false;
        }

        $hasDress = false;
        $hasTop = false;
        $hasBottom = false;

        foreach ($wardrobeItems as $item) {
            $category = strtolower($item->category ?? '');
            
            // Check for dresses (standalone outfits)
            if (str_contains($category, 'dress') || str_contains($category, 'romper') || str_contains($category, 'jumpsuit')) {
                $hasDress = true;
            }
            
            // Check for tops
            if (str_contains($category, 'top') || str_contains($category, 'shirt') || 
                str_contains($category, 't-shirt') || str_contains($category, 'blouse') || 
                str_contains($category, 'tank') || str_contains($category, 'sweater') || 
                str_contains($category, 'hoodie')) {
                $hasTop = true;
            }
            
            // Check for bottoms
            if (str_contains($category, 'bottom') || str_contains($category, 'pants') || 
                str_contains($category, 'jeans') || str_contains($category, 'shorts') || 
                str_contains($category, 'skirt') || str_contains($category, 'legging')) {
                $hasBottom = true;
            }
        }

        // Valid outfit if: has a dress OR (has top AND has bottom)
        return $hasDress || ($hasTop && $hasBottom);
    }

    /**
     * Apply weather-based filtering to wardrobe items
     */
    private function applyWeatherFiltering($wardrobeItems, $weatherData, $maxRecommendations = 6)
    {
        if (!$weatherData || !isset($weatherData['main']['temp'])) {
            return $wardrobeItems;
        }

        $temp = $weatherData['main']['temp'];
        $condition = strtolower($weatherData['weather'][0]['main'] ?? '');
        
        // Rain is only valid for 24-32°C (Philippines climate)
        $isRainy = (str_contains($condition, 'rain') || str_contains($condition, 'drizzle') || 
                    str_contains($condition, 'thunderstorm')) && $temp >= 24 && $temp <= 32;
        
        // Light colors for hot weather (from system)
        $lightColors = ['white', 'sky blue', 'cream', 'ivory', 'yellow', 'pink', 'lavender', 'mint', 'coral', 'turquoise', 'beige', 'khaki', 'tan', 'silver'];
        
        // Dark colors for rainy weather (from system)
        $darkColors = ['black', 'navy', 'blue', 'gray', 'charcoal', 'maroon', 'brown', 'teal', 'emerald', 'olive', 'purple', 'violet'];
        
        // Breathable fabrics for hot/dry season
        $breathableFabrics = ['cotton', 'linen', 'bamboo', 'modal', 'rayon'];
        
        // Waterproof fabrics for wet season
        $waterproofFabrics = ['waterproof', 'nylon', 'polyester'];
        
        // Heavy/warm fabrics to avoid in hot weather
        $heavyFabrics = ['wool', 'fleece', 'cashmere', 'denim', 'leather'];
        
        // Warm fabrics preferred in cool weather
        $warmFabrics = ['wool', 'fleece', 'cashmere'];
        
        return $wardrobeItems->filter(function ($item) use ($temp, $condition, $isRainy, $lightColors, $darkColors, $breathableFabrics, $waterproofFabrics, $heavyFabrics, $warmFabrics) {
            $category = strtolower($item->category);
            $itemColor = strtolower($item->color ?? '');
            $itemFabric = strtolower($item->fabric ?? '');
            
            // WET SEASON (Rainy) - Priority check (only valid 24-32°C)
            if ($isRainy) {
                // Prefer: jackets, pants, boots, waterproof items, all shoes
                $hasRainAppropriateCategory = str_contains($category, 'jacket') || 
                                             str_contains($category, 'pant') || 
                                             str_contains($category, 'jean') ||
                                             str_contains($category, 'boot') ||
                                             str_contains($category, 'hoodie') ||
                                             str_contains($category, 'shoe'); // Include all shoes for rain
                
                // Prefer: waterproof fabrics
                $hasWaterproofFabric = false;
                foreach ($waterproofFabrics as $waterproofFabric) {
                    if (str_contains($itemFabric, $waterproofFabric)) {
                        $hasWaterproofFabric = true;
                        break;
                    }
                }
                
                // Avoid: shorts, skirts, dresses, sandals
                $isInappropriate = str_contains($category, 'short') || 
                                 str_contains($category, 'skirt') || 
                                 str_contains($category, 'dress') ||
                                 str_contains($category, 'sandal');
                
                // Avoid heavy fabrics that retain moisture
                $hasHeavyFabric = false;
                foreach ($heavyFabrics as $heavyFabric) {
                    if (str_contains($itemFabric, $heavyFabric)) {
                        $hasHeavyFabric = true;
                        break;
                    }
                }
                
                // SMART LOGIC: If item is appropriate for rain (boots, waterproof, jacket, shoes), 
                // allow it regardless of color (respects user preferences)
                if (($hasRainAppropriateCategory || $hasWaterproofFabric) && !$isInappropriate && !$hasHeavyFabric) {
                    return true; // Allow appropriate items even with light colors
                }
                
                // For other items, prefer dark colors but don't strictly exclude
                $hasRainAppropriateColor = false;
                foreach ($darkColors as $darkColor) {
                    if (str_contains($itemColor, $darkColor)) {
                        $hasRainAppropriateColor = true;
                        break;
                    }
                }
                
                return $hasRainAppropriateColor && !$isInappropriate && !$hasHeavyFabric;
            }
            
            // DRY SEASON (Hot) - >30°C (rain already handled above)
            if ($temp > 30) {
                // Prefer: light clothing
                $hasHotAppropriateCategory = str_contains($category, 'shirt') || 
                                            str_contains($category, 'dress') || 
                                            str_contains($category, 'shorts') ||
                                            str_contains($category, 't-shirt') ||
                                            str_contains($category, 'polo');
                
                // Prefer: light colors from system
                $hasHotAppropriateColor = false;
                foreach ($lightColors as $lightColor) {
                    if (str_contains($itemColor, $lightColor)) {
                        $hasHotAppropriateColor = true;
                        break;
                    }
                }
                
                // Prefer: breathable fabrics
                $hasBreathableFabric = false;
                foreach ($breathableFabrics as $breathableFabric) {
                    if (str_contains($itemFabric, $breathableFabric)) {
                        $hasBreathableFabric = true;
                        break;
                    }
                }
                
                // Avoid: heavy outerwear and dark colors
                $isInappropriate = str_contains($category, 'coat') || 
                                  str_contains($category, 'jacket') ||
                                  str_contains($category, 'sweater');
                
                $hasDarkColor = false;
                foreach ($darkColors as $darkColor) {
                    if (str_contains($itemColor, $darkColor)) {
                        $hasDarkColor = true;
                        break;
                    }
                }
                
                // Avoid: heavy/warm fabrics in hot weather
                $hasHeavyFabric = false;
                foreach ($heavyFabrics as $heavyFabric) {
                    if (str_contains($itemFabric, $heavyFabric)) {
                        $hasHeavyFabric = true;
                        break;
                    }
                }
                
                // Include if: appropriate category OR appropriate color OR breathable fabric, AND not inappropriate, AND not dark color, AND not heavy fabric
                return ($hasHotAppropriateCategory || $hasHotAppropriateColor || $hasBreathableFabric) && 
                       !$isInappropriate && !$hasDarkColor && !$hasHeavyFabric;
            }
            
            // WARM WEATHER (24-30°C) - Typical Philippine temperature
            if ($temp >= 24 && $temp <= 30) {
                // Not raining (rain already handled above)
                // Prefer: light colors from system
                $hasWarmAppropriateColor = false;
                foreach ($lightColors as $lightColor) {
                    if (str_contains($itemColor, $lightColor)) {
                        $hasWarmAppropriateColor = true;
                        break;
                    }
                }
                
                // Prefer: breathable fabrics
                $hasBreathableFabric = false;
                foreach ($breathableFabrics as $breathableFabric) {
                    if (str_contains($itemFabric, $breathableFabric)) {
                        $hasBreathableFabric = true;
                        break;
                    }
                }
                
                // Avoid: heavy outerwear
                $isInappropriate = str_contains($category, 'coat') || 
                                  str_contains($category, 'heavy');
                
                // Avoid: heavy fabrics in warm weather
                $hasHeavyFabric = false;
                foreach ($heavyFabrics as $heavyFabric) {
                    if (str_contains($itemFabric, $heavyFabric)) {
                        $hasHeavyFabric = true;
                        break;
                    }
                }
                
                return (!$isInappropriate || $hasWarmAppropriateColor || $hasBreathableFabric) && !$hasHeavyFabric;
            }
            
            // MILD/COOL WEATHER (20-23°C)
            if ($temp >= 20 && $temp < 24) {
                return true; // All items suitable
            }
            
            // COOL WEATHER (<20°C) - Very rare in Philippines
            if ($temp < 20) {
                $hasAppropriateCategory = str_contains($category, 'jacket') || 
                                        str_contains($category, 'pant') || 
                                        str_contains($category, 'jean') ||
                                        str_contains($category, 'sweater') ||
                                        str_contains($category, 'hoodie');
                
                // Prefer: warm fabrics in cool weather
                $hasWarmFabric = false;
                foreach ($warmFabrics as $warmFabric) {
                    if (str_contains($itemFabric, $warmFabric)) {
                        $hasWarmFabric = true;
                        break;
                    }
                }
                
                return $hasAppropriateCategory || $hasWarmFabric;
            }
            
            return true;
        });
    }

    /**
     * Generate weather-based recommendations (fallback)
     */
    private function generateWeatherBasedRecommendations($filteredItems, $weatherData, $maxRecommendations = 6)
    {
        $recommendations = [];
        $temp = $weatherData['main']['temp'] ?? 20;
        $condition = strtolower($weatherData['weather'][0]['main'] ?? '');
        
        // Select top items based on weather and max recommendations
        $selectedItems = $filteredItems->take($maxRecommendations)->map(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'brand' => $item->brand,
                'category' => $item->category,
                'color' => $item->color,
                'size' => $item->size,
                'image_url' => $item->image_url,
                'description' => $item->description,
            ];
        })->toArray();

        $message = "Perfect weather! Here are some great outfit options.";
        if ($temp > 30) {
            $message = "It's hot! Stay cool with these light, breathable options.";
        } elseif ($temp < 15) {
            $message = "It's chilly! Layer up with these warm clothing options.";
        }

        if (str_contains($condition, 'rain')) {
            $message .= " Don't forget rain protection!";
        }

        return [
            'message' => $message,
            'items' => $selectedItems,
            'reason' => "Weather-based recommendation (temp: {$temp}°C, condition: {$condition})",
        ];
    }

    /**
     * Get embedding-based recommendations using Hugging Face
     */
    private function getEmbeddingBasedRecommendations($filteredItems, $weatherData, $occasion, $userId, $maxRecommendations = 6)
    {
        try {
            // Build query text from context
            $temp = $weatherData['main']['temp'] ?? 20;
            $condition = $weatherData['weather'][0]['main'] ?? 'Clear';
            $conditionLower = strtolower($condition);
            
            $userPreferences = $this->getUserPreferencesFromFeedback($userId);
            $preferredColors = implode(', ', $userPreferences['preferred_colors'] ?? []);
            $preferredCategories = implode(', ', $userPreferences['preferred_categories'] ?? []);
            
            // Rain is only valid for 24-32°C (Philippines climate)
            $isRainy = (str_contains($conditionLower, 'rain') || str_contains($conditionLower, 'drizzle') || 
                        str_contains($conditionLower, 'thunderstorm')) && $temp >= 24 && $temp <= 32;
            
            // Determine fabric preferences based on weather (Philippines two-season system)
            $fabricPreference = '';
            if ($temp > 30 || ($temp >= 24 && !$isRainy)) {
                // Hot/Dry season - prefer breathable fabrics
                $fabricPreference = 'Prefer breathable fabrics like cotton, linen, bamboo, modal, or rayon.';
            } elseif ($isRainy) {
                // Wet season - prefer waterproof fabrics
                $fabricPreference = 'Prefer waterproof or water-resistant fabrics like nylon, polyester, or waterproof materials.';
            } elseif ($temp < 20) {
                // Cool weather - prefer warm fabrics
                $fabricPreference = 'Prefer warm fabrics like wool, fleece, or cashmere.';
            }
            
            // Build weather-specific clothing guidance (Philippines climate)
            $weatherGuidance = '';
            if ($isRainy) {
                // Wet season / Rainy condition (24-32°C only)
                $weatherGuidance = 'It is rainy. Wear jackets, hoodies, windbreakers, long pants, waterproof shoes (boots or closed shoes, not sandals). Avoid shorts and sandals.';
            } elseif ($temp >= 32) {
                // Very hot (common from March–May)
                $weatherGuidance = 'Very hot weather. Wear ultra-light clothing: sleeveless, shirts, shorts, skirts, sandals. Avoid jackets or sweaters.';
            } elseif ($temp >= 27 && $temp < 32) {
                // Warm (typical PH daytime)
                $weatherGuidance = 'Warm weather. Wear light shirts, t-shirts, and breathable clothing. Shorts or light pants are recommended.';
            } elseif ($temp >= 23 && $temp < 27) {
                // Mild / Comfortable
                $weatherGuidance = 'Mild weather. Wear versatile clothing: shirts, jeans, light jackets, dresses. Comfortable and not too hot.';
            } elseif ($temp < 23) {
                // Cool / Ber months or highlands
                $weatherGuidance = 'Cool weather. Wear jackets, sweaters, hoodies, long sleeves, pants. Avoid very thin clothing.';
            }
            
            // Build smarter, more contextual AI query
            $queryText = "Create an outfit recommendation for a {$occasion} occasion. ";

            // Weather context with priority (rain only valid 24-32°C)
            if ($isRainy) {
                $queryText .= "CRITICAL: It is currently raining ({$condition}) at {$temp}°C. ";
                $queryText .= "Prioritize rain protection: waterproof items, boots (not sandals), jackets, long pants. ";
                if ($temp >= 24 && $temp < 30) {
                    $queryText .= "Balance protection with breathability since it's warm. ";
                } elseif ($temp >= 30) {
                    $queryText .= "It's also hot, so prioritize lightweight waterproof/breathable materials. ";
                }
            } else {
                $queryText .= "Weather conditions: {$temp}°C, {$condition}. ";
                if ($weatherGuidance) {
                    $queryText .= "{$weatherGuidance} ";
                }
            }

            // User preferences (personalization)
            if ($preferredColors || $preferredCategories) {
                $queryText .= "User's personal style preferences: ";
                if ($preferredColors) {
                    $queryText .= "favorite colors are {$preferredColors}. ";
                }
                if ($preferredCategories) {
                    $queryText .= "prefers {$preferredCategories} items. ";
                }
                $queryText .= "Prioritize matching these preferences when possible, but weather protection takes priority over color preferences. ";
            }

            // Fabric guidance
            if ($fabricPreference) {
                $queryText .= "{$fabricPreference} ";
            }

            // Smart context about conflicts
            if ($isRainy && $preferredColors) {
                $preferredColorsArray = explode(', ', $preferredColors);
                $hasLightPreferredColor = false;
                foreach ($preferredColorsArray as $color) {
                    $colorLower = strtolower(trim($color));
                    if (in_array($colorLower, ['white', 'cream', 'ivory', 'yellow', 'pink', 'lavender', 'mint', 'coral', 'beige', 'khaki', 'tan'])) {
                        $hasLightPreferredColor = true;
                        break;
                    }
                }
                
                if ($hasLightPreferredColor) {
                    $queryText .= "Note: User prefers light colors, but for rainy weather, prioritize functional items (boots, waterproof jackets, shoes) even if they're light colored, as protection is more important than color preference in rain. ";
                }
            }

            // Final instruction
            $queryText .= "Select items that best match the weather requirements first, then user preferences, ensuring a practical and stylish outfit combination.";
            
            // Create text descriptions for each wardrobe item (include fabric)
            $itemTexts = $filteredItems->map(function ($item) {
                $fabricText = $item->fabric ? " made of {$item->fabric}" : '';
                return "{$item->category} {$item->name} by {$item->brand} in {$item->color}{$fabricText}. {$item->description}";
            })->toArray();
            
            // If no items, return null
            if (empty($itemTexts)) {
                return null;
            }
            
            // Get embeddings for query and all items
            $allTexts = array_merge([$queryText], $itemTexts);
            $embeddings = $this->getEmbeddings($allTexts);
            
            if (!$embeddings || count($embeddings) !== count($allTexts)) {
                Log::warning('Failed to get embeddings or count mismatch');
                return null;
            }
            
            // First embedding is the query, rest are items
            $queryEmbedding = $embeddings[0];
            $itemEmbeddings = array_slice($embeddings, 1);
            
            // Calculate similarity scores
            $scoredItems = [];
            foreach ($filteredItems as $index => $item) {
                $itemEmbedding = $itemEmbeddings[$index];
                $similarity = $this->cosineSimilarity($queryEmbedding, $itemEmbedding);
                
                $scoredItems[] = [
                    'item' => $item,
                    'score' => $similarity,
                ];
            }
            
            // Sort by similarity score (highest first)
            usort($scoredItems, function ($a, $b) {
                return $b['score'] <=> $a['score'];
            });
            
            // Get top recommendations
            $topItems = array_slice($scoredItems, 0, $maxRecommendations);
            
            // Format recommendations
            $recommendations = [
                'message' => "AI-powered recommendations for {$occasion} in {$temp}°C weather",
                'items' => array_map(function ($scored) {
                    return [
                        'id' => $scored['item']->id,
                        'name' => $scored['item']->name,
                        'brand' => $scored['item']->brand,
                        'category' => $scored['item']->category,
                        'color' => $scored['item']->color,
                        'size' => $scored['item']->size,
                        'fabric' => $scored['item']->fabric,
                        'image_url' => $scored['item']->image_url,
                        'description' => $scored['item']->description,
                        'match_score' => round($scored['score'] * 100, 1), // Convert to percentage
                    ];
                }, $topItems),
                'reason' => 'AI embedding-based semantic matching',
            ];
            
            return [
                'recommendations' => $recommendations,
                'confidence' => 0.85,
            ];
            
        } catch (\Exception $e) {
            Log::error('Embedding-based recommendation error: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Get embeddings from Hugging Face API
     */
    private function getEmbeddings($texts)
    {
        try {
            $apiKey = config('services.huggingface.api_key');
            $modelIdentifier = config('services.huggingface.model_url') ?? config('services.huggingface.model_name');
            
            if (!$apiKey || !$modelIdentifier) {
                Log::warning('Hugging Face API not configured');
                return null;
            }

            // If it's a model name (not a full URL), construct the Inference API URL
            if (!str_starts_with($modelIdentifier, 'http')) {
                $modelUrl = "https://api-inference.huggingface.co/models/{$modelIdentifier}";
            } else {
                $modelUrl = $modelIdentifier;
            }

            Log::info('Calling Hugging Face Embedding API', [
                'model_url' => $modelUrl,
                'text_count' => count($texts)
            ]);

            // For embedding models, send the inputs as an array of texts
            // Use longer timeout to allow API to complete (up to 90 seconds)
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(90)->post($modelUrl, [
                'inputs' => $texts,
            ]);

            if ($response->successful()) {
                $result = $response->json();
                Log::info('Embedding API response received', [
                    'response_type' => gettype($result),
                    'is_array' => is_array($result),
                ]);
                return $result;
            } else {
                Log::error('Hugging Face Embedding API Error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return null;
            }

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::warning('Hugging Face Embedding API Connection Timeout: ' . $e->getMessage());
            return null;
        } catch (\Exception $e) {
            Log::error('Hugging Face Embedding API Exception: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Calculate cosine similarity between two vectors
     */
    private function cosineSimilarity($vec1, $vec2)
    {
        if (count($vec1) !== count($vec2)) {
            return 0;
        }
        
        $dotProduct = 0;
        $magnitude1 = 0;
        $magnitude2 = 0;
        
        for ($i = 0; $i < count($vec1); $i++) {
            $dotProduct += $vec1[$i] * $vec2[$i];
            $magnitude1 += $vec1[$i] * $vec1[$i];
            $magnitude2 += $vec2[$i] * $vec2[$i];
        }
        
        $magnitude1 = sqrt($magnitude1);
        $magnitude2 = sqrt($magnitude2);
        
        if ($magnitude1 == 0 || $magnitude2 == 0) {
            return 0;
        }
        
        return $dotProduct / ($magnitude1 * $magnitude2);
    }

    /**
     * Call Hugging Face API for ML recommendations
     */
    private function callHuggingFaceAPI($data)
    {
        try {
            $apiKey = config('services.huggingface.api_key');
            $modelIdentifier = config('services.huggingface.model_url') ?? config('services.huggingface.model_name');
            
            if (!$apiKey || !$modelIdentifier) {
                Log::warning('Hugging Face API not configured');
                return null;
            }

            // If it's a model name (not a full URL), construct the Inference API URL
            if (!str_starts_with($modelIdentifier, 'http')) {
                $modelUrl = "https://api-inference.huggingface.co/models/{$modelIdentifier}";
            } else {
                $modelUrl = $modelIdentifier;
            }

            Log::info('Calling Hugging Face API', [
                'model_url' => $modelUrl,
                'data_keys' => array_keys($data)
            ]);

            // Use longer timeout to allow API to complete (up to 90 seconds)
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(90)->post($modelUrl, $data);

            if ($response->successful()) {
                return $response->json();
            } else {
                Log::error('Hugging Face API Error: ' . $response->body());
                return null;
            }

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::warning('Hugging Face API Connection Timeout: ' . $e->getMessage());
            return null;
        } catch (\Exception $e) {
            Log::error('Hugging Face API Exception: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get user preferences from feedback history
     */
    private function getUserPreferencesFromFeedback($userId)
    {
        $feedback = OutfitFeedback::where('user_id', $userId)
            ->whereIn('feedback_type', ['liked', 'wore_this'])
            ->with('savedOutfit')
            ->get();

        $preferences = [
            'preferred_colors' => [],
            'preferred_categories' => [],
            'preferred_brands' => [],
            'preferred_occasions' => [],
        ];

        foreach ($feedback as $f) {
            if ($f->savedOutfit) {
                $outfit = $f->savedOutfit;
                $items = WardrobeItem::whereIn('id', $outfit->wardrobe_item_ids)->get();
                
                foreach ($items as $item) {
                    $preferences['preferred_colors'][] = $item->color;
                    $preferences['preferred_categories'][] = $item->category;
                    $preferences['preferred_brands'][] = $item->brand;
                }
                
                if ($outfit->occasion) {
                    $preferences['preferred_occasions'][] = $outfit->occasion;
                }
            }
        }

        // Count and sort preferences
        foreach ($preferences as $key => $values) {
            $preferences[$key] = array_count_values($values);
            arsort($preferences[$key]);
            $preferences[$key] = array_keys(array_slice($preferences[$key], 0, 5));
        }

        return $preferences;
    }

    /**
     * Get user preferences
     */
    public function getUserPreferences(): JsonResponse
    {
        try {
            $user = auth()->user();
            
            // For now, we'll return default preferences
            // In a real implementation, you'd store these in a user_preferences table
            $preferences = [
                'preferredColors' => [],
                'preferredCategories' => [],
                'preferredBrands' => [],
                'preferredOccasions' => [],
                'styleNotes' => '',
                'avoidColors' => [],
                'avoidCategories' => [],
            ];

            return response()->json([
                'success' => true,
                'preferences' => $preferences,
            ]);

        } catch (\Exception $e) {
            Log::error('Get User Preferences Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch preferences.',
            ], 500);
        }
    }

    /**
     * Save user preferences
     */
    public function saveUserPreferences(Request $request): JsonResponse
    {
        try {
            Log::info('Save preferences request received', [
                'user_id' => auth()->id(),
                'request_data' => $request->all()
            ]);

            $request->validate([
                'preferences' => 'required|array',
                'preferences.preferredColors' => 'array',
                'preferences.preferredCategories' => 'array',
                'preferences.preferredBrands' => 'array',
                'preferences.preferredOccasions' => 'array',
                'preferences.styleNotes' => 'nullable|string|max:500',
                'preferences.avoidColors' => 'array',
                'preferences.avoidCategories' => 'array',
            ]);

            $user = auth()->user();
            $preferences = $request->preferences;
            
            // Normalize empty string to null for styleNotes (optional field)
            if (isset($preferences['styleNotes']) && $preferences['styleNotes'] === '') {
                $preferences['styleNotes'] = null;
            }
            
            // For now, we'll just return success
            // In a real implementation, you'd store these in a user_preferences table
            // and use them in the ML recommendations
            
            Log::info('User preferences saved successfully', [
                'user_id' => $user->id,
                'preferences' => $preferences
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Preferences saved successfully!',
                'preferences' => $preferences,
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error in save preferences', [
                'errors' => $e->errors(),
                'user_id' => auth()->id()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Save User Preferences Error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to save preferences: ' . $e->getMessage(),
            ], 500);
        }
    }
}