"use client";

import { useState, useCallback } from 'react';
import { Header } from '@/components/layout/mobile-header';
import { MobileBottomNavigation } from '@/components/layout/bottom-nav';
import { PullToRefresh } from '@/components/layout/pull-to-refresh';
import HeroBanners from '@/components/sections/hero-banners';
import CategoryGrid from '@/components/sections/category-grid';
import ProductCarouselSection from '@/components/sections/product-carousel';
import Footer from '@/components/sections/footer';

export default function HomePage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      // Simulate API refresh - replace with actual data fetching
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Trigger cache update for fresh data
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_URLS',
          urls: ['/api/products', '/api/categories']
        });
      }
      
      console.log('Page refreshed successfully');
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile-Optimized Header */}
      <Header />

      {/* Pull-to-Refresh Wrapper */}
      <PullToRefresh 
        onRefresh={handleRefresh}
        isLoading={isRefreshing}
        className="flex-1 overflow-auto"
      >
        {/* Main Content */}
        <main className="pb-20"> {/* Extra padding for bottom nav */}
          <div className="max-w-[1200px] mx-auto px-4 sm:px-5">
            {/* Hero Banners */}
            <div className="py-4">
              <HeroBanners />
            </div>
            
            {/* Category Grid */}
            <div className="py-4">
              <CategoryGrid />
            </div>
            
            {/* Product Carousels */}
            <div className="py-4">
              <ProductCarouselSection />
            </div>
          </div>

          {/* Footer - Hidden on mobile, shown on desktop */}
          <div className="hidden md:block">
            <Footer />
          </div>
        </main>
      </PullToRefresh>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation />

      {/* App-like enhancements */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Prevent zoom on double-tap for app-like feel
            let lastTouchEnd = 0;
            document.addEventListener('touchend', function (event) {
              const now = (new Date()).getTime();
              if (now - lastTouchEnd <= 300) {
                event.preventDefault();
              }
              lastTouchEnd = now;
            }, false);

            // Add app-like scroll behavior
            document.addEventListener('DOMContentLoaded', function() {
              // Smooth scroll for anchor links
              document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                  e.preventDefault();
                  const target = document.querySelector(this.getAttribute('href'));
                  if (target) {
                    target.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }
                });
              });

              // Add focus styles for keyboard navigation
              document.addEventListener('keydown', function(e) {
                if (e.key === 'Tab') {
                  document.body.classList.add('keyboard-navigation');
                }
              });

              document.addEventListener('mousedown', function() {
                document.body.classList.remove('keyboard-navigation');
              });
            });

            // Performance monitoring
            if ('performance' in window) {
              window.addEventListener('load', function() {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
              });
            }

            // App state management
            window.appState = {
              isOnline: navigator.onLine,
              cartItems: JSON.parse(localStorage.getItem('cart') || '[]'),
              updateCart: function(items) {
                localStorage.setItem('cart', JSON.stringify(items));
                window.dispatchEvent(new CustomEvent('cartUpdated'));
              }
            };

            // Network status updates
            window.addEventListener('online', function() {
              window.appState.isOnline = true;
              console.log('App is online');
            });

            window.addEventListener('offline', function() {
              window.appState.isOnline = false;
              console.log('App is offline');
            });
          `
        }}
      />

      {/* App-specific CSS */}
      <style jsx global>{`
        /* App-like enhancements */
        html {
          /* Prevent iOS Safari bounce */
          overscroll-behavior: none;
          /* Better text rendering */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          /* Disable selection on interactive elements */
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Re-enable selection for text content */
        p, span, div:not([role="button"]), h1, h2, h3, h4, h5, h6 {
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }

        /* iOS Safari specific */
        @supports (-webkit-touch-callout: none) {
          .safe-area-top {
            padding-top: env(safe-area-inset-top);
          }
          
          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom);
          }
          
          .pb-safe-bottom {
            padding-bottom: calc(env(safe-area-inset-bottom) + 1rem);
          }
        }

        /* Focus styles for keyboard navigation */
        .keyboard-navigation *:focus {
          outline: 2px solid #0C831F;
          outline-offset: 2px;
        }

        /* Better button interactions */
        button, [role="button"] {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        /* Smooth animations */
        * {
          transition: transform 0.1s ease-out;
        }

        /* Active states for better feedback */
        button:active, [role="button"]:active {
          transform: scale(0.98);
        }

        /* Disable text selection on interactive elements */
        button, a, [role="button"], [role="tab"] {
          -webkit-user-select: none;
          -moz-user-select: none;
          user-select: none;
        }

        /* App loading skeleton */
        .loading-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(12, 131, 31, 0.3);
          border-radius: 2px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(12, 131, 31, 0.5);
        }
      `}</style>
    </div>
  );
}