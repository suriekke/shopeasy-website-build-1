import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ShopEasy - Fresh Groceries in 8 Minutes',
  description: 'Get fresh groceries delivered to your doorstep in just 8 minutes. Order dairy, fruits, vegetables, snacks and more.',
  keywords: 'grocery delivery, online grocery, food delivery, fresh vegetables, dairy products, 8 minute delivery',
  authors: [{ name: 'ShopEasy' }],
  creator: 'ShopEasy',
  publisher: 'ShopEasy',
  applicationName: 'ShopEasy',
  generator: 'Next.js',
  metadataBase: new URL('https://shopeasy.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ShopEasy - Fresh Groceries in 8 Minutes',
    description: 'Get fresh groceries delivered to your doorstep in just 8 minutes.',
    url: 'https://shopeasy.app',
    siteName: 'ShopEasy',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ShopEasy - Fresh Groceries Delivered Fast',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopEasy - Fresh Groceries in 8 Minutes',
    description: 'Get fresh groceries delivered to your doorstep in just 8 minutes.',
    images: ['/og-image.png'],
    creator: '@shopeasy',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ShopEasy',
    startupImage: [
      {
        url: '/splash/apple-splash-2048-2732.png',
        media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: '/splash/apple-splash-1668-2388.png',
        media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: '/splash/apple-splash-1536-2048.png',
        media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: '/splash/apple-splash-1125-2436.png',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      {
        url: '/splash/apple-splash-1242-2688.png',
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      {
        url: '/splash/apple-splash-828-1792.png',
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: '/splash/apple-splash-1170-2532.png',
        media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icons/safari-pinned-tab.svg',
        color: '#0C831F',
      },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0C831F' },
    { media: '(prefers-color-scheme: dark)', color: '#0C831F' },
  ],
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ShopEasy" />
        <meta name="msapplication-TileColor" content="#0C831F" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch for performance */}
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//slelguoygbfzlpylpxfs.supabase.co" />
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', async () => {
                  try {
                    const registration = await navigator.serviceWorker.register('/sw.js', {
                      scope: '/'
                    });
                    
                    console.log('SW registered: ', registration);
                    
                    // Listen for updates
                    registration.addEventListener('updatefound', () => {
                      const newWorker = registration.installing;
                      if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New content available
                            if (confirm('New version available! Reload to update?')) {
                              newWorker.postMessage({ type: 'SKIP_WAITING' });
                              window.location.reload();
                            }
                          }
                        });
                      }
                    });
                    
                    // Listen for SW messages
                    navigator.serviceWorker.addEventListener('message', (event) => {
                      if (event.data.type === 'cart-synced') {
                        // Handle cart sync completion
                        console.log('Cart synced successfully');
                      }
                    });
                    
                  } catch (error) {
                    console.log('SW registration failed: ', error);
                  }
                });
              }
              
              // Install prompt handling
              let deferredPrompt;
              
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                
                // Show install button or banner
                const installBanner = document.getElementById('install-banner');
                if (installBanner) {
                  installBanner.style.display = 'block';
                }
              });
              
              // App installed
              window.addEventListener('appinstalled', () => {
                console.log('PWA was installed');
                const installBanner = document.getElementById('install-banner');
                if (installBanner) {
                  installBanner.style.display = 'none';
                }
                deferredPrompt = null;
              });
              
              // Install app function
              window.installApp = async () => {
                if (!deferredPrompt) return;
                
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log('User choice: ', outcome);
                deferredPrompt = null;
              };
              
              // Setup install banner after DOM loads
              window.addEventListener('DOMContentLoaded', () => {
                const installBtn = document.getElementById('install-btn');
                const closeBtn = document.getElementById('close-banner');
                const banner = document.getElementById('install-banner');
                
                if (installBtn) {
                  installBtn.addEventListener('click', () => {
                    window.installApp?.();
                  });
                }
                
                if (closeBtn) {
                  closeBtn.addEventListener('click', () => {
                    if (banner) banner.style.display = 'none';
                  });
                }
              });
            `,
          }}
        />
      </head>
      <body className={`${inter.className} h-full bg-gray-50 overflow-x-hidden`}>
        {/* Install App Banner */}
        <div
          id="install-banner"
          className="hidden fixed top-0 left-0 right-0 z-50 bg-green-600 text-white p-3 text-center text-sm"
        >
          <span>Install ShopEasy app for faster shopping!</span>
          <button
            id="install-btn"
            className="ml-3 bg-white text-green-600 px-3 py-1 rounded text-xs font-medium"
          >
            Install
          </button>
          <button
            id="close-banner"
            className="ml-2 text-white opacity-75 hover:opacity-100"
          >
            ×
          </button>
        </div>

        {/* Main App Container */}
        <div className="min-h-full flex flex-col">
          {children}
        </div>
        
        {/* Toaster for notifications */}
        <Toaster 
          position="top-center"
          richColors
          closeButton
          duration={4000}
        />
        
        {/* Network Status Indicator */}
        <div
          id="offline-indicator"
          className="hidden fixed bottom-20 left-4 right-4 bg-red-500 text-white p-3 rounded-lg text-center text-sm z-50"
        >
          📡 You're offline. Some features may be limited.
        </div>
        
        {/* Online/Offline Detection */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const offlineIndicator = document.getElementById('offline-indicator');
              
              function updateOnlineStatus() {
                if (navigator.onLine) {
                  if (offlineIndicator) offlineIndicator.classList.add('hidden');
                } else {
                  if (offlineIndicator) offlineIndicator.classList.remove('hidden');
                }
              }
              
              window.addEventListener('online', updateOnlineStatus);
              window.addEventListener('offline', updateOnlineStatus);
              updateOnlineStatus();
            `,
          }}
        />
      </body>
    </html>
  )
}