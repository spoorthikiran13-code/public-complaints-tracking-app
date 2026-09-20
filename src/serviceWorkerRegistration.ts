// Service Worker Registration for PWA & Offline Support

export function registerServiceWorker(onSyncTriggered?: () => void) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Register periodic or background sync if supported
        if ('sync' in registration) {
          (registration as any).sync.register('sync-offline-complaints').catch(() => {
            // Background sync not allowed or rejected, fallback to online event listener
          });
        }
      })
      .catch((error) => {
        console.warn('[PWA] Service Worker registration failed:', error);
      });

    // Listen for messages from the service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SERVICE_WORKER_TRIGGER_SYNC') {
        if (onSyncTriggered) {
          onSyncTriggered();
        }
      }
    });
  });
}
