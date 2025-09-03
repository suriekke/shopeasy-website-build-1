"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Grid3x3, Search, ShoppingCart, User } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  badge?: boolean;
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: House,
    href: '/',
  },
  {
    id: 'categories',
    label: 'Categories',
    icon: Grid3x3,
    href: '/categories',
  },
  {
    id: 'search',
    label: 'Search',
    icon: Search,
    href: '/search',
  },
  {
    id: 'cart',
    label: 'Cart',
    icon: ShoppingCart,
    href: '/cart',
    badge: true,
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    href: '/profile',
  },
];

export const MobileBottomNavigation = () => {
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    // Get cart count from localStorage
    const updateCartCount = () => {
      try {
        const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalCount = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
        setCartCount(totalCount);
      } catch (error) {
        setCartCount(0);
      }
    };

    // Initial load
    updateCartCount();

    // Listen for cart updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart') {
        updateCartCount();
      }
    };

    // Listen for custom cart update events
    const handleCartUpdate = () => {
      updateCartCount();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const handleNavClick = () => {
    // Haptic feedback for supported devices
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg pb-safe-bottom">
      <div className="flex items-center justify-around h-15 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={handleNavClick}
              className="flex flex-col items-center justify-center min-h-11 px-2 py-1 min-w-11 touch-manipulation"
              aria-label={item.label}
            >
              <div 
                className={`relative flex flex-col items-center justify-center transition-all duration-200 transform active:scale-95 ${
                  active ? 'text-primary' : 'text-gray-500'
                }`}
              >
                <div className="relative mb-1">
                  <Icon 
                    size={22} 
                    className={`transition-colors duration-200 ${
                      active ? 'text-primary' : 'text-gray-500'
                    }`} 
                  />
                  {item.badge && cartCount > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-in zoom-in-50 duration-200">
                      <span className="px-1 text-xs font-medium leading-none">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    </div>
                  )}
                </div>
                <span 
                  className={`text-xs leading-none transition-colors duration-200 ${
                    active ? 'text-primary font-semibold' : 'text-gray-500 font-normal'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};