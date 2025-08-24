// IndexedDB utility for storing generated images in the gallery

const DB_NAME = "DreamHouseDB";
const DB_VERSION = 1;
const STORE_NAME = "gallery";
const MAX_GALLERY_ITEMS = 6;

export interface GalleryItem {
  id: string;
  url: string;
  houseTheme: string;
  vibe: string;
  pose: string;
  createdAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
}

export async function saveToGallery(item: Omit<GalleryItem, "id" | "createdAt">): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const galleryItem: GalleryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.add(galleryItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Clean up old items if we exceed the limit
    await cleanupOldItems();
    
    db.close();
  } catch (error) {
    console.error("Failed to save to gallery:", error);
    throw error;
  }
}

export async function loadGallery(): Promise<GalleryItem[]> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("createdAt");

    const items = await new Promise<GalleryItem[]>((resolve, reject) => {
      const request = index.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });

    db.close();
    
    // Sort by creation time (newest first) and limit to MAX_GALLERY_ITEMS
    return items
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, MAX_GALLERY_ITEMS);
  } catch (error) {
    console.error("Failed to load gallery:", error);
    return [];
  }
}

async function cleanupOldItems(): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("createdAt");

    const items = await new Promise<GalleryItem[]>((resolve, reject) => {
      const request = index.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });

    // Sort by creation time (oldest first) and delete excess items
    const sortedItems = items.sort((a, b) => a.createdAt - b.createdAt);
    const itemsToDelete = sortedItems.slice(0, Math.max(0, sortedItems.length - MAX_GALLERY_ITEMS));

    for (const item of itemsToDelete) {
      await new Promise<void>((resolve, reject) => {
        const deleteRequest = store.delete(item.id);
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      });
    }

    db.close();
  } catch (error) {
    console.error("Failed to cleanup old items:", error);
  }
}

export async function clearGallery(): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
  } catch (error) {
    console.error("Failed to clear gallery:", error);
    throw error;
  }
}