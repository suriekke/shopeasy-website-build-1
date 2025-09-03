"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, SlidersHorizontal, X, Clock, TrendingUp, Star, ChevronDown, Grid, List, ArrowUpDown, MapPin, ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useSearch, type SearchFilters, type SortOption } from '@/hooks/useSearch';
import Image from 'next/image';

// Mock data for categories and brands
const CATEGORIES = [
  'Dairy, Bread & Eggs',
  'Fruits & Vegetables', 
  'Snacks & Munchies',
  'Cold Drinks & Juices',
  'Breakfast & Instant Food',
  'Sweet Tooth',
  'Bakery & Biscuits',
  'Tea Coffee & Health Drink'
];

const BRANDS = [
  'Amul', 'Mother Dairy', 'Britannia', 'Parle', 'Nestle', 'Dabur', 'Haldiram', 'ITC'
];

const PRICE_RANGES = [
  { label: 'Under ₹50', min: 0, max: 50 },
  { label: '₹50 - ₹100', min: 50, max: 100 },
  { label: '₹100 - ₹200', min: 100, max: 200 },
  { label: '₹200 - ₹500', min: 200, max: 500 },
  { label: 'Above ₹500', min: 500, max: 10000 }
];

const SORT_OPTIONS = [
  { label: 'Most Popular', value: 'popularity:desc' },
  { label: 'Price: Low to High', value: 'price:asc' },
  { label: 'Price: High to Low', value: 'price:desc' },
  { label: 'Customer Rating', value: 'rating:desc' },
  { label: 'Newest First', value: 'newest:desc' },
  { label: 'A to Z', value: 'name:asc' },
  { label: 'Z to A', value: 'name:desc' }
];

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [searchFocused, setSearchFocused] = useState(false);

  const {
    query,
    results,
    isLoading,
    isSearching,
    error,
    filters,
    sort,
    suggestions,
    history,
    hasMore,
    selectedSuggestion,
    search,
    setFilters,
    updateFilter,
    clearFilters,
    setSortOption,
    loadMore,
    clearHistory,
    removeFromHistory,
    navigateSuggestions,
    selectSuggestion,
    retry
  } = useSearch({
    debounceMs: 300,
    enableCache: true,
    enableAnalytics: true
  });

  // Initialize search from URL params
  useEffect(() => {
    const q = searchParams.get('q');
    const category = searchParams.get('category');
    const sortParam = searchParams.get('sort');
    
    if (q) {
      search(q, true);
    }
    
    if (category) {
      updateFilter('category', category);
      setSelectedCategories([category]);
    }
    
    if (sortParam) {
      const [field, direction] = sortParam.split(':');
      setSortOption({ field: field as any, direction: direction as any });
    }
  }, [searchParams]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (searchFocused && suggestions.length > 0) {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            navigateSuggestions('down');
            break;
          case 'ArrowUp':
            e.preventDefault();
            navigateSuggestions('up');
            break;
          case 'Enter':
            e.preventDefault();
            selectSuggestion();
            break;
          case 'Escape':
            setSearchFocused(false);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchFocused, suggestions, navigateSuggestions, selectSuggestion]);

  // Apply filters
  const applyFilters = useCallback(() => {
    const newFilters: SearchFilters = {
      ...activeFilters,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
      minRating: minRating > 0 ? minRating : undefined
    };

    if (selectedCategories.length > 0) {
      newFilters.category = selectedCategories[0]; // For simplicity, using first category
    }

    if (selectedBrands.length > 0) {
      newFilters.brand = selectedBrands[0]; // For simplicity, using first brand
    }

    setFilters(newFilters);
    setShowFilters(false);
  }, [activeFilters, priceRange, minRating, selectedCategories, selectedBrands, setFilters]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    clearFilters();
    setActiveFilters({});
    setPriceRange([0, 1000]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMinRating(0);
  }, [clearFilters]);

  // Handle sort change
  const handleSortChange = useCallback((value: string) => {
    const [field, direction] = value.split(':');
    setSortOption({ field: field as any, direction: direction as any });
  }, [setSortOption]);

  // Add to cart function (mock)
  const handleAddToCart = useCallback((productId: string) => {
    toast.success('Added to cart!');
    // Implement actual add to cart logic here
  }, []);

  // Add to wishlist function (mock)  
  const handleAddToWishlist = useCallback((productId: string) => {
    toast.success('Added to wishlist!');
    // Implement actual add to wishlist logic here
  }, []);

  // Get active filters count
  const activeFilterCount = Object.keys(filters).length;

  // Filter sidebar component
  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-3">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={1000}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {PRICE_RANGES.map((range) => (
              <Button
                key={range.label}
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => setPriceRange([range.min, range.max])}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {CATEGORIES.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCategories(prev => [...prev, category]);
                  } else {
                    setSelectedCategories(prev => prev.filter(c => c !== category));
                  }
                }}
              />
              <label htmlFor={category} className="text-sm cursor-pointer flex-1">
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Brands */}
      <div>
        <h3 className="font-semibold mb-3">Brands</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {BRANDS.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={brand}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedBrands(prev => [...prev, brand]);
                  } else {
                    setSelectedBrands(prev => prev.filter(b => b !== brand));
                  }
                }}
              />
              <label htmlFor={brand} className="text-sm cursor-pointer flex-1">
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div>
        <h3 className="font-semibold mb-3">Minimum Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <Button
              key={rating}
              variant={minRating === rating ? "default" : "outline"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setMinRating(rating)}
            >
              <div className="flex items-center space-x-1">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2">& up</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Apply/Clear Buttons */}
      <div className="space-y-2 pt-4 border-t">
        <Button onClick={applyFilters} className="w-full">
          Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
        <Button variant="outline" onClick={handleClearFilters} className="w-full">
          Clear All
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="lg:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for products..."
                  value={query}
                  onChange={(e) => search(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  className="pl-10 pr-4 h-12"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {searchFocused && (suggestions.length > 0 || history.length > 0) && (
                <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
                  <CardContent className="p-0 max-h-80 overflow-y-auto">
                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-500 mb-2 px-2">Suggestions</div>
                        {suggestions.map((suggestion, index) => (
                          <Button
                            key={suggestion.id}
                            variant="ghost"
                            className={`w-full justify-start h-auto py-2 px-2 ${
                              selectedSuggestion === index ? 'bg-gray-100' : ''
                            }`}
                            onClick={() => {
                              search(suggestion.text, true);
                              setSearchFocused(false);
                            }}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <Search className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{suggestion.text}</span>
                              {suggestion.count && (
                                <span className="ml-auto text-xs text-gray-500">
                                  {suggestion.count} results
                                </span>
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Search History */}
                    {history.length > 0 && (
                      <div className="p-2 border-t">
                        <div className="flex items-center justify-between mb-2 px-2">
                          <div className="text-xs font-medium text-gray-500">Recent Searches</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearHistory}
                            className="h-6 px-2 text-xs"
                          >
                            Clear
                          </Button>
                        </div>
                        {history.slice(0, 5).map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <Button
                              variant="ghost"
                              className="flex-1 justify-start h-auto py-2 px-2"
                              onClick={() => {
                                search(item.query, true);
                                setSearchFocused(false);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">{item.query}</span>
                                <span className="text-xs text-gray-500">
                                  {item.resultCount} results
                                </span>
                              </div>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromHistory(item.query);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Desktop Filter Button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="hidden lg:flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            {/* Mobile Filter Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="w-4 h-4" />
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          {showFilters && (
            <div className="hidden lg:block w-64 flex-shrink-0">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold">Filters</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <FilterSidebar />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results Section */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-semibold">
                  {query ? `Search results for "${query}"` : 'Search Products'}
                </h1>
                {results && (
                  <p className="text-sm text-gray-600 mt-1">
                    {results.total} products found
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <Select 
                  value={`${sort.field}:${sort.direction}`} 
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {Object.entries(filters).map(([key, value]) => (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {key}: {String(value)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateFilter(key as keyof SearchFilters, undefined)}
                      className="h-auto p-0 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-6 px-2 text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* Results */}
            {error ? (
              <Card className="p-8 text-center">
                <CardContent>
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={retry}>Try Again</Button>
                </CardContent>
              </Card>
            ) : isLoading ? (
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {[...Array(8)].map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-4">
                      {viewMode === 'grid' ? (
                        <div className="space-y-3">
                          <Skeleton className="aspect-square rounded-lg" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      ) : (
                        <div className="flex gap-4">
                          <Skeleton className="w-24 h-24 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-8 w-32" />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : results && results.products.length > 0 ? (
              <>
                <div className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {results.products.map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        {viewMode === 'grid' ? (
                          <div className="space-y-3">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                              {product.image ? (
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  No Image
                                </div>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddToWishlist(product.id)}
                                className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                              >
                                <Heart className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div>
                              <h3 className="font-medium text-sm line-clamp-2 mb-1">
                                {product.name}
                              </h3>
                              <p className="text-xs text-gray-600 line-clamp-1">
                                {product.description}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < Math.floor(product.rating) 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-600">
                                ({product.reviewCount})
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-bold text-primary">
                                  ₹{product.price}
                                </span>
                                {product.originalPrice && (
                                  <span className="text-xs text-gray-500 line-through ml-1">
                                    ₹{product.originalPrice}
                                  </span>
                                )}
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleAddToCart(product.id)}
                                className="h-8"
                              >
                                <ShoppingCart className="w-3 h-3 mr-1" />
                                Add
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-4">
                            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {product.image ? (
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={96}
                                  height={96}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                  No Image
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm line-clamp-2 mb-1">
                                {product.name}
                              </h3>
                              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                {product.description}
                              </p>
                              
                              <div className="flex items-center gap-1 mb-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < Math.floor(product.rating) 
                                          ? 'fill-yellow-400 text-yellow-400' 
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-600">
                                  ({product.reviewCount})
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-primary">
                                    ₹{product.price}
                                  </span>
                                  {product.originalPrice && (
                                    <span className="text-xs text-gray-500 line-through ml-1">
                                      ₹{product.originalPrice}
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddToWishlist(product.id)}
                                  >
                                    <Heart className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddToCart(product.id)}
                                  >
                                    <ShoppingCart className="w-4 h-4 mr-1" />
                                    Add to Cart
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="text-center mt-8">
                    <Button 
                      onClick={loadMore} 
                      disabled={isLoading}
                      variant="outline"
                      size="lg"
                    >
                      {isLoading ? 'Loading...' : 'Load More Products'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="p-8 text-center">
                <CardContent>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium mb-2">No products found</h3>
                  <p className="text-gray-600 text-sm">
                    {query 
                      ? `No results found for "${query}". Try different keywords or filters.`
                      : 'Start searching to discover amazing products!'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}