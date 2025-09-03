"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, Heart, ShoppingCart, Star, Clock, ChevronDown, Grid, Grid3X3, List, X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { authClient, useSession } from '@/lib/auth-client';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  imageUrl?: string;
  categoryId: number;
  stockQuantity: number;
  deliveryTime: string;
  rating: number;
  reviewCount: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
}

interface Filters {
  categories: number[];
  priceRange: [number, number];
  rating: number;
}

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('order') || 'desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    searchParams.get('category') ? parseInt(searchParams.get('category')!) : null
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cartItems, setCartItems] = useState<{[productId: number]: number}>({});
  const [wishlistItems, setWishlistItems] = useState<Set<number>>(new Set());
  const [addingToCart, setAddingToCart] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<Filters>({
    categories: selectedCategoryId ? [selectedCategoryId] : [],
    priceRange: [0, 1000],
    rating: 0
  });
  
  const productsPerPage = 20;

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // Fetch products with filters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: productsPerPage.toString(),
        offset: ((currentPage - 1) * productsPerPage).toString(),
        sort: sortBy,
        order: sortOrder,
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategoryId) params.append('category_id', selectedCategoryId.toString());

      const response = await fetch(`/api/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        setTotalProducts(data.length); // In a real app, this would come from the API
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategoryId, sortBy, sortOrder]);

  // Fetch user's cart and wishlist
  const fetchUserData = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      // Fetch cart
      const cartResponse = await fetch(`/api/cart?user_id=${session.user.id}`);
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        const cartMap: {[productId: number]: number} = {};
        cartData.forEach((item: any) => {
          cartMap[item.productId] = item.quantity;
        });
        setCartItems(cartMap);
      }

      // Fetch wishlist
      const wishlistResponse = await fetch(`/api/wishlists?user_id=${session.user.id}`);
      if (wishlistResponse.ok) {
        const wishlistData = await wishlistResponse.json();
        const wishlistSet = new Set<number>();
        wishlistData.forEach((item: any) => wishlistSet.add(item.productId));
        setWishlistItems(wishlistSet);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Update URL params
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategoryId) params.set('category', selectedCategoryId.toString());
    if (sortBy !== 'createdAt') params.set('sort', sortBy);
    if (sortOrder !== 'desc') params.set('order', sortOrder);
    
    const newUrl = `/products${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl);
  }, [searchQuery, selectedCategoryId, sortBy, sortOrder, router]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  // Handle add to cart
  const handleAddToCart = async (productId: number) => {
    if (!session?.user?.id) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }

    setAddingToCart(prev => new Set([...prev, productId]));
    
    try {
      const currentQuantity = cartItems[productId] || 0;
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bearer_token')}`
        },
        body: JSON.stringify({
          userId: session.user.id,
          productId,
          quantity: currentQuantity + 1
        })
      });

      if (response.ok) {
        setCartItems(prev => ({
          ...prev,
          [productId]: currentQuantity + 1
        }));
        toast.success('Added to cart');
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (productId: number) => {
    if (!session?.user?.id) {
      toast.error('Please login to manage wishlist');
      router.push('/login');
      return;
    }

    try {
      const isInWishlist = wishlistItems.has(productId);
      
      if (isInWishlist) {
        // Remove from wishlist - we'd need the wishlist item ID for this
        // For now, just update local state
        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        toast.success('Removed from wishlist');
      } else {
        const response = await fetch('/api/wishlists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('bearer_token')}`
          },
          body: JSON.stringify({
            userId: session.user.id,
            productId
          })
        });

        if (response.ok) {
          setWishlistItems(prev => new Set([...prev, productId]));
          toast.success('Added to wishlist');
        } else {
          throw new Error('Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  // Handle quantity change
  const handleQuantityChange = async (productId: number, change: number) => {
    const currentQuantity = cartItems[productId] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);
    
    if (newQuantity === 0) {
      // Remove from cart - would need cart item ID
      setCartItems(prev => {
        const newItems = { ...prev };
        delete newItems[productId];
        return newItems;
      });
    } else {
      setCartItems(prev => ({
        ...prev,
        [productId]: newQuantity
      }));
    }
  };

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  // Filter sidebar component
  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="all-categories"
              checked={!selectedCategoryId}
              onCheckedChange={() => setSelectedCategoryId(null)}
            />
            <label htmlFor="all-categories" className="text-sm">All Categories</label>
          </div>
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategoryId === category.id}
                onCheckedChange={(checked) => {
                  setSelectedCategoryId(checked ? category.id : null);
                }}
              />
              <label htmlFor={`category-${category.id}`} className="text-sm">
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.priceRange[0]}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]]
              }))}
              className="w-20"
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.priceRange[1]}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                priceRange: [prev.priceRange[0], parseInt(e.target.value) || 1000]
              }))}
              className="w-20"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.rating === rating}
                onCheckedChange={() => setFilters(prev => ({
                  ...prev,
                  rating: prev.rating === rating ? 0 : rating
                }))}
              />
              <label htmlFor={`rating-${rating}`} className="text-sm flex items-center gap-1">
                {rating}+ <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Product card component
  const ProductCard = ({ product }: { product: Product }) => {
    const discountPercentage = product.discountedPrice 
      ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
      : 0;

    return (
      <Card className="group hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="relative mb-3">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-2">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-gray-400 text-sm">No Image</div>
              )}
            </div>
            
            <div className="absolute top-2 left-2 flex gap-1">
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                <Clock className="h-3 w-3 mr-1" />
                {product.deliveryTime}
              </Badge>
              {discountPercentage > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {discountPercentage}% OFF
                </Badge>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0"
              onClick={() => handleWishlistToggle(product.id)}
            >
              <Heart 
                className={`h-4 w-4 ${
                  wishlistItems.has(product.id) 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-400'
                }`} 
              />
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
              {product.name}
            </h3>
            
            <p className="text-xs text-gray-600 line-clamp-2">
              {product.description}
            </p>

            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {renderStars(product.rating)}
              </div>
              <span className="text-xs text-gray-500">
                ({product.reviewCount})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                ₹{product.discountedPrice || product.price}
              </span>
              {product.discountedPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.price}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              {product.stockQuantity > 0 ? (
                <Badge variant="secondary" className="text-xs text-green-600">
                  In Stock
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  Out of Stock
                </Badge>
              )}
            </div>

            {cartItems[product.id] ? (
              <div className="flex items-center justify-center gap-3 border rounded-lg py-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => handleQuantityChange(product.id, -1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-medium">{cartItems[product.id]}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => handleQuantityChange(product.id, 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                className="w-full text-button"
                onClick={() => handleAddToCart(product.id)}
                disabled={product.stockQuantity === 0 || addingToCart.has(product.id)}
              >
                {addingToCart.has(product.id) ? (
                  'Adding...'
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    ADD
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container py-4">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-600 mb-4">
            <span>Home</span> / <span>Products</span>
            {selectedCategoryId && categories.find(c => c.id === selectedCategoryId) && (
              <span> / {categories.find(c => c.id === selectedCategoryId)?.name}</span>
            )}
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            <div className="flex gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Newest</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Low to High</SelectItem>
                  <SelectItem value="desc">High to Low</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="flex gap-6">
          {/* Desktop Filters */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-32">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold">Filters</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCategoryId(null);
                        setFilters({
                          categories: [],
                          priceRange: [0, 1000],
                          rating: 0
                        });
                      }}
                    >
                      Clear All
                    </Button>
                  </div>
                  <Separator className="mb-4" />
                  <FilterSidebar />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mobile Filters */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
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

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                {!loading && (
                  <>
                    Showing {products.length} products
                    {searchQuery && (
                      <span> for "{searchQuery}"</span>
                    )}
                    {selectedCategoryId && categories.find(c => c.id === selectedCategoryId) && (
                      <span> in {categories.find(c => c.id === selectedCategoryId)?.name}</span>
                    )}
                  </>
                )}
              </div>
              
              {/* Category chips */}
              {selectedCategoryId && (
                <div className="flex gap-2">
                  <Badge 
                    variant="secondary" 
                    className="flex items-center gap-1 cursor-pointer hover:bg-gray-200"
                    onClick={() => setSelectedCategoryId(null)}
                  >
                    {categories.find(c => c.id === selectedCategoryId)?.name}
                    <X className="h-3 w-3" />
                  </Badge>
                </div>
              )}
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className={`grid gap-4 ${viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                : 'grid-cols-1'
              }`}>
                {Array.from({ length: 8 }).map((_, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <Skeleton className="aspect-square rounded-lg mb-3" />
                      <Skeleton className="h-4 mb-2" />
                      <Skeleton className="h-3 mb-2 w-3/4" />
                      <Skeleton className="h-3 mb-3 w-1/2" />
                      <Skeleton className="h-8 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Products */}
            {!loading && products.length > 0 && (
              <div className={`grid gap-4 ${viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                : 'grid-cols-1 md:grid-cols-2'
              }`}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && products.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-sm">
                    {searchQuery 
                      ? `No products match your search "${searchQuery}"` 
                      : 'No products available in this category'
                    }
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategoryId(null);
                    fetchProducts();
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {!loading && products.length > 0 && totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                    const pageNum = currentPage <= 3 
                      ? index + 1 
                      : currentPage + index - 2;
                    
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}