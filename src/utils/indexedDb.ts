const DB_NAME = "ColumnaPublicaGalleryDB";
const STORE_NAME = "localGallery";
const DB_VERSION = 1;

export interface GalleryItem {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
  type: string;
  timestamp: number;
}

export function initGalleryDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB no está soportado en este entorno."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Error al abrir IndexedDB"));
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

export async function addImageToGallery(name: string, file: File): Promise<GalleryItem> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const db = await initGalleryDb();
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);

        const item: GalleryItem = {
          id: "img-" + Math.random().toString(36).substring(2, 11) + "-" + Date.now(),
          name: name || file.name,
          dataUrl: reader.result as string,
          size: file.size,
          type: file.type,
          timestamp: Date.now()
        };

        const request = store.add(item);

        request.onsuccess = () => {
          resolve(item);
        };

        request.onerror = () => {
          reject(new Error("No se pudo guardar la imagen en IndexedDB"));
        };
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error("Error leyendo el archivo con FileReader"));
    };

    reader.readAsDataURL(file);
  });
}

export async function getGalleryImages(): Promise<GalleryItem[]> {
  const db = await initGalleryDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      // Return sorted by newer timestamp first
      const items = (request.result as GalleryItem[]) || [];
      resolve(items.sort((a, b) => b.timestamp - a.timestamp));
    };

    request.onerror = () => {
      reject(new Error("Error obteniendo imágenes de la galería local"));
    };
  });
}

export async function deleteGalleryImage(id: string): Promise<void> {
  const db = await initGalleryDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error("Error eliminando imagen de la galería local"));
    };
  });
}
