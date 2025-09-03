"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { authClient, useSession } from '@/lib/auth-client';
import { toast } from 'sonner';

// Types
interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates: Coordinates;
  label?: string;
  isDefault?: boolean;
  formatted: string;
}

interface DeliveryArea {
  id: string;
  name: string;
  coordinates: Coordinates;
  radius: number; // in kilometers
}

interface LocationState {
  currentLocation: Coordinates | null;
  currentAddress: Address | null;
  selectedAddress: Address | null;
  savedAddresses: Address[];
  isLoading: boolean;
  error: string | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
  isInDeliveryArea: boolean | null;
}

interface GeolocationError {
  code: number;
  message: string;
}

interface LocationHook {
  // State
  currentLocation: Coordinates | null;
  currentAddress: Address | null;
  selectedAddress: Address | null;
  savedAddresses: Address[];
  isLoading: boolean;
  error: string | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
  isInDeliveryArea: boolean | null;
  
  // Methods
  requestLocation: () => Promise<Coordinates | null>;
  getCurrentAddress: (coords?: Coordinates) => Promise<Address | null>;
  validateDeliveryArea: (coords: Coordinates) => Promise<boolean>;
  saveAddress: (address: Address) => Promise<boolean>;
  getAddresses: () => Promise<Address[]>;
  setSelectedAddress: (address: Address) => void;
  searchAddresses: (query: string) => Promise<Address[]>;
  calculateDistance: (coord1: Coordinates, coord2: Coordinates) => number;
  formatAddress: (address: Partial<Address>) => string;
  clearError: () => void;
}

// Default delivery areas (example data)
const DEFAULT_DELIVERY_AREAS: DeliveryArea[] = [
  {
    id: '1',
    name: 'Downtown Area',
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
    radius: 10
  },
  {
    id: '2', 
    name: 'Midtown Area',
    coordinates: { latitude: 40.7831, longitude: -73.9712 },
    radius: 15
  }
];

export const useLocation = (): LocationHook => {
  const { data: session } = useSession();
  const [state, setState] = useState<LocationState>({
    currentLocation: null,
    currentAddress: null,
    selectedAddress: null,
    savedAddresses: [],
    isLoading: false,
    error: null,
    permissionStatus: 'unknown',
    isInDeliveryArea: null,
  });

  const watchIdRef = useRef<number | null>(null);
  const cacheTimeoutRef = useRef<NodeJS.Timeout>();

  // Cache keys
  const LOCATION_CACHE_KEY = 'quickcommerce_location_cache';
  const ADDRESSES_CACHE_KEY = 'quickcommerce_addresses_cache';
  const SELECTED_ADDRESS_KEY = 'quickcommerce_selected_address';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Utility function to calculate distance between two coordinates
  const calculateDistance = useCallback((coord1: Coordinates, coord2: Coordinates): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Format address utility
  const formatAddress = useCallback((address: Partial<Address>): string => {
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ');
  }, []);

  // Cache management
  const getCachedLocation = useCallback((): Coordinates | null => {
    try {
      const cached = localStorage.getItem(LOCATION_CACHE_KEY);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(LOCATION_CACHE_KEY);
        return null;
      }
      
      return data;
    } catch {
      return null;
    }
  }, []);

  const setCachedLocation = useCallback((location: Coordinates) => {
    try {
      localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({
        data: location,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to cache location:', error);
    }
  }, []);

  const getCachedAddresses = useCallback((): Address[] => {
    try {
      const cached = localStorage.getItem(ADDRESSES_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }, []);

  const setCachedAddresses = useCallback((addresses: Address[]) => {
    try {
      localStorage.setItem(ADDRESSES_CACHE_KEY, JSON.stringify(addresses));
    } catch (error) {
      console.warn('Failed to cache addresses:', error);
    }
  }, []);

  // Check geolocation permission
  const checkPermission = useCallback(async (): Promise<'granted' | 'denied' | 'prompt'> => {
    if (!navigator.permissions) return 'prompt';
    
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state;
    } catch {
      return 'prompt';
    }
  }, []);

  // Request current location
  const requestLocation = useCallback(async (): Promise<Coordinates | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    // Check for cached location first
    const cachedLocation = getCachedLocation();
    if (cachedLocation) {
      setState(prev => ({ 
        ...prev, 
        currentLocation: cachedLocation,
        isLoading: false 
      }));
      return cachedLocation;
    }

    // Check permission
    const permissionStatus = await checkPermission();
    setState(prev => ({ ...prev, permissionStatus }));

    if (permissionStatus === 'denied') {
      const error = 'Location permission denied. Please enable location access in your browser settings.';
      setState(prev => ({ ...prev, error, isLoading: false }));
      toast.error(error);
      return null;
    }

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        const error = 'Geolocation is not supported by this browser.';
        setState(prev => ({ ...prev, error, isLoading: false }));
        toast.error(error);
        resolve(null);
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };

          setCachedLocation(coordinates);
          setState(prev => ({ 
            ...prev, 
            currentLocation: coordinates,
            isLoading: false,
            permissionStatus: 'granted'
          }));
          
          resolve(coordinates);
        },
        (error: GeolocationError) => {
          let errorMessage = 'Failed to get your location.';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              setState(prev => ({ ...prev, permissionStatus: 'denied' }));
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please try again.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timeout. Please try again.';
              break;
          }
          
          setState(prev => ({ 
            ...prev, 
            error: errorMessage, 
            isLoading: false 
          }));
          toast.error(errorMessage);
          resolve(null);
        },
        options
      );
    });
  }, [getCachedLocation, setCachedLocation, checkPermission]);

  // Reverse geocode coordinates to address
  const getCurrentAddress = useCallback(async (coords?: Coordinates): Promise<Address | null> => {
    const targetCoords = coords || state.currentLocation;
    if (!targetCoords) return null;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Using a mock geocoding service - replace with actual service
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${targetCoords.latitude}+${targetCoords.longitude}&key=YOUR_API_KEY`
      );
      
      if (!response.ok) {
        throw new Error('Failed to geocode location');
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const components = result.components;
        
        const address: Address = {
          street: `${components.house_number || ''} ${components.road || ''}`.trim(),
          city: components.city || components.town || components.village || '',
          state: components.state || '',
          zipCode: components.postcode || '',
          country: components.country || '',
          coordinates: targetCoords,
          formatted: result.formatted
        };

        setState(prev => ({ 
          ...prev, 
          currentAddress: address,
          isLoading: false 
        }));
        
        return address;
      }
      
      throw new Error('No address found for this location');
    } catch (error) {
      // Fallback to a mock address for demo purposes
      const mockAddress: Address = {
        street: '123 Main Street',
        city: 'Sample City',
        state: 'Sample State',
        zipCode: '12345',
        country: 'Sample Country',
        coordinates: targetCoords,
        formatted: '123 Main Street, Sample City, Sample State 12345, Sample Country'
      };

      setState(prev => ({ 
        ...prev, 
        currentAddress: mockAddress,
        isLoading: false 
      }));
      
      return mockAddress;
    }
  }, [state.currentLocation]);

  // Validate if coordinates are in delivery area
  const validateDeliveryArea = useCallback(async (coords: Coordinates): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Check against all delivery areas
      const isInArea = DEFAULT_DELIVERY_AREAS.some(area => {
        const distance = calculateDistance(coords, area.coordinates);
        return distance <= area.radius;
      });

      setState(prev => ({ 
        ...prev, 
        isInDeliveryArea: isInArea,
        isLoading: false 
      }));

      if (!isInArea) {
        toast.error('Sorry, we don\'t deliver to this location yet.');
      }

      return isInArea;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to validate delivery area',
        isLoading: false 
      }));
      return false;
    }
  }, [calculateDistance]);

  // Save address to user profile
  const saveAddress = useCallback(async (address: Address): Promise<boolean> => {
    if (!session?.user) {
      toast.error('Please login to save addresses');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(address)
      });

      if (!response.ok) {
        throw new Error('Failed to save address');
      }

      const savedAddress = await response.json();
      
      setState(prev => {
        const updatedAddresses = [...prev.savedAddresses, savedAddress];
        setCachedAddresses(updatedAddresses);
        return {
          ...prev,
          savedAddresses: updatedAddresses,
          isLoading: false
        };
      });

      toast.success('Address saved successfully');
      return true;
    } catch (error) {
      // Fallback to local storage for demo
      const addressWithId = { ...address, id: Date.now().toString() };
      setState(prev => {
        const updatedAddresses = [...prev.savedAddresses, addressWithId];
        setCachedAddresses(updatedAddresses);
        return {
          ...prev,
          savedAddresses: updatedAddresses,
          isLoading: false
        };
      });

      toast.success('Address saved locally');
      return true;
    }
  }, [session, setCachedAddresses]);

  // Get user's saved addresses
  const getAddresses = useCallback(async (): Promise<Address[]> => {
    if (!session?.user) return [];

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/addresses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }

      const addresses = await response.json();
      
      setState(prev => ({ 
        ...prev, 
        savedAddresses: addresses,
        isLoading: false 
      }));
      
      setCachedAddresses(addresses);
      return addresses;
    } catch (error) {
      // Fallback to cached addresses
      const cachedAddresses = getCachedAddresses();
      
      setState(prev => ({ 
        ...prev, 
        savedAddresses: cachedAddresses,
        isLoading: false 
      }));
      
      return cachedAddresses;
    }
  }, [session, getCachedAddresses, setCachedAddresses]);

  // Set selected address
  const setSelectedAddress = useCallback((address: Address) => {
    setState(prev => ({ ...prev, selectedAddress: address }));
    
    try {
      localStorage.setItem(SELECTED_ADDRESS_KEY, JSON.stringify(address));
    } catch (error) {
      console.warn('Failed to cache selected address:', error);
    }
  }, []);

  // Search addresses (mock implementation)
  const searchAddresses = useCallback(async (query: string): Promise<Address[]> => {
    if (!query.trim()) return [];

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Mock search results for demo
      const mockResults: Address[] = [
        {
          id: '1',
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          coordinates: { latitude: 40.7128, longitude: -74.0060 },
          formatted: '123 Main Street, New York, NY 10001, USA'
        },
        {
          id: '2',
          street: '456 Broadway',
          city: 'New York',
          state: 'NY',
          zipCode: '10013',
          country: 'USA',
          coordinates: { latitude: 40.7205, longitude: -74.0080 },
          formatted: '456 Broadway, New York, NY 10013, USA'
        }
      ].filter(addr => 
        addr.formatted.toLowerCase().includes(query.toLowerCase())
      );

      setState(prev => ({ ...prev, isLoading: false }));
      return mockResults;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to search addresses',
        isLoading: false 
      }));
      return [];
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load cached data on mount
  useEffect(() => {
    const cachedLocation = getCachedLocation();
    const cachedAddresses = getCachedAddresses();
    
    let selectedAddress = null;
    try {
      const cached = localStorage.getItem(SELECTED_ADDRESS_KEY);
      if (cached) {
        selectedAddress = JSON.parse(cached);
      }
    } catch {
      // Ignore parsing errors
    }

    setState(prev => ({
      ...prev,
      currentLocation: cachedLocation,
      savedAddresses: cachedAddresses,
      selectedAddress
    }));
  }, [getCachedLocation, getCachedAddresses]);

  // Load addresses when user logs in
  useEffect(() => {
    if (session?.user) {
      getAddresses();
    }
  }, [session, getAddresses]);

  // Validate delivery area when location changes
  useEffect(() => {
    if (state.currentLocation) {
      validateDeliveryArea(state.currentLocation);
    }
  }, [state.currentLocation, validateDeliveryArea]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (cacheTimeoutRef.current) {
        clearTimeout(cacheTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    currentLocation: state.currentLocation,
    currentAddress: state.currentAddress,
    selectedAddress: state.selectedAddress,
    savedAddresses: state.savedAddresses,
    isLoading: state.isLoading,
    error: state.error,
    permissionStatus: state.permissionStatus,
    isInDeliveryArea: state.isInDeliveryArea,
    
    // Methods
    requestLocation,
    getCurrentAddress,
    validateDeliveryArea,
    saveAddress,
    getAddresses,
    setSelectedAddress,
    searchAddresses,
    calculateDistance,
    formatAddress,
    clearError
  };
};