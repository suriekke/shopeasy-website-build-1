"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, ShoppingCart, User, Clock, ChevronDown, X } from 'lucide-react';
import { LocationSelector } from '@/components/location/location-selector';

interface HeaderProps {
  className?: string;
}

export const Header = ({ className = "" }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const searchSuggestions = [
    "Fresh vegetables",
    "Milk and dairy",
    "Bread and eggs",
    "Cold drinks",
    "Snacks",
    "Fruits"
  ];

  // Update cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = localStorage.getItem('cart');
        if (cart) {
          const cartData = JSON.parse(cart);
          const totalItems = cartData.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
          setCartCount(totalItems);
        }
      } catch (error) {
        console.error('Error reading cart from localStorage:', error);
      }
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    
    // Custom event for cart updates
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  // Haptic feedback for supported devices
  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search logic here
      console.log('Searching for:', searchQuery);
      triggerHapticFeedback();
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    searchRef.current?.focus();
  };

  const handleLocationChange = (address: any) => {
    console.log('Location changed:', address);
    // Update delivery area validation, shipping calculations, etc.
  };

  return (
    <header className={`sticky top-0 z-50 bg-white border-b border-gray-200 ${className}`}>
      {/* Safe area support for notched devices */}
      <div className="safe-area-inset-top">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Logo and Location */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SE</span>
                </div>
                <span className="font-bold text-lg text-gray-900 hidden sm:block">ShopEasy</span>
              </div>

              {/* Delivery Time */}
              <div className="hidden sm:flex items-center gap-1 text-xs text-gray-600">
                <Clock className="w-3 h-3" />
                <span>8 mins</span>
              </div>
            </div>

            {/* Location Selector - Updated to use new component */}
            <LocationSelector 
              onLocationChange={handleLocationChange}
              showDeliveryTime={true}
              className="flex-shrink-0"
            />

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-2">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className={`relative flex items-center bg-gray-50 rounded-lg border transition-all duration-200 ${
                  isSearchFocused ? 'border-primary bg-white shadow-sm' : 'border-gray-200'
                }`}>
                  <Search className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Search for products..."
                    className="w-full px-3 py-3 bg-transparent text-sm placeholder-gray-500 outline-none min-h-[44px]"
                    aria-label="Search for products"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Search Suggestions */}
                {isSearchFocused && searchQuery.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-gray-100">
                      <h3 className="font-medium text-gray-900 text-sm">Popular Searches</h3>
                    </div>
                    <div className="py-2">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchQuery(suggestion);
                            setIsSearchFocused(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div className="flex items-center gap-2">
                            <Search className="w-3 h-3 text-gray-400" />
                            {suggestion}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Profile/Login Button */}
              <button
                onClick={triggerHapticFeedback}
                className="p-3 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="User profile"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Cart Button */}
              <button
                onClick={triggerHapticFeedback}
                className="relative p-3 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={`Shopping cart with ${cartCount} items`}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-in zoom-in-50 duration-200">
                    {cartCount > 99 ? '99+' : cartCount}
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Delivery Time */}
          <div className="flex sm:hidden items-center justify-center gap-1 text-xs text-gray-600 mt-2 pt-2 border-t border-gray-100">
            <Clock className="w-3 h-3" />
            <span>Delivery in 8 minutes</span>
          </div>
        </div>
      </div>
    </header>
  );
};