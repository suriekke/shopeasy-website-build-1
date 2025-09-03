// Service Worker for ShopEasy Grocery Delivery App
// Version: v1
// Cache-first for static assets, network-first for dynamic content

const CACHE_NAME = 'shopeasy-v1.0.0';
const OFFLINE_URL = '/offline';

// Core app shell files that should always be cached
const APP_SHELL = [
  '/',
  '/offline',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// API endpoints to cache for offline access
const API_CACHE_PATTERNS = [
  '/api/products',
  '/api/categories',
  '/api/cart',
  '/api/users'
];

// Network-first strategy for dynamic content
const NETWORK_FIRST = [
  '/api/orders',
  '/api/reviews',
  '/api/auth'
];

// Cache management
const MAX_CACHE_SIZE = 50;
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours

// Install event - cache core resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell...');
        return cache.addAll(APP_SHELL);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache app shell:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - handle requests with different strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return offline page for navigation failures
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    // Network-first strategy for critical APIs
    if (NETWORK_FIRST.some(pattern => url.pathname.startsWith(pattern))) {
      event.respondWith(networkFirst(request));
      return;
    }
    
    // Cache-first strategy for cacheable APIs
    if (API_CACHE_PATTERNS.some(pattern => url.pathname.startsWith(pattern))) {
      event.respondWith(cacheFirst(request));
      return;
    }
    
    // Default to network-only for other APIs
    event.respondWith(fetch(request));
    return;
  }

  // Handle static assets
  if (request.destination === 'image' || 
      request.destination === 'style' || 
      request.destination === 'script') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default strategy
  event.respondWith(
    caches.match(request)
      .then((response) => response || fetch(request))
  );
});

// Network-first strategy with fallback to cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    if (response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      // Cache successful responses
      cache.put(request, response.clone());
      
      // Limit cache size
      await limitCacheSize(cache, MAX_CACHE_SIZE);
    }
    
    return response;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // Add a header to indicate this is from cache
      const responseClone = cachedResponse.clone();
      return new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: {
          ...Object.fromEntries(responseClone.headers.entries()),
          'X-Served-By': 'service-worker-cache'
        }
      });
    }
    
    throw error;
  }
}

// Cache-first strategy with network fallback
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Check if cache is stale
    const cacheTime = cachedResponse.headers.get('sw-cache-time');
    if (cacheTime && Date.now() - parseInt(cacheTime) < MAX_CACHE_AGE) {
      return cachedResponse;
    }
  }
  
  try {
    const response = await fetch(request);
    
    if (response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      const responseToCache = response.clone();
      
      // Add timestamp to cached response
      const responseHeaders = new Headers(responseToCache.headers);
      responseHeaders.set('sw-cache-time', Date.now().toString());
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: responseHeaders
      });
      
      cache.put(request, cachedResponse);
      await limitCacheSize(cache, MAX_CACHE_SIZE);
    }
    
    return response;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Limit cache size to prevent storage bloat
async function limitCacheSize(cache, maxSize) {
  const keys = await cache.keys();
  if (keys.length > maxSize) {
    console.log(`Cache size (${keys.length}) exceeds limit (${maxSize}), cleaning up...`);
    // Remove oldest entries
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCart());
  } else if (event.tag === 'order-sync') {
    event.waitUntil(syncOrders());
  }
});

// Sync cart data when back online
async function syncCart() {
  try {
    const pendingRequests = await getStoredRequests('cart');
    
    for (const request of pendingRequests) {
      try {
        await fetch(request.url, request.options);
        console.log('Cart sync successful');
      } catch (error) {
        console.error('Cart sync failed:', error);
      }
    }
    
    await clearStoredRequests('cart');
  } catch (error) {
    console.error('Cart sync error:', error);
  }
}

// Sync orders when back online
async function syncOrders() {
  try {
    const pendingRequests = await getStoredRequests('orders');
    
    for (const request of pendingRequests) {
      try {
        await fetch(request.url, request.options);
        console.log('Order sync successful');
      } catch (error) {
        console.error('Order sync failed:', error);
      }
    }
    
    await clearStoredRequests('orders');
  } catch (error) {
    console.error('Order sync error:', error);
  }
}

// Store failed requests for retry
async function storeFailedRequest(type, url, options) {
  const db = await openDB();
  const transaction = db.transaction(['requests'], 'readwrite');
  const store = transaction.objectStore('requests');
  
  await store.add({
    type,
    url,
    options,
    timestamp: Date.now()
  });
}

// Get stored requests by type
async function getStoredRequests(type) {
  const db = await openDB();
  const transaction = db.transaction(['requests'], 'readonly');
  const store = transaction.objectStore('requests');
  const requests = await store.getAll();
  
  return requests.filter(req => req.type === type);
}

// Clear stored requests by type
async function clearStoredRequests(type) {
  const db = await openDB();
  const transaction = db.transaction(['requests'], 'readwrite');
  const store = transaction.objectStore('requests');
  const requests = await store.getAll();
  
  for (const request of requests) {
    if (request.type === type) {
      await store.delete(request.id);
    }
  }
}

// Open IndexedDB for offline storage
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ShopEasyDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create requests store for background sync
      if (!db.objectStoreNames.contains('requests')) {
        const store = db.createObjectStore('requests', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    badge: '/icon-192x192.png',
    icon: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'view',
        title: 'View Order',
        icon: '/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/action-dismiss.png'
      }
    ],
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  let title = 'ShopEasy';
  let body = 'You have a new notification';

  if (event.data) {
    try {
      const data = event.data.json();
      title = data.title || title;
      body = data.body || body;
      options.data = { ...options.data, ...data };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      ...options
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  if (action === 'dismiss') {
    return;
  }
  
  let url = data?.url || '/';
  
  if (action === 'view' && data?.orderId) {
    url = `/orders/${data.orderId}`;
  } else if (action === 'view' && data?.productId) {
    url = `/products/${data.productId}`;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if app not open
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync for data freshness
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic sync triggered:', event.tag);
  
  if (event.tag === 'refresh-products') {
    event.waitUntil(refreshProducts());
  } else if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart());
  }
});

// Refresh products data in background
async function refreshProducts() {
  try {
    const cache = await caches.open(CACHE_NAME);
    
    // Refresh categories
    const categoriesResponse = await fetch('/api/categories');
    if (categoriesResponse.ok) {
      await cache.put('/api/categories', categoriesResponse);
    }
    
    // Refresh featured products
    const productsResponse = await fetch('/api/products?featured=true');
    if (productsResponse.ok) {
      await cache.put('/api/products?featured=true', productsResponse);
    }
    
    console.log('Products data refreshed in background');
  } catch (error) {
    console.error('Background refresh failed:', error);
  }
}

console.log('ShopEasy Service Worker loaded successfully');