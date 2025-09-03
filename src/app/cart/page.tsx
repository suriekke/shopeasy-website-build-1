"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  total: number;
}

interface CartData {
  items: CartItem[];
  subtotal: number;
  deliveryCharges: number;
  total: number;
  itemCount: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const fetchCart = useCallback(async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      if (!token) {
        toast.error("Please login to view your cart");
        router.push("/login");
        return;
      }

      const response = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }

      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (session?.user) {
      fetchCart();
    }
  }, [session, fetchCart]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(itemId));

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      await fetchCart();
      toast.success("Quantity updated");
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      await fetchCart();
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)}`;
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-6 w-48" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-20 h-20 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-40 mb-2" />
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-10 w-full mt-6" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center mb-6">
            <Link href="/products">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-text-dark">My Cart</h1>
              <p className="text-text-medium">Shopping Cart</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="w-16 h-16 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6 text-center">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link href="/products">
              <Button className="bg-primary hover:bg-primary/90">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link href="/products">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-dark">My Cart</h1>
            <div className="flex items-center text-text-medium">
              <Clock className="w-4 h-4 mr-1" />
              <span>Delivery in 8 minutes</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <Card key={item.id} className="transition-all duration-200 hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-card-background">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-text-dark line-clamp-2">
                        {item.name}
                      </h3>
                      <div className="flex items-center mt-2">
                        <Clock className="w-3 h-3 text-primary mr-1" />
                        <span className="text-xs text-primary font-medium">8 MINS</span>
                      </div>
                      <p className="text-price text-text-dark mt-1">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end space-y-3">
                      <div className="flex items-center space-x-3 bg-primary/5 rounded-lg p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updatingItems.has(item.id) || item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-semibold text-sm w-8 text-center">
                          {updatingItems.has(item.id) ? "..." : item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updatingItems.has(item.id)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-text-dark">
                          {formatPrice(item.total)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 h-auto"
                          onClick={() => removeItem(item.id)}
                          disabled={updatingItems.has(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:sticky lg:top-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <ShoppingCart className="w-5 h-5 mr-2 text-primary" />
                  <h2 className="text-lg font-semibold">Cart Summary</h2>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-text-medium">
                      Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})
                    </span>
                    <span className="font-semibold">{formatPrice(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-medium">Delivery charges</span>
                    <span className={cart.deliveryCharges === 0 ? "text-primary font-semibold" : "font-semibold"}>
                      {cart.deliveryCharges === 0 ? "FREE" : formatPrice(cart.deliveryCharges)}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-lg">Total</span>
                      <span className="font-bold text-lg text-primary">
                        {formatPrice(cart.total)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-text-medium bg-accent p-3 rounded-lg">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>Delivery in 8 minutes</span>
                  </div>

                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    onClick={() => router.push("/checkout")}
                  >
                    Proceed to Checkout
                  </Button>

                  <p className="text-xs text-text-light text-center">
                    By proceeding, you agree to our Terms & Conditions
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 p-4 bg-accent rounded-lg">
              <h3 className="font-semibold mb-2 text-sm">Delivery Address</h3>
              <p className="text-sm text-text-medium">
                Current location • Change address in checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}