"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Home, Building2, MapPin, Edit2, Trash2, Navigation, Star, MoreVertical, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useLocation } from '@/hooks/useLocation';
import { useSession } from '@/lib/auth-client';

interface Address {
  id: string;
  label: 'home' | 'work' | 'other';
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  landmark?: string;
  isDefault: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const LABEL_ICONS = {
  home: Home,
  work: Building2,
  other: MapPin
};

const LABEL_COLORS = {
  home: 'text-blue-500 bg-blue-50',
  work: 'text-purple-500 bg-purple-50',
  other: 'text-green-500 bg-green-50'
};

export default function AddressPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { getCurrentLocation, validateDeliveryArea } = useLocation();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    landmark: ''
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  // Load addresses on mount
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('bearer_token');
      
      const response = await fetch('/api/addresses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGetCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      const location = await getCurrentLocation();
      
      if (location) {
        // Reverse geocoding simulation
        setFormData(prev => ({
          ...prev,
          street: `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
          city: 'Current City',
          state: 'Current State',
          zipCode: '12345'
        }));
        
        toast.success('Location detected successfully');
      }
    } catch (error) {
      console.error('Failed to get location:', error);
      toast.error('Failed to get current location');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const validateForm = () => {
    const required = ['label', 'name', 'street', 'city', 'state', 'zipCode'];
    const missing = required.filter(field => !formData[field as keyof typeof formData]);
    
    if (missing.length > 0) {
      toast.error('Please fill all required fields');
      return false;
    }
    
    return true;
  };

  const handleSaveAddress = async () => {
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('bearer_token');
      const addressData = {
        ...formData,
        isDefault: addresses.length === 0 // First address becomes default
      };

      let url = '/api/addresses';
      let method = 'POST';

      if (editingAddress) {
        url = `/api/addresses/${editingAddress.id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      });

      if (response.ok) {
        toast.success(editingAddress ? 'Address updated successfully' : 'Address added successfully');
        setIsAddDialogOpen(false);
        setEditingAddress(null);
        resetForm();
        loadAddresses();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Failed to save address:', error);
      toast.error('Failed to save address');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const token = localStorage.getItem('bearer_token');
      
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Address deleted successfully');
        loadAddresses();
      } else {
        toast.error('Failed to delete address');
      }
    } catch (error) {
      console.error('Failed to delete address:', error);
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const token = localStorage.getItem('bearer_token');
      
      const response = await fetch(`/api/addresses/${addressId}/set-default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Default address updated');
        loadAddresses();
      } else {
        toast.error('Failed to update default address');
      }
    } catch (error) {
      console.error('Failed to set default address:', error);
      toast.error('Failed to update default address');
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      landmark: address.landmark || ''
    });
    setIsAddDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      label: '',
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      landmark: ''
    });
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingAddress(null);
    resetForm();
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="bg-white shadow-sm p-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">My Addresses</h1>
          </div>
        </div>
      </div>

      <div className="p-4 pb-safe">
        {/* Add New Address Button */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full mb-6 bg-primary hover:bg-primary-dark text-white"
              onClick={() => {
                setEditingAddress(null);
                resetForm();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Address
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Address Label */}
              <div className="space-y-2">
                <Label>Address Type *</Label>
                <Select value={formData.label} onValueChange={(value) => setFormData(prev => ({ ...prev, label: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select address type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>

              {/* Street Address */}
              <div className="space-y-2">
                <Label>Street Address *</Label>
                <Textarea
                  value={formData.street}
                  onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                  placeholder="House number, street name, area"
                  rows={3}
                />
              </div>

              {/* GPS Location Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4 mr-2" />
                    Use Current Location
                  </>
                )}
              </Button>

              {/* City and State */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label>State *</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                  />
                </div>
              </div>

              {/* ZIP Code */}
              <div className="space-y-2">
                <Label>ZIP Code *</Label>
                <Input
                  value={formData.zipCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                  placeholder="ZIP Code"
                />
              </div>

              {/* Landmark */}
              <div className="space-y-2">
                <Label>Landmark (Optional)</Label>
                <Input
                  value={formData.landmark}
                  onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                  placeholder="Nearby landmark"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCloseDialog}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-primary hover:bg-primary-dark"
                  onClick={handleSaveAddress}
                >
                  {editingAddress ? 'Update' : 'Save'} Address
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <Card className="p-8 text-center">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">No addresses saved yet</h3>
                <p className="text-sm text-gray-500">
                  Add your delivery addresses to get started with quick orders
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => {
              const IconComponent = LABEL_ICONS[address.label];
              const iconColorClass = LABEL_COLORS[address.label];
              
              return (
                <Card key={address.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${iconColorClass}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 capitalize">
                              {address.label}
                            </span>
                            {address.isDefault && (
                              <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
                                <Star className="h-3 w-3 mr-1 fill-current" />
                                Default
                              </Badge>
                            )}
                          </div>
                          
                          <p className="font-medium text-sm text-gray-900 mb-1">
                            {address.name}
                          </p>
                          
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {address.street}
                          </p>
                          
                          <p className="text-sm text-gray-500">
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                          
                          {address.landmark && (
                            <p className="text-xs text-gray-500 mt-1">
                              Near {address.landmark}
                            </p>
                          )}

                          {/* Quick Actions */}
                          <div className="flex items-center gap-3 mt-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary-dark h-8 px-3"
                              onClick={() => handleEditAddress(address)}
                            >
                              <Edit2 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            
                            {!address.isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-gray-900 h-8 px-3"
                                onClick={() => handleSetDefault(address.id)}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Set Default
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* More Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-2">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditAddress(address)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit Address
                          </DropdownMenuItem>
                          {!address.isDefault && (
                            <DropdownMenuItem onClick={() => handleSetDefault(address.id)}>
                              <Star className="h-4 w-4 mr-2" />
                              Set as Default
                            </DropdownMenuItem>
                          )}
                          <Separator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Address
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Delivery Info */}
        <Card className="mt-6 bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900 mb-1">
                  Delivery Information
                </h4>
                <p className="text-sm text-green-700">
                  We deliver within 8 minutes to verified addresses in our service area. 
                  Make sure your address is complete and accurate for fastest delivery.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}