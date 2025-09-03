"use client";

import { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, ChevronDown, Loader2, AlertCircle, Search, X, Navigation, Plus, Home, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLocation } from '@/hooks/useLocation';
import { toast } from 'sonner';

interface LocationSelectorProps {
  className?: string;
  onLocationChange?: (address: any) => void;
  showDeliveryTime?: boolean;
  compact?: boolean;
}

export const LocationSelector = ({ 
  className = "", 
  onLocationChange,
  showDeliveryTime = true,
  compact = false 
}: LocationSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    currentLocation,
    currentAddress,
    selectedAddress,
    savedAddresses,
    isLoading,
    error,
    permissionStatus,
    isInDeliveryArea,
    requestLocation,
    getCurrentAddress,
    validateDeliveryArea,
    saveAddress,
    setSelectedAddress,
    searchAddresses,
    formatAddress,
    clearError
  } = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowAddressForm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const results = await searchAddresses(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchAddresses]);

  // Handle location request
  const handleLocationRequest = async () => {
    clearError();
    
    try {
      const coords = await requestLocation();
      if (coords) {
        const address = await getCurrentAddress(coords);
        if (address) {
          const isValid = await validateDeliveryArea(coords);
          if (isValid) {
            setSelectedAddress(address);
            onLocationChange?.(address);
            setIsOpen(false);
            toast.success('Location updated successfully!');
          }
        }
      }
    } catch (error) {
      console.error('Location request failed:', error);
    }
  };

  // Handle address selection
  const handleAddressSelect = async (address: any) => {
    setSelectedAddress(address);
    onLocationChange?.(address);
    
    // Validate delivery area if coordinates are available
    if (address.coordinates) {
      await validateDeliveryArea(address.coordinates);
    }
    
    setIsOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    toast.success('Address selected successfully!');
  };

  // Handle save new address
  const handleSaveAddress = async (addressData: any) => {
    try {
      const success = await saveAddress(addressData);
      if (success) {
        setShowAddressForm(false);
        toast.success('Address saved successfully!');
      }
    } catch (error) {
      toast.error('Failed to save address');
    }
  };

  // Get display text for current selection
  const getDisplayText = () => {
    if (selectedAddress) {
      return compact ? selectedAddress.city : selectedAddress.formatted;
    }
    if (currentAddress) {
      return compact ? currentAddress.city : currentAddress.formatted;
    }
    return 'Select location';
  };

  // Get address type icon
  const getAddressIcon = (address: any) => {
    if (address.label?.toLowerCase().includes('home')) {
      return <Home className="w-4 h-4 text-blue-500" />;
    }
    if (address.label?.toLowerCase().includes('work') || address.label?.toLowerCase().includes('office')) {
      return <Building2 className="w-4 h-4 text-green-500" />;
    }
    return <MapPin className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className={`flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50 ${
          compact ? 'px-3 py-1.5' : 'px-4 py-2'
        } ${error ? 'border-red-300' : ''}`}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : error ? (
          <AlertCircle className="w-4 h-4 text-red-500" />
        ) : (
          <MapPin className="w-4 h-4 text-primary" />
        )}
        
        <div className="text-left min-w-0 flex-1">
          {!compact && (
            <div className="text-xs text-gray-500">Deliver to</div>
          )}
          <div className={`font-medium text-gray-900 truncate ${
            compact ? 'text-sm max-w-[100px]' : 'text-sm max-w-[150px]'
          }`}>
            {getDisplayText()}
          </div>
        </div>
        
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </Button>

      {/* Delivery time indicator */}
      {showDeliveryTime && selectedAddress && isInDeliveryArea && (
        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>8min</span>
        </div>
      )}

      {/* Error indicator */}
      {error && (
        <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
          !
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg border-gray-200 min-w-[320px] max-w-[400px]">
          <CardContent className="p-0">
            {/* Search Section */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for area, street name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Current Location Section */}
            <div className="p-4 border-b border-gray-100">
              <Button
                variant="ghost"
                onClick={handleLocationRequest}
                disabled={isLoading}
                className="w-full justify-start p-0 h-auto text-left"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    ) : (
                      <Navigation className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-blue-600">Use current location</div>
                    <div className="text-sm text-gray-500">
                      {permissionStatus === 'denied' 
                        ? 'Location access denied' 
                        : 'Get accurate delivery time'}
                    </div>
                  </div>
                </div>
              </Button>
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="max-h-64 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    <div className="text-sm text-gray-500">Searching...</div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="p-2">
                    {searchResults.map((result, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        onClick={() => handleAddressSelect(result)}
                        className="w-full justify-start p-3 h-auto text-left mb-1"
                      >
                        <div className="flex items-start gap-3 w-full">
                          <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {result.street}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {result.city}, {result.state} {result.zipCode}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No results found
                  </div>
                )}
              </div>
            )}

            {/* Saved Addresses */}
            {!searchQuery && savedAddresses.length > 0 && (
              <>
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-700">Saved Addresses</div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {savedAddresses.map((address, index) => (
                    <Button
                      key={address.id || index}
                      variant="ghost"
                      onClick={() => handleAddressSelect(address)}
                      className="w-full justify-start p-3 h-auto text-left border-b border-gray-50 last:border-b-0"
                    >
                      <div className="flex items-start gap-3 w-full">
                        {getAddressIcon(address)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {address.label || 'Address'}
                            </span>
                            {address.isDefault && (
                              <Badge variant="outline" className="text-xs">Default</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {formatAddress(address)}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </>
            )}

            {/* Add Address Section */}
            {!searchQuery && (
              <div className="p-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => setShowAddressForm(true)}
                  className="w-full justify-start gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New Address
                </Button>
              </div>
            )}

            {/* Delivery Area Status */}
            {selectedAddress && isInDeliveryArea !== null && (
              <div className="p-3 bg-gray-50 border-t border-gray-100">
                <div className={`flex items-center gap-2 text-sm ${
                  isInDeliveryArea ? 'text-green-600' : 'text-red-600'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isInDeliveryArea ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  {isInDeliveryArea ? (
                    <span>✓ Delivery available in 8 minutes</span>
                  ) : (
                    <span>✗ Outside delivery area</span>
                  )}
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border-t border-red-100">
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearError}
                    className="ml-auto h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};