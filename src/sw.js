import { precacheAndRoute } from 'workbox-precaching';
import { openDB } from 'idb';

if (self.__WB_MANIFEST && Array.isArray(self.__WB_MANIFEST)) {
  precacheAndRoute(self.__WB_MANIFEST);
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-new-items') {
    event.waitUntil(syncItems());
  }
});

async function syncItems() {
  try {
    const db = await openDB('fridge-db', 1);
    const tx = db.transaction('products', 'readwrite');
    const store = tx.objectStore('products');
    const allItems = await store.getAll();
    
    const unsyncedItems = allItems.filter(item => !item.synced);

    if (unsyncedItems.length > 0) {
      for (const item of unsyncedItems) {
        item.synced = true;
        await store.put(item);
      }
      await tx.done;

      self.registration.showNotification('Fridge Cloud Sync', {
        body: `Uspješno sinkronizirano namirnica: ${unsyncedItems.length}`,
        icon: '/pwa-192x192.png', 
        badge: '/pwa-192x192.png', 
        vibrate: [200, 100, 200]   
      });
    }
  } catch (err) {
    console.error('Sinkronizacija nije uspjela:', err);
  }
}