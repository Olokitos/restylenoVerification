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

        $wardrobeItem = new WardrobeItem([
            'user_id' => auth()->id(),
            'name' => $request->name,
            'brand' => $request->brand,
            'category' => $request->category,
            'color' => $request->color,
            'size' => $request->size,
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

        // Update basic fields
        $wardrobeItem->update([
            'name' => $request->name,
            'brand' => $request->brand,
            'category' => $request->category,
            'color' => $request->color,
            'size' => $request->size,
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
     * Generate AI outfit recommendations using Hugging Face Stylique/recomendation model
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
                Log::warning('Hugging Face API token not configured');
                return response()->json([
                    'success' => false,
                    'error' => 'API_NOT_CONFIGURED',
                    'message' => 'Hugging Face API token not configured'
                ], 500);
            }

            // Call Hugging Face Gradio API
            $apiUrl = 'https://stylique-recomendation.hf.space/gradio_api/call/gradio_recommend';
            
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
                Log::error('Hugging Face API POST request failed', [
                    'status' => $postResponse->status(),
                    'response' => $postResponse->body(),
                    'user_id' => auth()->id()
                ]);
                
                return response()->json([
                    'success' => false,
                    'error' => 'API_REQUEST_FAILED',
                    'message' => 'Failed to connect to AI service'
                ], 500);
            }

            $postData = $postResponse->json();
            $eventId = $postData['event_id'] ?? null;

            if (!$eventId) {
                Log::error('No event_id received from Hugging Face API', [
                    'response' => $postData,
                    'user_id' => auth()->id()
                ]);
                
                return response()->json([
                    'success' => false,
                    'error' => 'NO_EVENT_ID',
                    'message' => 'Invalid response from AI service'
                ], 500);
            }

            Log::info('Received event_id from Hugging Face', ['event_id' => $eventId]);

            // Step 2: GET request to retrieve prediction result
            // Try multiple endpoint formats (Gradio API can use different formats)
            $endpointFormats = [
                "https://stylique-recomendation.hf.space/gradio_api/queue/status/{$eventId}",
                "https://stylique-recomendation.hf.space/gradio_api/call/gradio_recommend/{$eventId}",
            ];
            
            // Poll for results (max 5 minutes total to account for cold starts)
            // Use shorter timeouts for polling requests since we're just checking status
            $maxAttempts = 60; // 60 attempts with progressive wait times = ~5 minutes max
            $maxTotalTime = 300; // 5 minutes in seconds
            $startTime = time();
            $attempt = 0;
            $result = null;
            $currentEndpoint = 0;

            while ($attempt < $maxAttempts && (time() - $startTime) < $maxTotalTime) {
                // Wait progressively longer: 2s first 5 times, then 3s, then 5s
                if ($attempt < 5) {
                    $waitTime = 2;
                } elseif ($attempt < 20) {
                    $waitTime = 3;
                } else {
                    $waitTime = 5;
                }
                sleep($waitTime);
                
                // Try different endpoint formats if one fails
                $getUrl = $endpointFormats[$currentEndpoint % count($endpointFormats)];
                
                try {
                    // Use shorter timeout for polling requests (15 seconds) - we're just checking status
                    $getResponse = Http::timeout(15)
                        ->withHeaders([
                            'Authorization' => "Bearer {$hfToken}",
                            'Accept' => 'application/json',
                        ])
                        ->get($getUrl);

                    if ($getResponse->successful()) {
                        $getData = $getResponse->json();
                        
                        // Check multiple possible response structures
                        $responseData = null;
                        if (isset($getData['data'])) {
                            $responseData = $getData['data'];
                        } elseif (isset($getData['result'])) {
                            $responseData = $getData['result'];
                        } elseif (isset($getData['output'])) {
                            $responseData = $getData['output'];
                        } elseif (isset($getData['status']) && $getData['status'] === 'COMPLETE' && isset($getData['data'])) {
                            $responseData = $getData['data'];
                        }
                        
                        // If we have data, use it
                        if ($responseData !== null && !empty($responseData)) {
                            $result = is_array($responseData) && isset($responseData[0]) ? $responseData : ['data' => $responseData];
                            Log::info('Successfully retrieved result from Hugging Face', [
                                'attempt' => $attempt + 1,
                                'event_id' => $eventId,
                                'endpoint' => $getUrl
                            ]);
                            break;
                        }
                        
                        // Check if still processing
                        if (isset($getData['status'])) {
                            if ($getData['status'] === 'PROCESSING' || $getData['status'] === 'PENDING') {
                                // Still processing, continue polling
                                if ($attempt % 10 === 0) {
                                    Log::info('Hugging Face model still processing', [
                                        'attempt' => $attempt + 1,
                                        'status' => $getData['status'],
                                        'event_id' => $eventId
                                    ]);
                                }
                            } elseif ($getData['status'] === 'FAILED') {
                                Log::error('Hugging Face model processing failed', [
                                    'event_id' => $eventId,
                                    'response' => $getData
                                ]);
                                break;
                            }
                        }
                        
                        // Log progress every 10 attempts
                        if ($attempt % 10 === 0 && $attempt > 0) {
                            Log::info('Polling for Hugging Face results', [
                                'attempt' => $attempt + 1,
                                'max_attempts' => $maxAttempts,
                                'event_id' => $eventId,
                                'endpoint' => $getUrl,
                                'response_status' => $getResponse->status()
                            ]);
                        }
                    } else {
                        // Try next endpoint format if current one fails consistently
                        if ($attempt > 5 && $attempt % 15 === 0) {
                            $currentEndpoint++;
                            Log::info('Switching to alternative endpoint format', [
                                'attempt' => $attempt + 1,
                                'new_endpoint' => $endpointFormats[$currentEndpoint % count($endpointFormats)],
                                'status_code' => $getResponse->status()
                            ]);
                        }
                    }
                } catch (\Exception $pollingException) {
                    // Log polling errors but continue trying
                    if ($attempt % 15 === 0) { // Only log every 15th attempt to avoid spam
                        Log::warning('Polling error for Hugging Face results', [
                            'attempt' => $attempt + 1,
                            'error' => $pollingException->getMessage(),
                            'event_id' => $eventId,
                            'endpoint' => $getUrl
                        ]);
                    }
                }
                
                $attempt++;
            }

            if (!$result) {
                $elapsedTime = time() - $startTime;
                Log::error('Hugging Face API timed out waiting for results', [
                    'event_id' => $eventId,
                    'attempts' => $attempt,
                    'elapsed_seconds' => $elapsedTime,
                    'user_id' => auth()->id()
                ]);
                
                return response()->json([
                    'success' => false,
                    'error' => 'API_TIMEOUT',
                    'message' => 'AI service took too long to respond'
                ], 504);
            }

            Log::info('Received result from Hugging Face', [
                'result' => $result,
                'user_id' => auth()->id()
            ]);

            // Parse and format the AI response
            $recommendations = $this->parseHuggingFaceResponse($result, $wardrobeItems);

            return response()->json([
                'success' => true,
                'recommendations' => $recommendations,
                'source' => 'hugging_face_ai',
                'event_id' => $eventId
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'VALIDATION_ERROR',
                'message' => 'Invalid input data',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error generating AI recommendations', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id()
            ]);
            
            // Check if it's a timeout error - provide better error message
            if (str_contains($e->getMessage(), 'Maximum execution time') || str_contains($e->getMessage(), 'timeout')) {
                return response()->json([
                    'success' => false,
                    'error' => 'TIMEOUT',
                    'message' => 'The recommendation service is processing your request. This may take a moment. Please try again in a few seconds.',
                    'timeout' => true
                ], 504);
            }
            
            return response()->json([
                'success' => false,
                'error' => 'GENERAL_ERROR',
                'message' => 'An error occurred while generating recommendations. Please try again.',
            ], 500);
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