import { precacheAndRoute } from 'workbox-precaching';
import { openDB } from 'idb';

precacheAndRoute(self.__WB_MANIFEST || []);

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

    if (unsyncedItems.length === 0) return;

    for (const item of unsyncedItems) {
      item.synced = true;
      await store.put(item);
    }
    await tx.done;

    self.registration.showNotification('Fridge Cloud Sync', {
      body: `Successfully synced ${unsyncedItems.length} items!`,
      icon: '/pwa-192x192.png'
    });
  } catch (err) {
    console.error('Sync failed:', err);
  }
}