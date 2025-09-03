"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ShoppingCart, 
  MapPin, 
  ChevronDown, 
  User, 
  LogOut, 
  Package,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import { authClient, useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  price: number;
  discountedPrice?: number;
  imageUrl?: string;
  deliveryTime: string;
}

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product?: Product;
}

interface SearchResult {
  id: number;
  name: string;
  price: number;
  discountedPrice?: number;
  imageUrl?: string;
  deliveryTime: string;
}

export const Header = () => {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);

  // Refs
  const searchRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      if (query.trim().length > 0) {
        setIsSearching(true);
        try {
          const response = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=5`);
          if (response.ok) {
            const products = await response.json();
            setSearchResults(products);
            setShowSearchDropdown(true);
          }
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 300);
  }, []);

  // Load cart items
  const loadCartItems = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoadingCart(true);
    try {
      const response = await fetch(`/api/cart?user_id=${session.user.id}`);
      if (response.ok) {
        const items = await response.json();
        setCartItems(items);
        setCartCount(items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoadingCart(false);
    }
  }, [session?.user?.id]);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchDropdown(false);
      setSearchQuery('');
    }
  };

  // Handle login
  const handleLogin = () => {
    router.push('/login');
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const { error } = await authClient.signOut();
      if (error?.code) {
        toast.error(error.code);
      } else {
        localStorage.removeItem("bearer_token");
        refetch();
        router.push('/');
        toast.success('Logged out successfully');
      }
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setShowCartDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load cart on session change
  useEffect(() => {
    if (session?.user?.id) {
      loadCartItems();
    } else {
      setCartItems([]);
      setCartCount(0);
    }
  }, [session?.user?.id, loadCartItems]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="text-2xl font-bold text-primary-green">
              ShopEasy
            </div>
          </Link>

          {/* Location Indicator - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 text-sm">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Delivery in 8 minutes</span>
              <div className="flex items-center gap-1 text-gray-700">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">New Delhi, Delhi</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-md relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 w-full border-gray-200 focus:ring-2 focus:ring-primary-green focus:border-transparent"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                )}
              </div>
            </form>

            {/* Search Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <Card className="absolute top-full left-0 right-0 mt-1 shadow-lg border z-50">
                <CardContent className="p-0">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="block p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setShowSearchDropdown(false);
                        setSearchQuery('');
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="w-8 h-8 object-cover rounded"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{product.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>₹{product.discountedPrice || product.price}</span>
                            <span>•</span>
                            <span>{product.deliveryTime}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {searchQuery.trim() && (
                    <button
                      onClick={() => {
                        router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                        setShowSearchDropdown(false);
                        setSearchQuery('');
                      }}
                      className="w-full p-3 text-left text-sm text-primary-green hover:bg-gray-50 border-t"
                    >
                      See all results for "{searchQuery}"
                    </button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            {/* Login/User Menu */}
            {!isPending && (
              <>
                {session?.user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 text-gray-700">
                        <User className="w-4 h-4" />
                        <span className="hidden sm:inline">{session.user.name}</span>
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/orders" className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
                        <LogOut className="w-4 h-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button onClick={handleLogin} variant="ghost" className="text-gray-700">
                    Login
                  </Button>
                )}
              </>
            )}

            {/* Cart */}
            <div className="relative" ref={cartRef}>
              <Button 
                variant="ghost" 
                className="relative flex items-center gap-2 text-gray-700"
                onClick={() => setShowCartDropdown(!showCartDropdown)}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">My Cart</span>
                {cartCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>

              {/* Cart Dropdown */}
              {showCartDropdown && (
                <Card className="absolute top-full right-0 mt-1 w-80 shadow-lg border z-50">
                  <CardContent className="p-4">
                    {isLoadingCart ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : cartItems.length > 0 ? (
                      <>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {cartItems.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center gap-3 py-2">
                              <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0"></div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">Product {item.productId}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                          {cartItems.length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{cartItems.length - 3} more items
                            </p>
                          )}
                        </div>
                        <div className="border-t pt-3 mt-3 space-y-2">
                          <Button asChild className="w-full" size="sm">
                            <Link href="/cart">View Cart</Link>
                          </Button>
                          <Button asChild variant="outline" className="w-full" size="sm">
                            <Link href="/checkout">Checkout</Link>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">Your cart is empty</p>
                        <Button asChild size="sm" className="mt-2">
                          <Link href="/products">Start Shopping</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
            </form>

            {/* Mobile Location */}
            <div className="flex items-center gap-2 text-sm mb-4 p-2 bg-gray-50 rounded">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <div className="text-xs text-gray-500">Delivery in 8 minutes</div>
                <div className="font-medium text-gray-700">New Delhi, Delhi</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              <Link 
                href="/categories" 
                className="block p-2 text-gray-700 hover:bg-gray-50 rounded"
                onClick={() => setShowMobileMenu(false)}
              >
                Categories
              </Link>
              <Link 
                href="/offers" 
                className="block p-2 text-gray-700 hover:bg-gray-50 rounded"
                onClick={() => setShowMobileMenu(false)}
              >
                Offers
              </Link>
              {session?.user && (
                <>
                  <Link 
                    href="/profile" 
                    className="block p-2 text-gray-700 hover:bg-gray-50 rounded"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Profile
                  </Link>
                  <Link 
                    href="/orders" 
                    className="block p-2 text-gray-700 hover:bg-gray-50 rounded"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    My Orders
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};