<?php

namespace App\Http\Controllers;

use App\Models\WardrobeItem;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
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
        $rules = [
            'name' => 'required|string|max:100',
            'brand' => 'required|string|max:50',
            'category' => 'required|string|max:50',
            'color' => 'required|string|max:20',
            'fabric' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:200',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ];
        
        // Size is optional for Hat and Accessories
        if (!in_array($request->category, ['Hat', 'Accessories'])) {
            $rules['size'] = 'required|string|max:10';
        } else {
            $rules['size'] = 'nullable|string|max:10';
        }
        
        $request->validate($rules);

        // Convert empty size to null for Hat and Accessories
        $size = ($request->category === 'Hat' || $request->category === 'Accessories') 
            ? null 
            : ($request->size ?: null);

        $wardrobeItem = new WardrobeItem([
            'user_id' => auth()->id(),
            'name' => $request->name,
            'brand' => $request->brand,
            'category' => $request->category,
            'color' => $request->color,
            'size' => $size,
            'fabric' => $request->fabric,
            'description' => $request->description,
        ]);

        // Handle multiple images upload
        if ($request->hasFile('images')) {
            try {
                $uploadedImages = [];
                foreach ($request->file('images') as $image) {
                    // Validate image size and type
                    if ($image->getSize() > 5120 * 1024) { // 5MB limit
                        continue; // Skip images that are too large
                    }

                    $imagePath = $image->store('wardrobe', 'public');
                    $uploadedImages[] = $imagePath;
                }

                if (!empty($uploadedImages)) {
                    $wardrobeItem->images = $uploadedImages;
                    // Set first image as image_path for backward compatibility
                    $wardrobeItem->image_path = $uploadedImages[0];
                }
                
            } catch (\Exception $e) {
                \Log::error('Images upload failed: ' . $e->getMessage());
                return redirect()->back()->withErrors(['images' => 'Failed to upload images. Please try again.']);
            }
        } elseif ($request->hasFile('image')) {
            // Fallback to single image for backward compatibility
            try {
                $image = $request->file('image');
                
                // Validate image size and type
                if ($image->getSize() > 5120 * 1024) { // 5MB limit
                    return redirect()->back()->withErrors(['image' => 'Image size must be less than 5MB.']);
                }

                $imagePath = $image->store('wardrobe', 'public');
                $wardrobeItem->image_path = $imagePath;
                $wardrobeItem->images = [$imagePath];
                
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

        $rules = [
            'name' => 'required|string|max:100',
            'brand' => 'required|string|max:50',
            'category' => 'required|string|max:50',
            'color' => 'required|string|max:20',
            'description' => 'nullable|string|max:200',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ];
        
        // Size is optional for Hat and Accessories
        if (!in_array($request->category, ['Hat', 'Accessories'])) {
            $rules['size'] = 'required|string|max:10';
        } else {
            $rules['size'] = 'nullable|string|max:10';
        }
        
        $request->validate($rules);

        // Convert empty size to null for Hat and Accessories
        $size = ($request->category === 'Hat' || $request->category === 'Accessories') 
            ? null 
            : ($request->size ?: null);

        // Update basic fields
        $wardrobeItem->update([
            'name' => $request->name,
            'brand' => $request->brand,
            'category' => $request->category,
            'color' => $request->color,
            'size' => $size,
            'fabric' => $request->fabric,
            'description' => $request->description,
        ]);

        // Handle multiple images upload
        if ($request->hasFile('images')) {
            try {
                // Delete old images if they exist
                if ($wardrobeItem->images && is_array($wardrobeItem->images)) {
                    foreach ($wardrobeItem->images as $oldImagePath) {
                        if ($oldImagePath) {
                            Storage::disk('public')->delete($oldImagePath);
                        }
                    }
                }
                if ($wardrobeItem->image_path) {
                    Storage::disk('public')->delete($wardrobeItem->image_path);
                }

                $uploadedImages = [];
                foreach ($request->file('images') as $image) {
                    // Validate image size and type
                    if ($image->getSize() > 5120 * 1024) { // 5MB limit
                        continue; // Skip images that are too large
                    }

                    $imagePath = $image->store('wardrobe', 'public');
                    $uploadedImages[] = $imagePath;
                }

                if (!empty($uploadedImages)) {
                    $wardrobeItem->images = $uploadedImages;
                    // Set first image as image_path for backward compatibility
                    $wardrobeItem->image_path = $uploadedImages[0];
                    $wardrobeItem->save();
                }
                
                \Log::info('Images updated successfully', [
                    'item_id' => $wardrobeItem->id,
                    'images_count' => count($uploadedImages)
                ]);
                
            } catch (\Exception $e) {
                \Log::error('Images upload failed: ' . $e->getMessage());
                return redirect()->back()->withErrors(['images' => 'Failed to upload images. Please try again.']);
            }
        } elseif ($request->hasFile('image')) {
            // Fallback to single image for backward compatibility
            try {
                $image = $request->file('image');
                
                // Validate image size and type
                if ($image->getSize() > 5120 * 1024) { // 5MB limit
                    return redirect()->back()->withErrors(['image' => 'Image size must be less than 5MB.']);
                }

                // Delete old images if they exist
                if ($wardrobeItem->images && is_array($wardrobeItem->images)) {
                    foreach ($wardrobeItem->images as $oldImagePath) {
                        if ($oldImagePath) {
                            Storage::disk('public')->delete($oldImagePath);
                        }
                    }
                }
                if ($wardrobeItem->image_path) {
                    Storage::disk('public')->delete($wardrobeItem->image_path);
                }

                $imagePath = $image->store('wardrobe', 'public');
                
                // Update image path
                $wardrobeItem->images = [$imagePath];
                $wardrobeItem->image_path = $imagePath;
                $wardrobeItem->save();
                
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

    /**
     * Generate AI outfit recommendations using Hugging Face kennnyy/recomendation model
     */
    public function generateAIRecommendations(Request $request)
    {
        try {
            // Remove execution time limit for this operation - set at the very beginning
            set_time_limit(0); // Unlimited execution time to allow API to complete
            ini_set('max_execution_time', 0); // Also set at PHP configuration level
            ignore_user_abort(true); // Continue processing even if client disconnects
            
            $request->validate([
                'wardrobe_items' => 'required|array',
                'weather' => 'nullable|array',
                'preferences' => 'nullable|array',
                'max_recommendations' => 'nullable|integer|min:1|max:10',
            ]);

            $wardrobeItems = $request->input('wardrobe_items', []);
            $weather = $request->input('weather', []);
            $preferences = $request->input('preferences', []);
            $maxRecommendations = $request->input('max_recommendations', 6);

            // Prepare data for Hugging Face API
            $inputData = $this->prepareHuggingFaceInput(
                $wardrobeItems,
                $weather,
                $preferences,
                $maxRecommendations
            );

            Log::info('Sending request to Hugging Face API', [
                'input_data' => $inputData,
                'user_id' => auth()->id()
            ]);

            // Get Hugging Face API token from environment
            $hfToken = env('HUGGING_FACE_API_TOKEN');
            
            if (!$hfToken) {
                Log::warning('Hugging Face API token not configured - using local fallback');
                // Use fallback when API token is missing
                $fallbackRecommendations = $this->generateLocalRecommendations(
                    $wardrobeItems,
                    $weather,
                    $preferences,
                    $maxRecommendations
                );
                
                return response()->json([
                    'success' => true,
                    'recommendations' => $fallbackRecommendations,
                    'source' => 'local_fallback',
                    'fallback_reason' => 'API token not configured - using preference-based recommendations'
                ]);
            }

            // Use Gradio API according to documentation
            // Endpoint: /gradio_api/call/gradio_recommend
            return $this->callGradioAPI($inputData, $hfToken, $wardrobeItems, $weather, $preferences, $maxRecommendations);


        } catch (\Illuminate\Validation\ValidationException $e) {
            // Validation errors should still return error, but log it
            Log::warning('Validation error in AI recommendations', [
                'errors' => $e->errors(),
                'user_id' => auth()->id()
            ]);
            return response()->json([
                'success' => false,
                'error' => 'VALIDATION_ERROR',
                'message' => 'Invalid input data',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::warning('Error generating AI recommendations - using local fallback', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id()
            ]);
            
            // Use fallback for ANY exception
            try {
                $fallbackRecommendations = $this->generateLocalRecommendations(
                    $wardrobeItems ?? [],
                    $weather ?? [],
                    $preferences ?? [],
                    $maxRecommendations ?? 6
                );
                
                return response()->json([
                    'success' => true,
                    'recommendations' => $fallbackRecommendations,
                    'source' => 'local_fallback',
                    'fallback_reason' => 'Error occurred - using preference-based recommendations'
                ]);
            } catch (\Exception $fallbackError) {
                // If even fallback fails, return error
                Log::error('Fallback recommendation also failed', [
                    'error' => $fallbackError->getMessage(),
                    'user_id' => auth()->id()
                ]);
                
                return response()->json([
                    'success' => false,
                    'error' => 'GENERAL_ERROR',
                    'message' => 'An error occurred while generating recommendations. Please try again.',
                ], 500);
            }
        }
    }

    /**
     * Prepare input data for FastAPI /compose endpoint
     */
    private function prepareFastAPIInput(array $wardrobeItems, array $weather, array $preferences, int $maxRecommendations): array
    {
        // Extract weather information
        $temperature = $weather['main']['temp'] ?? 27;
        $weatherCondition = $weather['weather'][0]['main'] ?? 'Clear';
        
        // Normalize weather condition
        $conditionNormalized = strtolower($weatherCondition);
        if (in_array($conditionNormalized, ['drizzle', 'rain'])) {
            $weatherCondition = 'rain';
        } elseif (in_array($conditionNormalized, ['clear', 'sunny'])) {
            $weatherCondition = 'sunny';
        } elseif (in_array($conditionNormalized, ['clouds', 'cloudy'])) {
            $weatherCondition = 'cloudy';
        } else {
            $weatherCondition = 'any';
        }

        // Map temperature to weather category for FastAPI
        $weatherCategory = 'any';
        if ($temperature >= 30) {
            $weatherCategory = 'hot';
        } elseif ($temperature >= 25) {
            $weatherCategory = 'warm';
        } elseif ($temperature >= 20) {
            $weatherCategory = 'mild';
        } elseif ($temperature >= 15) {
            $weatherCategory = 'cool';
        } elseif ($temperature >= 5) {
            $weatherCategory = 'cold';
        } else {
            $weatherCategory = 'freezing';
        }

        // Prepare items with image URLs
        $items = [];
        foreach ($wardrobeItems as $item) {
            // Try to get image URL from item
            $imageUrl = null;
            
            // If item has image_path, construct full URL (must be publicly accessible)
            if (isset($item['image_path']) && $item['image_path']) {
                // Use full URL so Hugging Face Space can access it
                $imageUrl = url('storage/' . $item['image_path']);
            } elseif (isset($item['image_url']) && $item['image_url']) {
                $imageUrl = $item['image_url'];
            } elseif (isset($item['images']) && is_array($item['images']) && !empty($item['images'])) {
                // Use first image from images array
                $imageUrl = url('storage/' . $item['images'][0]);
            } else {
                // Try to load from database if we have item ID
                if (isset($item['id'])) {
                    $wardrobeItemModel = WardrobeItem::find($item['id']);
                    if ($wardrobeItemModel && $wardrobeItemModel->image_url) {
                        // Model's image_url attribute already returns full URL via asset()
                        $imageUrl = $wardrobeItemModel->image_url;
                    }
                }
            }

            // Build item for FastAPI
            $fastApiItem = [
                'id' => (string)($item['id'] ?? uniqid()),
                'category' => strtolower($item['category'] ?? ''),
            ];

            // Add image URL if available
            if ($imageUrl) {
                $fastApiItem['image_url'] = $imageUrl;
            }

            $items[] = $fastApiItem;
        }

        // Extract preferences
        $occasion = $preferences['preferredOccasions'][0] ?? 'casual';
        $outfitStyle = $preferences['styleNotes'] ?? 'casual';
        $colorPreference = !empty($preferences['preferredColors']) ? $preferences['preferredColors'][0] : null;
        
        // Build FastAPI request
        $requestData = [
            'items' => $items,
            'occasion' => $occasion,
            'weather' => $weatherCategory,
            'style' => $outfitStyle,
            'outfit_style' => $outfitStyle,
            'num_outfits' => $maxRecommendations,
        ];

        // Add optional tags
        if ($colorPreference && $colorPreference !== 'None') {
            $requestData['color_preference'] = strtolower($colorPreference);
        }

        return $requestData;
    }

    /**
     * Call Gradio API according to official documentation
     * Uses /gradio_api/call/gradio_recommend endpoint with proper polling
     */
    private function callGradioAPI(array $inputData, string $hfToken, array $wardrobeItems, array $weather = [], array $preferences = [], int $maxRecommendations = 6)
    {
        // Get Space URL from config (defaults to old URL for backward compatibility)
        $spaceUrl = rtrim(config('services.huggingface.space_url'), '/');
        $apiUrl = "{$spaceUrl}/gradio_api/call/gradio_recommend";
        
        Log::info('Calling Gradio API', [
            'endpoint' => $apiUrl,
            'user_id' => auth()->id()
        ]);
        
        // Wake up private Space by making a simple GET request first
        // This helps wake up sleeping Spaces
        // Retry a few times if we get 502/503
        $wakeUpAttempts = 0;
        $maxWakeUpAttempts = 3;
        $spaceIsAwake = false;
        
        while ($wakeUpAttempts < $maxWakeUpAttempts && !$spaceIsAwake) {
            try {
                $wakeResponse = Http::timeout(15)
                    ->withHeaders([
                        'Authorization' => "Bearer {$hfToken}",
                    ])
                    ->get($spaceUrl);
                
                $wakeStatus = $wakeResponse->status();
                
                Log::info('Space wake-up check', [
                    'status' => $wakeStatus,
                    'attempt' => $wakeUpAttempts + 1,
                    'space_url' => $spaceUrl
                ]);
                
                // If we get 200 or successful response, Space is awake
                if ($wakeResponse->successful()) {
                    $spaceIsAwake = true;
                } elseif ($wakeStatus === 502 || $wakeStatus === 503) {
                    // Space is sleeping, wait and retry
                    $wakeUpAttempts++;
                    if ($wakeUpAttempts < $maxWakeUpAttempts) {
                        Log::info('Space is sleeping, waiting before retry', [
                            'wait_seconds' => 5,
                            'attempt' => $wakeUpAttempts
                        ]);
                        sleep(5);
                    }
                } else {
                    // Other error, assume Space is accessible
                    $spaceIsAwake = true;
                }
            } catch (\Exception $e) {
                Log::warning('Space wake-up check failed', [
                    'error' => $e->getMessage(),
                    'attempt' => $wakeUpAttempts + 1
                ]);
                $wakeUpAttempts++;
                if ($wakeUpAttempts < $maxWakeUpAttempts) {
                    sleep(3);
                }
            }
        }
        
        // Step 1: POST request to initiate prediction
        $postResponse = Http::timeout(90)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => "Bearer {$hfToken}",
            ])
            ->post($apiUrl, [
                'data' => $inputData
            ]);

        if (!$postResponse->successful()) {
            $statusCode = $postResponse->status();
            $responseBody = $postResponse->body();
            
            Log::error('Gradio API POST request failed', [
                'status' => $statusCode,
                'response' => $responseBody,
                'user_id' => auth()->id()
            ]);
            
            // Handle specific error cases
            if ($statusCode === 401 || $statusCode === 403) {
            return response()->json([
                'success' => false,
                    'error' => 'AUTHENTICATION_FAILED',
                    'message' => 'Authentication failed. Please verify your Hugging Face API token has access to this private Space.'
                ], 401);
            }
            
            if ($statusCode === 503 || $statusCode === 502) {
                // Space is sleeping - use fallback
                Log::info('Space is sleeping - using local fallback', [
                    'status' => $statusCode,
                    'user_id' => auth()->id()
                ]);
                
                $fallbackRecommendations = $this->generateLocalRecommendations(
                    $wardrobeItems,
                    $weather,
                    $preferences,
                    $maxRecommendations
                );
                
                return response()->json([
                    'success' => true,
                    'recommendations' => $fallbackRecommendations,
                    'source' => 'local_fallback',
                    'fallback_reason' => 'AI Space is sleeping - using preference-based recommendations'
                ]);
            }
            
            // API request failed - use fallback
            Log::warning('API request failed - using local fallback', [
                'status' => $statusCode,
                'user_id' => auth()->id()
            ]);
            
            $fallbackRecommendations = $this->generateLocalRecommendations(
                $wardrobeItems,
                $weather,
                $preferences,
                $maxRecommendations
            );
            
            return response()->json([
                'success' => true,
                'recommendations' => $fallbackRecommendations,
                'source' => 'local_fallback',
                'fallback_reason' => 'Failed to connect to AI service - using preference-based recommendations'
            ]);
        }

        $postData = $postResponse->json();
        
        // Check if results are already in response (synchronous response)
        if (isset($postData['data']) && !empty($postData['data'])) {
            Log::info('Received synchronous response from Gradio API', [
                'has_data' => true,
                'user_id' => auth()->id()
            ]);
            
            $result = is_array($postData['data']) ? $postData['data'] : ['data' => $postData['data']];
            $recommendations = $this->parseHuggingFaceResponse($result, $wardrobeItems);
            
            return response()->json([
                'success' => true,
                'recommendations' => $recommendations,
                'source' => 'hugging_face_ai_gradio_sync',
            ]);
        }
        
        // Get event_id for async processing
        $eventId = $postData['event_id'] ?? null;

        if (!$eventId) {
            Log::warning('No event_id received from Gradio API - using local fallback', [
                'response' => $postData,
                'user_id' => auth()->id()
            ]);
            
            // Use fallback
            $fallbackRecommendations = $this->generateLocalRecommendations(
                $wardrobeItems,
                $weather,
                $preferences,
                $maxRecommendations
            );
            
            return response()->json([
                'success' => true,
                'recommendations' => $fallbackRecommendations,
                'source' => 'local_fallback',
                'fallback_reason' => 'Invalid response from AI service - using preference-based recommendations'
            ]);
        }

        Log::info('Received event_id from Gradio API', [
            'event_id' => $eventId,
            'user_id' => auth()->id()
        ]);

        // Step 2: Poll for results using the correct Gradio API endpoint
        // According to Gradio API docs: GET /gradio_api/call/gradio_recommend/{EVENT_ID}
        $pollUrl = "{$spaceUrl}/gradio_api/call/gradio_recommend/{$eventId}";
        
        // Wait a bit before starting to poll (gives Space time to start processing)
        // Private Spaces need more time to wake up
        Log::info('Waiting before polling (Space wake-up time)', [
            'wait_seconds' => 5,
            'event_id' => $eventId
        ]);
        sleep(5);
        
        $maxWaitTime = 300; // 5 minutes
        $checkInterval = 3; // Check every 3 seconds
        $elapsed = 5; // Start at 5 seconds (we already waited)
        $attempt = 0;
        $consecutive502503 = 0; // Track consecutive 502/503 errors
        
        while ($elapsed < $maxWaitTime) {
            sleep($checkInterval);
            $elapsed += $checkInterval;
            $attempt++;
            
            try {
                // Use GET request with longer timeout for streaming responses
                // Gradio API uses streaming (SSE), so we need a longer timeout
                // According to Gradio docs, responses can take time to stream
                $pollResponse = Http::timeout(60) // Increased timeout for streaming
                    ->withHeaders([
                        'Content-Type' => 'application/json',
                        'Authorization' => "Bearer {$hfToken}",
                        'Accept' => 'text/event-stream, application/json', // Accept streaming responses
                    ])
                    ->get($pollUrl);
                
                $statusCode = $pollResponse->status();
                $responseBody = $pollResponse->body();
                
                // Log response details for debugging
                if ($attempt % 5 === 0 || $statusCode !== 200) {
                    Log::info('Gradio API polling response', [
                        'status' => $statusCode,
                        'body_length' => strlen($responseBody),
                        'body_preview' => substr($responseBody, 0, 500),
                        'event_id' => $eventId,
                        'attempt' => $attempt,
                        'elapsed_seconds' => $elapsed
                    ]);
                }
                
                if ($pollResponse->successful()) {
                    // Handle empty response (still processing)
                    if (empty($responseBody) || trim($responseBody) === '') {
                        if ($attempt % 10 === 0) {
                            Log::info('Gradio API still processing (empty response)', [
                                'elapsed_seconds' => $elapsed,
                    'attempt' => $attempt,
                    'event_id' => $eventId
                ]);
                        }
                        continue;
                    }
                    
                    // Parse Server-Sent Events (SSE) format
                    // Gradio returns: event: complete\ndata: [...] or event: error\ndata: [...]
                    $pollData = null;
                    
                    // Check if response is SSE format (contains "event:" or "data:")
                    if (preg_match('/^(event:|data:)/m', $responseBody)) {
                        // Parse SSE format
                        $lines = explode("\n", $responseBody);
                        $currentEvent = null;
                        $currentData = null;
                        
                        foreach ($lines as $line) {
                            $line = trim($line);
                            if (empty($line)) {
                                // Empty line indicates end of event
                                if ($currentEvent === 'complete' && $currentData !== null) {
                                    try {
                                        $pollData = json_decode($currentData, true);
                                        Log::info('Parsed SSE complete event', [
                                            'event_id' => $eventId,
                                            'data_preview' => substr($currentData, 0, 200)
                                        ]);
                                        break;
                                    } catch (\Exception $e) {
                                        Log::warning('Failed to parse SSE data as JSON', [
                                            'error' => $e->getMessage(),
                                            'data_preview' => substr($currentData, 0, 200)
                                        ]);
                                    }
                                } elseif ($currentEvent === 'error' && $currentData !== null) {
                                    Log::warning('Gradio API returned error event - using local fallback', [
                                        'event_id' => $eventId,
                                        'error_data' => $currentData
                                    ]);
                                    
                                    // Use fallback for Space errors
                                    $fallbackRecommendations = $this->generateLocalRecommendations(
                                        $wardrobeItems,
                                        $weather,
                                        $preferences,
                                        $maxRecommendations
                                    );
                                    
                                    return response()->json([
                                        'success' => true,
                                        'recommendations' => $fallbackRecommendations,
                                        'source' => 'local_fallback',
                                        'fallback_reason' => 'AI Space error - using preference-based recommendations'
                                    ]);
                                }
                                $currentEvent = null;
                                $currentData = null;
                                continue;
                            }
                            
                            // Parse SSE lines: "event: ..." or "data: ..."
                            if (preg_match('/^event:\s*(.+)$/i', $line, $matches)) {
                                $currentEvent = trim($matches[1]);
                            } elseif (preg_match('/^data:\s*(.+)$/i', $line, $matches)) {
                                $currentData = trim($matches[1]);
                            }
                        }
                        
                        // Handle last event if response doesn't end with empty line
                        if ($currentEvent === 'complete' && $currentData && !$pollData) {
                            try {
                                $pollData = json_decode($currentData, true);
                            } catch (\Exception $e) {
                                Log::warning('Failed to parse final SSE data', [
                                    'error' => $e->getMessage()
                                ]);
                            }
                        } elseif ($currentEvent === 'error' && $currentData) {
                            Log::warning('Gradio API error in final event - using local fallback', [
                                'event_id' => $eventId,
                                'error_data' => $currentData
                            ]);
                            
                            // Use fallback for Space errors
                            $fallbackRecommendations = $this->generateLocalRecommendations(
                                $wardrobeItems,
                                $weather,
                                $preferences,
                                $maxRecommendations
                            );
                            
                            return response()->json([
                                'success' => true,
                                'recommendations' => $fallbackRecommendations,
                                'source' => 'local_fallback',
                                'fallback_reason' => 'AI Space processing error - using preference-based recommendations'
                            ]);
                        }
                    }
                    
                    // Fallback: Try to parse as regular JSON (for non-SSE responses)
                    if (!$pollData) {
                        try {
                    $pollData = $pollResponse->json();
                            Log::info('Parsed response as regular JSON (non-SSE)', [
                                'event_id' => $eventId
                            ]);
                        } catch (\Exception $e) {
                            // Response might be in a different format
                            Log::warning('Failed to parse Gradio API response', [
                                'response_preview' => substr($responseBody, 0, 500),
                                'response_length' => strlen($responseBody),
                                'error' => $e->getMessage(),
                                'event_id' => $eventId,
                                'attempt' => $attempt
                            ]);
                            continue;
                        }
                    }
                    
                    if (!$pollData) {
                        continue;
                    }
                    
                    // Check if results are available in data field
                    if (isset($pollData['data']) && !empty($pollData['data'])) {
                        // Extract data from response
                        $responseData = null;
                        if (is_array($pollData['data'])) {
                            // Gradio returns data as array, first element might be the result
                            if (isset($pollData['data'][0]) && !empty($pollData['data'][0])) {
                            $responseData = $pollData['data'][0];
                            } elseif (count($pollData['data']) > 0) {
                                $responseData = $pollData['data'];
                            }
                        } else {
                            $responseData = $pollData['data'];
                        }
                        
                        if ($responseData) {
                            Log::info('Retrieved results from Gradio API', [
                                'elapsed_seconds' => $elapsed,
                                'attempt' => $attempt,
                                'event_id' => $eventId,
                                'endpoint' => $pollUrl,
                                'user_id' => auth()->id()
                            ]);
                            
                            $result = is_array($responseData) ? $responseData : ['data' => $responseData];
                            $recommendations = $this->parseHuggingFaceResponse($result, $wardrobeItems);
                            
                            return response()->json([
                                'success' => true,
                                'recommendations' => $recommendations,
                                'source' => 'hugging_face_ai_gradio_async',
                                'event_id' => $eventId
                            ]);
                        }
                    }
                    
                    // Check status field (if present)
                    if (isset($pollData['status'])) {
                        if ($pollData['status'] === 'COMPLETE' && isset($pollData['data'])) {
                            $responseData = is_array($pollData['data']) && isset($pollData['data'][0]) 
                                ? $pollData['data'][0] 
                                : $pollData['data'];
                            
                            if ($responseData) {
                                $result = is_array($responseData) ? $responseData : ['data' => $responseData];
                                $recommendations = $this->parseHuggingFaceResponse($result, $wardrobeItems);
                                
                                return response()->json([
                                    'success' => true,
                                    'recommendations' => $recommendations,
                                    'source' => 'hugging_face_ai_gradio_async',
                                    'event_id' => $eventId
                                ]);
                            }
                        } elseif ($pollData['status'] === 'FAILED') {
                            Log::warning('Gradio API processing failed - using local fallback', [
                                'event_id' => $eventId,
                                'response' => $pollData,
                                'user_id' => auth()->id()
                            ]);
                            
                            // Use fallback when processing fails
                            $fallbackRecommendations = $this->generateLocalRecommendations(
                                $wardrobeItems,
                                $weather,
                                $preferences,
                                $maxRecommendations
                            );
                            
                            return response()->json([
                                'success' => true,
                                'recommendations' => $fallbackRecommendations,
                                'source' => 'local_fallback',
                                'fallback_reason' => 'AI service failed - using preference-based recommendations'
                            ]);
                        } elseif ($pollData['status'] === 'PROCESSING' || $pollData['status'] === 'PENDING') {
                            // Still processing, continue polling
                            if ($attempt % 10 === 0) {
                                Log::info('Gradio API still processing', [
                                    'status' => $pollData['status'],
                                    'elapsed_seconds' => $elapsed,
                                    'event_id' => $eventId
                                ]);
                            }
                        }
                    }
                    
                    // Log unexpected response format for debugging
                    if ($attempt % 20 === 0) {
                        Log::info('Gradio API polling - unexpected response format', [
                            'response_preview' => substr($responseBody, 0, 300),
                            'event_id' => $eventId,
                            'attempt' => $attempt
                        ]);
                    }
                } else {
                    // Handle authentication errors immediately
                    if ($statusCode === 401 || $statusCode === 403) {
                        Log::error('Gradio API authentication failed during polling', [
                            'status' => $statusCode,
                            'response' => substr($responseBody, 0, 500),
                            'endpoint' => $pollUrl,
                            'event_id' => $eventId,
                            'user_id' => auth()->id()
                        ]);
                        
                        return response()->json([
                            'success' => false,
                            'error' => 'AUTHENTICATION_FAILED',
                            'message' => 'Authentication failed while checking results. Please verify your Hugging Face API token has access to this private Space.'
                        ], 401);
                    }
                    
                    // Handle 502/503 errors - Space is sleeping or starting up
                    if ($statusCode === 502 || $statusCode === 503) {
                        $consecutive502503++;
                        
                        // These are common for private Spaces - continue polling
                        if ($attempt % 5 === 0) {
                            Log::info('Gradio API Space is unavailable (sleeping/starting)', [
                                'status' => $statusCode,
                                'status_text' => $statusCode === 502 ? 'Bad Gateway' : 'Service Unavailable',
                                'event_id' => $eventId,
                                'attempt' => $attempt,
                                'elapsed_seconds' => $elapsed,
                                'consecutive_errors' => $consecutive502503,
                                'message' => 'Space is likely sleeping or starting up. Continuing to poll...'
                            ]);
                        }
                        
                        // Increase wait time if we're getting many consecutive 502/503 errors
                        // This gives the Space more time to wake up
                        if ($consecutive502503 > 5) {
                            $extraWait = min($consecutive502503 * 2, 10); // Max 10 seconds extra wait
                            Log::info('Increasing wait time due to consecutive 502/503 errors', [
                                'extra_wait_seconds' => $extraWait,
                                'consecutive_errors' => $consecutive502503,
                                'event_id' => $eventId
                            ]);
                            sleep($extraWait);
                            $elapsed += $extraWait;
                        } elseif ($statusCode === 503) {
                            sleep(2); // Extra wait for 503
                            $elapsed += 2;
                        }
                        continue;
                    }
                    
                    // Reset counter if we got a successful response (not 502/503)
                    $consecutive502503 = 0;
                    
                    // Handle 404 errors - should not happen with correct endpoint
                    if ($statusCode === 404) {
                        Log::error('Gradio API endpoint not found - this should not happen', [
                            'status' => $statusCode,
                            'endpoint' => $pollUrl,
                            'event_id' => $eventId,
                            'attempt' => $attempt,
                            'response' => substr($responseBody, 0, 500)
                        ]);
                        // Continue polling in case it's temporary
                    }
                    
                    // Handle other errors - log with full details
                    if ($attempt % 10 === 0 || ($statusCode >= 500 && $statusCode !== 502 && $statusCode !== 503)) {
                        Log::warning('Gradio API poll request failed', [
                            'status' => $statusCode,
                            'response' => substr($responseBody, 0, 500),
                            'response_length' => strlen($responseBody),
                            'attempt' => $attempt,
                            'endpoint' => $pollUrl,
                            'event_id' => $eventId,
                            'elapsed_seconds' => $elapsed
                        ]);
                    }
                }
            } catch (\Exception $e) {
                // Continue waiting on exceptions
                if ($attempt % 20 === 0) {
                    Log::warning('Exception during Gradio API polling', [
                        'error' => $e->getMessage(),
                        'attempt' => $attempt,
                        'endpoint' => $pollUrl,
                        'event_id' => $eventId
                    ]);
                }
            }
            
            // Log progress every 30 seconds
            if ($elapsed % 30 === 0) {
                Log::info('Polling Gradio API for results', [
                    'elapsed_seconds' => $elapsed,
                    'attempt' => $attempt,
                    'current_endpoint' => $pollUrl,
                    'event_id' => $eventId,
                    'user_id' => auth()->id()
                ]);
            }
            
            // Fallback: After 60 seconds, try re-calling the original endpoint
            // Some Gradio setups return results when you call the same endpoint again
            if ($elapsed === 60) {
                Log::info('Trying fallback: re-calling original endpoint', [
                    'event_id' => $eventId,
                    'user_id' => auth()->id()
                ]);
                
                try {
                    $originalUrl = "{$spaceUrl}/gradio_api/call/gradio_recommend";
                    $recheckResponse = Http::timeout(30)
                        ->withHeaders([
                            'Content-Type' => 'application/json',
                            'Authorization' => "Bearer {$hfToken}",
                        ])
                        ->post($originalUrl, [
                            'data' => $inputData,
                            'event_id' => $eventId // Include event_id in case it helps
                        ]);
                    
                    if ($recheckResponse->successful()) {
                        $recheckData = $recheckResponse->json();
                        
                        if (isset($recheckData['data']) && !empty($recheckData['data'])) {
                            Log::info('Retrieved results from re-calling original endpoint', [
                                'event_id' => $eventId,
                                'user_id' => auth()->id()
                            ]);
                            
                            $result = is_array($recheckData['data']) ? $recheckData['data'] : ['data' => $recheckData['data']];
                            $recommendations = $this->parseHuggingFaceResponse($result, $wardrobeItems);
                            
                            return response()->json([
                                'success' => true,
                                'recommendations' => $recommendations,
                                'source' => 'hugging_face_ai_gradio_fallback',
                                'event_id' => $eventId
                            ]);
                        }
                    }
                } catch (\Exception $e) {
                    // Continue with normal polling
                    Log::debug('Fallback re-call failed, continuing polling', [
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }

        // Timeout reached - use fallback
        Log::warning('Gradio API polling timeout - using local fallback', [
            'event_id' => $eventId,
            'elapsed_seconds' => $elapsed,
            'attempts' => $attempt,
            'space_url' => $spaceUrl,
            'user_id' => auth()->id()
        ]);
        
        // Generate local recommendations as fallback
        $fallbackRecommendations = $this->generateLocalRecommendations(
            $wardrobeItems,
            $weather,
            $preferences,
            $maxRecommendations
        );
        
        return response()->json([
            'success' => true,
            'recommendations' => $fallbackRecommendations,
            'source' => 'local_fallback',
            'fallback_reason' => 'API timeout - using preference-based recommendations'
        ]);
    }

    /**
     * Parse FastAPI response format
     */
    private function parseFastAPIResponse(array $responseData, array $wardrobeItems): array
    {
        try {
            $outfits = $responseData['outfits'] ?? [];
            
            if (empty($outfits)) {
                return [
                    'message' => 'No outfit recommendations available.',
                    'items' => [],
                    'reason' => 'No matches found',
                    'confidence' => 0
                ];
            }

            // Take first outfit recommendation
            $outfit = $outfits[0] ?? [];
            
            // Extract item IDs from outfit
            $itemIds = $outfit['item_ids'] ?? [];
            
            // Map item IDs to actual wardrobe items
            $recommendedItems = [];
            foreach ($itemIds as $itemId) {
                // Try to find matching item
                $itemIdStr = (string)$itemId;
                foreach ($wardrobeItems as $item) {
                    if ((string)($item['id'] ?? '') === $itemIdStr || 
                        str_contains($itemIdStr, (string)($item['id'] ?? ''))) {
                        $recommendedItems[] = [
                            'id' => $item['id'],
                            'name' => $item['name'] ?? 'Unknown',
                            'category' => $item['category'] ?? '',
                            'color' => $item['color'] ?? '',
                            'brand' => $item['brand'] ?? '',
                            'size' => $item['size'] ?? '',
                        ];
                        break;
                    }
                }
            }

            return [
                'message' => 'AI-generated outfit recommendation',
                'items' => $recommendedItems,
                'reason' => 'AI model recommendation based on your wardrobe',
                'confidence' => 0.85,
                'outfit_details' => $outfit
            ];

        } catch (\Exception $e) {
            Log::error('Error parsing FastAPI response', [
                'error' => $e->getMessage(),
                'response' => $responseData
            ]);

            return [
                'message' => 'Received recommendations but had trouble processing them.',
                'items' => [],
                'reason' => 'Processing error',
                'confidence' => 0
            ];
        }
    }

    /**
     * Prepare input data in the format expected by Hugging Face model
     */
    private function prepareHuggingFaceInput(array $wardrobeItems, array $weather, array $preferences, int $maxRecommendations): array
    {
        // Extract weather information (simplified - only temp and condition matter)
        $temperature = $weather['main']['temp'] ?? 27;
        $weatherCondition = $weather['weather'][0]['main'] ?? 'Clear';
        // Normalize condition for better matching
        $conditionNormalized = strtolower($weatherCondition);
        if (in_array($conditionNormalized, ['drizzle', 'rain'])) {
            $weatherCondition = 'Rainy';
        } elseif (in_array($conditionNormalized, ['clear'])) {
            $weatherCondition = 'Sunny';
        } elseif (in_array($conditionNormalized, ['clouds', 'cloudy'])) {
            $weatherCondition = 'Cloudy';
        }
        
        $humidity = $weather['main']['humidity'] ?? 70; // Kept for API compatibility
        $windSpeed = $weather['wind']['speed'] ?? 5; // Kept for API compatibility
        $location = $weather['name'] ?? 'Unknown';

        // Format wardrobe items for the model
        $formattedItems = array_map(function ($item) {
            return [
                'id' => $item['id'],
                'name' => $item['name'],
                'category' => strtolower($item['category'] ?? ''),
                'color' => strtolower($item['color'] ?? ''),
                'brand' => $item['brand'] ?? '',
                'size' => $item['size'] ?? '',
                'description' => $item['description'] ?? '',
            ];
        }, $wardrobeItems);

        // Format user preferences
        $preferredColors = array_map('strtolower', $preferences['preferredColors'] ?? []);
        $preferredCategories = array_map('strtolower', $preferences['preferredCategories'] ?? []);
        $preferredBrands = array_map('strtolower', $preferences['preferredBrands'] ?? []);
        $preferredOccasions = $preferences['preferredOccasions'] ?? [];
        $styleNotes = $preferences['styleNotes'] ?? '';
        $avoidColors = array_map('strtolower', $preferences['avoidColors'] ?? []);
        $avoidCategories = array_map('strtolower', $preferences['avoidCategories'] ?? []);

        // Prepare the data array in Hugging Face expected format
        // The exact format depends on the model's input schema
        // Adjust this based on the actual model requirements
        return [
            // Wardrobe items
            json_encode($formattedItems),
            
            // Weather context
            $weatherCondition,
            $temperature,
            $humidity,
            $windSpeed,
            
            // User preferences
            implode(',', $preferredColors),
            implode(',', $preferredCategories),
            implode(',', $preferredBrands),
            implode(',', $preferredOccasions),
            $styleNotes,
            implode(',', $avoidColors),
            implode(',', $avoidCategories),
            
            // Max recommendations
            $maxRecommendations,
        ];
    }

    /**
     * Generate local preference-based recommendations as fallback when API fails
     * Uses scoring based on user preferences, colors, categories, and weather
     */
    private function generateLocalRecommendations(array $wardrobeItems, array $weather, array $preferences, int $maxRecommendations): array
    {
        Log::info('Generating local fallback recommendations', [
            'wardrobe_count' => count($wardrobeItems),
            'max_recommendations' => $maxRecommendations,
            'user_id' => auth()->id()
        ]);

        // Extract weather information
        $temperature = $weather['main']['temp'] ?? 27;
        $weatherCondition = strtolower($weather['weather'][0]['main'] ?? 'clear');
        $humidity = $weather['main']['humidity'] ?? 70;

        // Extract preferences
        $preferredColors = array_map('strtolower', $preferences['preferredColors'] ?? []);
        $preferredCategories = array_map('strtolower', $preferences['preferredCategories'] ?? []);
        $preferredBrands = array_map('strtolower', $preferences['preferredBrands'] ?? []);
        $avoidColors = array_map('strtolower', $preferences['avoidColors'] ?? []);
        $avoidCategories = array_map('strtolower', $preferences['avoidCategories'] ?? []);

        // Define category groups for outfit building
        $categoryGroups = [
            'tops' => ['t-shirt', 'shirt', 'blouse', 'polo', 'tank', 'sweater', 'hoodie', 'jacket', 'coat', 'cardigan', 'top'],
            'bottoms' => ['pants', 'jeans', 'shorts', 'skirt', 'trousers', 'leggings', 'joggers'],
            'footwear' => ['shoes', 'sneakers', 'boots', 'sandals', 'heels', 'loafers', 'flats'],
            'dresses' => ['dress', 'romper', 'jumpsuit'],
            'accessories' => ['hat', 'cap', 'bag', 'belt', 'scarf', 'watch', 'jewelry', 'glasses', 'sunglasses'],
            'outerwear' => ['jacket', 'coat', 'blazer', 'cardigan', 'sweater', 'hoodie']
        ];

        // Weather-appropriate categories
        $weatherAppropriate = $this->getWeatherAppropriateCategories($temperature, $weatherCondition);

        // Score each item
        $scoredItems = [];
        $reasonNotes = [];

        foreach ($wardrobeItems as $item) {
            $score = 0;
            $itemCategory = strtolower($item['category'] ?? '');
            $itemColor = strtolower($item['color'] ?? '');
            $itemBrand = strtolower($item['brand'] ?? '');

            // Skip items in avoid lists
            if (in_array($itemColor, $avoidColors)) {
                continue;
            }
            foreach ($avoidCategories as $avoidCat) {
                if (str_contains($itemCategory, $avoidCat)) {
                    continue 2;
                }
            }

            // Score based on preferred colors (high weight)
            if (in_array($itemColor, $preferredColors)) {
                $score += 30;
                $reasonNotes['preferredColor'] = true;
            }

            // Score based on preferred categories
            foreach ($preferredCategories as $prefCat) {
                if (str_contains($itemCategory, $prefCat)) {
                    $score += 25;
                    $reasonNotes['preferredCategory'] = true;
                    break;
                }
            }

            // Score based on preferred brands
            if (in_array($itemBrand, $preferredBrands)) {
                $score += 15;
                $reasonNotes['preferredBrand'] = true;
            }

            // Score based on weather appropriateness
            if ($this->isWeatherAppropriate($itemCategory, $weatherAppropriate)) {
                $score += 20;
                $reasonNotes['weatherAligned'] = true;
            }

            // Add some randomness to prevent always showing same items
            $score += rand(0, 10);

            // Base score for all items
            $score += 5;

            $scoredItems[] = [
                'item' => $item,
                'score' => $score,
                'category_group' => $this->getCategoryGroup($itemCategory, $categoryGroups)
            ];
        }

        // Sort by score descending
        usort($scoredItems, function ($a, $b) {
            return $b['score'] - $a['score'];
        });

        // Build a balanced outfit (try to include different category groups)
        $selectedItems = [];
        $usedCategoryGroups = [];
        $usedIds = [];

        // First pass: Select high-scoring items from different categories
        foreach ($scoredItems as $scored) {
            if (count($selectedItems) >= $maxRecommendations) {
                break;
            }

            $item = $scored['item'];
            $categoryGroup = $scored['category_group'];

            // Skip if already used this item
            if (in_array($item['id'], $usedIds)) {
                continue;
            }

            // Try to get variety - limit items per category group
            $categoryCount = count(array_filter($usedCategoryGroups, fn($g) => $g === $categoryGroup));
            if ($categoryCount >= 2 && count($selectedItems) < $maxRecommendations - 1) {
                continue;
            }

            $selectedItems[] = $item;
            $usedIds[] = $item['id'];
            $usedCategoryGroups[] = $categoryGroup;
        }

        // Second pass: Fill remaining slots if needed
        foreach ($scoredItems as $scored) {
            if (count($selectedItems) >= $maxRecommendations) {
                break;
            }

            $item = $scored['item'];
            if (!in_array($item['id'], $usedIds)) {
                $selectedItems[] = $item;
                $usedIds[] = $item['id'];
            }
        }

        // Build reason message
        $reasons = [];
        if (!empty($reasonNotes['preferredColor'])) {
            $reasons[] = 'your preferred colors';
        }
        if (!empty($reasonNotes['preferredCategory'])) {
            $reasons[] = 'your preferred categories';
        }
        if (!empty($reasonNotes['preferredBrand'])) {
            $reasons[] = 'your favorite brands';
        }
        if (!empty($reasonNotes['weatherAligned'])) {
            $reasons[] = "today's weather ({$temperature}°C, {$weatherCondition})";
        }

        $reasonMessage = !empty($reasons) 
            ? 'Matched ' . implode(', ', $reasons) . '.'
            : 'Showing a mix of pieces from your wardrobe.';

        // Calculate confidence based on how well items matched preferences
        $totalScore = array_sum(array_column(array_slice($scoredItems, 0, count($selectedItems)), 'score'));
        $maxPossibleScore = count($selectedItems) * 100;
        $confidence = $maxPossibleScore > 0 
            ? min(0.85, 0.25 + ($totalScore / $maxPossibleScore) * 0.6)
            : 0.25;

        $message = count($selectedItems) > 0
            ? "Here's a look that blends your preferences with today's weather."
            : "We couldn't find enough items that match your preferences.";

        // Add weather context to message
        $weatherMessage = $this->buildWeatherMessage($temperature, $weatherCondition);

        return [
            'message' => $message,
            'items' => $selectedItems,
            'reason' => $reasonMessage . ' ' . $weatherMessage,
            'confidence' => round($confidence, 2),
            'weatherContext' => [
                'temp' => $temperature,
                'condition' => ucfirst($weatherCondition),
                'humidity' => $humidity
            ]
        ];
    }

    /**
     * Get weather-appropriate clothing categories based on temperature and condition
     */
    private function getWeatherAppropriateCategories(float $temperature, string $condition): array
    {
        $categories = [];

        // Temperature-based categories
        if ($temperature >= 30) {
            // Hot weather
            $categories = array_merge($categories, ['t-shirt', 'tank', 'shorts', 'sandals', 'dress', 'skirt']);
        } elseif ($temperature >= 25) {
            // Warm weather
            $categories = array_merge($categories, ['t-shirt', 'polo', 'shirt', 'shorts', 'jeans', 'sneakers', 'sandals', 'dress']);
        } elseif ($temperature >= 20) {
            // Mild weather
            $categories = array_merge($categories, ['shirt', 'polo', 'jeans', 'pants', 'sneakers', 'cardigan']);
        } elseif ($temperature >= 15) {
            // Cool weather
            $categories = array_merge($categories, ['sweater', 'jacket', 'jeans', 'pants', 'boots', 'cardigan']);
        } else {
            // Cold weather
            $categories = array_merge($categories, ['sweater', 'hoodie', 'coat', 'jacket', 'boots', 'pants', 'jeans']);
        }

        // Condition-based adjustments
        if (str_contains($condition, 'rain') || str_contains($condition, 'drizzle')) {
            $categories = array_merge($categories, ['jacket', 'coat', 'boots']);
            $categories = array_diff($categories, ['sandals']); // Remove sandals in rain
        }

        return array_unique($categories);
    }

    /**
     * Check if an item category is weather-appropriate
     */
    private function isWeatherAppropriate(string $itemCategory, array $weatherAppropriate): bool
    {
        foreach ($weatherAppropriate as $appropriate) {
            if (str_contains($itemCategory, $appropriate)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get the category group for an item
     */
    private function getCategoryGroup(string $itemCategory, array $categoryGroups): string
    {
        foreach ($categoryGroups as $group => $categories) {
            foreach ($categories as $category) {
                if (str_contains($itemCategory, $category)) {
                    return $group;
                }
            }
        }
        return 'other';
    }

    /**
     * Build a weather-based message for recommendations
     */
    private function buildWeatherMessage(float $temperature, string $condition): string
    {
        $tempDescription = '';
        if ($temperature >= 30) {
            $tempDescription = 'It\'s hot outside';
        } elseif ($temperature >= 25) {
            $tempDescription = 'It\'s warm';
        } elseif ($temperature >= 20) {
            $tempDescription = 'The weather is mild';
        } elseif ($temperature >= 15) {
            $tempDescription = 'It\'s a bit cool';
        } else {
            $tempDescription = 'It\'s cold outside';
        }

        $conditionNote = '';
        if (str_contains($condition, 'rain') || str_contains($condition, 'drizzle')) {
            $conditionNote = ', bring an umbrella or jacket';
        } elseif (str_contains($condition, 'cloud')) {
            $conditionNote = ', might stay cloudy';
        } elseif (str_contains($condition, 'clear') || str_contains($condition, 'sun')) {
            $conditionNote = ', enjoy the sunshine';
        }

        return "Weather: {$tempDescription} at {$temperature}°C{$conditionNote}.";
    }

    /**
     * Parse the response from Hugging Face and map it to wardrobe items
     */
    private function parseHuggingFaceResponse(array $response, array $wardrobeItems): array
    {
        try {
            // Extract the actual recommendation data
            // Adjust this based on the actual response structure from the model
            $data = $response['data'] ?? $response['result'] ?? [];
            
            if (empty($data)) {
                Log::warning('Empty data from Hugging Face response', ['response' => $response]);
                return [
                    'message' => 'Unable to generate recommendations at this time.',
                    'items' => [],
                    'reason' => 'No recommendations available',
                    'confidence' => 0
                ];
            }

            // The model should return recommended item IDs or indices
            // Parse the response and map to actual wardrobe items
            $recommendedIds = [];
            $message = '';
            $reason = '';
            $confidence = 0;

            // Check different possible response formats
            if (is_array($data) && isset($data[0])) {
                // If response is an array with results
                $result = is_string($data[0]) ? json_decode($data[0], true) : $data[0];
                
                if (is_array($result)) {
                    $recommendedIds = $result['recommended_ids'] ?? $result['items'] ?? [];
                    $message = $result['message'] ?? 'AI generated personalized recommendations for you.';
                    $reason = $result['reason'] ?? 'Based on your preferences and current weather.';
                    $confidence = $result['confidence'] ?? 0.75;
                }
            }

            // Map IDs to actual wardrobe items
            $recommendedItems = [];
            $wardrobeItemsById = collect($wardrobeItems)->keyBy('id');

            foreach ($recommendedIds as $itemId) {
                if (isset($wardrobeItemsById[$itemId])) {
                    $recommendedItems[] = $wardrobeItemsById[$itemId];
                }
            }

            return [
                'message' => $message,
                'items' => $recommendedItems,
                'reason' => $reason,
                'confidence' => $confidence,
                'weatherContext' => [
                    'temp' => $data['weather_temp'] ?? null,
                    'condition' => $data['weather_condition'] ?? null,
                    'windSpeed' => $data['wind_speed'] ?? null,
                ]
            ];

        } catch (\Exception $e) {
            Log::error('Error parsing Hugging Face response', [
                'error' => $e->getMessage(),
                'response' => $response
            ]);

            return [
                'message' => 'Received recommendations but had trouble processing them.',
                'items' => [],
                'reason' => 'Processing error',
                'confidence' => 0
            ];
        }
    }
}