"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

// Types and Interfaces
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  subcategory?: string;
  brand?: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  deliveryTime: number;
  tags: string[];
  sku: string;
  weight?: string;
  unit?: string;
}

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  deliveryTime?: number;
  tags?: string[];
}

export interface SortOption {
  field: 'price' | 'rating' | 'popularity' | 'newest' | 'name';
  direction: 'asc' | 'desc';
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand' | 'popular';
  count?: number;
  category?: string;
}

export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  suggestions?: SearchSuggestion[];
  facets?: {
    categories: { name: string; count: number }[];
    brands: { name: string; count: number }[];
    priceRanges: { min: number; max: number; count: number }[];
  };
}

export interface SearchHistory {
  query: string;
  timestamp: number;
  filters?: SearchFilters;
  resultCount: number;
}

export interface SearchAnalytics {
  popularQueries: { query: string; count: number }[];
  trendingCategories: { category: string; growth: number }[];
  searchVolume: { date: string; count: number }[];
}

export interface UseSearchOptions {
  debounceMs?: number;
  maxHistoryItems?: number;
  enableAnalytics?: boolean;
  enableCache?: boolean;
  cacheTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface SearchState {
  query: string;
  results: SearchResult | null;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  filters: SearchFilters;
  sort: SortOption;
  page: number;
  suggestions: SearchSuggestion[];
  history: SearchHistory[];
  analytics: SearchAnalytics | null;
  hasMore: boolean;
  selectedSuggestion: number;
}

// Cache Implementation
class SearchCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;
  private maxSize: number;

  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  private generateKey(query: string, filters: SearchFilters, sort: SortOption, page: number): string {
    return JSON.stringify({ query, filters, sort, page });
  }

  get(query: string, filters: SearchFilters, sort: SortOption, page: number): SearchResult | null {
    const key = this.generateKey(query, filters, sort, page);
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.timestamp + item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(query: string, filters: SearchFilters, sort: SortOption, page: number, data: SearchResult, ttl = 300000): void {
    const key = this.generateKey(query, filters, sort, page);
    
    // Implement LRU eviction
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  clear(): void {
    this.cache.clear();
  }

  has(query: string, filters: SearchFilters, sort: SortOption, page: number): boolean {
    const key = this.generateKey(query, filters, sort, page);
    return this.cache.has(key);
  }
}

// Request cancellation utility
class RequestManager {
  private controllers: Map<string, AbortController>;

  constructor() {
    this.controllers = new Map();
  }

  createRequest(id: string): AbortController {
    // Cancel previous request with same ID
    this.cancelRequest(id);
    
    const controller = new AbortController();
    this.controllers.set(id, controller);
    return controller;
  }

  cancelRequest(id: string): void {
    const controller = this.controllers.get(id);
    if (controller) {
      controller.abort();
      this.controllers.delete(id);
    }
  }

  cancelAll(): void {
    for (const controller of this.controllers.values()) {
      controller.abort();
    }
    this.controllers.clear();
  }
}

// Search history management
class SearchHistoryManager {
  private storageKey = 'quickcommerce_search_history';
  private maxItems: number;

  constructor(maxItems = 20) {
    this.maxItems = maxItems;
  }

  getHistory(): SearchHistory[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  addToHistory(item: SearchHistory): void {
    try {
      let history = this.getHistory();
      
      // Remove duplicate queries
      history = history.filter(h => h.query !== item.query);
      
      // Add new item to beginning
      history.unshift(item);
      
      // Limit size
      history = history.slice(0, this.maxItems);
      
      localStorage.setItem(this.storageKey, JSON.stringify(history));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }

  clearHistory(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to clear search history:', error);
    }
  }

  removeFromHistory(query: string): void {
    try {
      const history = this.getHistory().filter(h => h.query !== query);
      localStorage.setItem(this.storageKey, JSON.stringify(history));
    } catch (error) {
      console.warn('Failed to remove from search history:', error);
    }
  }
}

// Fuzzy search utility
class FuzzySearch {
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  static getSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  static shouldSuggestCorrection(query: string, suggestion: string, threshold = 0.7): boolean {
    return this.getSimilarity(query.toLowerCase(), suggestion.toLowerCase()) >= threshold;
  }
}

// Main hook implementation
export const useSearch = (options: UseSearchOptions = {}) => {
  const {
    debounceMs = 300,
    maxHistoryItems = 20,
    enableAnalytics = true,
    enableCache = true,
    cacheTimeout = 300000,
    retryAttempts = 3,
    retryDelay = 1000
  } = options;

  // State management
  const [state, setState] = useState<SearchState>({
    query: '',
    results: null,
    isLoading: false,
    isSearching: false,
    error: null,
    filters: {},
    sort: { field: 'popularity', direction: 'desc' },
    page: 1,
    suggestions: [],
    history: [],
    analytics: null,
    hasMore: false,
    selectedSuggestion: -1
  });

  // Refs for utilities
  const cacheRef = useRef<SearchCache>();
  const requestManagerRef = useRef<RequestManager>();
  const historyManagerRef = useRef<SearchHistoryManager>();
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const suggestionsTimerRef = useRef<NodeJS.Timeout>();

  // Initialize utilities
  useEffect(() => {
    cacheRef.current = new SearchCache();
    requestManagerRef.current = new RequestManager();
    historyManagerRef.current = new SearchHistoryManager(maxHistoryItems);

    // Load initial history
    setState(prev => ({
      ...prev,
      history: historyManagerRef.current!.getHistory()
    }));

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (suggestionsTimerRef.current) {
        clearTimeout(suggestionsTimerRef.current);
      }
      requestManagerRef.current?.cancelAll();
    };
  }, [maxHistoryItems]);

  // API call with retry logic
  const makeRequest = useCallback(async (url: string, params: any, signal: AbortSignal, retries = 0): Promise<any> => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(`${url}?${queryParams.toString()}`, { signal });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw error;
      }
      
      if (retries < retryAttempts && !signal.aborted) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (retries + 1)));
        return makeRequest(url, params, signal, retries + 1);
      }
      
      throw error;
    }
  }, [retryAttempts, retryDelay]);

  // Search function
  const performSearch = useCallback(async (
    query: string,
    filters: SearchFilters = {},
    sort: SortOption = { field: 'popularity', direction: 'desc' },
    page: number = 1,
    loadMore: boolean = false
  ) => {
    if (!query.trim() && Object.keys(filters).length === 0) {
      setState(prev => ({ 
        ...prev, 
        results: null, 
        isLoading: false, 
        isSearching: false,
        error: null 
      }));
      return;
    }

    // Check cache first
    if (enableCache && cacheRef.current) {
      const cached = cacheRef.current.get(query, filters, sort, page);
      if (cached) {
        setState(prev => ({
          ...prev,
          results: loadMore && prev.results ? {
            ...cached,
            products: [...prev.results.products, ...cached.products]
          } : cached,
          isLoading: false,
          isSearching: false,
          hasMore: cached.page < cached.totalPages,
          error: null
        }));
        return;
      }
    }

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      isSearching: true, 
      error: null 
    }));

    try {
      const controller = requestManagerRef.current!.createRequest('search');
      
      const params = {
        q: query,
        page,
        sort: `${sort.field}:${sort.direction}`,
        ...filters
      };

      const data = await makeRequest('/api/products/search', params, controller.signal);
      
      // Cache the result
      if (enableCache && cacheRef.current) {
        cacheRef.current.set(query, filters, sort, page, data, cacheTimeout);
      }

      // Add to history
      if (query.trim() && historyManagerRef.current) {
        historyManagerRef.current.addToHistory({
          query: query.trim(),
          timestamp: Date.now(),
          filters,
          resultCount: data.total || 0
        });
      }

      setState(prev => ({
        ...prev,
        results: loadMore && prev.results ? {
          ...data,
          products: [...prev.results.products, ...data.products]
        } : data,
        isLoading: false,
        isSearching: false,
        hasMore: data.page < data.totalPages,
        history: historyManagerRef.current!.getHistory(),
        error: null
      }));

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isSearching: false,
          error: error.message || 'Search failed. Please try again.'
        }));
      }
    }
  }, [enableCache, cacheTimeout, makeRequest]);

  // Get suggestions
  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, suggestions: [] }));
      return;
    }

    try {
      const controller = requestManagerRef.current!.createRequest('suggestions');
      const data = await makeRequest('/api/products/suggestions', { q: query }, controller.signal);
      
      setState(prev => ({ ...prev, suggestions: data.suggestions || [] }));
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.warn('Failed to get suggestions:', error);
      }
    }
  }, [makeRequest]);

  // Debounced search
  const debouncedSearch = useCallback((
    query: string,
    filters?: SearchFilters,
    sort?: SortOption,
    page?: number
  ) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(
        query,
        filters || state.filters,
        sort || state.sort,
        page || 1
      );
    }, debounceMs);
  }, [debounceMs, performSearch, state.filters, state.sort]);

  // Debounced suggestions
  const debouncedSuggestions = useCallback((query: string) => {
    if (suggestionsTimerRef.current) {
      clearTimeout(suggestionsTimerRef.current);
    }

    suggestionsTimerRef.current = setTimeout(() => {
      getSuggestions(query);
    }, 150);
  }, [getSuggestions]);

  // Public API methods
  const search = useCallback((query: string, immediate: boolean = false) => {
    setState(prev => ({ ...prev, query, page: 1 }));
    
    if (immediate) {
      performSearch(query, state.filters, state.sort, 1);
    } else {
      debouncedSearch(query);
    }
    
    debouncedSuggestions(query);
  }, [performSearch, debouncedSearch, debouncedSuggestions, state.filters, state.sort]);

  const setFilters = useCallback((filters: SearchFilters) => {
    setState(prev => ({ ...prev, filters, page: 1 }));
    debouncedSearch(state.query, filters, state.sort, 1);
  }, [debouncedSearch, state.query, state.sort]);

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    const newFilters = { ...state.filters, [key]: value };
    if (value === undefined || value === null || value === '') {
      delete newFilters[key];
    }
    setFilters(newFilters);
  }, [state.filters, setFilters]);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, [setFilters]);

  const setSortOption = useCallback((sort: SortOption) => {
    setState(prev => ({ ...prev, sort, page: 1 }));
    debouncedSearch(state.query, state.filters, sort, 1);
  }, [debouncedSearch, state.query, state.filters]);

  const loadMore = useCallback(() => {
    if (state.hasMore && !state.isLoading) {
      const nextPage = state.page + 1;
      setState(prev => ({ ...prev, page: nextPage }));
      performSearch(state.query, state.filters, state.sort, nextPage, true);
    }
  }, [state.hasMore, state.isLoading, state.page, state.query, state.filters, state.sort, performSearch]);

  const clearHistory = useCallback(() => {
    historyManagerRef.current?.clearHistory();
    setState(prev => ({ ...prev, history: [] }));
  }, []);

  const removeFromHistory = useCallback((query: string) => {
    historyManagerRef.current?.removeFromHistory(query);
    setState(prev => ({ 
      ...prev, 
      history: prev.history.filter(h => h.query !== query)
    }));
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current?.clear();
  }, []);

  const retry = useCallback(() => {
    if (state.error) {
      performSearch(state.query, state.filters, state.sort, state.page);
    }
  }, [state.error, state.query, state.filters, state.sort, state.page, performSearch]);

  const getSearchAnalytics = useCallback(async () => {
    if (!enableAnalytics) return;

    try {
      const controller = requestManagerRef.current!.createRequest('analytics');
      const data = await makeRequest('/api/products/analytics', {}, controller.signal);
      setState(prev => ({ ...prev, analytics: data }));
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.warn('Failed to get search analytics:', error);
      }
    }
  }, [enableAnalytics, makeRequest]);

  const navigateSuggestions = useCallback((direction: 'up' | 'down') => {
    setState(prev => {
      const maxIndex = prev.suggestions.length - 1;
      let newIndex = prev.selectedSuggestion;
      
      if (direction === 'down') {
        newIndex = newIndex < maxIndex ? newIndex + 1 : -1;
      } else {
        newIndex = newIndex > -1 ? newIndex - 1 : maxIndex;
      }
      
      return { ...prev, selectedSuggestion: newIndex };
    });
  }, []);

  const selectSuggestion = useCallback((index?: number) => {
    const suggestionIndex = index ?? state.selectedSuggestion;
    if (suggestionIndex >= 0 && suggestionIndex < state.suggestions.length) {
      const suggestion = state.suggestions[suggestionIndex];
      search(suggestion.text, true);
      setState(prev => ({ ...prev, selectedSuggestion: -1, suggestions: [] }));
    }
  }, [state.selectedSuggestion, state.suggestions, search]);

  // Load analytics on mount
  useEffect(() => {
    if (enableAnalytics) {
      getSearchAnalytics();
    }
  }, [enableAnalytics, getSearchAnalytics]);

  return {
    // State
    query: state.query,
    results: state.results,
    isLoading: state.isLoading,
    isSearching: state.isSearching,
    error: state.error,
    filters: state.filters,
    sort: state.sort,
    page: state.page,
    suggestions: state.suggestions,
    history: state.history,
    analytics: state.analytics,
    hasMore: state.hasMore,
    selectedSuggestion: state.selectedSuggestion,

    // Methods
    search,
    setFilters,
    updateFilter,
    clearFilters,
    setSortOption,
    loadMore,
    clearHistory,
    removeFromHistory,
    clearCache,
    retry,
    getSearchAnalytics,
    navigateSuggestions,
    selectSuggestion,

    // Utilities
    fuzzySearch: FuzzySearch
  };
};

export default useSearch;