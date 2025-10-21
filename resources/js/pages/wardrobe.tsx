import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useAuthNavigation } from '@/hooks/use-auth-navigation';
import { 
    Plus, 
    Search, 
    Shirt, 
    Edit3, 
    Trash2, 
    ArrowLeft,
    Grid3X3,
    List,
    MoreVertical,
    Heart,
    X,
    Cloud,
    Sun,
    CloudRain,
    Snowflake,
    Wind,
    Thermometer,
    MapPin,
    RefreshCw,
    Save,
    Sparkles
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Wardrobe',
        href: '/wardrobe',
    },
];

const categories = ['T-shirt', 'Shirt', 'Pants', 'Shorts', 'Dress', 'Shoes', 'Hat', 'Accessories'];
const colors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Purple', 'Brown', 'Gray'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50'];

interface WardrobeItem {
    id: number;
    name: string;
    brand: string;
    category: string;
    color: string;
    size?: string;
    description?: string;
    image_path?: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
}

interface WardrobeProps {
    wardrobeItems: WardrobeItem[];
}

export default function Wardrobe({ wardrobeItems }: WardrobeProps) {
    useAuthNavigation();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedColor, setSelectedColor] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isAddItemOpen, setIsAddItemOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    
    // AI Recommender states
    const [weather, setWeather] = useState<any>(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<any>(null);
    const [suggestionLoading, setSuggestionLoading] = useState(false);
    const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
    const [savedOutfits, setSavedOutfits] = useState<any[]>([]);
    const [isSaveOutfitOpen, setIsSaveOutfitOpen] = useState(false);
    const [selectedOutfitItems, setSelectedOutfitItems] = useState<WardrobeItem[]>([]);
    const [mlConfidence, setMlConfidence] = useState<number>(0);
    const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
    const [isSavingPreferences, setIsSavingPreferences] = useState(false);
    const [selectedForToday, setSelectedForToday] = useState<number[]>([]);
    const [isWearingOutfit, setIsWearingOutfit] = useState(false);
    const [maxRecommendations, setMaxRecommendations] = useState(6); // Configurable number of recommendations
    const [userPreferences, setUserPreferences] = useState({
        preferredColors: [] as string[],
        preferredCategories: [] as string[],
        preferredBrands: [] as string[],
        preferredOccasions: [] as string[],
        styleNotes: '',
        avoidColors: [] as string[],
        avoidCategories: [] as string[],
    });

    // Handle dialog scroll behavior
    useEffect(() => {
        // Ensure dialog doesn't prevent page scrolling
        if (isAddItemOpen) {
            const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
            if (dialog) {
                dialog.style.position = 'fixed';
                dialog.style.top = '50%';
                dialog.style.left = '50%';
                dialog.style.transform = 'translate(-50%, -50%)';
                dialog.style.maxHeight = '90vh';
                dialog.style.overflowY = 'auto';
            }
        }
    }, [isAddItemOpen]);

    // Fetch weather data using geolocation
    const fetchWeather = async () => {
        setWeatherLoading(true);
        
        try {
            const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
            if (!apiKey) {
                throw new Error('Weather API key not found');
            }

            // Get user's current location
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        setLocationPermission('granted');
                        resolve(pos);
                    },
                    (error) => {
                        setLocationPermission('denied');
                        reject(error);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 300000 // 5 minutes
                    }
                );
            });

            const { latitude, longitude } = position.coords;
            
            // Fetch weather using coordinates
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
            );
            
            if (!response.ok) {
                throw new Error('Weather fetch failed');
            }
            
            const data = await response.json();
            setWeather(data);
            setSuccessMessage('Weather updated successfully! 🌤️');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error('Weather fetch error:', error);
            
            // If geolocation fails, try with a default location (Lapu-Lapu City)
            try {
                const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=Lapu-Lapu City,PH&appid=${apiKey}&units=metric`
                );
                
                if (response.ok) {
                    const data = await response.json();
                    setWeather(data);
                    setSuccessMessage('Weather updated (using default location) 🌤️');
                    setTimeout(() => setSuccessMessage(null), 3000);
                } else {
                    throw new Error('Fallback weather fetch failed');
                }
            } catch (fallbackError) {
                console.error('Fallback weather fetch error:', fallbackError);
                // Set dummy weather data for testing
                setWeather({
                    name: 'Lapu-Lapu City',
                    main: { temp: 28, feels_like: 32, humidity: 75 },
                    weather: [{ main: 'Clouds', description: 'overcast clouds', icon: '04d' }],
                    wind: { speed: 8 }
                });
                setSuccessMessage('Using demo weather data 🌤️');
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        } finally {
            setWeatherLoading(false);
        }
    };

    // Generate AI outfit suggestion with ML integration
    const generateAISuggestion = async () => {
        setSuggestionLoading(true);
        
        try {
            if (!wardrobeItems.length) {
                setAiSuggestion({
                    message: "Add some items to your wardrobe to get personalized suggestions!",
                    items: [],
                    reason: "No items available"
                });
                setSuggestionLoading(false);
                setSuccessMessage('Please add some wardrobe items first! 👕');
                setTimeout(() => setSuccessMessage(null), 3000);
                return;
            }

            if (!weather) {
                setSuccessMessage('Fetching weather data first... 🌤️');
                setTimeout(() => setSuccessMessage(null), 2000);
                await fetchWeather();
            }

            // Check local storage cache first
            const cacheKey = `ai_recommendations_${weather.main.temp}_${weather.weather[0].main}_${maxRecommendations}`;
            const cached = localStorage.getItem(cacheKey);
            const cacheTime = localStorage.getItem(`${cacheKey}_time`);
            
            if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 3600000) { // 1 hour cache
                const cachedData = JSON.parse(cached);
                setAiSuggestion(cachedData.suggestion);
                setMlConfidence(cachedData.mlConfidence);
                setSuggestionLoading(false);
                return;
            }

            // Call ML API
            const response = await fetch('/api/ai-recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    weather: weather,
                    occasion: 'casual', // Default occasion, can be made dynamic
                    max_recommendations: maxRecommendations
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success) {
                    setAiSuggestion(data.recommendations);
                    setMlConfidence(data.ml_confidence);
                    
                    // Cache the result
                    localStorage.setItem(cacheKey, JSON.stringify({
                        suggestion: data.recommendations,
                        mlConfidence: data.ml_confidence
                    }));
                    localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
                    
                    setSuccessMessage('AI recommendations generated successfully! 🤖✨');
                    setTimeout(() => setSuccessMessage(null), 3000);
                } else {
                    throw new Error(data.message || 'Failed to get recommendations');
                }
            } else {
                throw new Error('API request failed');
            }

        } catch (error) {
            console.error('ML API Error:', error);
            
            // Fallback to weather-based recommendations
            const temp = weather.main.temp;
            const condition = weather.weather[0].main.toLowerCase();
            const windSpeed = weather.wind.speed;
            
            let suggestion: any = {
                message: "",
                items: [],
                reason: "",
                weather: {
                    temp: temp,
                    condition: condition,
                    windSpeed: windSpeed
                }
            };

            // Temperature-based recommendations
            if (temp > 30) {
                suggestion.message = "It's hot! Stay cool with light, breathable clothing.";
                suggestion.reason = "High temperature detected";
                suggestion.items = wardrobeItems.filter(item => 
                    item.category.toLowerCase().includes('shirt') || 
                    item.category.toLowerCase().includes('dress') ||
                    item.category.toLowerCase().includes('shorts')
                ).slice(0, maxRecommendations);
            } else if (temp < 15) {
                suggestion.message = "It's chilly! Layer up with warm clothing.";
                suggestion.reason = "Low temperature detected";
                suggestion.items = wardrobeItems.filter(item => 
                    item.category.toLowerCase().includes('shirt') || 
                    item.category.toLowerCase().includes('pants') ||
                    item.category.toLowerCase().includes('dress')
                ).slice(0, maxRecommendations);
            } else {
                suggestion.message = "Perfect weather! Choose comfortable, versatile pieces.";
                suggestion.reason = "Moderate temperature";
                suggestion.items = wardrobeItems.slice(0, maxRecommendations);
            }

            // Weather condition adjustments
            if (condition.includes('rain')) {
                suggestion.message += " Don't forget rain protection!";
                suggestion.items = suggestion.items.filter((item: WardrobeItem) => 
                    item.category.toLowerCase().includes('jacket') ||
                    item.category.toLowerCase().includes('coat')
                ).concat(suggestion.items).slice(0, maxRecommendations);
            }

            if (windSpeed > 10) {
                suggestion.message += " It's windy - consider layers that won't blow around.";
            }

            setAiSuggestion(suggestion);
            setMlConfidence(0.3); // Lower confidence for fallback
        } finally {
            setSuggestionLoading(false);
        }
    };

    // Load weather and generate suggestion on component mount
    useEffect(() => {
        fetchWeather();
    }, []);

    useEffect(() => {
        if (weather && wardrobeItems.length > 0) {
            generateAISuggestion();
        }
    }, [weather, wardrobeItems]);

    // Load saved outfits and preferences on component mount
    useEffect(() => {
        loadSavedOutfits();
        loadUserPreferences();
    }, []);

    // Load saved outfits from API
    const loadSavedOutfits = async () => {
        try {
            const response = await fetch('/api/outfits/saved');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setSavedOutfits(data.outfits);
                }
            }
        } catch (error) {
            console.error('Error loading saved outfits:', error);
        }
    };

    // Save outfit combination
    const saveOutfit = async (outfitData: any) => {
        try {
            const response = await fetch('/api/outfits/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(outfitData)
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setSuccessMessage('Outfit saved successfully! ✨');
                    setTimeout(() => setSuccessMessage(null), 3000);
                    loadSavedOutfits(); // Refresh saved outfits list
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error saving outfit:', error);
            return false;
        }
    };

    // Submit feedback on recommendation
    const submitFeedback = async (feedbackType: string, outfitId?: number) => {
        try {
            const response = await fetch('/api/outfits/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    saved_outfit_id: outfitId,
                    feedback_type: feedbackType,
                    recommendation_context: {
                        weather: weather,
                        ml_confidence: mlConfidence,
                        timestamp: new Date().toISOString()
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Show different messages based on feedback type
                    const messages = {
                        'liked': '👍 Thanks! We\'ll show you more similar styles.',
                        'wore_this': '👕 Awesome! This helps us learn your style preferences.',
                        'not_for_me': '👎 Got it! We\'ll avoid similar recommendations.',
                        'saved': '💾 Outfit saved! We\'ll use this for better recommendations.',
                        'shared': '📤 Thanks for sharing! This helps improve our AI.'
                    };
                    
                    setSuccessMessage(messages[feedbackType as keyof typeof messages] || 'Feedback submitted! Thank you for helping improve recommendations.');
                    setTimeout(() => setSuccessMessage(null), 4000);
                    
                    // If it's positive feedback, refresh recommendations to show more similar items
                    if (['liked', 'wore_this', 'saved'].includes(feedbackType)) {
                        setTimeout(() => {
                            generateAISuggestion();
                        }, 2000);
                    }
                }
            } else {
                setSuccessMessage('Failed to submit feedback. Please try again.');
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setSuccessMessage('Error submitting feedback. Please try again.');
            setTimeout(() => setSuccessMessage(null), 3000);
        }
    };

    // Handle save this look button
    const handleSaveThisLook = () => {
        if (aiSuggestion?.items && aiSuggestion.items.length > 0) {
            setSelectedOutfitItems(aiSuggestion.items);
            setIsSaveOutfitOpen(true);
        } else {
            setSuccessMessage('No recommendations to save. Get some recommendations first! 💡');
            setTimeout(() => setSuccessMessage(null), 3000);
        }
    };

    // Load user preferences from API
    const loadUserPreferences = async () => {
        try {
            const response = await fetch('/api/user-preferences');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setUserPreferences(data.preferences);
                }
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    };

    // Save user preferences
    const saveUserPreferences = async (preferences: any) => {
        setIsSavingPreferences(true);
        try {
            console.log('Saving preferences:', preferences);
            
            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || 
                             document.querySelector('input[name="_token"]')?.getAttribute('value') || '';
            
            const response = await fetch('/api/user-preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ preferences })
            });

            console.log('Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Response data:', data);
                
                if (data.success) {
                    setSuccessMessage('Preferences saved successfully! 🎨');
                    setTimeout(() => setSuccessMessage(null), 3000);
                    return true;
                } else {
                    setSuccessMessage(`Error: ${data.message || 'Failed to save preferences'}`);
                    setTimeout(() => setSuccessMessage(null), 5000);
                    return false;
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                setSuccessMessage(`Error ${response.status}: ${errorData.message || 'Failed to save preferences'}`);
                setTimeout(() => setSuccessMessage(null), 5000);
                return false;
            }
        } catch (error) {
            console.error('Error saving preferences:', error);
            setSuccessMessage('Network error: Failed to save preferences. Please try again.');
            setTimeout(() => setSuccessMessage(null), 5000);
            return false;
        } finally {
            setIsSavingPreferences(false);
        }
    };

    // Handle preference toggle
    const togglePreference = (type: string, value: string) => {
        setUserPreferences(prev => {
            const currentArray = prev[type as keyof typeof prev] as string[];
            const newArray = currentArray.includes(value)
                ? currentArray.filter(item => item !== value)
                : [...currentArray, value];
            
            return {
                ...prev,
                [type]: newArray
            };
        });
    };

    // Clear cache and refresh recommendations
    const clearCacheAndRefresh = async () => {
        // Clear all AI recommendation cache
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('ai_recommendations_')) {
                localStorage.removeItem(key);
                localStorage.removeItem(`${key}_time`);
            }
        });
        
        setSuccessMessage('Cache cleared! Generating fresh recommendations... 🔄');
        setTimeout(() => setSuccessMessage(null), 2000);
        
        // Generate new suggestions
        await generateAISuggestion();
    };

    // Handle item selection for today's outfit
    const toggleItemSelection = (itemId: number) => {
        setSelectedForToday(prev => {
            if (prev.includes(itemId)) {
                return prev.filter(id => id !== itemId);
            } else {
                return [...prev, itemId];
            }
        });
    };

    // Mark selected items as worn today
    const markAsWornToday = async () => {
        if (selectedForToday.length === 0) {
            setSuccessMessage('Please select at least one item to wear! 👕');
            setTimeout(() => setSuccessMessage(null), 3000);
            return;
        }

        try {
            // Submit feedback for each selected item
            for (const itemId of selectedForToday) {
                await submitFeedback('wore_this', itemId);
            }

            setIsWearingOutfit(true);
            setSuccessMessage(`Great choice! You're wearing ${selectedForToday.length} item(s) today! 👔✨`);
            setTimeout(() => setSuccessMessage(null), 4000);

            // Clear selection after a delay
            setTimeout(() => {
                setSelectedForToday([]);
                setIsWearingOutfit(false);
            }, 5000);

        } catch (error) {
            console.error('Error marking items as worn:', error);
            setSuccessMessage('Error marking items as worn. Please try again.');
            setTimeout(() => setSuccessMessage(null), 3000);
        }
    };

    // Clear today's selection
    const clearTodaySelection = () => {
        setSelectedForToday([]);
        setIsWearingOutfit(false);
        setSuccessMessage('Selection cleared! You can choose again. 🔄');
        setTimeout(() => setSuccessMessage(null), 3000);
    };
    
    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        brand: '',
        category: '',
        color: '',
        size: '',
        description: '',
        image: null as File | null,
    });

    // Filter items based on search and filters
    const filteredItems = wardrobeItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesColor = selectedColor === 'All' || item.color === selectedColor;
        
        return matchesSearch && matchesCategory && matchesColor;
    });

    // Handle adding new item
    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        post('/wardrobe', {
            onSuccess: () => {
                reset();
                setIsAddItemOpen(false);
                setSuccessMessage('Wardrobe item added successfully!');
                setTimeout(() => setSuccessMessage(null), 3000);
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
            }
        });
    };

    // Handle editing item
    const handleEditItem = (item: WardrobeItem) => {
        setEditingItem(item);
        setEditingId(item.id);
        setIsEditMode(true);
        setImagePreview(item.image_url || null);
        setData({
            name: item.name,
            brand: item.brand,
            category: item.category,
            color: item.color,
            size: item.size || '',
            description: item.description || '',
            image: null,
        });
        setIsAddItemOpen(true);
    };

    // Handle updating item
    const handleUpdateItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            // Validate required fields
            if (!data.name.trim() || !data.brand.trim() || !data.category || !data.color || !data.size) {
                setSuccessMessage('Please fill in all required fields.');
                setTimeout(() => setSuccessMessage(null), 3000);
                return;
            }

            console.log('Updating item:', editingItem.id, 'with data:', data);
            
            put(`/wardrobe/${editingItem.id}`, {
                onStart: () => {
                    console.log('Update started');
                },
                onProgress: (progress) => {
                    console.log('Update progress:', progress);
                },
                onSuccess: (page) => {
                    console.log('Update successful', page);
                    reset();
                    setEditingItem(null);
                    setEditingId(null);
                    setIsEditMode(false);
                    setIsAddItemOpen(false);
                    setImagePreview(null);
                    setIsUploadingImage(false);
                    setSuccessMessage('Wardrobe item updated successfully! ✨');
                    setTimeout(() => setSuccessMessage(null), 3000);
                },
                onError: (errors) => {
                    console.error('Update errors:', errors);
                    let errorMessage = 'Error updating item. Please try again.';
                    
                    if (errors.image) {
                        errorMessage = `Image error: ${errors.image}`;
                    } else if (errors.name) {
                        errorMessage = `Name error: ${errors.name}`;
                    } else if (errors.brand) {
                        errorMessage = `Brand error: ${errors.brand}`;
                    }
                    
                    setSuccessMessage(errorMessage);
                    setTimeout(() => setSuccessMessage(null), 5000);
                },
                onFinish: () => {
                    console.log('Update finished');
                }
            });
        }
    };

    // Handle deleting item
    const handleDeleteItem = (id: number) => {
        if (confirm('Are you sure you want to delete this item?')) {
            destroy(`/wardrobe/${id}`, {
                onSuccess: () => {
                    setSuccessMessage('Wardrobe item deleted successfully!');
                    setTimeout(() => setSuccessMessage(null), 3000);
                },
                onError: (errors) => {
                    console.error('Delete errors:', errors);
                    setSuccessMessage('Error deleting item. Please try again.');
                    setTimeout(() => setSuccessMessage(null), 3000);
                }
            });
        }
    };

    // Handle canceling edit
    const handleCancelEdit = () => {
        reset();
        setEditingItem(null);
        setEditingId(null);
        setIsEditMode(false);
        setIsAddItemOpen(false);
        setImagePreview(null);
        setIsUploadingImage(false);
    };

    // Handle image preview
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            setIsUploadingImage(true);
            
            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
                setIsUploadingImage(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const getColorBadgeVariant = (color: string) => {
        const colorMap: { [key: string]: string } = {
            'Black': 'secondary',
            'White': 'outline',
            'Blue': 'default',
            'Red': 'destructive',
            'Green': 'default',
            'Yellow': 'default',
            'Pink': 'default',
            'Purple': 'default',
            'Brown': 'default',
            'Gray': 'secondary'
        };
        return colorMap[color] || 'default';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wardrobe" />
            
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-green-800/20">
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                
                        {/* Success/Error Message */}
                        {successMessage && (
                            <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-in slide-in-from-right-5 duration-300 ${
                                successMessage.includes('Error') || successMessage.includes('error') 
                                    ? 'bg-red-500 text-white' 
                                    : 'bg-green-500 text-white'
                            }`}>
                                {successMessage.includes('Error') || successMessage.includes('error') ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Heart className="h-5 w-5" />
                                )}
                                <span>{successMessage}</span>
                                <button 
                                    onClick={() => setSuccessMessage(null)}
                                    className={`ml-2 rounded-full p-1 transition-colors ${
                                        successMessage.includes('Error') || successMessage.includes('error')
                                            ? 'hover:bg-red-600'
                                            : 'hover:bg-green-600'
                                    }`}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link 
                            href={dashboard()}
                            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Dashboard</span>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsPreferencesOpen(true)}
                                className="flex items-center space-x-2"
                            >
                                <Sparkles className="h-4 w-4" />
                                <span>Style Preferences</span>
                            </Button>
                            <div className="flex items-center space-x-2">
                                <Label className="text-sm text-gray-600 dark:text-gray-400">Show:</Label>
                                <Select value={maxRecommendations.toString()} onValueChange={(value) => setMaxRecommendations(parseInt(value))}>
                                    <SelectTrigger className="w-20 h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="3">3</SelectItem>
                                        <SelectItem value="6">6</SelectItem>
                                        <SelectItem value="9">9</SelectItem>
                                        <SelectItem value="12">12</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span className="text-sm text-gray-600 dark:text-gray-400">items</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                            <Shirt className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>

                {/* Page Title */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">My Wardrobe</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        Organize your sustainable fashion collection. Add, edit, and manage your clothing items.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{wardrobeItems.length}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
                        </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{categories.length}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
                        </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{filteredItems.length}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Filtered Items</div>
                        </CardContent>
                    </Card>
                </div>

                        {/* Container 1: Management Controls */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Left Container: Add Item & View Controls */}
                <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader>
                                    <CardTitle className="text-xl flex items-center space-x-2">
                                        <Plus className="h-5 w-5 text-purple-600" />
                                        <span>Add New Item</span>
                                    </CardTitle>
                                    <CardDescription>Create and manage your wardrobe items</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                            <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                                <DialogTrigger asChild>
                                            <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full">
                                        <Plus className="mr-2 h-4 w-4" />
                                                Add New Wardrobe Item
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] animate-in fade-in-0 zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center space-x-2">
                                            {isEditMode ? (
                                                <>
                                                    <Edit3 className="h-5 w-5 text-purple-600" />
                                                    <span>Edit Wardrobe Item</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="h-5 w-5 text-purple-600" />
                                                    <span>Add New Wardrobe Item</span>
                                                </>
                                            )}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {isEditMode 
                                                ? `Update your "${editingItem?.name}" item details.` 
                                                : 'Add a new item to your wardrobe collection.'
                                            }
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="max-h-[80vh] overflow-y-auto">
                                    <form onSubmit={editingItem ? handleUpdateItem : handleAddItem}>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="item-name">Item Name *</Label>
                                                <Input
                                                    id="item-name"
                                                    placeholder="e.g., Blue Cotton T-shirt"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    maxLength={100}
                                                    required
                                                    className={errors.name ? 'border-red-500' : ''}
                                                />
                                                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                                                <p className="text-xs text-gray-500">{data.name.length}/100 characters</p>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="item-brand">Brand *</Label>
                                                <Input
                                                    id="item-brand"
                                                    placeholder="e.g., Nike, Zara, H&M"
                                                    value={data.brand}
                                                    onChange={(e) => setData('brand', e.target.value)}
                                                    maxLength={50}
                                                    required
                                                    className={errors.brand ? 'border-red-500' : ''}
                                                />
                                                {errors.brand && <p className="text-red-500 text-sm">{errors.brand}</p>}
                                                <p className="text-xs text-gray-500">{data.brand.length}/50 characters</p>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="item-category">Category *</Label>
                                                <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category} value={category}>
                                                                {category}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="item-color">Color *</Label>
                                                <Select value={data.color} onValueChange={(value) => setData('color', value)}>
                                                    <SelectTrigger className={errors.color ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder="Select color" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {colors.map((color) => (
                                                            <SelectItem key={color} value={color}>
                                                                {color}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.color && <p className="text-red-500 text-sm">{errors.color}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="item-size">Size *</Label>
                                                <Select value={data.size} onValueChange={(value) => setData('size', value)}>
                                                    <SelectTrigger className={errors.size ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder="Select size" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {sizes.map((size) => (
                                                            <SelectItem key={size} value={size}>
                                                                {size}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.size && <p className="text-red-500 text-sm">{errors.size}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="item-description">Style Notes</Label>
                                                <Textarea
                                                    id="item-description"
                                                    placeholder="Any additional notes about this item..."
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    maxLength={200}
                                                    rows={3}
                                                />
                                                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="item-image">Image</Label>
                                                <Input
                                                    id="item-image"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    disabled={isUploadingImage}
                                                />
                                                {isUploadingImage && (
                                                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                                                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                        <span>Processing image...</span>
                                                    </div>
                                                )}
                                                {imagePreview && (
                                                    <div className="mt-2">
                                                        <img 
                                                            src={imagePreview} 
                                                            alt="Preview" 
                                                            className="w-20 h-20 object-cover rounded-lg border"
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">Image preview</p>
                                                    </div>
                                                )}
                                                {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={handleCancelEdit}
                                                disabled={processing}
                                            >
                                                Cancel
                                            </Button>
                                            <Button 
                                                type="submit" 
                                                disabled={processing || isUploadingImage}
                                                className="bg-purple-600 hover:bg-purple-700 transition-all duration-200"
                                            >
                                                {processing ? (
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        <span>
                                                            {data.image ? 'Uploading image...' : (isEditMode ? 'Updating...' : 'Adding...')}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        {isEditMode ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                                        <span>{isEditMode ? 'Update Item' : 'Add Item'}</span>
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                    </div>
                                </DialogContent>
                            </Dialog>
                                </CardContent>
                            </Card>

                            {/* Right Container: Search & Filters */}
                            <Card className="border-gray-200 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center space-x-2">
                                        <Search className="h-5 w-5 text-blue-600" />
                                        <span>Search & Filter</span>
                                    </CardTitle>
                                    <CardDescription>Find and organize your wardrobe items</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                            {/* Search Items */}
                            <div className="space-y-2">
                                <Label htmlFor="search" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Search Items
                                </Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="search"
                                                placeholder="Search by name, brand, or style notes..."
                                        className="pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        maxLength={50}
                                    />
                                </div>
                            </div>

                            {/* Category Dropdown */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Category
                                </Label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                                <SelectItem value="All">All Categories</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Color Dropdown */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Color
                                </Label>
                                <Select value={selectedColor} onValueChange={setSelectedColor}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select color" />
                                    </SelectTrigger>
                                    <SelectContent>
                                                <SelectItem value="All">All Colors</SelectItem>
                                        {colors.map((color) => (
                                            <SelectItem key={color} value={color}>
                                                {color}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Container 3: AI Recommender */}
                        <Card className="border-gray-200 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center space-x-2">
                                    <Sparkles className="h-5 w-5 text-purple-600" />
                                    <span>AI Recommender</span>
                                </CardTitle>
                                <CardDescription>Get personalized outfit suggestions based on weather and your wardrobe</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Weather Card */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Card className="border-blue-200 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    {weatherLoading ? (
                                                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                                                    ) : (
                                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                                                            {weather?.weather?.[0]?.main === 'Clear' ? (
                                                                <Sun className="h-6 w-6 text-yellow-500" />
                                                            ) : weather?.weather?.[0]?.main === 'Rain' ? (
                                                                <CloudRain className="h-6 w-6 text-blue-500" />
                                                            ) : weather?.weather?.[0]?.main === 'Snow' ? (
                                                                <Snowflake className="h-6 w-6 text-blue-300" />
                                                            ) : (
                                                                <Cloud className="h-6 w-6 text-gray-500" />
                                                            )}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="flex items-center space-x-1">
                                                            <MapPin className="h-4 w-4 text-gray-500" />
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {weatherLoading ? 'Loading...' : weather?.name || 'Unknown'}
                                                            </span>
                                                            {locationPermission === 'granted' && (
                                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                                    Live
                                                                </span>
                                                            )}
                                                            {locationPermission === 'denied' && (
                                                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                                                    Default
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {weatherLoading ? 'Fetching weather...' : weather?.weather?.[0]?.description || 'No data'}
                                                        </p>
                                                        {locationPermission === 'denied' && (
                                                            <div className="text-xs text-yellow-600 dark:text-yellow-400">
                                                                <p>Location access denied. Using Lapu-Lapu City weather.</p>
                                                                <p className="mt-1">💡 Enable location in browser settings for your exact weather!</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center space-x-1">
                                                        <Thermometer className="h-4 w-4 text-gray-500" />
                                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                            {weatherLoading ? '--' : Math.round(weather?.main?.temp || 0)}°C
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        Feels like {weatherLoading ? '--' : Math.round(weather?.main?.feels_like || 0)}°C
                                                    </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                                    {/* Weather Details */}
                                    <Card className="border-gray-200 dark:border-gray-700">
                                        <CardContent className="p-4">
                                            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Weather Details</h4>
                                            <div className="space-y-2">
                    <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Condition</span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {weatherLoading ? 'Loading...' : weather?.weather?.[0]?.main || 'Unknown'}
                                                    </span>
                        </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Wind Speed</span>
                                                    <div className="flex items-center space-x-1">
                                                        <Wind className="h-3 w-3 text-gray-500" />
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {weatherLoading ? '--' : weather?.wind?.speed || 0} m/s
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Humidity</span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {weatherLoading ? '--' : weather?.main?.humidity || 0}%
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                    </div>

                                {/* AI Suggestion Panel */}
                                <Card className="border-purple-200 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg flex items-center space-x-2">
                                                <Sparkles className="h-5 w-5 text-purple-600" />
                                                <span>Outfit Suggestion</span>
                                            </CardTitle>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={fetchWeather}
                                                    disabled={weatherLoading}
                                                    className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                                                >
                                                    <RefreshCw className={`h-4 w-4 mr-2 ${weatherLoading ? 'animate-spin' : ''}`} />
                                                    {weatherLoading ? 'Updating...' : 'Weather'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={clearCacheAndRefresh}
                                                    disabled={suggestionLoading || !wardrobeItems.length}
                                                    className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <RefreshCw className={`h-4 w-4 mr-2 ${suggestionLoading ? 'animate-spin' : ''}`} />
                                                    {suggestionLoading ? 'Generating...' : 'Refresh'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!aiSuggestion?.items?.length}
                                                    onClick={handleSaveThisLook}
                                                    className="hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Save Look
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {suggestionLoading ? (
                                            <div className="text-center py-8">
                                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Sparkles className="h-6 w-6 text-purple-600 animate-pulse" />
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400">AI is analyzing your wardrobe and weather...</p>
                                            </div>
                                        ) : aiSuggestion ? (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <p className="text-gray-900 dark:text-white flex-1">{aiSuggestion.message}</p>
                                                        {mlConfidence > 0 && (
                                                            <div className="ml-4 flex items-center space-x-2">
                                                                <div className="text-xs text-gray-500">ML Confidence:</div>
                                                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                    mlConfidence > 0.7 ? 'bg-green-100 text-green-800' :
                                                                    mlConfidence > 0.4 ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                    {Math.round(mlConfidence * 100)}%
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        <strong>Reason:</strong> {aiSuggestion.reason}
                                                    </p>
                                                </div>
                                                
                                                {aiSuggestion.items && aiSuggestion.items.length > 0 ? (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h5 className="font-medium text-gray-900 dark:text-white">Recommended Items:</h5>
                                                            {selectedForToday.length > 0 && (
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                        {selectedForToday.length} selected
                                                                    </span>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={clearTodaySelection}
                                                                        className="text-xs"
                                                                    >
                                                                        Clear
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className={`grid gap-3 ${
                                                            maxRecommendations <= 3 ? 'md:grid-cols-3' :
                                                            maxRecommendations <= 6 ? 'md:grid-cols-2 lg:grid-cols-3' :
                                                            maxRecommendations <= 9 ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :
                                                            'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
                                                        }`}>
                                                            {aiSuggestion.items.map((item: WardrobeItem, index: number) => (
                                                                <div 
                                                                    key={item.id || index} 
                                                                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                                                                        selectedForToday.includes(item.id) 
                                                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 ring-2 ring-blue-200 dark:ring-blue-800' 
                                                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                                                                    }`}
                                                                    onClick={() => toggleItemSelection(item.id)}
                                                                >
                                                                    <div className="relative">
                                                                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                                            {item.image_url ? (
                                                                                <img 
                                                                                    src={item.image_url} 
                                                                                    alt={item.name}
                                                                                    className="w-full h-full object-cover rounded-lg"
                                                                                />
                                                                            ) : (
                                                                                <Shirt className="h-6 w-6 text-gray-400" />
                                                                            )}
                                                                        </div>
                                                                        {selectedForToday.includes(item.id) && (
                                                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                                                                <span className="text-white text-xs">✓</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                            {item.name}
                                                                        </p>
                                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                            {item.brand} • {item.category}
                                                                        </p>
                                                                        {selectedForToday.includes(item.id) && (
                                                                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                                                                Selected for today
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        
                                                        {/* Action Buttons for Selected Items */}
                                                        {selectedForToday.length > 0 && (
                                                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center space-x-2">
                                                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                                            <Shirt className="h-4 w-4 text-white" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                                Ready to wear {selectedForToday.length} item{selectedForToday.length > 1 ? 's' : ''}?
                                                                            </p>
                                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                Click "Wear This Outfit" to mark as worn today
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex space-x-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={clearTodaySelection}
                                                                            className="text-gray-600 hover:text-gray-700"
                                                                        >
                                                                            Change
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={markAsWornToday}
                                                                            disabled={isWearingOutfit}
                                                                            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                                                                        >
                                                                            {isWearingOutfit ? (
                                                                                <>
                                                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                                                    Wearing...
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <Shirt className="h-4 w-4 mr-2" />
                                                                                    Wear This Outfit
                                                                                </>
                                                                            )}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Feedback Buttons */}
                                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">How was this recommendation?</span>
                                                                <div className="flex space-x-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => submitFeedback('liked')}
                                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                    >
                                                                        👍 Liked
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => submitFeedback('wore_this')}
                                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                    >
                                                                        👕 Wore This
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => submitFeedback('not_for_me')}
                                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    >
                                                                        👎 Not For Me
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <Shirt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            {aiSuggestion.message || "No suitable items found for current weather conditions."}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    Click "Refresh" to get your first AI outfit suggestion!
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </CardContent>
                        </Card>

                        {/* Container 4: Today's Outfit */}
                        {isWearingOutfit && selectedForToday.length > 0 && (
                            <Card className="border-green-200 dark:border-green-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center space-x-2">
                                        <Shirt className="h-5 w-5 text-green-600" />
                                        <span>Today's Outfit</span>
                                    </CardTitle>
                                    <CardDescription>What you're wearing today</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                                            <Shirt className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                You're wearing {selectedForToday.length} item{selectedForToday.length > 1 ? 's' : ''} from today's recommendations
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                Great choice! This helps the AI learn your preferences.
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={clearTodaySelection}
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                        >
                                            Change Outfit
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Container 5: Style Preferences */}
                        <Card className="border-gray-200 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center space-x-2">
                                    <Sparkles className="h-5 w-5 text-indigo-600" />
                                    <span>Style Preferences</span>
                                </CardTitle>
                                <CardDescription>Help us understand your style better for more accurate recommendations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Quick Preference Buttons */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Feedback</h4>
                                        <div className="space-y-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => submitFeedback('liked')}
                                                className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
                                            >
                                                👍 I like this style
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => submitFeedback('not_for_me')}
                                                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                👎 Not my style
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    if (aiSuggestion?.items && aiSuggestion.items.length > 0) {
                                                        handleSaveThisLook();
                                                    } else {
                                                        setSuccessMessage('No recommendations to save. Get some recommendations first!');
                                                        setTimeout(() => setSuccessMessage(null), 3000);
                                                    }
                                                }}
                                                className="w-full justify-start text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                            >
                                                💾 Save this look
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Style Learning Progress */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Learning Progress</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Saved Outfits</span>
                                                <Badge variant="outline">{savedOutfits.length}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">ML Confidence</span>
                                                <Badge variant={mlConfidence > 0.7 ? "default" : mlConfidence > 0.4 ? "secondary" : "outline"}>
                                                    {Math.round(mlConfidence * 100)}%
                                                </Badge>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {savedOutfits.length === 0 
                                                    ? "Save some outfits to help us learn your style!"
                                                    : savedOutfits.length < 3
                                                    ? "Keep saving outfits for better recommendations!"
                                                    : "Great! We're learning your style preferences."
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Container 6: My Saved Looks */}
                        <Card className="border-gray-200 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center space-x-2">
                                    <Heart className="h-5 w-5 text-pink-600" />
                                    <span>My Saved Looks</span>
                                </CardTitle>
                                <CardDescription>Your favorite outfit combinations saved for easy access</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {savedOutfits.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No saved looks yet
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            Save your favorite outfit combinations to see them here
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {savedOutfits.map((outfit) => (
                                            <Card key={outfit.id} className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <CardTitle className="text-lg line-clamp-1" title={outfit.name}>
                                                                {outfit.name}
                                                            </CardTitle>
                                                            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                                                {outfit.occasion && (
                                                                    <Badge variant="outline" className="mr-2">
                                                                        {outfit.occasion}
                                                                    </Badge>
                                                                )}
                                                                {outfit.created_at && new Date(outfit.created_at).toLocaleDateString()}
                                                            </CardDescription>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => {
                                                                    // Load outfit items for re-recommendation
                                                                    const outfitItems = wardrobeItems.filter(item => 
                                                                        outfit.wardrobe_item_ids.includes(item.id)
                                                                    );
                                                                    setSelectedOutfitItems(outfitItems);
                                                                    setIsSaveOutfitOpen(true);
                                                                }}>
                                                                    <Edit3 className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    className="text-red-600"
                                                                    onClick={() => {
                                                                        if (confirm('Are you sure you want to delete this saved look?')) {
                                                                            // TODO: Implement delete functionality
                                                                            console.log('Delete outfit:', outfit.id);
                                                                        }
                                                                    }}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    {/* Outfit Items Preview */}
                                                    <div className="flex -space-x-2">
                                                        {outfit.wardrobe_item_ids.slice(0, 3).map((itemId: number, index: number) => {
                                                            const item = wardrobeItems.find(w => w.id === itemId);
                                                            return item ? (
                                                                <div key={index} className="relative">
                                                                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-white dark:border-gray-700 flex items-center justify-center overflow-hidden">
                                                                        {item.image_url ? (
                                                                            <img 
                                                                                src={item.image_url} 
                                                                                alt={item.name}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <Shirt className="h-6 w-6 text-gray-400" />
                                                                        )}
                                                                    </div>
                                                                    {index === 2 && outfit.wardrobe_item_ids.length > 3 && (
                                                                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                                                            <span className="text-white text-xs font-medium">
                                                                                +{outfit.wardrobe_item_ids.length - 3}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : null;
                                                        })}
                                                    </div>

                                                    {/* Outfit Description */}
                                                    {outfit.description && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2" title={outfit.description}>
                                                            {outfit.description}
                                                        </p>
                                                    )}

                                                    {/* Feedback Stats */}
                                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                                        <span>
                                                            {outfit.total_feedback_count || 0} feedback
                                                        </span>
                                                        <span>
                                                            {outfit.positive_feedback_count || 0} positive
                                                        </span>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex space-x-2 pt-2">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="flex-1"
                                                            onClick={() => {
                                                                // TODO: Implement "Wear This" functionality
                                                                console.log('Wear outfit:', outfit.id);
                                                            }}
                                                        >
                                                            <Shirt className="mr-2 h-4 w-4" />
                                                            Wear This
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            onClick={() => submitFeedback('liked', outfit.id)}
                                                        >
                                                            👍
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Container 7: Items Display */}
                        <Card className="border-gray-200 dark:border-gray-700">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl flex items-center space-x-2">
                                            <Shirt className="h-5 w-5 text-green-600" />
                                            <span>Your Wardrobe Items</span>
                                        </CardTitle>
                                        <CardDescription>
                                            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setViewMode('grid')}
                                        >
                                            <Grid3X3 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setViewMode('list')}
                                        >
                                            <List className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {filteredItems.length === 0 ? (
                                    <div className="p-12 text-center">
                                <Shirt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No items found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {searchTerm || selectedCategory !== 'All' || selectedColor !== 'All'
                                        ? 'Try adjusting your search or filters'
                                        : 'Start building your wardrobe by adding your first item'
                                    }
                                </p>
                                <Button 
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                    onClick={() => setIsAddItemOpen(true)}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Your First Item
                                </Button>
                                    </div>
                    ) : (
                        <div className={viewMode === 'grid' 
                            ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                            : 'space-y-4'
                        }>
                            {filteredItems.map((item) => (
                                        <Card 
                                            key={item.id} 
                                            className={`border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 ${
                                                editingId === item.id 
                                                    ? 'ring-2 ring-purple-500 shadow-purple-200 dark:shadow-purple-900' 
                                                    : ''
                                            }`}
                                        >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg line-clamp-1" title={item.name}>
                                                    {item.name}
                                                </CardTitle>
                                                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                                    {item.brand}
                                                </CardDescription>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEditItem(item)}>
                                                        <Edit3 className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        className="text-red-600"
                                                        onClick={() => handleDeleteItem(item.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Item Image */}
                                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                                            {item.image_url ? (
                                                <img 
                                                    src={item.image_url} 
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Shirt className="h-12 w-12 text-gray-400" />
                                            )}
                                        </div>

                                        {/* Item Details */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</span>
                                                <span className="text-sm text-gray-900 dark:text-white">{item.category}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Color</span>
                                                <Badge variant={getColorBadgeVariant(item.color) as any}>
                                                    {item.color}
                                                </Badge>
                                            </div>
                                            {item.size && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Size</span>
                                                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                                                        {item.size}
                                                    </span>
                                                </div>
                                            )}
                                            {item.description && (
                                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Style Notes</span>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2" title={item.description}>
                                                        {item.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex space-x-2 pt-3">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                        className="flex-1 transition-all duration-200 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700"
                                                onClick={() => handleEditItem(item)}
                                            >
                                                <Edit3 className="mr-2 h-4 w-4" />
                                                Edit
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                                                onClick={() => handleDeleteItem(item.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                            </CardContent>
                        </Card>
                </div>
            </div>

            {/* Save Outfit Dialog */}
            <Dialog open={isSaveOutfitOpen} onOpenChange={setIsSaveOutfitOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <Save className="h-5 w-5 text-purple-600" />
                            <span>Save This Look</span>
                        </DialogTitle>
                        <DialogDescription>
                            Save this outfit combination to your collection for future reference.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* Selected Items Preview */}
                        <div>
                            <Label className="text-sm font-medium">Selected Items:</Label>
                            <div className="mt-2 space-y-2">
                                {selectedOutfitItems.map((item, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                            {item.image_url ? (
                                                <img 
                                                    src={item.image_url} 
                                                    alt={item.name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <Shirt className="h-5 w-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">{item.brand} • {item.category}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Outfit Details Form */}
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="outfit-name">Outfit Name *</Label>
                                <Input
                                    id="outfit-name"
                                    placeholder="e.g., Casual Summer Look"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    maxLength={100}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="outfit-occasion">Occasion</Label>
                                <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select occasion" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="casual">Casual</SelectItem>
                                        <SelectItem value="work">Work</SelectItem>
                                        <SelectItem value="formal">Formal</SelectItem>
                                        <SelectItem value="party">Party</SelectItem>
                                        <SelectItem value="sport">Sport</SelectItem>
                                        <SelectItem value="date">Date</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="outfit-description">Description</Label>
                                <Textarea
                                    id="outfit-description"
                                    placeholder="Any notes about this outfit..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    maxLength={200}
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsSaveOutfitOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={async () => {
                                    if (!data.name.trim()) {
                                        setSuccessMessage('Please enter an outfit name.');
                                        setTimeout(() => setSuccessMessage(null), 3000);
                                        return;
                                    }
                                    
                                    const success = await saveOutfit({
                                        name: data.name,
                                        description: data.description,
                                        wardrobe_item_ids: selectedOutfitItems.map(item => item.id),
                                        occasion: data.category,
                                        weather_context: weather,
                                        outfit_metadata: {
                                            colors: [...new Set(selectedOutfitItems.map(item => item.color))],
                                            categories: [...new Set(selectedOutfitItems.map(item => item.category))],
                                            brands: [...new Set(selectedOutfitItems.map(item => item.brand))],
                                        }
                                    });
                                    
                                    if (success) {
                                        setIsSaveOutfitOpen(false);
                                        setData('name', '');
                                        setData('description', '');
                                        setData('category', '');
                                        setSelectedOutfitItems([]);
                                    }
                                }}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Save Outfit
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Style Preferences Dialog */}
            <Dialog open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <Sparkles className="h-5 w-5 text-indigo-600" />
                            <span>Style Preferences</span>
                        </DialogTitle>
                        <DialogDescription>
                            Tell us about your style preferences to get better recommendations
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                        {/* Preferred Colors */}
                        <div>
                            <Label className="text-base font-medium mb-3 block">Preferred Colors</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {colors.map((color) => (
                                    <Button
                                        key={color}
                                        variant={userPreferences.preferredColors.includes(color) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => togglePreference('preferredColors', color)}
                                        className={`justify-start ${
                                            userPreferences.preferredColors.includes(color)
                                                ? 'bg-blue-600 text-white'
                                                : ''
                                        }`}
                                    >
                                        {color}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Avoid Colors */}
                        <div>
                            <Label className="text-base font-medium mb-3 block">Colors to Avoid</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {colors.map((color) => (
                                    <Button
                                        key={color}
                                        variant={userPreferences.avoidColors.includes(color) ? "destructive" : "outline"}
                                        size="sm"
                                        onClick={() => togglePreference('avoidColors', color)}
                                        className={`justify-start ${
                                            userPreferences.avoidColors.includes(color)
                                                ? 'bg-red-600 text-white'
                                                : ''
                                        }`}
                                    >
                                        {color}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Preferred Categories */}
                        <div>
                            <Label className="text-base font-medium mb-3 block">Preferred Categories</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {categories.map((category) => (
                                    <Button
                                        key={category}
                                        variant={userPreferences.preferredCategories.includes(category) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => togglePreference('preferredCategories', category)}
                                        className={`justify-start ${
                                            userPreferences.preferredCategories.includes(category)
                                                ? 'bg-green-600 text-white'
                                                : ''
                                        }`}
                                    >
                                        {category}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Avoid Categories */}
                        <div>
                            <Label className="text-base font-medium mb-3 block">Categories to Avoid</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {categories.map((category) => (
                                    <Button
                                        key={category}
                                        variant={userPreferences.avoidCategories.includes(category) ? "destructive" : "outline"}
                                        size="sm"
                                        onClick={() => togglePreference('avoidCategories', category)}
                                        className={`justify-start ${
                                            userPreferences.avoidCategories.includes(category)
                                                ? 'bg-red-600 text-white'
                                                : ''
                                        }`}
                                    >
                                        {category}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Preferred Occasions */}
                        <div>
                            <Label className="text-base font-medium mb-3 block">Preferred Occasions</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {['casual', 'work', 'formal', 'party', 'sport', 'date'].map((occasion) => (
                                    <Button
                                        key={occasion}
                                        variant={userPreferences.preferredOccasions.includes(occasion) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => togglePreference('preferredOccasions', occasion)}
                                        className={`justify-start capitalize ${
                                            userPreferences.preferredOccasions.includes(occasion)
                                                ? 'bg-purple-600 text-white'
                                                : ''
                                        }`}
                                    >
                                        {occasion}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Style Notes */}
                        <div>
                            <Label htmlFor="style-notes" className="text-base font-medium mb-3 block">
                                Style Notes
                            </Label>
                            <Textarea
                                id="style-notes"
                                placeholder="Tell us about your personal style, any specific preferences, or things you like to avoid..."
                                value={userPreferences.styleNotes}
                                onChange={(e) => setUserPreferences(prev => ({
                                    ...prev,
                                    styleNotes: e.target.value
                                }))}
                                rows={4}
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {userPreferences.styleNotes.length}/500 characters
                            </p>
                        </div>

                        {/* Current Preferences Summary */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Current Preferences Summary</h4>
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <p><strong>Preferred Colors:</strong> {userPreferences.preferredColors.join(', ') || 'None selected'}</p>
                                <p><strong>Avoid Colors:</strong> {userPreferences.avoidColors.join(', ') || 'None selected'}</p>
                                <p><strong>Preferred Categories:</strong> {userPreferences.preferredCategories.join(', ') || 'None selected'}</p>
                                <p><strong>Avoid Categories:</strong> {userPreferences.avoidCategories.join(', ') || 'None selected'}</p>
                                <p><strong>Occasions:</strong> {userPreferences.preferredOccasions.join(', ') || 'None selected'}</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsPreferencesOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={async () => {
                                    const success = await saveUserPreferences(userPreferences);
                                    if (success) {
                                        setIsPreferencesOpen(false);
                                        // Refresh recommendations with new preferences
                                        if (weather && wardrobeItems.length > 0) {
                                            generateAISuggestion();
                                        }
                                    }
                                }}
                                disabled={isSavingPreferences}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSavingPreferences ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Preferences
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}