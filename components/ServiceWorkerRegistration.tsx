'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' && 
      'serviceWorker' in navigator && 
      process.env.NODE_ENV === 'production'
    ) {
      // ✅ OPTIMIZED: Register service worker on page load
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });

          console.log('✅ Service Worker registered successfully:', registration.scope);

          // ✅ OPTIMIZED: Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, notify user
                  console.log('🔄 New content available! Please refresh.');
                  
                  // Optional: Show update notification
                  if (window.confirm('New version available! Refresh to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });

          // ✅ OPTIMIZED: Handle service worker messages
          navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('📨 Message from service worker:', event.data);
          });

        } catch (error) {
          console.error('❌ Service Worker registration failed:', error);
        }
      });

      // ✅ OPTIMIZED: Handle service worker controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service Worker controller changed');
        window.location.reload();
      });
    }
  }, []);

  return null; // This component doesn't render anything
}
