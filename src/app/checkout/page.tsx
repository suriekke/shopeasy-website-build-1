"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { MapPin, Clock, Minus, Plus, CreditCard, Smartphone, Banknote } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  total: number;
}

interface Address {
  id: string;
  street: string;
  city: string;
  pincode: string;
  landmark?: string;
  is_default: boolean;
}

interface AddressForm {
  street: string;
  city: string;
  pincode: string;
  landmark: string;
}

interface OrderTotals {
  subtotal: number;
  deliveryCharges: number;
  total: number;
  itemCount: number;
}

export default function CheckoutPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [addressForm, setAddressForm] = useState<AddressForm>({
    street: "",
    city: "",
    pincode: "",
    landmark: ""
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/checkout");
    }
  }, [session, isPending, router]);

  const loadCartItems = useCallback(async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to load cart items");
      }

      const data = await response.json();
      setCartItems(data.items || []);
    } catch (error) {
      console.error("Error loading cart:", error);
      toast.error("Failed to load cart items");
    }
  }, []);

  const loadUserData = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/users/${session.user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.addresses) {
          setAddresses(userData.addresses);
          const defaultAddress = userData.addresses.find((addr: Address) => addr.is_default);
          if (defaultAddress) {
            setSelectedAddress(defaultAddress.id);
          }
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadCartItems(), loadUserData()]);
      setIsLoading(false);
    };

    if (session?.user && !isPending) {
      loadData();
    }
  }, [session?.user, isPending, loadCartItems, loadUserData]);

  const calculateTotals = useCallback((): OrderTotals => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const deliveryCharges = subtotal > 200 ? 0 : 30;
    const total = subtotal + deliveryCharges;

    return { subtotal, deliveryCharges, total, itemCount };
  }, [cartItems]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        setCartItems(items =>
          items.map(item =>
            item.id === itemId
              ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setCartItems(items => items.filter(item => item.id !== itemId));
        toast.success("Item removed from cart");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!addressForm.street || !addressForm.city || !addressForm.pincode) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(addressForm)
      });

      if (response.ok) {
        const newAddress = await response.json();
        setAddresses(prev => [...prev, newAddress]);
        setSelectedAddress(newAddress.id);
        setShowAddressForm(false);
        setAddressForm({ street: "", city: "", pincode: "", landmark: "" });
        toast.success("Address added successfully");
      }
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Failed to add address");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (!termsAccepted) {
      toast.error("Please accept terms and conditions");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const totals = calculateTotals();
      
      const orderData = {
        address_id: selectedAddress,
        payment_method: paymentMethod,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: totals.subtotal,
        delivery_charges: totals.deliveryCharges,
        total: totals.total
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const order = await response.json();
        
        // Clear cart
        await fetch("/api/cart/clear", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        toast.success("Order placed successfully!");
        router.push(`/orders/${order.id}?success=true`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-16 w-16 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12">
              <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some items to proceed with checkout</p>
              <Button onClick={() => router.push("/")} className="bg-primary hover:bg-primary/90">
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">Review your order and complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Order Summary</CardTitle>
                <div className="flex items-center text-sm text-green-600">
                  <Clock className="h-4 w-4 mr-1" />
                  Delivery in 8 minutes
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 object-cover rounded-lg border"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                        <p className="text-sm text-gray-600">₹{item.price}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right min-w-0">
                        <p className="font-semibold text-gray-900">₹{item.total}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 p-0 h-auto"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Items ({totals.itemCount})</span>
                      <span>₹{totals.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery charges</span>
                      <span>{totals.deliveryCharges === 0 ? "FREE" : `₹${totals.deliveryCharges}`}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span>₹{totals.total}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Delivery & Payment - Right Column */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <MapPin className="h-5 w-5 mr-2" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {addresses.length > 0 && (
                    <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                      {addresses.map((address) => (
                        <div key={address.id} className="flex items-start space-x-2">
                          <RadioGroupItem value={address.id} id={address.id} />
                          <Label htmlFor={address.id} className="flex-1 text-sm cursor-pointer">
                            <div>
                              <p className="font-medium">{address.street}</p>
                              <p className="text-gray-600">{address.city}, {address.pincode}</p>
                              {address.landmark && (
                                <p className="text-gray-500 text-xs">Near {address.landmark}</p>
                              )}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {!showAddressForm ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowAddressForm(true)}
                      className="w-full"
                    >
                      + Add New Address
                    </Button>
                  ) : (
                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="street">Street Address *</Label>
                        <Input
                          id="street"
                          value={addressForm.street}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                          placeholder="Enter your street address"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="City"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="pincode">Pincode *</Label>
                          <Input
                            id="pincode"
                            value={addressForm.pincode}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, pincode: e.target.value }))}
                            placeholder="Pincode"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="landmark">Landmark</Label>
                        <Input
                          id="landmark"
                          value={addressForm.landmark}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, landmark: e.target.value }))}
                          placeholder="Landmark (optional)"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit" size="sm" className="flex-1">
                          Add Address
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddressForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center cursor-pointer">
                      <Banknote className="h-4 w-4 mr-2" />
                      Cash on Delivery
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex items-center cursor-pointer">
                      <Smartphone className="h-4 w-4 mr-2" />
                      UPI Payment
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center cursor-pointer">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Credit/Debit Card
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Order Placement */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={setTermsAccepted}
                    />
                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                      I agree to the terms and conditions
                    </Label>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder || !selectedAddress || !termsAccepted}
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    {isPlacingOrder ? "Placing Order..." : `Place Order • ₹${totals.total}`}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Your order will be delivered in 8 minutes
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}