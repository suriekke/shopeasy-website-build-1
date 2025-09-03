"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wifi, WifiOff, RefreshCw, ShoppingCart, Heart, Clock, Package } from 'lucide-react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [cachedData, setCachedData] = useState({
    cartItems: 0,
    wishlistItems: 0,
    lastSync: null as string | null
  });

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Load cached data from localStorage
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const lastSync = localStorage.getItem('lastSync');
      
      setCachedData({
        cartItems: cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0),
        wishlistItems: wishlist.length,
        lastSync
      });
    } catch (error) {
      console.error('Error loading cached data:', error);
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Attempt to sync when back online
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_WHEN_ONLINE'
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    
    if (navigator.onLine) {
      // Try to navigate back to home
      window.location.href = '/';
    } else {
      // Still offline, show feedback
      setTimeout(() => {
        if (!navigator.onLine) {
          alert('Still offline. Please check your internet connection.');
        }
      }, 1000);
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleViewCart = () => {
    window.location.href = '/cart';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Status Icon */}
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
            isOnline ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isOnline ? (
              <Wifi className="w-10 h-10 text-green-600" />
            ) : (
              <WifiOff className="w-10 h-10 text-red-600" />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isOnline ? 'Back Online!' : 'You\'re Offline'}
          </h1>
          
          <p className="text-gray-600 text-center">
            {isOnline 
              ? 'Great! Your connection has been restored.' 
              : 'No internet connection found. Check your connection and try again.'
            }
          </p>
        </div>

        {/* Network Status Card */}
        <Card className={`border-2 ${isOnline ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${
                isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
              <span className="font-medium">
                {isOnline ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {!isOnline && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Don't worry! You can still:
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="w-4 h-4 text-primary" />
                    <span>View cart ({cachedData.cartItems})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>View wishlist ({cachedData.wishlistItems})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-blue-500" />
                    <span>Browse cached products</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>View order history</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cached Data Info */}
        {cachedData.lastSync && (
          <div className="text-center text-sm text-gray-500">
            Last synced: {new Date(cachedData.lastSync).toLocaleString()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {isOnline ? (
            <Button 
              onClick={handleGoHome}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
              size="lg"
            >
              Continue Shopping
            </Button>
          ) : (
            <Button 
              onClick={handleRetry}
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary hover:text-white font-semibold"
              size="lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again {retryCount > 0 && `(${retryCount})`}
            </Button>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={handleViewCart}
              className="text-sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart ({cachedData.cartItems})
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/profile'}
              className="text-sm"
            >
              <Package className="w-4 h-4 mr-2" />
              Orders
            </Button>
          </div>
        </div>

        {/* Offline Tips */}
        {!isOnline && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-2">Tips to get back online:</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Check your WiFi connection</li>
                <li>• Turn off airplane mode</li>
                <li>• Move to an area with better signal</li>
                <li>• Restart your router if needed</li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* App Info */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SE</span>
            </div>
            <span className="font-bold text-lg text-primary">ShopEasy</span>
          </div>
          <p className="text-xs text-gray-500">
            Fresh groceries delivered in 8 minutes
          </p>
        </div>

        {/* PWA Install Prompt */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Install the app for the best offline experience
          </p>
        </div>
      </div>
    </div>
  );
}