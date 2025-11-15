import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Eye
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

const categories = Array.from(new Set(['T-shirt', 'Polo', 'Pants', 'Jeans', 'Shorts', 'Skirts', 'Dress', 'Shoes', 'Sandals', 'Boots', 'Sweaters', 'Long Sleeves', 'Hoodie', 'Hat', 'Jacket', 'Accessories']));
const colors = [
  'Black',
  'White',
  'Blue',
  'Navy',
  'Sky Blue',
  'Teal',
  'Red',
  'Maroon',
  'Green',
  'Emerald',
  'Olive',
  'Lime',
  'Yellow',
  'Gold',
  'Orange',
  'Pink',
  'Rose',
  'Purple',
  'Lavender',
  'Violet',
  'Brown',
  'Beige',
  'Khaki',
  'Tan',
  'Gray',
  'Silver',
  'Charcoal',
  'Cream',
  'Ivory',
  'Mint',
  'Camou',
  'Coral',
  'Turquoise',
];
const apparelSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const shoeSizes = ['5', '6', '7', '8', '9', '10', '11', '12'];
const waistSizes = ['W28', 'W30', 'W32', 'W34', 'W36', 'W38', 'W40', 'W42', 'W44'];
const fabrics = ['Cotton', 'Linen', 'Wool', 'Polyester', 'Silk', 'Denim', 'Leather', 'Synthetic', 'Blend', 'Rayon', 'Bamboo', 'Modal', 'Cashmere', 'Fleece', 'Waterproof'];

type UserPreferenceState = {
    preferredColors: string[];
    preferredCategories: string[];
    preferredBrands: string[];
    preferredOccasions: string[];
    styleNotes: string;
    avoidColors: string[];
    avoidCategories: string[];
};

interface WardrobeItem {
    id: number;
    name: string;
    brand: string;
    category: string;
    color: string;
    size?: string;
    fabric?: string;
    description?: string;
    image_path?: string | null;
    image_url?: string | null;
    images?: string[];
    image_urls?: string[];
    created_at: string;
    updated_at: string;
}

interface WardrobeProps {
    wardrobeItems: WardrobeItem[];
}

type PreferenceFallbackResult = {
    suggestion: {
        message: string;
        items: WardrobeItem[];
        reason: string;
        weatherContext?: {
            temp: number;
            condition: string;
            windSpeed: number;
        };
    };
    confidence: number;
    statusMessage: string;
};

const categoryGroups: Record<string, string[]> = {
    tops: ['top', 'shirt', 't-shirt', 'blouse', 'tank', 'sweater', 'hoodie'],
    dresses: ['dress', 'romper', 'jumpsuit'],
    bottoms: ['bottom', 'pants', 'jeans', 'shorts', 'skirt', 'legging'],
    outerwear: ['jacket', 'coat', 'cardigan', 'blazer', 'outerwear'],
    footwear: ['shoe', 'sneaker', 'boot', 'heel', 'sandal', 'loafer'],
    accessories: ['bag', 'hat', 'accessory', 'scarf', 'belt'],
};

const classifyCategory = (category: string): string => {
    const normalized = category.toLowerCase();
    for (const [group, keywords] of Object.entries(categoryGroups)) {
        if (keywords.some((keyword) => normalized.includes(keyword))) {
            return group;
        }
    }
    return 'others';
};

// Check if wardrobe items can form a valid outfit combination
// A valid outfit needs either: a dress (standalone), OR at least one top AND one bottom
const canFormValidOutfit = (items: WardrobeItem[]): boolean => {
    if (items.length < 2) {
        return false;
    }

    let hasDress = false;
    let hasTop = false;
    let hasBottom = false;

    for (const item of items) {
        const category = (item.category || '').toLowerCase();
        
        // Check for dresses (standalone outfits)
        if (category.includes('dress') || category.includes('romper') || category.includes('jumpsuit')) {
            hasDress = true;
        }
        
        // Check for tops
        if (category.includes('top') || category.includes('shirt') || 
            category.includes('t-shirt') || category.includes('blouse') || 
            category.includes('tank') || category.includes('sweater') || 
            category.includes('hoodie')) {
            hasTop = true;
        }
        
        // Check for bottoms
        if (category.includes('bottom') || category.includes('pants') || 
            category.includes('jeans') || category.includes('shorts') || 
            category.includes('skirt') || category.includes('legging')) {
            hasBottom = true;
        }
    }

    // Valid outfit if: has a dress OR (has top AND has bottom)
    return hasDress || (hasTop && hasBottom);
};

// Helper function to determine Philippines season based on current month
// Dry Season: November to April (months 11, 12, 1, 2, 3, 4)
// Wet Season: May to October (months 5, 6, 7, 8, 9, 10)
const getPhilippinesSeason = (): 'dry' | 'wet' => {
    const month = new Date().getMonth() + 1; // getMonth() returns 0-11, so +1 for 1-12
    return (month >= 11 || month <= 4) ? 'dry' : 'wet';
};

const getWeatherProfile = (temp: number, condition: string) => {
    const normalizedCondition = condition.toLowerCase();
    const season = getPhilippinesSeason(); // Determine current season
    // Rain is only valid for 24-32°C (Philippines climate)
    const isRainy = (normalizedCondition.includes('rain') || normalizedCondition === 'rainy' || 
                    normalizedCondition.includes('drizzle') || normalizedCondition.includes('thunderstorm')) &&
                    temp >= 24 && temp <= 32;

    // WET SEASON (May to October) - Priority check for rainy conditions (24-32°C only)
    // Even during wet season months, if it's actually raining, prioritize wet season logic
    if ((season === 'wet' || isRainy) && temp >= 24 && temp <= 32) {
        // During wet season or when raining, prefer dark colors and protective clothing
        return {
            label: season === 'wet' ? 'wet season (rainy)' : 'wet season (rainy weather)',
            // Dark colors from system that hide water marks
            preferredColors: ['Black', 'Navy', 'Blue', 'Gray', 'Charcoal', 'Maroon', 'Brown', 'Teal', 'Emerald', 'Olive', 'Purple', 'Violet'],
            preferred: ['jacket', 'hoodie', 'windbreaker', 'long sleeve', 'pant', 'jean', 'boot', 'shoe', 'waterproof'],
            avoid: ['sandal', 'open', 'short', 'skirt', 'dress', 'White', 'Cream', 'Ivory', 'Yellow', 'Pink', 'Lavender', 'Mint', 'Coral', 'Beige', 'Khaki', 'Tan'],
            tempRange: 'rainy',
            maxOuterwearScore: 3,
            preferLightOuterwear: false,
        };
    }

    // DRY SEASON (November to April) - Hot & Sunny
    // During dry season, prioritize light colors and breathable clothing
    if (season === 'dry') {
        if (temp >= 30 || normalizedCondition.includes('hot') || normalizedCondition.includes('clear')) {
            return {
                label: 'dry season (hot)',
                // Light colors from system that reflect heat
                preferredColors: ['White', 'Sky Blue', 'Cream', 'Ivory', 'Yellow', 'Pink', 'Lavender', 'Mint', 'Coral', 'Turquoise', 'Beige', 'Khaki', 'Tan', 'Silver'],
                preferred: ['shirt', 't-shirt', 'polo', 'dress', 'tank', 'short', 'skirt', 'sandal', 'linen', 'light', 'cotton', 'breathable'],
                avoid: ['coat', 'jacket', 'sweater', 'hoodie', 'boot', 'Black', 'Navy', 'Brown', 'Charcoal', 'Maroon'],
                tempRange: 'hot',
                maxOuterwearScore: -5,
                preferLightOuterwear: true,
            };
        }

        // Warm weather during dry season (24-29°C)
        if (temp >= 24 && temp < 30) {
            return {
                label: 'dry season (warm)',
                // Light to medium colors from system
                preferredColors: ['White', 'Sky Blue', 'Cream', 'Ivory', 'Yellow', 'Pink', 'Lavender', 'Mint', 'Coral', 'Turquoise', 'Beige', 'Blue', 'Green', 'Teal'],
                preferred: ['shirt', 't-shirt', 'polo', 'dress', 'short', 'skirt', 'sandal', 'linen', 'light', 'cotton', 'breathable', 'light jacket', 'windbreaker'],
                avoid: ['heavy jacket', 'coat', 'sweater', 'Black', 'Navy', 'Charcoal'],
                tempRange: 'warm',
                maxOuterwearScore: -2,
                preferLightOuterwear: true,
            };
        }
    }

    // WARM WEATHER (24-29°C) - Typical Philippine temperature (fallback)
    if (temp >= 24 && temp < 30) {
        return {
            label: 'warm weather',
            // Light to medium colors from system
            preferredColors: ['White', 'Sky Blue', 'Cream', 'Ivory', 'Yellow', 'Pink', 'Lavender', 'Mint', 'Coral', 'Turquoise', 'Beige', 'Blue', 'Green', 'Teal'],
            preferred: ['shirt', 't-shirt', 'polo', 'dress', 'short', 'skirt', 'sandal', 'linen', 'light', 'cotton', 'breathable', 'light jacket', 'windbreaker'],
            avoid: ['heavy jacket', 'coat', 'sweater', 'Black', 'Navy', 'Charcoal'],
            tempRange: 'warm',
            maxOuterwearScore: -2,
            preferLightOuterwear: true,
        };
    }

    // MILD WEATHER (20-23°C)
    if (temp >= 20 && temp < 24) {
        const baseProfile = {
            label: 'mild weather',
            preferredColors: ['Blue', 'Green', 'Teal', 'Gray', 'Beige', 'Navy'],
            preferred: ['shirt', 't-shirt', 'polo', 'jean', 'pant', 'dress', 'skirt', 'sneaker', 'light jacket', 'cardigan'],
            avoid: [] as string[],
            tempRange: 'mild',
            maxOuterwearScore: 1,
            preferLightOuterwear: true,
        };

        // Rainy condition in mild weather (wet season logic) - only if 24-32°C
        // Note: This case won't happen since we're in 20-23°C range, but kept for consistency
        if ((isRainy || season === 'wet') && temp >= 24 && temp <= 32) {
            baseProfile.preferred.push('jacket', 'hoodie', 'windbreaker', 'boot', 'waterproof', 'long sleeve', 'pant', 'jean');
            baseProfile.avoid.push('sandal', 'open', 'short', 'skirt', 'dress');
            baseProfile.preferredColors = ['Black', 'Navy', 'Blue', 'Gray', 'Charcoal', 'Maroon', 'Brown'];
            baseProfile.maxOuterwearScore = 3;
            baseProfile.preferLightOuterwear = false;
        }

        if (normalizedCondition.includes('wind')) {
            baseProfile.preferred.push('jacket', 'windbreaker');
            baseProfile.maxOuterwearScore = 2;
        }

        return baseProfile;
    }

    // COOL WEATHER (<20°C) - Very rare in Philippines
    if (temp < 20) {
        return {
            label: 'cool weather',
            // Dark/warm colors from system
            preferredColors: ['Black', 'Navy', 'Brown', 'Gray', 'Charcoal', 'Maroon', 'Olive', 'Purple', 'Violet'],
            preferred: ['jacket', 'sweater', 'hoodie', 'long sleeve', 'pant', 'jean', 'boot'],
            avoid: ['short', 'tank', 'sandal', 'White', 'Cream', 'Ivory', 'Yellow', 'Pink', 'Lavender', 'Mint'],
            tempRange: 'cool',
            maxOuterwearScore: 3,
            preferLightOuterwear: false,
        };
    }

    // Fallback
    return {
        label: 'mild weather',
        preferredColors: [] as string[],
        preferred: ['shirt', 't-shirt', 'polo', 'jean', 'pant', 'dress', 'skirt', 'sneaker'],
        avoid: [] as string[],
        tempRange: 'mild',
        maxOuterwearScore: 0,
        preferLightOuterwear: true,
    };
};

type WeatherSuggestionResult = PreferenceFallbackResult;

const buildWeatherBasedSuggestion = ({
    wardrobeItems,
    weather,
    maxRecommendations,
}: {
    wardrobeItems: WardrobeItem[];
    weather: any;
    maxRecommendations: number;
}): WeatherSuggestionResult => {
    const temp = weather?.main?.temp ?? 27;
    const condition = weather?.weather?.[0]?.main ?? 'Clear';
    const conditionLower = condition.toLowerCase();
    const windSpeed = weather?.wind?.speed ?? 5;

    const profile = getWeatherProfile(temp, condition);

    const grouped = wardrobeItems.reduce<Record<string, WardrobeItem[]>>((acc, item) => {
        const group = classifyCategory(item.category || '');
        acc[group] = acc[group] || [];
        acc[group].push(item);
        return acc;
    }, {});

    const selection: WardrobeItem[] = [];
    const usedKeys = new Set<string>();
    
    // Get recently recommended items to avoid duplicates
    const recentRecommendationsKey = 'recent_recommendations';
    const recentRecommendations = JSON.parse(localStorage.getItem(recentRecommendationsKey) || '[]');
    const recentItemIds = new Set(recentRecommendations.map((r: any) => r.itemId).filter(Boolean));

    const takeFromGroup = (group: string, limit = 1, predicate?: (item: WardrobeItem) => boolean) => {
        const source = grouped[group] || [];
        let taken = 0;
        for (const item of source) {
            if (selection.length >= maxRecommendations) break;
            const key = String(item.id ?? `${item.name}-${item.category}-${item.brand}`);
            // Skip if already used or recently recommended
            if (usedKeys.has(key) || recentItemIds.has(item.id)) continue;
            if (predicate && !predicate(item)) continue;
            selection.push(item);
            usedKeys.add(key);
            taken += 1;
            if (taken >= limit) break;
        }
    };

    let message = '';
    const reasonParts: string[] = [`Weather: ${Math.round(temp)}°C · ${condition}`];

    switch (profile.label) {
        case 'hot weather': {
            message = "It's hot out—let's keep things light and breathable.";
            if ((grouped.dresses || []).length) {
                takeFromGroup('dresses', 1);
            } else {
                takeFromGroup('tops', 1);
                takeFromGroup('bottoms', 1);
            }
            takeFromGroup('footwear', 1, (item) =>
                /sand|slip|flat/.test((item.name || '').toLowerCase()) ||
                /sand|slip/.test((item.category || '').toLowerCase()),
            );
            // Skip outerwear in hot weather
            break;
        }
        case 'warm weather': {
            message = "Warm weather—light layers and breathable pieces.";
            if ((grouped.dresses || []).length) {
                takeFromGroup('dresses', 1);
            } else {
                takeFromGroup('tops', 1);
                takeFromGroup('bottoms', 1);
            }
            // Prefer light outerwear (windbreaker, light jacket, cardigan) if available
            // Skip heavy outerwear (denim jackets, coats, heavy jackets)
            takeFromGroup('outerwear', 1, (item) => {
                const itemName = (item.name || '').toLowerCase();
                const itemCategory = (item.category || '').toLowerCase();
                const itemFabric = ((item.fabric || '').toLowerCase());
                // Prefer light outerwear only
                return itemCategory.includes('windbreaker') || itemName.includes('windbreaker') ||
                       itemCategory.includes('cardigan') || itemFabric.includes('cotton') ||
                       itemFabric.includes('linen') || itemName.includes('light jacket');
            });
            takeFromGroup('footwear', 1, (item) =>
                /sneaker|loafer|shoe|sand/.test((item.name || '').toLowerCase()) ||
                /shoe|sneaker/.test((item.category || '').toLowerCase()),
            );
            break;
        }
        case 'cool weather': {
            message = "Temps are cooler—building a layered look to stay cozy.";
            takeFromGroup('tops', 1);
            takeFromGroup('bottoms', 1);
            takeFromGroup('outerwear', 1);
            takeFromGroup('footwear', 1, (item) =>
                /boot|leather|sneaker/.test((item.name || '').toLowerCase()) ||
                /boot|shoe/.test((item.category || '').toLowerCase()),
            );
            break;
        }
        default: {
            message = "Comfortable conditions—here's an easy everyday combo.";
            if ((grouped.dresses || []).length) {
                takeFromGroup('dresses', 1);
            } else {
                takeFromGroup('tops', 1);
                takeFromGroup('bottoms', 1);
            }
            // Mild weather: Optional outerwear, prefer light if included
            takeFromGroup('outerwear', 1, (item) => {
                const itemName = (item.name || '').toLowerCase();
                const itemCategory = (item.category || '').toLowerCase();
                const itemFabric = ((item.fabric || '').toLowerCase());
                // Prefer light outerwear in mild weather
                if (profile.preferLightOuterwear) {
                    return itemCategory.includes('windbreaker') || itemName.includes('windbreaker') ||
                           itemCategory.includes('cardigan') || itemFabric.includes('cotton') ||
                           itemFabric.includes('linen') || itemName.includes('light jacket');
                }
                return true; // Any outerwear is okay if not preferring light
            });
            takeFromGroup('footwear', 1, (item) =>
                /sneaker|loafer|shoe/.test((item.name || '').toLowerCase()) ||
                /shoe|sneaker/.test((item.category || '').toLowerCase()),
            );
        }
    }

    // Rain is only valid for 24-32°C (Philippines climate)
    const isRainyCondition = (conditionLower.includes('rain') || conditionLower === 'rainy') && temp >= 24 && temp <= 32;
    
    if (isRainyCondition) {
        reasonParts.push('Added rain-friendly layers for protection.');
        // Prioritize outerwear (jackets, coats, hoodies) for rain
        if ((grouped.outerwear || []).length) {
            takeFromGroup('outerwear', 2); // Try to get 2 outerwear items for layering
        }
        // Prioritize boots and waterproof footwear (not sandals)
        takeFromGroup('footwear', 1, (item) => {
            const itemCat = (item.category || '').toLowerCase();
            const itemName = (item.name || '').toLowerCase();
            return (/boot|waterproof|rain/.test(itemName) || /boot|shoe/.test(itemCat)) && 
                   !itemCat.includes('sandal');
        });
        // Avoid shorts, skirts, dresses in rain - prefer pants/bottoms
        if ((grouped.bottoms || []).length) {
            takeFromGroup('bottoms', 1, (item) => {
                const cat = (item.category || '').toLowerCase();
                return !cat.includes('short') && !cat.includes('skirt');
            });
        }
    }

    if (windSpeed > 10) {
        reasonParts.push('Windy outside—favoring pieces that stay put.');
        if (
            !selection.some((item) => classifyCategory(item.category) === 'outerwear') &&
            (grouped.outerwear || []).length
        ) {
            takeFromGroup('outerwear', 1);
        }
    }

    // Add some randomness to selection order for variety
    const priorityFillOrder = ['tops', 'bottoms', 'dresses', 'outerwear', 'footwear', 'accessories'];
    const shuffledOrder = [...priorityFillOrder].sort(() => Math.random() - 0.5);
    
    for (const group of shuffledOrder) {
        if (selection.length >= maxRecommendations) break;
        // Try to get 1-2 items per category for variety (depending on maxRecommendations)
        const limit = maxRecommendations <= 3 ? 1 : Math.floor(Math.random() * 2) + 1;
        takeFromGroup(group, limit);
    }

    if (selection.length < maxRecommendations) {
        // Shuffle remaining items to add variety
        const shuffledItems = [...wardrobeItems].sort(() => Math.random() - 0.5);
        for (const item of shuffledItems) {
            if (selection.length >= maxRecommendations) break;
            const key = String(item.id ?? `${item.name}-${item.category}-${item.brand}-${selection.length}`);
            // Skip if already used or recently recommended
            if (usedKeys.has(key) || recentItemIds.has(item.id)) continue;
            
            // Ensure category diversity
            const itemCategory = classifyCategory(item.category || '');
            const sameCategoryCount = selection.filter(
                (selItem) => classifyCategory(selItem.category || '') === itemCategory
            ).length;
            if (sameCategoryCount >= 3) continue; // Max 3 items per category
            
            selection.push(item);
            usedKeys.add(key);
        }
    }
    
    // Store recommended items in localStorage (keep last 20, expire after 7 days)
    const now = Date.now();
    const newRecommendations = selection.map((item) => ({
        itemId: item.id,
        timestamp: now
    }));
    const allRecommendations = [...recentRecommendations.filter((r: any) => 
        now - r.timestamp < 7 * 24 * 60 * 60 * 1000 // Keep items from last 7 days
    ), ...newRecommendations].slice(-20); // Keep last 20 items
    localStorage.setItem(recentRecommendationsKey, JSON.stringify(allRecommendations));

    const hasTopOrDress = selection.some((item) => {
        const group = classifyCategory(item.category);
        return group === 'tops' || group === 'dresses';
    });
    const hasBottom = selection.some((item) => classifyCategory(item.category) === 'bottoms');
    const hasOuterLayer = selection.some((item) => classifyCategory(item.category) === 'outerwear');
    const hasFootwear = selection.some((item) => classifyCategory(item.category) === 'footwear');

    let confidence = 0.35;
    confidence += hasTopOrDress ? 0.2 : 0;
    confidence += hasBottom ? 0.15 : 0;
    confidence += hasFootwear ? 0.1 : 0;
    confidence += hasOuterLayer && profile.label !== 'hot weather' ? 0.1 : 0;
    confidence = Math.min(confidence, 0.8);

    return {
        suggestion: {
            message,
            items: selection.slice(0, maxRecommendations),
            reason: reasonParts.join(' '),
            weatherContext: {
                temp,
                condition,
                windSpeed,
            },
        },
        confidence,
        statusMessage: 'Generated a combo tailored to the current weather.',
    };
};

const buildPreferenceBasedSuggestion = ({
    wardrobeItems,
    preferences,
    weather,
    maxRecommendations,
}: {
    wardrobeItems: WardrobeItem[];
    preferences: UserPreferenceState;
    weather: any;
    maxRecommendations: number;
}): PreferenceFallbackResult => {
    const normalizedPreferredColors = new Set(
        (preferences.preferredColors || []).map((color) => color.toLowerCase()),
    );
    const normalizedAvoidColors = new Set(
        (preferences.avoidColors || []).map((color) => color.toLowerCase()),
    );
    const normalizedPreferredCategories = new Set(
        (preferences.preferredCategories || []).map((category) => category.toLowerCase()),
    );
    const normalizedAvoidCategories = new Set(
        (preferences.avoidCategories || []).map((category) => category.toLowerCase()),
    );
    const normalizedPreferredBrands = new Set(
        (preferences.preferredBrands || []).map((brand) => brand.toLowerCase()),
    );
    const normalizedStyleTokens = (preferences.styleNotes || '')
        .toLowerCase()
        .split(/[\s,]+/)
        .filter(Boolean);

    const temp = weather?.main?.temp ?? 27;
    const condition = weather?.weather?.[0]?.main ?? 'Clear';
    const windSpeed = weather?.wind?.speed ?? 5;

    const weatherProfile = getWeatherProfile(temp, condition);
    const reasonNotes = new Set<string>();

    const scoredItems = wardrobeItems.map((item) => {
        const category = item.category?.toLowerCase() || '';
        const color = item.color?.toLowerCase() || '';
        const brand = item.brand?.toLowerCase() || '';
        const name = item.name?.toLowerCase() || '';
        const description = item.description?.toLowerCase() || '';

        let score = 1; // base score to keep items viable
        let matchedPreferredColor = false;
        let matchedPreferredCategory = false;
        let matchedPreferredBrand = false;
        let weatherAligned = false;

        if (normalizedPreferredColors.has(color)) {
            score += 4;
            matchedPreferredColor = true;
            reasonNotes.add('your preferred colors');
        }

        if (normalizedAvoidColors.has(color)) {
            score -= 6;
        }

        if (normalizedPreferredCategories.has(category)) {
            score += 4;
            matchedPreferredCategory = true;
            reasonNotes.add('your go-to categories');
        }

        if (normalizedAvoidCategories.has(category)) {
            score -= 6;
        }

        if (normalizedPreferredBrands.has(brand)) {
            score += 2;
            matchedPreferredBrand = true;
            reasonNotes.add('brands you like');
        }

        // Weather-based category matching
        if (weatherProfile.preferred.some((keyword) => category.includes(keyword) || name.includes(keyword))) {
            score += 3;
            weatherAligned = true;
            reasonNotes.add(weatherProfile.label);
        }

        if (weatherProfile.avoid.some((keyword) => category.includes(keyword) || name.includes(keyword))) {
            score -= 4;
        }

        // Temperature-based outerwear scoring (heavy vs light jackets)
        const isOuterwear = category.includes('jacket') || category.includes('coat') || 
                           category.includes('hoodie') || category.includes('blazer') ||
                           name.includes('jacket') || name.includes('coat') || name.includes('hoodie');
        
        if (isOuterwear) {
            // Detect heavy vs light outerwear based on fabric and category
            const itemFabric = (item.fabric || '').toLowerCase();
            const itemName = name.toLowerCase();
            const itemCategory = category.toLowerCase();
            
            const isHeavyFabric = itemFabric.includes('denim') || itemFabric.includes('wool') || 
                                 itemFabric.includes('fleece') || itemFabric.includes('cashmere') ||
                                 itemFabric.includes('leather');
            const isHeavyItem = itemCategory.includes('coat') || itemName.includes('denim jacket') ||
                               itemName.includes('winter jacket') || itemName.includes('heavy') ||
                               itemCategory.includes('heavy');
            const isLightOuterwear = itemCategory.includes('windbreaker') || itemName.includes('windbreaker') ||
                                    itemCategory.includes('cardigan') || itemFabric.includes('cotton') ||
                                    itemFabric.includes('linen') || itemName.includes('light jacket');

            const isHeavy = isHeavyFabric || isHeavyItem;

            // Apply temperature-based scoring for outerwear
            if (weatherProfile.tempRange === 'warm' && weatherProfile.maxOuterwearScore !== undefined) {
                // Warm weather (24-29°C): Penalize heavy outerwear, allow light outerwear
                if (isHeavy && !isLightOuterwear) {
                    score += weatherProfile.maxOuterwearScore; // Usually -2 for warm weather
                    reasonNotes.add('heavy outerwear not ideal for warm weather');
                } else if (isLightOuterwear && weatherProfile.preferLightOuterwear) {
                    score += 1; // Slight bonus for light outerwear in warm weather
                    weatherAligned = true;
                    reasonNotes.add('light outerwear for warm weather');
                } else if (!isLightOuterwear && !isHeavy) {
                    // Medium weight - neutral
                    score += 0;
                }
            } else if (weatherProfile.tempRange === 'hot' && weatherProfile.maxOuterwearScore !== undefined) {
                // Hot weather: Strongly penalize all outerwear
                score += weatherProfile.maxOuterwearScore; // -5 for hot weather
            } else if (weatherProfile.tempRange === 'cool' && weatherProfile.maxOuterwearScore !== undefined) {
                // Cool weather: Prefer outerwear, heavier is better
                if (isHeavy && !weatherProfile.preferLightOuterwear) {
                    score += 2; // Bonus for heavy outerwear in cool weather
                    weatherAligned = true;
                    reasonNotes.add('warm layers for cool weather');
                } else if (!isHeavy) {
                    score += weatherProfile.maxOuterwearScore; // Still prefer outerwear, but lighter items get less bonus
                }
            } else if (weatherProfile.tempRange === 'mild' && weatherProfile.maxOuterwearScore !== undefined) {
                // Mild weather (16-23°C): Outerwear optional, prefer light if included
                if (isLightOuterwear && weatherProfile.preferLightOuterwear) {
                    score += 1.5;
                    weatherAligned = true;
                } else if (isHeavy && weatherProfile.preferLightOuterwear) {
                    score -= 1; // Slight penalty for heavy outerwear in mild weather
                } else {
                    score += weatherProfile.maxOuterwearScore; // Neutral for medium weight
                }
            }
        }

        // Weather-based color matching (especially for hot weather)
        if (weatherProfile.preferredColors && weatherProfile.preferredColors.length > 0) {
            const itemColorLower = color.toLowerCase();
            if (weatherProfile.preferredColors.some((prefColor) => itemColorLower.includes(prefColor))) {
                score += 2;
                weatherAligned = true;
                reasonNotes.add('weather-appropriate colors');
            }
            // Penalize colors that absorb heat in hot weather
            if (weatherProfile.label === 'hot weather') {
                if (itemColorLower.includes('black') || itemColorLower.includes('dark') || 
                    itemColorLower.includes('navy') || itemColorLower.includes('brown')) {
                    score -= 3;
                }
            }
        }

        // Fabric-based weather matching
        const itemFabric = (item.fabric || '').toLowerCase();
        if (itemFabric) {
            if (weatherProfile.label === 'hot weather') {
                // Prefer breathable fabrics for hot weather
                if (itemFabric.includes('cotton') || itemFabric.includes('linen') || 
                    itemFabric.includes('bamboo') || itemFabric.includes('modal')) {
                    score += 2.5;
                    weatherAligned = true;
                    reasonNotes.add('breathable fabric');
                }
                // Avoid heavy/warm fabrics in hot weather
                if (itemFabric.includes('wool') || itemFabric.includes('fleece') || 
                    itemFabric.includes('cashmere')) {
                    score -= 3;
                }
            } else if (weatherProfile.label === 'cool weather') {
                // Prefer warm fabrics for cool weather
                if (itemFabric.includes('wool') || itemFabric.includes('fleece') || 
                    itemFabric.includes('cashmere')) {
                    score += 2.5;
                    weatherAligned = true;
                    reasonNotes.add('warm fabric');
                }
            }
            
            // Rainy weather - prefer waterproof fabrics
            if (condition.toLowerCase().includes('rain') || condition.toLowerCase() === 'rainy') {
                if (itemFabric.includes('waterproof') || itemFabric.includes('synthetic')) {
                    score += 2;
                    weatherAligned = true;
                    reasonNotes.add('water-resistant fabric');
                }
            }
        }

        if (condition.toLowerCase().includes('rain')) {
            if (category.includes('jacket') || category.includes('coat') || name.includes('rain')) {
                score += 2;
                weatherAligned = true;
                reasonNotes.add('rain-ready layers');
            }
            if (category.includes('sandal') || category.includes('open')) {
                score -= 3;
            }
        }

        if (windSpeed > 10 && (category.includes('scarf') || category.includes('jacket'))) {
            score += 1.5;
            weatherAligned = true;
        }

        if (
            normalizedStyleTokens.length > 0 &&
            normalizedStyleTokens.some(
                (token) => name.includes(token) || description?.includes(token) || category.includes(token),
            )
        ) {
            score += 1.5;
            reasonNotes.add('the vibe described in your style notes');
        }

        return {
            item,
            score,
            metrics: {
                matchedPreferredColor,
                matchedPreferredCategory,
                matchedPreferredBrand,
                weatherAligned,
            },
        };
    });

    // Get recently recommended items from localStorage to avoid duplicates
    const recentRecommendationsKey = 'recent_recommendations';
    const recentRecommendations = JSON.parse(localStorage.getItem(recentRecommendationsKey) || '[]');
    const recentItemIds = new Set(recentRecommendations.map((r: any) => r.itemId).filter(Boolean));
    
    const viableItems = scoredItems
        .filter(({ score, item }) => {
            // Filter out low scores AND recently recommended items
            return score > -2 && !recentItemIds.has(item.id);
        })
        .sort((a, b) => b.score - a.score);

    // Group items by score ranges to ensure variety (not just top scores)
    const scoreGroups: { [key: string]: typeof scoredItems } = {};
    viableItems.forEach((entry) => {
        // Group items into score ranges (e.g., 10-15, 15-20, 20+)
        const scoreRange = Math.floor(entry.score / 5) * 5;
        const rangeKey = `range_${scoreRange}`;
        if (!scoreGroups[rangeKey]) {
            scoreGroups[rangeKey] = [];
        }
        scoreGroups[rangeKey].push(entry);
    });

    const selection: typeof scoredItems = [];
    const usedIds = new Set<number>();
    const categoryOrder = ['tops', 'bottoms', 'dresses', 'outerwear', 'footwear', 'accessories'];

    // First pass: Get one item from each category from different score ranges for variety
    for (const group of categoryOrder) {
        if (selection.length >= maxRecommendations) break;
        
        // Shuffle score groups to get variety in selection order
        const shuffledRanges = Object.keys(scoreGroups).sort(() => Math.random() - 0.5);
        
        for (const rangeKey of shuffledRanges) {
            if (selection.length >= maxRecommendations) break;
            // Shuffle items within the score range for variety
            const shuffledItems = [...scoreGroups[rangeKey]].sort(() => Math.random() - 0.5);
            const match = shuffledItems.find(
                ({ item }) => !usedIds.has(item.id) && 
                classifyCategory(item.category || '') === group &&
                !recentItemIds.has(item.id)
            );
            if (match) {
                selection.push(match);
                usedIds.add(match.item.id);
                break; // Found one for this category, move to next category
            }
        }
    }

    // Second pass: Fill remaining slots with diverse items (mix of high and medium scores)
    const allScoreRanges = Object.keys(scoreGroups).sort((a, b) => {
        // Sort by score range (highest first), but add some randomness
        const scoreA = parseInt(a.split('_')[1]);
        const scoreB = parseInt(b.split('_')[1]);
        if (Math.abs(scoreA - scoreB) <= 5) {
            // If scores are close, randomize to add variety
            return Math.random() - 0.5;
        }
        return scoreB - scoreA;
    });

    for (const rangeKey of allScoreRanges) {
        if (selection.length >= maxRecommendations) break;
        // Shuffle items in this range
        const shuffledItems = [...scoreGroups[rangeKey]].sort(() => Math.random() - 0.5);
        for (const entry of shuffledItems) {
            if (selection.length >= maxRecommendations) break;
            if (usedIds.has(entry.item.id)) continue;
            // Ensure category diversity - don't add too many of same category
            const entryCategory = classifyCategory(entry.item.category || '');
            const sameCategoryCount = selection.filter(
                ({ item }) => classifyCategory(item.category || '') === entryCategory
            ).length;
            // Allow max 2 items per category (or 3 if we need more items)
            if (sameCategoryCount >= (maxRecommendations <= 3 ? 2 : 3)) continue;
            
            selection.push(entry);
            usedIds.add(entry.item.id);
        }
    }

    // Final pass: If still need items, get any remaining viable items
    for (const entry of viableItems) {
        if (selection.length >= maxRecommendations) break;
        if (usedIds.has(entry.item.id)) continue;
        selection.push(entry);
        usedIds.add(entry.item.id);
    }
    
    // Store recommended items in localStorage (keep last 20, expire after 7 days)
    const now = Date.now();
    const newRecommendations = selection.map(({ item }) => ({
        itemId: item.id,
        timestamp: now
    }));
    const allRecommendations = [...recentRecommendations.filter((r: any) => 
        now - r.timestamp < 7 * 24 * 60 * 60 * 1000 // Keep items from last 7 days
    ), ...newRecommendations].slice(-20); // Keep last 20 items
    localStorage.setItem(recentRecommendationsKey, JSON.stringify(allRecommendations));

    let finalItems = selection.map(({ item }) => item);

    if (!finalItems.length) {
        finalItems = wardrobeItems.slice(0, maxRecommendations);
    }

    const preferredMatchCount = selection.filter((entry) => entry.metrics.matchedPreferredCategory).length;
    const colorMatchCount = selection.filter((entry) => entry.metrics.matchedPreferredColor).length;
    const weatherMatchCount = selection.filter((entry) => entry.metrics.weatherAligned).length;

    const confidence =
        finalItems.length === 0
            ? 0.15
            : Math.min(
                  0.85,
                  0.25 +
                      (preferredMatchCount / Math.max(finalItems.length, 1)) * 0.25 +
                      (colorMatchCount / Math.max(finalItems.length, 1)) * 0.2 +
                      (weatherMatchCount / Math.max(finalItems.length, 1)) * 0.2,
              );

    const reasonMessage =
        reasonNotes.size > 0
            ? `Matched ${Array.from(reasonNotes).join(', ')}.`
            : 'Showing a mix of pieces from your wardrobe.';

    const message =
        finalItems.length > 0
            ? `Here’s a preference-based look built from your wardrobe.`
            : `We couldn’t find enough items that match your saved preferences—showing recent additions instead.`;

    const weatherSuggestion = buildWeatherBasedSuggestion({
        wardrobeItems,
        weather,
        maxRecommendations,
    });

    const dedupedItems = [
        ...new Map(
            [...finalItems, ...weatherSuggestion.suggestion.items].map((item, index) => [
                item.id ?? `${item.name}-${index}`,
                item,
            ]),
        ).values(),
    ].slice(0, maxRecommendations);

    const combinedReason = [reasonMessage, weatherSuggestion.suggestion.reason]
        .filter(Boolean)
        .join(' ');

    const combinedMessage =
        finalItems.length > 0
            ? `Here’s a look that blends your preferences with today’s weather.`
            : weatherSuggestion.suggestion.message;

    return {
        suggestion: {
            message: combinedMessage,
            items: dedupedItems,
            reason: combinedReason,
            weatherContext: weatherSuggestion.suggestion.weatherContext,
        },
        confidence: Math.max(confidence, weatherSuggestion.confidence),
        statusMessage:
            finalItems.length > 0
                ? 'Hugging Face API unavailable—mixing your saved preferences with weather-friendly picks.'
                : weatherSuggestion.statusMessage,
    };
};

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
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Image navigation states
    const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({});

    // Image navigation functions
    const getCurrentImage = (item: WardrobeItem): string | undefined => {
        if (!item) return undefined;

        // Priority 1: Use image_urls array if available (from Laravel model accessor - multiple images)
        if (item.image_urls && Array.isArray(item.image_urls) && item.image_urls.length > 0) {
            const index = currentImageIndex[item.id] || 0;
            const url = item.image_urls[index] || item.image_urls[0];
            const timestamp = new Date().getTime();
            if (url) {
                return `${url}${url.includes('?') ? '&' : '?'}t=${timestamp}`;
            }
        }

        // Priority 2: Handle images array (for multiple images stored as paths)
        if (item.images && Array.isArray(item.images) && item.images.length > 0) {
            const index = currentImageIndex[item.id] || 0;
            const imagePath = item.images[index] || item.images[0];
            if (imagePath) {
                // Ensure path doesn't already include storage/
                const cleanPath = imagePath.startsWith('storage/') 
                    ? imagePath.substring(8)
                    : imagePath.startsWith('/storage/')
                    ? imagePath.substring(9)
                    : imagePath;
                const timestamp = new Date().getTime();
                return `/storage/${cleanPath}?t=${timestamp}`;
            }
        }

        // Priority 3: Use image_url if available (single image from Laravel model accessor)
        if (item.image_url) {
            // Add timestamp to prevent caching
            const timestamp = new Date().getTime();
            // If image_url is a full URL, use it directly; otherwise treat as relative
            if (item.image_url.startsWith('http://') || item.image_url.startsWith('https://')) {
                return `${item.image_url}${item.image_url.includes('?') ? '&' : '?'}t=${timestamp}`;
            }
            return `${item.image_url}${item.image_url.includes('?') ? '&' : '?'}t=${timestamp}`;
        }

        // Priority 4: Handle image_path directly (single image - backward compatibility)
        if (item.image_path) {
            // Ensure image_path doesn't already start with storage/
            const cleanPath = item.image_path.startsWith('storage/') 
                ? item.image_path.substring(8) // Remove 'storage/' prefix if present
                : item.image_path.startsWith('/storage/')
                ? item.image_path.substring(9) // Remove '/storage/' prefix if present
                : item.image_path;
            
            // Add timestamp to prevent caching
            const timestamp = new Date().getTime();
            return `/storage/${cleanPath}?t=${timestamp}`;
        }

        return undefined;
    };

    // Get total image count for an item
    const getImageCount = (item: WardrobeItem): number => {
        // Priority 1: Check for image_urls array (from model accessor - multiple images)
        if (item.image_urls && Array.isArray(item.image_urls) && item.image_urls.length > 0) {
            return item.image_urls.length;
        }
        
        // Priority 2: Check for images array (multiple images stored as paths)
        if (item.images && Array.isArray(item.images) && item.images.length > 0) {
            return item.images.length;
        }
        
        // Priority 3: Check for single image_url
        if (item.image_url) {
            return 1;
        }
        
        // Priority 4: Check for single image_path (backward compatibility)
        if (item.image_path) {
            return 1;
        }
        
        return 0;
    };

    const nextImage = (itemId: number, totalImages: number) => {
        setCurrentImageIndex(prev => ({
            ...prev,
            [itemId]: ((prev[itemId] || 0) + 1) % totalImages
        }));
    };

    const prevImage = (itemId: number, totalImages: number) => {
        setCurrentImageIndex(prev => ({
            ...prev,
            [itemId]: ((prev[itemId] || 0) - 1 + totalImages) % totalImages
        }));
    };
    
    
    // AI Recommender states
    const [weather, setWeather] = useState<any>(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<any>(null);
    const [suggestionLoading, setSuggestionLoading] = useState(false);
    const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
    const [savedOutfits, setSavedOutfits] = useState<any[]>([]);
    const [isSaveOutfitOpen, setIsSaveOutfitOpen] = useState(false);
    const [selectedOutfitItems, setSelectedOutfitItems] = useState<WardrobeItem[]>([]);
    const [viewingOutfit, setViewingOutfit] = useState<any | null>(null);
    const [isViewOutfitOpen, setIsViewOutfitOpen] = useState(false);
    const [mlConfidence, setMlConfidence] = useState<number>(0);
    const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
    const [isSavingPreferences, setIsSavingPreferences] = useState(false);
    const [selectedForToday, setSelectedForToday] = useState<number[]>([]);
    const [isWearingOutfit, setIsWearingOutfit] = useState(false);
    const [maxRecommendations, setMaxRecommendations] = useState(6); // Configurable number of recommendations
    const [isEditWeatherOpen, setIsEditWeatherOpen] = useState(false);
    const [editedWeather, setEditedWeather] = useState({
        temp: 0,
        condition: 'Sunny',
        location: ''
    });
    const [userPreferences, setUserPreferences] = useState<UserPreferenceState>({
        preferredColors: [],
        preferredCategories: [],
        preferredBrands: [],
        preferredOccasions: [],
        styleNotes: '',
        avoidColors: [],
        avoidCategories: [],
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
    const locationWatchIdRef = useRef<number | null>(null);
    const lastLocationRef = useRef<{ lat: number; lon: number; timestamp: number } | null>(null);

    const fetchWeather = useCallback(
        async (
            providedCoords?: { latitude: number; longitude: number },
            options: { silent?: boolean } = {},
        ) => {
            const { silent = false } = options;
            if (!silent) {
                setWeatherLoading(true);
            }
            let resolvedWeather: any = null;
            
            try {
                const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
                if (!apiKey) {
                    throw new Error('Weather API key not found');
                }

                let coords = providedCoords;

                if (!coords) {
                    if (!navigator.geolocation) {
                        throw new Error('Geolocation is not supported in this browser');
                    }

                    coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(
                            (pos) => {
                                setLocationPermission('granted');
                                resolve(pos.coords);
                            },
                            (error) => {
                                setLocationPermission('denied');
                                reject(error);
                            },
                            {
                                enableHighAccuracy: true,
                                timeout: 10000,
                                maximumAge: 300000, // 5 minutes
                            },
                        );
                    });
                } else {
                    setLocationPermission('granted');
                }

                const { latitude, longitude } = coords;

                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`,
                );

                if (!response.ok) {
                    throw new Error('Weather fetch failed');
                }

                const data = await response.json();
                setWeather(data);
                resolvedWeather = data;
                lastLocationRef.current = { lat: latitude, lon: longitude, timestamp: Date.now() };

                if (!silent) {
                    setSuccessMessage('Weather updated successfully! 🌤️');
                    setTimeout(() => setSuccessMessage(null), 3000);
                }
            } catch (error) {
                console.error('Weather fetch error:', error);

                try {
                    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
                    const response = await fetch(
                        `https://api.openweathermap.org/data/2.5/weather?q=Lapu-Lapu City,PH&appid=${apiKey}&units=metric`,
                    );

                    if (response.ok) {
                        const data = await response.json();
                        setWeather(data);
                        resolvedWeather = data;
                        lastLocationRef.current = {
                            lat: data?.coord?.lat ?? 10.3167,
                            lon: data?.coord?.lon ?? 123.95,
                            timestamp: Date.now(),
                        };
                        if (!silent) {
                            setSuccessMessage('Weather updated (using default location) 🌤️');
                            setTimeout(() => setSuccessMessage(null), 3000);
                        }
                    } else {
                        throw new Error('Fallback weather fetch failed');
                    }
                } catch (fallbackError) {
                    console.error('Fallback weather fetch error:', fallbackError);
                    const fallback = {
                        name: 'Lapu-Lapu City',
                        main: { temp: 28, feels_like: 32, humidity: 75 },
                        weather: [{ main: 'Clouds', description: 'overcast clouds', icon: '04d' }],
                        wind: { speed: 8 },
                    };
                    setWeather(fallback);
                    resolvedWeather = fallback;
                    lastLocationRef.current = { lat: 10.3167, lon: 123.95, timestamp: Date.now() };
                    if (!silent) {
                        setSuccessMessage('Using demo weather data 🌤️');
                        setTimeout(() => setSuccessMessage(null), 3000);
                    }
                }
            } finally {
                if (!silent) {
                    setWeatherLoading(false);
                }
            }
            return resolvedWeather;
        },
        [],
    );

    const MIN_DISTANCE_DELTA = 0.01; // ~1km
    const MIN_TIME_DELTA_MS = 5 * 60 * 1000; // 5 minutes

    // Generate AI outfit suggestion with ML integration using Hugging Face API
    const generateAISuggestion = async () => {
        setSuggestionLoading(true);
        let currentWeather = weather;

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
            
            // Check if user has only one item
            if (wardrobeItems.length === 1) {
                setAiSuggestion({
                    message: "You need at least 2 items in your wardrobe to generate outfit recommendations.",
                    items: [],
                    reason: "Insufficient items for recommendations"
                });
                setSuggestionLoading(false);
                setSuccessMessage('Add more items to create stylish outfit combinations! 👔✨');
                setTimeout(() => setSuccessMessage(null), 5000);
                return;
            }
            
            // Check if items can form a valid outfit combination
            if (!canFormValidOutfit(wardrobeItems)) {
                setAiSuggestion({
                    message: "Your wardrobe items cannot form a complete outfit combination. You need either: (1) a dress, OR (2) at least one top AND one bottom.",
                    items: [],
                    reason: "Items cannot form valid outfit combination"
                });
                setSuggestionLoading(false);
                setSuccessMessage('Add items from different categories (tops, bottoms, or dresses) to create outfit combinations! 👗👔👖');
                setTimeout(() => setSuccessMessage(null), 6000);
                return;
            }

            if (!currentWeather) {
                setSuccessMessage('Fetching weather data first... 🌤️');
                setTimeout(() => setSuccessMessage(null), 2000);
                currentWeather = await fetchWeather();
            }

            if (!currentWeather) {
                currentWeather = {
                    main: { temp: 27, feels_like: 29, humidity: 70 },
                    weather: [{ main: 'Clear', description: 'clear sky' }],
                    wind: { speed: 5 },
                };
            }

            // Create cache key that includes weather AND preferences (so changing preferences invalidates cache)
            const preferencesHash = JSON.stringify({
                colors: userPreferences.preferredColors.sort(),
                categories: userPreferences.preferredCategories.sort(),
                brands: userPreferences.preferredBrands.sort(),
                occasions: userPreferences.preferredOccasions.sort(),
                avoidColors: userPreferences.avoidColors.sort(),
                avoidCategories: userPreferences.avoidCategories.sort(),
                styleNotes: userPreferences.styleNotes
            });
            const preferencesHashShort = btoa(preferencesHash).substring(0, 16); // Short hash
            const cacheKey = `ai_recommendations_${currentWeather.main.temp}_${currentWeather.weather[0].main}_${preferencesHashShort}_${maxRecommendations}`;
            const cached = localStorage.getItem(cacheKey);
            const cacheTime = localStorage.getItem(`${cacheKey}_time`);
            
            // Reduced cache time to 5 minutes - ensures fresh recommendations when preferences/weather change
            if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 300000) { // 5 minutes cache (reduced from 1 hour)
                const cachedData = JSON.parse(cached);
                setAiSuggestion(cachedData.suggestion);
                setMlConfidence(cachedData.mlConfidence);
                setSuggestionLoading(false);
                return;
            }

            // Try to get recommendations from Hugging Face API first
            // Show a message that we're waiting for the AI service
            setSuccessMessage('🤖 AI is analyzing your wardrobe and generating recommendations. This may take a moment...');
            
            // Retry mechanism for timeout errors
            let retryCount = 0;
            const maxRetries = 3;
            let lastError: any = null;
            
            while (retryCount <= maxRetries) {
                try {
                    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                    
                    // Fetch with no timeout - wait as long as needed
                    const response = await fetch('/api/wardrobe/ai-recommendations', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        credentials: 'same-origin',
                        body: JSON.stringify({
                            wardrobe_items: wardrobeItems,
                            weather: currentWeather,
                            preferences: userPreferences,
                            max_recommendations: maxRecommendations,
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        
                        if (data.success && data.recommendations) {
                            const recommendations = data.recommendations;
                            
                            setAiSuggestion(recommendations);
                            setMlConfidence(recommendations.confidence || 0.85);
                            setSuccessMessage('🤖 AI-powered outfit suggestions generated using Hugging Face! ✨');
                            setTimeout(() => setSuccessMessage(null), 4000);
                            
                            // Cache the result
                            localStorage.setItem(cacheKey, JSON.stringify({
                                suggestion: recommendations,
                                mlConfidence: recommendations.confidence || 0.85
                            }));
                            localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
                            
                            setSuggestionLoading(false);
                            return; // Success! Exit early
                        }
                    } else {
                        // Handle error responses from the API
                        const errorData = await response.json().catch(() => ({}));
                        
                        // Handle CSRF token mismatch specifically (419 status)
                        if (response.status === 419) {
                            setAiSuggestion({
                                message: 'CSRF token mismatch.',
                                items: [],
                                reason: 'Session expired. Please refresh the page and try again.'
                            });
                            setSuggestionLoading(false);
                            setSuccessMessage('Session expired. Please refresh the page and try again.');
                            setTimeout(() => {
                                window.location.reload();
                            }, 3000);
                            return;
                        }
                        
                        // If it's a timeout, retry
                        if (errorData.timeout && retryCount < maxRetries) {
                            retryCount++;
                            setSuccessMessage(`⏳ AI service is still processing (attempt ${retryCount}/${maxRetries + 1}). Please wait...`);
                            // Wait 2 seconds before retrying
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            continue; // Retry
                        } else if (errorData.message) {
                            // Real error - don't retry
                            setAiSuggestion({
                                message: errorData.message,
                                items: [],
                                reason: errorData.requires_combination 
                                    ? "Items cannot form valid outfit combination"
                                    : errorData.item_count === 1 
                                    ? "Insufficient items for recommendations" 
                                    : "Filtered items insufficient"
                            });
                            setSuggestionLoading(false);
                            setSuccessMessage(errorData.message);
                            setTimeout(() => setSuccessMessage(null), 6000);
                            return;
                        }
                    }
                    
                    // If we get here, break out of retry loop and fall back
                    break;
                    
                } catch (apiError: any) {
                    lastError = apiError;
                    console.warn('Hugging Face API error:', apiError);
                    
                    // If it's a timeout/network error and we haven't exceeded retries, retry
                    if (apiError.message && 
                        (apiError.message.includes('timeout') || 
                         apiError.message.includes('exceeded') ||
                         apiError.message.includes('network') ||
                         apiError.message.includes('Failed to fetch')) &&
                        retryCount < maxRetries) {
                        retryCount++;
                        setSuccessMessage(`⏳ Connection is slow (attempt ${retryCount}/${maxRetries + 1}). Retrying...`);
                        // Wait 2 seconds before retrying
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        continue; // Retry
                    }
                    
                    // If it's a timeout but we've exceeded retries, keep waiting (don't fall back)
                    if (apiError.message && 
                        (apiError.message.includes('timeout') || 
                         apiError.message.includes('exceeded') ||
                         apiError.message.includes('network') ||
                         apiError.message.includes('Failed to fetch'))) {
                        setSuccessMessage('⏳ AI service is taking longer than expected. Still waiting for recommendations...');
                        // Keep waiting - don't fall back
                        return; // Exit and keep loading state active
                    }
                    
                    // Real error - break and fall back
                    break;
                }
            }
            
            // If we get here after all retries, it's a real error - fall back
            if (lastError) {
                console.warn('Real error occurred after retries, falling back to local algorithm');
            }

            // Fallback: Use preference-based suggestions that combine preferences with weather
            // Only reach here if there was a real error (not timeout)
            // This ensures suggestions are personalized based on user preferences AND current weather
            const suggestion = buildPreferenceBasedSuggestion({
                wardrobeItems,
                preferences: userPreferences,
                weather: currentWeather,
                maxRecommendations,
            });

            setAiSuggestion(suggestion.suggestion);
            setMlConfidence(suggestion.confidence);
            setSuccessMessage('Outfit suggestions generated based on your preferences and current weather! ✨');
            setTimeout(() => setSuccessMessage(null), 4000);
            
            // Cache the result
            localStorage.setItem(cacheKey, JSON.stringify({
                suggestion: suggestion.suggestion,
                mlConfidence: suggestion.confidence
            }));
            localStorage.setItem(`${cacheKey}_time`, Date.now().toString());

        } catch (error) {
            console.error('Error generating suggestions:', error);
            
            const fallback = buildPreferenceBasedSuggestion({
                wardrobeItems,
                preferences: userPreferences,
                weather: currentWeather,
                maxRecommendations,
            });

            setAiSuggestion(fallback.suggestion);
            setMlConfidence(fallback.confidence);
            setSuccessMessage(fallback.statusMessage);
            setTimeout(() => setSuccessMessage(null), 4000);
        } finally {
            setSuggestionLoading(false);
        }
    };

    const handleRefreshWeather = async () => {
        setWeatherLoading(true);
        try {
            // Clear cache before refreshing to ensure new recommendations
            Object.keys(localStorage).forEach((key) => {
                if (key.startsWith('ai_recommendations_')) {
                    localStorage.removeItem(key);
                    localStorage.removeItem(`${key}_time`);
                }
            });
            
            await fetchWeather();
            // After refreshing weather, regenerate suggestions with new weather and preferences
            if (wardrobeItems.length > 0) {
                await generateAISuggestion();
            }
        } catch (error) {
            console.error('Error refreshing weather:', error);
        } finally {
            setWeatherLoading(false);
        }
    };

    // Handle opening edit weather dialog
    const handleOpenEditWeather = () => {
        if (weather) {
            // Map API condition to display name
            const apiToDisplayMap: { [key: string]: string } = {
                'Clear': 'Sunny',
                'Clouds': 'Cloudy',
                'Rain': 'Rainy',
                'Drizzle': 'Rainy',
                'Thunderstorm': 'Rainy',
                'Mist': 'Humid',
                'Fog': 'Humid',
                'Haze': 'Humid'
            };
            
            const apiCondition = weather.weather?.[0]?.main || 'Clear';
            const displayCondition = apiToDisplayMap[apiCondition] || 'Sunny';
            
            setEditedWeather({
                temp: Math.round(weather.main?.temp || 0),
                condition: displayCondition,
                location: weather.name || ''
            });
        } else {
            // Set default values if no weather loaded
            setEditedWeather({
                temp: 26,
                condition: 'Sunny',
                location: ''
            });
        }
        setIsEditWeatherOpen(true);
    };

    // Handle saving edited weather
    const handleSaveEditedWeather = async () => {
        // Map display names to API-compatible values
        const conditionMap: { [key: string]: string } = {
            'Sunny': 'Clear',
            'Hot': 'Clear',
            'Cloudy': 'Clouds',
            'Humid': 'Clouds',
            'Rainy': 'Rain'
        };
        
        const apiCondition = conditionMap[editedWeather.condition] || editedWeather.condition;
        const description = editedWeather.condition.toLowerCase();
        
        const updatedWeather = {
            ...weather,
            main: {
                ...weather?.main,
                temp: editedWeather.temp,
                feels_like: editedWeather.temp, // Use same as temp
                humidity: weather?.main?.humidity || 70 // Keep existing or default
            },
            weather: [{
                main: apiCondition,
                description: description,
                icon: '01d'
            }],
            wind: {
                ...weather?.wind,
                speed: weather?.wind?.speed || 5 // Keep existing or default
            },
            name: editedWeather.location || weather?.name || 'Manual'
        };

        setWeather(updatedWeather);
        setIsEditWeatherOpen(false);
        
        // Clear cache when weather is manually updated
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('ai_recommendations_')) {
                localStorage.removeItem(key);
                localStorage.removeItem(`${key}_time`);
            }
        });
        
        setSuccessMessage('Weather updated manually! ✨');
        setTimeout(() => setSuccessMessage(null), 3000);

        // Regenerate suggestions with new weather
        if (wardrobeItems.length > 0) {
            await generateAISuggestion();
        }
    };

    // Load weather and generate suggestion on component mount
    useEffect(() => {
        fetchWeather();
    }, [fetchWeather]);

    useEffect(() => {
        if (typeof navigator !== 'undefined' && 'permissions' in navigator && (navigator.permissions as any)?.query) {
            (navigator.permissions as any)
                .query({ name: 'geolocation' })
                .then((status: PermissionStatus) => {
                    const currentState = status.state as 'granted' | 'denied' | 'prompt';
                    setLocationPermission(currentState);

                    status.onchange = () => {
                        const nextState = status.state as 'granted' | 'denied' | 'prompt';
                        setLocationPermission(nextState);
                    };
                })
                .catch(() => {
                    setLocationPermission('unknown');
                });
        }
    }, [fetchWeather]);

    useEffect(() => {
        if (locationPermission !== 'granted') {
            if (locationWatchIdRef.current !== null) {
                navigator.geolocation.clearWatch(locationWatchIdRef.current);
                locationWatchIdRef.current = null;
            }
            return;
        }

        if (!navigator.geolocation) {
            return;
        }

        if (locationWatchIdRef.current !== null) {
            return;
        }

        locationWatchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const last = lastLocationRef.current;
                const hasMovedFar =
                    !last ||
                    Math.abs(latitude - last.lat) + Math.abs(longitude - last.lon) > MIN_DISTANCE_DELTA ||
                    Date.now() - last.timestamp > MIN_TIME_DELTA_MS;

                if (hasMovedFar) {
                    fetchWeather({ latitude, longitude }, { silent: true });
                }
            },
            (error) => {
                console.error('Location watch error:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            },
        );

        return () => {
            if (locationWatchIdRef.current !== null) {
                navigator.geolocation.clearWatch(locationWatchIdRef.current);
                locationWatchIdRef.current = null;
            }
        };
    }, [locationPermission, fetchWeather]);

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
            
            // Get CSRF token - try multiple methods
            let csrfToken = '';
            const metaTag = document.querySelector('meta[name="csrf-token"]');
            if (metaTag) {
                csrfToken = metaTag.getAttribute('content') || '';
            }
            
            // Fallback to input field if meta tag not found
            if (!csrfToken) {
                const inputTag = document.querySelector('input[name="_token"]');
                if (inputTag) {
                    csrfToken = (inputTag as HTMLInputElement).value || '';
                }
            }
            
            // If still no token, try to get from window (some Laravel setups)
            if (!csrfToken && (window as any).Laravel?.csrfToken) {
                csrfToken = (window as any).Laravel.csrfToken;
            }
            
            if (!csrfToken) {
                setSuccessMessage('CSRF token not found. Please refresh the page and try again.');
                setTimeout(() => setSuccessMessage(null), 5000);
                setIsSavingPreferences(false);
                return false;
            }
            
            const response = await fetch('/api/user-preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin', // Important for cookies/CSRF
                body: JSON.stringify({ preferences })
            });

            console.log('Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Response data:', data);
                
                if (data.success) {
                    // Clear recommendation cache when preferences change
                    Object.keys(localStorage).forEach((key) => {
                        if (key.startsWith('ai_recommendations_')) {
                            localStorage.removeItem(key);
                            localStorage.removeItem(`${key}_time`);
                        }
                    });
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
                
                // Handle CSRF token mismatch specifically
                if (response.status === 419) {
                    setSuccessMessage('Session expired. Please refresh the page and try again.');
                    setTimeout(() => {
                        window.location.reload();
                    }, 3000);
                } else {
                    setSuccessMessage(`Error ${response.status}: ${errorData.message || 'Failed to save preferences'}`);
                    setTimeout(() => setSuccessMessage(null), 5000);
                }
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
        fabric: '',
        description: '',
        image: null as File | null,
        images: [] as File[], // For UI preview management
    });

    const sizeOptions = useMemo(() => {
        if (data.category === 'Shoes' || data.category === 'Boots' || data.category === 'Sandals') {
            return shoeSizes;
        }
        if (data.category === 'Jeans' || data.category === 'Pants' || data.category === 'Shorts') {
            return waistSizes;
        }
        if (data.category === 'Accessories' || data.category === 'Hat') {
            return [];
        }
        return apparelSizes;
    }, [data.category]);

    useEffect(() => {
        if (data.category === 'Accessories' || data.category === 'Hat') {
            setData('size', '');
            return;
        }

        // Clear fabric field when Sandals is selected
        if (data.category === 'Sandals') {
            setData('fabric', '');
        }

        // Clear size if it's not valid for the current category
        if (data.size && !sizeOptions.includes(data.size)) {
            setData('size', '');
        }
    }, [data.category, data.size, sizeOptions, setData]);

    // Filter items based on search and filters
    const filteredItems = wardrobeItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesColor = selectedColor === 'All' || item.color === selectedColor;
        
        return matchesSearch && matchesCategory && matchesColor;
    });

    // Group filtered items by category for organized display
    const itemsByCategory = useMemo(() => {
        const grouped: Record<string, WardrobeItem[]> = {};
        
        filteredItems.forEach(item => {
            const category = item.category || 'Uncategorized';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(item);
        });
        
        // Sort items within each category by name
        Object.keys(grouped).forEach(category => {
            grouped[category].sort((a, b) => a.name.localeCompare(b.name));
        });
        
        return grouped;
    }, [filteredItems]);

    // Define category display order (logical grouping)
    const categoryOrder = [
        'T-shirt', 'Polo', 'Long Sleeves', 'Sweaters', 'Hoodie',
        'Dress', 'Skirts',
        'Pants', 'Jeans', 'Shorts',
        'Jacket',
        'Shoes', 'Sandals', 'Boots',
        'Hat', 'Accessories'
    ];

    // Get sorted categories (prioritize defined order, then alphabetically)
    const sortedCategories = useMemo(() => {
        const definedCategories = categoryOrder.filter(cat => itemsByCategory[cat]);
        const otherCategories = Object.keys(itemsByCategory)
            .filter(cat => !categoryOrder.includes(cat))
            .sort();
        return [...definedCategories, ...otherCategories];
    }, [itemsByCategory]);

    // Handle adding new item
    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate required fields (size is optional for Hat and Accessories)
        const requiresSize = data.category !== 'Hat' && data.category !== 'Accessories';
        if (!data.name.trim() || !data.brand.trim() || !data.category || !data.color || (requiresSize && !data.size)) {
            setSuccessMessage('Please fill in all required fields.');
            setTimeout(() => setSuccessMessage(null), 3000);
            return;
        }
        
        // Ensure size is cleared for Hat and Accessories
        if (data.category === 'Hat' || data.category === 'Accessories') {
            setData('size', '');
        }
        
        // Ensure fabric is cleared for Sandals
        if (data.category === 'Sandals') {
            setData('fabric', '');
        }
        
        // Prepare submission - if images array has files, clear single image; otherwise clear images array
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            setData('image', null); // Clear single image when using images array
        } else if (data.image) {
            setData('images', []); // Clear images array when using single image
        }
        
        post('/wardrobe', {
            onSuccess: () => {
                reset();
                setImagePreviews([]); // Clear image previews
                setIsUploadingImage(false); // Reset upload state
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''; // Clear file input
                }
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
        
        // Set image previews for existing images
        if (item.image_urls && item.image_urls.length > 0) {
            setImagePreviews(item.image_urls);
        } else if (item.image_url) {
            setImagePreviews([item.image_url]);
        } else {
            setImagePreviews([]);
        }
        
        setData({
            name: item.name,
            brand: item.brand,
            category: item.category,
            color: item.color,
            size: item.size || '',
            fabric: item.fabric || '',
            description: item.description || '',
            images: [], // Will be populated when user uploads new images
        });
        setIsAddItemOpen(true);
    };

    // Handle updating item
    const handleUpdateItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            // Validate required fields (size is optional for Hat and Accessories)
            const requiresSize = data.category !== 'Hat' && data.category !== 'Accessories';
            if (!data.name.trim() || !data.brand.trim() || !data.category || !data.color || (requiresSize && !data.size)) {
                setSuccessMessage('Please fill in all required fields.');
                setTimeout(() => setSuccessMessage(null), 3000);
                return;
            }

            // Ensure size is cleared for Hat and Accessories
            if (data.category === 'Hat' || data.category === 'Accessories') {
                setData('size', '');
            }

            console.log('Updating item:', editingItem.id, 'with data:', data);
            
            // Prepare submission - if images array has files, clear single image; otherwise clear images array
            if (data.images && Array.isArray(data.images) && data.images.length > 0) {
                setData('image', null); // Clear single image when using images array
            } else if (data.image) {
                setData('images', []); // Clear images array when using single image
            }
            
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
                            setImagePreviews([]);
                    setIsUploadingImage(false);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = ''; // Clear file input
                    }
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
                            setImagePreviews([]);
        setIsUploadingImage(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Clear file input
        }
    };

    // Handle individual image upload
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type - only JPEG and PNG allowed
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                alert('Please upload only JPEG or PNG images.');
                e.target.value = '';
                return;
            }
            
            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                alert('File size must be less than 5MB.');
                e.target.value = '';
                return;
            }

            setIsUploadingImage(true);

            // Create preview using URL.createObjectURL for better performance
            const previewUrl = URL.createObjectURL(file);

            // If index is provided, replace image at that index; otherwise add new image
            if (typeof index === 'number' && index >= 0) {
                // Replace existing image at index
                const newPreviews = [...imagePreviews];
                const newImages = [...(data.images || [])];
                
                // Revoke old object URL if it exists
                if (newPreviews[index] && newPreviews[index].startsWith('blob:')) {
                    URL.revokeObjectURL(newPreviews[index]);
                }
                
                newPreviews[index] = previewUrl;
                newImages[index] = file;
                
                setImagePreviews(newPreviews);
                setData('images', newImages);
                
                // For single image upload to backend, use the first image
                if (newImages.length > 0) {
                    setData('image', newImages[0]);
                }
            } else {
                // Add new image
                // Update form data with the file (backend expects 'image' singular)
                // Always use the first image for the backend 'image' field
                setData('image', file);
                
                // Also store in images array for preview management
                const newImages = [...(data.images || []), file];
                setData('images', newImages);
                
                // Update preview
                setImagePreviews(prev => [...prev, previewUrl]);
            }
            
            setIsUploadingImage(false);
        }
    };

    // Remove image at specific index
    const removeImage = (index: number) => {
        // Revoke object URL before removing
        if (imagePreviews[index] && imagePreviews[index].startsWith('blob:')) {
            URL.revokeObjectURL(imagePreviews[index]);
        }
        
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        const newImages = (data.images || []).filter((_, i) => i !== index);
        setImagePreviews(newPreviews);
        setData('images', newImages);
        
        // Update the main image field to point to first remaining image
        if (newImages.length > 0) {
            setData('image', newImages[0]);
        } else {
            setData('image', null);
        }
    };

    // Add new image slot
    const addImageSlot = () => {
        if (data.images.length < 5) {
            // Trigger file input for new image
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.jpg,.jpeg,.png,image/jpeg,image/png';
            input.onchange = (e) => handleImageChange(e as any);
            input.click();
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
            
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/50 dark:via-emerald-950/30 dark:to-teal-950/50">
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 sm:p-6">
                
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

                {/* Header Bar */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <Link 
                            href={dashboard()}
                            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Back</span>
                        </Link>
                        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                            <Shirt className="h-6 w-6 sm:h-7 sm:w-7 text-green-600 dark:text-green-400" />
                            <span>My Wardrobe</span>
                        </h1>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPreferencesOpen(true)}
                        className="hidden sm:flex items-center space-x-2 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
                    >
                        <Sparkles className="h-4 w-4" />
                        <span>Preferences</span>
                    </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                    <Card className="border-green-200 dark:border-green-800 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                        <CardContent className="p-3 sm:p-4 text-center">
                            <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{wardrobeItems.length}</div>
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Items</div>
                        </CardContent>
                    </Card>
                    <Card className="border-green-200 dark:border-green-800 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                        <CardContent className="p-3 sm:p-4 text-center">
                            <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{categories.length}</div>
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Categories</div>
                        </CardContent>
                    </Card>
                    <Card className="border-green-200 dark:border-green-800 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                        <CardContent className="p-3 sm:p-4 text-center">
                            <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{filteredItems.length}</div>
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Filtered</div>
                        </CardContent>
                    </Card>
                </div>

                        {/* Container 3: AI Recommender */}
                        <Card className="border-gray-200 dark:border-gray-700">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl flex items-center space-x-2">
                                            <Sparkles className="h-5 w-5 text-purple-600" />
                                            <span>AI Recommender</span>
                                        </CardTitle>
                                        <CardDescription>Get personalized outfit suggestions based on weather and your wardrobe</CardDescription>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleOpenEditWeather}
                                        className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                                    >
                                        <Edit3 className="h-4 w-4 mr-2" />
                                        Edit Weather
                                    </Button>
                                </div>
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
                                                            ) : weather?.weather?.[0]?.main === 'Rain' || 
                                                                  weather?.weather?.[0]?.main === 'Drizzle' ||
                                                                  weather?.weather?.[0]?.main === 'Thunderstorm' ? (
                                                                <CloudRain className="h-6 w-6 text-blue-500" />
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
                                                    onClick={handleRefreshWeather}
                                                    disabled={weatherLoading || suggestionLoading}
                                                    className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                                                >
                                                    <RefreshCw className={`h-4 w-4 mr-2 ${weatherLoading ? 'animate-spin' : ''}`} />
                                                    {weatherLoading ? 'Updating...' : 'Refresh Weather'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={clearCacheAndRefresh}
                                                    disabled={suggestionLoading || !wardrobeItems.length}
                                                    className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <RefreshCw className={`h-4 w-4 mr-2 ${suggestionLoading ? 'animate-spin' : ''}`} />
                                                    {suggestionLoading ? 'Generating...' : 'Refresh Suggestions'}
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
                                                <p className="text-gray-600 dark:text-gray-400">AI is analyzing your wardrobe, preferences, and weather...</p>
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
                                                        <div className="flex items-center justify-between mb-4">
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
                                                        
                                                        {/* Group items by category */}
                                                        {(() => {
                                                            const categoryMap: Record<string, string> = {
                                                                tops: 'Tops',
                                                                bottoms: 'Bottoms',
                                                                dresses: 'Dresses',
                                                                outerwear: 'Outerwear',
                                                                footwear: 'Shoes & Footwear',
                                                                accessories: 'Accessories',
                                                                others: 'Other Items'
                                                            };
                                                            
                                                            const categoryOrder = ['tops', 'bottoms', 'dresses', 'outerwear', 'footwear', 'accessories', 'others'];
                                                            
                                                            // Group items by category
                                                            const groupedItems = aiSuggestion.items.reduce<Record<string, WardrobeItem[]>>((acc: Record<string, WardrobeItem[]>, item: WardrobeItem) => {
                                                                const category = classifyCategory(item.category || '');
                                                                if (!acc[category]) {
                                                                    acc[category] = [];
                                                                }
                                                                acc[category].push(item);
                                                                return acc;
                                                            }, {});
                                                            
                                                            // Filter to only show categories that have items
                                                            const activeCategories = categoryOrder.filter(cat => groupedItems[cat] && groupedItems[cat].length > 0);
                                                            
                                                            return (
                                                                <div className="space-y-6">
                                                                    {activeCategories.map((category, catIndex) => (
                                                                        <div key={category} className="space-y-3">
                                                                            {catIndex > 0 && (
                                                                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4"></div>
                                                                            )}
                                                                            <div className="flex items-center space-x-2 pb-2">
                                                                                <h6 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                                                                                    {categoryMap[category] || category}
                                                                                </h6>
                                                                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                                                                    {groupedItems[category].length}
                                                                                </span>
                                                                            </div>
                                                                            <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                                                                {groupedItems[category].map((item: WardrobeItem, index: number) => (
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
                                                                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center relative group">
                                                                                                {getCurrentImage(item) ? (
                                                                                                    <>
                                                                                                        <img 
                                                                                                            src={getCurrentImage(item) || ''} 
                                                                                                            alt={item.name}
                                                                                                            className="w-full h-full object-cover rounded-lg"
                                                                                                        />
                                                                                                        {/* Small navigation arrows for multiple images */}
                                                                                                        {getImageCount(item) > 1 && (
                                                                                                            <>
                                                                                                                <button
                                                                                                                    onClick={(e) => {
                                                                                                                        e.stopPropagation();
                                                                                                                        prevImage(item.id, getImageCount(item));
                                                                                                                    }}
                                                                                                                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                                                >
                                                                                                                    <ChevronLeft className="h-2 w-2" />
                                                                                                                </button>
                                                                                                                <button
                                                                                                                    onClick={(e) => {
                                                                                                                        e.stopPropagation();
                                                                                                                        nextImage(item.id, getImageCount(item));
                                                                                                                    }}
                                                                                                                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                                                >
                                                                                                                    <ChevronRight className="h-2 w-2" />
                                                                                                                </button>
                                                                                                            </>
                                                                                                        )}
                                                                                                    </>
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
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            );
                                                        })()}
                                                        
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
                                                                        onClick={() => {
                                                                            submitFeedback('liked');
                                                                            setSuccessMessage('✅ Great! This helps us recommend better outfits for you!');
                                                                            setTimeout(() => setSuccessMessage(null), 3000);
                                                                        }}
                                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                                                    >
                                                                        ✅ This is a good outfit!
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => submitFeedback('liked')}
                                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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
                                                                    setViewingOutfit(outfit);
                                                                    setIsViewOutfitOpen(true);
                                                                }}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Outfit
                                                                </DropdownMenuItem>
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
                                                                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-white dark:border-gray-700 flex items-center justify-center overflow-hidden relative group">
                                                                        {getCurrentImage(item) ? (
                                                                            <>
                                                                                <img 
                                                                                    src={getCurrentImage(item) || ''} 
                                                                                    alt={item.name}
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                                {/* Small navigation arrows for multiple images */}
                                                                                {getImageCount(item) > 1 && (
                                                                                    <>
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                prevImage(item.id, getImageCount(item));
                                                                                            }}
                                                                                            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                        >
                                                                                            <ChevronLeft className="h-2 w-2" />
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                nextImage(item.id, getImageCount(item));
                                                                                            }}
                                                                                            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                        >
                                                                                            <ChevronRight className="h-2 w-2" />
                                                                                        </button>
                                                                                    </>
                                                                                )}
                                                                            </>
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

                        {/* Container 1: Management Controls */}
                        <div className="grid gap-6 lg:grid-cols-2 mb-6">
                            {/* Left Container: Add Item & View Controls */}
                            <Card className="border-gray-200 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center space-x-2">
                                        <Plus className="h-5 w-5 text-green-600" />
                                        <span>Add New Item</span>
                                    </CardTitle>
                                    <CardDescription>Create and manage your wardrobe items</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button 
                                        className="bg-green-600 hover:bg-green-700 text-white w-full"
                                        onClick={() => setIsAddItemOpen(true)}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add New Wardrobe Item
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Right Container: Search & Filters */}
                            <Card className="border-gray-200 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center space-x-2">
                                        <Search className="h-5 w-5 text-green-600" />
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
                                                className="pl-10 border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-green-500"
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
                                            <SelectTrigger className="border-green-200 dark:border-green-800">
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
                                            <SelectTrigger className="border-green-200 dark:border-green-800">
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
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => setIsAddItemOpen(true)}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Your First Item
                                </Button>
                                    </div>
                    ) : (
                        <div className="space-y-8">
                            {sortedCategories.map((category) => {
                                const categoryItems = itemsByCategory[category] || [];
                                if (categoryItems.length === 0) return null;
                                
                                return (
                                    <div key={category} className="space-y-4">
                                        {/* Category Header */}
                                        <div className="flex items-center justify-between border-b-2 border-green-200 dark:border-green-800 pb-3 mb-4">
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                                                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                                    <Shirt className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <span>{category}</span>
                                                <Badge variant="secondary" className="ml-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                                    {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
                                                </Badge>
                                            </h3>
                                        </div>
                                        
                                        {/* Items Grid/List for this Category */}
                                        <div className={viewMode === 'grid' 
                                            ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                                            : 'space-y-4'
                                        }>
                                            {categoryItems.map((item) => (
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
                                                    {item.fabric && (
                                                        <span className="ml-2 text-xs text-gray-500">• {item.fabric}</span>
                                                    )}
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
                                        {/* Item Image with Navigation */}
                                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden relative group">
                                            {getCurrentImage(item) ? (
                                                <>
                                                    <img 
                                                        src={getCurrentImage(item) || ''} 
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {getImageCount(item) > 1 && (
                                                        <>
                                                            {/* Navigation Controls - Always Visible Arrows */}
                                                            <div className="absolute inset-0 flex items-center justify-between px-3 z-10 pointer-events-none">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        prevImage(item.id, getImageCount(item));
                                                                    }}
                                                                    className="bg-black/80 hover:bg-black text-white rounded-full p-3 transform hover:scale-125 transition-all shadow-xl backdrop-blur-md pointer-events-auto border-2 border-white/20 hover:border-white/40"
                                                                    aria-label="Previous image"
                                                                >
                                                                    <ChevronLeft className="h-6 w-6" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        nextImage(item.id, getImageCount(item));
                                                                    }}
                                                                    className="bg-black/80 hover:bg-black text-white rounded-full p-3 transform hover:scale-125 transition-all shadow-xl backdrop-blur-md pointer-events-auto border-2 border-white/20 hover:border-white/40"
                                                                    aria-label="Next image"
                                                                >
                                                                    <ChevronRight className="h-6 w-6" />
                                                                </button>
                                                            </div>
                                                            
                                                            {/* Bottom Bar with Dots Indicator */}
                                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4 z-10">
                                                                {/* Dots Indicator - Always Visible */}
                                                                <div className="flex justify-center items-center gap-2 mb-2">
                                                                    {Array.from({ length: getImageCount(item) }).map((_, index) => (
                                                                        <button
                                                                            key={index}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setCurrentImageIndex(prev => ({
                                                                                    ...prev,
                                                                                    [item.id]: index
                                                                                }));
                                                                            }}
                                                                            className={`rounded-full transition-all ${
                                                                                (currentImageIndex[item.id] || 0) === index 
                                                                                    ? 'bg-white w-3 h-3 scale-125 shadow-lg ring-2 ring-white/50' 
                                                                                    : 'bg-white/70 hover:bg-white/90 w-2.5 h-2.5 hover:scale-110'
                                                                            }`}
                                                                            aria-label={`Go to image ${index + 1}`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                {/* Counter Text */}
                                                                <div className="text-white text-xs text-center font-semibold">
                                                                    Image {(currentImageIndex[item.id] || 0) + 1} of {getImageCount(item)}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </>
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
                                                        className="flex-1 transition-all duration-200 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
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
                                    </div>
                                );
                            })}
                        </div>
                    )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Floating Add Item Button */}
                <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                    <DialogTrigger asChild>
                        <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-xl hover:shadow-2xl transition-all duration-200 z-40 flex items-center justify-center group hover:scale-110" aria-label="Add new wardrobe item">
                            <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-200" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] animate-in fade-in-0 zoom-in-95 duration-200 max-h-[95vh] overflow-hidden">
                        <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                                {isEditMode ? (
                                    <>
                                        <Edit3 className="h-5 w-5 text-green-600" />
                                        <span>Edit Wardrobe Item</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-5 w-5 text-green-600" />
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
                        <div className="overflow-y-auto max-h-[75vh] pr-2">
                            <form onSubmit={editingItem ? handleUpdateItem : handleAddItem}>
                                <div className="space-y-6 py-4">
                                    {/* Row 1: Item Name and Brand */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
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
                                        <div className="space-y-2">
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
                                    </div>

                                    {/* Row 2: Category, Color, Size, and Fabric */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
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
                                        <div className="space-y-2">
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
                                        {data.category !== 'Accessories' && data.category !== 'Hat' ? (
                                            <div className="space-y-2">
                                                <Label htmlFor="item-size">
                                                    {data.category === 'Shorts' || data.category === 'Jeans' || data.category === 'Pants' 
                                                        ? 'Waist Size *' 
                                                        : data.category === 'Boots' || data.category === 'Shoes' || data.category === 'Sandals'
                                                        ? 'Shoe Size *'
                                                        : 'Size *'}
                                                </Label>
                                                <Select value={data.size} onValueChange={(value) => setData('size', value)}>
                                                    <SelectTrigger className={errors.size ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder={
                                                            data.category === 'Shorts' || data.category === 'Jeans' || data.category === 'Pants'
                                                                ? 'Select waist size'
                                                                : data.category === 'Boots' || data.category === 'Shoes' || data.category === 'Sandals'
                                                                ? 'Select shoe size'
                                                                : 'Select size'
                                                        } />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {sizeOptions.map((size) => (
                                                            <SelectItem key={size} value={size}>
                                                                {size}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.size && <p className="text-red-500 text-sm">{errors.size}</p>}
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Label htmlFor="item-fabric">Fabric (Optional)</Label>
                                                <Select 
                                                    value={data.fabric || undefined} 
                                                    onValueChange={(value) => setData('fabric', value === 'none' ? '' : value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select fabric" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        {fabrics.map((fabric) => (
                                                            <SelectItem key={fabric} value={fabric}>
                                                                {fabric}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Row 3: Fabric (only shown when size field is visible, since fabric is already in the grid above for Hat/Accessories) */}
                                    {data.category !== 'Accessories' && data.category !== 'Hat' && data.category !== 'Sandals' && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="item-fabric-row3">Fabric (Optional)</Label>
                                                <Select 
                                                    value={data.fabric || undefined} 
                                                    onValueChange={(value) => setData('fabric', value === 'none' ? '' : value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select fabric" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        {fabrics.map((fabric) => (
                                                            <SelectItem key={fabric} value={fabric}>
                                                                {fabric}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    )}

                                    {/* Row 4: Image */}
                                    <div className="space-y-2">
                                        <Label htmlFor="item-image">Images *</Label>
                                            <div className="space-y-3">
                                                {/* Initial upload button */}
                                                {imagePreviews.length === 0 && (
                                                    <div className="space-y-3">
                                                        <Input
                                                            ref={fileInputRef}
                                                            id="item-image"
                                                            type="file"
                                                            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                                                            onChange={(e) => handleImageChange(e)}
                                                            disabled={isUploadingImage}
                                                            className="cursor-pointer"
                                                        />
                                                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                                            <div className="text-xs text-green-800 dark:text-green-200 space-y-1">
                                                                <p className="font-medium">Upload images from your device</p>
                                                                <p className="text-green-600 dark:text-green-300">Accepted formats: JPEG, PNG only</p>
                                                                <p className="text-green-600 dark:text-green-300">File size: Maximum 5MB per image</p>
                                                                <p className="text-green-600 dark:text-green-300">Maximum: 5 images per item</p>
                                                                <p className="text-green-500 dark:text-green-400">Recommended: 500x500px or larger</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Image previews with individual controls */}
                                                {imagePreviews.length > 0 && (
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                            {imagePreviews.map((preview, index) => (
                                                                <div key={index} className="relative group">
                                                                    <div className="relative">
                                                                        <img 
                                                                            src={preview} 
                                                                            alt={`Preview ${index + 1}`} 
                                                                            className="w-full h-24 object-cover rounded-lg border-2 border-green-500"
                                                                        />
                                                                        {/* Remove button */}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeImage(index)}
                                                                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            <X className="h-3 w-3" />
                                                                        </button>
                                                                        {/* Replace button */}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const input = document.createElement('input');
                                                                                input.type = 'file';
                                                                                input.accept = '.jpg,.jpeg,.png,image/jpeg,image/png';
                                                                                input.onchange = (e) => handleImageChange(e as any, index);
                                                                                input.click();
                                                                            }}
                                                                            className="absolute bottom-1 right-1 bg-green-500 hover:bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            <Edit3 className="h-3 w-3" />
                                                                        </button>
                                                                        {/* Image number */}
                                                                        <div className="absolute top-1 left-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                                            {index + 1}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            
                                                            {/* Add more button */}
                                                            {imagePreviews.length < 5 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={addImageSlot}
                                                                    disabled={isUploadingImage}
                                                                    className="w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
                                                                >
                                                                    <Plus className="h-6 w-6 text-gray-400 group-hover:text-green-500" />
                                                                    <span className="text-xs text-gray-500 group-hover:text-green-600 mt-1">Add Image</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between text-sm">
                                                            <p className="text-green-600 dark:text-green-400 font-medium">
                                                                ✓ {imagePreviews.length} image{imagePreviews.length > 1 ? 's' : ''} ready
                                                            </p>
                                                            <p className="text-gray-500">
                                                                {imagePreviews.length}/5 images
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {isUploadingImage && (
                                                    <div className="flex items-center space-x-2 text-sm text-green-600">
                                                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                                        <span>Processing image...</span>
                                                    </div>
                                                )}
                                                
                                                {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}
                                            </div>
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
                                        className="bg-green-600 hover:bg-green-700 transition-all duration-200"
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

            {/* Edit Weather Dialog */}
            <Dialog open={isEditWeatherOpen} onOpenChange={setIsEditWeatherOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <Edit3 className="h-5 w-5 text-blue-600" />
                            <span>Edit Weather</span>
                        </DialogTitle>
                        <DialogDescription>
                            Manually set the weather conditions for outfit recommendations.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={editedWeather.location}
                                onChange={(e) => setEditedWeather({ ...editedWeather, location: e.target.value })}
                                placeholder="e.g., New York, Tokyo"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="temp">Temperature (°C)</Label>
                            <Input
                                id="temp"
                                type="number"
                                value={editedWeather.temp}
                                onChange={(e) => setEditedWeather({ ...editedWeather, temp: parseInt(e.target.value) || 0 })}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="condition">Weather Condition</Label>
                            <Select
                                value={editedWeather.condition}
                                onValueChange={(value) => setEditedWeather({ ...editedWeather, condition: value })}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Sunny">Sunny</SelectItem>
                                    <SelectItem value="Hot">Hot</SelectItem>
                                    <SelectItem value="Cloudy">Cloudy</SelectItem>
                                    <SelectItem value="Humid">Humid</SelectItem>
                                    <SelectItem value="Rainy">Rainy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsEditWeatherOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveEditedWeather}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Save Weather
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

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
                                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center relative group">
                                            {getCurrentImage(item) ? (
                                                <>
                                                    <img 
                                                        src={getCurrentImage(item) || ''} 
                                                        alt={item.name}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                    {/* Small navigation arrows for multiple images */}
                                                    {getImageCount(item) > 1 && (
                                                        <>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    prevImage(item.id, getImageCount(item));
                                                                }}
                                                                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <ChevronLeft className="h-2 w-2" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    nextImage(item.id, getImageCount(item));
                                                                }}
                                                                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <ChevronRight className="h-2 w-2" />
                                                            </button>
                                                        </>
                                                    )}
                                                </>
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
                                Style Notes (Optional)
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
                                {userPreferences.styleNotes.length}/500 characters (optional)
                            </p>
                        </div>

                        {/* Current Preferences Summary */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Current Preferences Summary</h4>
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <p><strong>Preferred Colors:</strong> {userPreferences.preferredColors.join(', ') || 'None selected'}</p>
                                <p><strong>Preferred Categories:</strong> {userPreferences.preferredCategories.join(', ') || 'None selected'}</p>
                                <p><strong>Occasions:</strong> {userPreferences.preferredOccasions.join(', ') || 'None selected'}</p>
                                {userPreferences.styleNotes && (
                                    <p><strong>Style Notes:</strong> {userPreferences.styleNotes}</p>
                                )}
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

            {/* View Outfit Dialog */}
            <Dialog open={isViewOutfitOpen} onOpenChange={setIsViewOutfitOpen}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <Eye className="h-5 w-5 text-blue-600" />
                            <span>View Outfit Combination</span>
                        </DialogTitle>
                        <DialogDescription>
                            {viewingOutfit && (
                                <>
                                    {viewingOutfit.name}
                                    {viewingOutfit.occasion && (
                                        <Badge variant="outline" className="ml-2">
                                            {viewingOutfit.occasion}
                                        </Badge>
                                    )}
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {viewingOutfit && (
                        <div className="space-y-6">
                            {/* Outfit Description */}
                            {viewingOutfit.description && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {viewingOutfit.description}
                                    </p>
                                </div>
                            )}

                            {/* Outfit Items */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                                    <Shirt className="h-5 w-5" />
                                    <span>Outfit Items ({viewingOutfit.wardrobe_item_ids?.length || 0})</span>
                                </h3>
                                
                                {viewingOutfit.wardrobe_item_ids && viewingOutfit.wardrobe_item_ids.length > 0 ? (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {viewingOutfit.wardrobe_item_ids.map((itemId: number) => {
                                            const item = wardrobeItems.find(w => w.id === itemId);
                                            return item ? (
                                                <Card key={itemId} className="border-gray-200 dark:border-gray-700">
                                                    <CardContent className="p-4">
                                                        <div className="flex gap-4">
                                                            {/* Item Image */}
                                                            <div className="relative w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden group flex-shrink-0">
                                                                {getCurrentImage(item) ? (
                                                                    <>
                                                                        <img 
                                                                            src={getCurrentImage(item) || ''} 
                                                                            alt={item.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                        {/* Navigation arrows for multiple images */}
                                                                        {getImageCount(item) > 1 && (
                                                                            <>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        prevImage(item.id, getImageCount(item));
                                                                                    }}
                                                                                    className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                                                >
                                                                                    <ChevronLeft className="h-3 w-3" />
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        nextImage(item.id, getImageCount(item));
                                                                                    }}
                                                                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                                                >
                                                                                    <ChevronRight className="h-3 w-3" />
                                                                                </button>
                                                                                {/* Image counter */}
                                                                                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                                                                                    {(currentImageIndex[item.id] || 0) + 1}/{getImageCount(item)}
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <Shirt className="h-8 w-8 text-gray-400" />
                                                                )}
                                                            </div>

                                                            {/* Item Details */}
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-semibold text-base text-gray-900 dark:text-white truncate">
                                                                    {item.name}
                                                                </h4>
                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                    {item.category && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {item.category}
                                                                        </Badge>
                                                                    )}
                                                                    {item.color && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {item.color}
                                                                        </Badge>
                                                                    )}
                                                                    {item.brand && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {item.brand}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                                                    {item.size && (
                                                                        <div>Size: <span className="font-medium">{item.size}</span></div>
                                                                    )}
                                                                    {item.fabric && (
                                                                        <div>Fabric: <span className="font-medium">{item.fabric}</span></div>
                                                                    )}
                                                                </div>
                                                                {item.description && (
                                                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 line-clamp-2">
                                                                        {item.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ) : (
                                                <Card key={itemId} className="border-gray-200 dark:border-gray-700">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center justify-center py-8 text-gray-400">
                                                            <div className="text-center">
                                                                <Shirt className="h-8 w-8 mx-auto mb-2" />
                                                                <p className="text-sm">Item not found</p>
                                                                <p className="text-xs">ID: {itemId}</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Shirt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No items in this outfit</p>
                                    </div>
                                )}
                            </div>

                            {/* Outfit Metadata */}
                            {(viewingOutfit.weather_context || viewingOutfit.outfit_metadata) && (
                                <div className="border-t pt-4 space-y-2">
                                    {viewingOutfit.weather_context && (
                                        <div className="text-sm">
                                            <span className="font-medium">Weather Context:</span>
                                            <div className="mt-1 text-gray-600 dark:text-gray-400">
                                                {typeof viewingOutfit.weather_context === 'object' ? (
                                                    <div className="space-y-1">
                                                        {viewingOutfit.weather_context.location && (
                                                            <div>Location: {viewingOutfit.weather_context.location}</div>
                                                        )}
                                                        {viewingOutfit.weather_context.temp && (
                                                            <div>Temperature: {viewingOutfit.weather_context.temp}°C</div>
                                                        )}
                                                        {viewingOutfit.weather_context.condition && (
                                                            <div>Condition: {viewingOutfit.weather_context.condition}</div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span>{JSON.stringify(viewingOutfit.weather_context)}</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {viewingOutfit.outfit_metadata && (
                                        <div className="text-sm">
                                            <span className="font-medium">Metadata:</span>
                                            <div className="mt-1 text-gray-600 dark:text-gray-400">
                                                {typeof viewingOutfit.outfit_metadata === 'object' ? (
                                                    <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-auto">
                                                        {JSON.stringify(viewingOutfit.outfit_metadata, null, 2)}
                                                    </pre>
                                                ) : (
                                                    <span>{viewingOutfit.outfit_metadata}</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Feedback Stats */}
                            {(viewingOutfit.total_feedback_count || viewingOutfit.positive_feedback_count) && (
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="text-sm">
                                        <span className="font-medium">Total Feedback:</span>
                                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                                            {viewingOutfit.total_feedback_count || 0}
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-medium">Positive:</span>
                                        <span className="ml-2 text-green-600 dark:text-green-400">
                                            {viewingOutfit.positive_feedback_count || 0}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-2 pt-4 border-t">
                                <Button 
                                    variant="outline"
                                    onClick={() => {
                                        if (viewingOutfit) {
                                            const outfitItems = wardrobeItems.filter(item => 
                                                viewingOutfit.wardrobe_item_ids.includes(item.id)
                                            );
                                            setSelectedOutfitItems(outfitItems);
                                            setIsViewOutfitOpen(false);
                                            setIsSaveOutfitOpen(true);
                                        }
                                    }}
                                >
                                    <Edit3 className="mr-2 h-4 w-4" />
                                    Edit Outfit
                                </Button>
                                <Button onClick={() => setIsViewOutfitOpen(false)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}