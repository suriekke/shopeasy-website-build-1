"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, Heart, Plus, Minus, ShoppingCart, Truck, Package, Clock, User, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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
  createdAt: string;
  updatedAt: string;
}

interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
}

interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products?id=${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          
          // Fetch related products from same category
          const relatedResponse = await fetch(`/api/products?category_id=${data.categoryId}&limit=6`);
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            setRelatedProducts(relatedData.filter((p: Product) => p.id !== data.id).slice(0, 5));
          }
        } else {
          toast.error('Product not found');
          router.push('/');
        }
      } catch (error) {
        toast.error('Failed to load product');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, router]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return;
      
      setReviewsLoading(true);
      try {
        const response = await fetch(`/api/reviews?product_id=${productId}&limit=20`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  // Fetch user cart and wishlist
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return;

      try {
        const token = localStorage.getItem("bearer_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch cart items
        const cartResponse = await fetch(`/api/cart?user_id=${session.user.id}`, { headers });
        if (cartResponse.ok) {
          const cartData = await cartResponse.json();
          setCartItems(cartData);
        }

        // Fetch wishlist items
        const wishlistResponse = await fetch(`/api/wishlists?user_id=${session.user.id}`, { headers });
        if (wishlistResponse.ok) {
          const wishlistData = await wishlistResponse.json();
          setWishlistItems(wishlistData);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  const handleAddToCart = async () => {
    if (!session?.user) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }

    setCartLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const existingItem = cartItems.find(item => item.productId === parseInt(productId));

      if (existingItem) {
        // Update quantity
        const response = await fetch(`/api/cart?id=${existingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          },
          body: JSON.stringify({ quantity: existingItem.quantity + quantity })
        });

        if (response.ok) {
          toast.success('Cart updated successfully');
          setCartItems(prev => prev.map(item => 
            item.id === existingItem.id 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ));
        } else {
          toast.error('Failed to update cart');
        }
      } else {
        // Add new item
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          },
          body: JSON.stringify({
            userId: session.user.id,
            productId: parseInt(productId),
            quantity
          })
        });

        if (response.ok) {
          const newItem = await response.json();
          toast.success('Added to cart successfully');
          setCartItems(prev => [...prev, newItem]);
        } else {
          toast.error('Failed to add to cart');
        }
      }
    } catch (error) {
      toast.error('Failed to add to cart');
      console.error(error);
    } finally {
      setCartLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!session?.user) {
      toast.error('Please login to add items to wishlist');
      router.push('/login');
      return;
    }

    setWishlistLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const existingItem = wishlistItems.find(item => item.productId === parseInt(productId));

      if (existingItem) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlists?id=${existingItem.id}`, {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (response.ok) {
          toast.success('Removed from wishlist');
          setWishlistItems(prev => prev.filter(item => item.id !== existingItem.id));
        } else {
          toast.error('Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          },
          body: JSON.stringify({
            userId: session.user.id,
            productId: parseInt(productId)
          })
        });

        if (response.ok) {
          const newItem = await response.json();
          toast.success('Added to wishlist');
          setWishlistItems(prev => [...prev, newItem]);
        } else {
          toast.error('Failed to add to wishlist');
        }
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
      console.error(error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!session?.user) {
      toast.error('Please login to submit a review');
      router.push('/login');
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setSubmittingReview(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          userId: session.user.id,
          productId: parseInt(productId),
          rating: newReview.rating,
          comment: newReview.comment
        })
      });

      if (response.ok) {
        const review = await response.json();
        toast.success('Review submitted successfully');
        setReviews(prev => [review, ...prev]);
        setNewReview({ rating: 5, comment: '' });
      } else {
        toast.error('Failed to submit review');
      }
    } catch (error) {
      toast.error('Failed to submit review');
      console.error(error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const isInWishlist = wishlistItems.some(item => item.productId === parseInt(productId));
  const cartItem = cartItems.find(item => item.productId === parseInt(productId));

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button onClick={() => router.push('/')}>Go back to home</Button>
        </div>
      </div>
    );
  }

  const discountPercentage = product.discountedPrice 
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  const ratingBreakdown = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <span className="cursor-pointer hover:text-primary" onClick={() => router.push('/')}>Home</span>
          <ChevronRight className="w-4 h-4" />
          <span className="cursor-pointer hover:text-primary">Products</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-2" />
                  <p>Product Image</p>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {product.description && (
                <p className="text-muted-foreground text-lg">{product.description}</p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= product.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{product.rating}</span>
              <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-primary">
                ₹{product.discountedPrice || product.price}
              </span>
              {product.discountedPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.price}
                  </span>
                  <Badge variant="destructive">{discountPercentage}% OFF</Badge>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-4">
              <Badge variant={product.stockQuantity > 0 ? "default" : "destructive"}>
                {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
              </Badge>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Delivery in {product.deliveryTime}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Truck className="w-4 h-4" />
                <span>Free delivery</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= product.stockQuantity}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0 || cartLoading}
                className="flex-1"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {cartLoading ? 'Adding...' : cartItem ? 'Update Cart' : 'Add to Cart'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
              >
                <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Reviews Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Customer Reviews</h3>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold">{product.rating}</div>
                  <div className="flex justify-center items-center space-x-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= product.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">{product.reviewCount} reviews</div>
                </div>

                {/* Rating Breakdown */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2 text-sm">
                      <span>{rating}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${reviews.length > 0 ? ((ratingBreakdown[rating] || 0) / reviews.length) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <span className="text-muted-foreground">{ratingBreakdown[rating] || 0}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reviews List and Add Review */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Review Form */}
            {session?.user && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4">Write a Review</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                            className="p-1"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= newReview.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300 hover:text-yellow-400'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Comment</label>
                      <Textarea
                        placeholder="Share your experience with this product..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                        rows={4}
                      />
                    </div>
                    <Button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || !newReview.comment.trim()}
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">All Reviews</h3>
              {reviewsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex items-center space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-muted-foreground">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No reviews yet. Be the first to review this product!
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <Card 
                  key={relatedProduct.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/products/${relatedProduct.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      {relatedProduct.imageUrl ? (
                        <img 
                          src={relatedProduct.imageUrl} 
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <h3 className="font-medium text-sm mb-2 line-clamp-2">{relatedProduct.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <span className="font-bold text-primary">
                          ₹{relatedProduct.discountedPrice || relatedProduct.price}
                        </span>
                        {relatedProduct.discountedPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            ₹{relatedProduct.price}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{relatedProduct.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}