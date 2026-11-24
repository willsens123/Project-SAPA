import { doc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from './config';
import { OperationType, handleFirestoreError } from './authAccountService';

export type SyncStatus = 'connecting' | 'synced' | 'syncing' | 'offline' | 'error';

export interface ErpCloudDoc<T = any> {
  id: string;
  updatedAt: string;
  items: T[];
}

// In-memory debounce timers to prevent excessive write calls during rapid typing
const debounceTimers: Record<string, any> = {};

/**
 * Saves a dataset to Firestore with debouncing and localStorage caching
 */
export async function saveCollectionToCloud<T>(
  key: string,
  items: T[],
  debounceMs: number = 500
): Promise<void> {
  // Always update local cache immediately for zero-latency local operations
  try {
    localStorage.setItem(`erp_cloud_cache_${key}`, JSON.stringify(items));
  } catch (e) {
    console.warn(`Failed to write local cache for ${key}`, e);
  }

  return new Promise((resolve, reject) => {
    if (debounceTimers[key]) {
      clearTimeout(debounceTimers[key]);
    }

    debounceTimers[key] = setTimeout(async () => {
      const path = `erp_state/${key}`;
      try {
        const docRef = doc(db, 'erp_state', key);
        const payload: ErpCloudDoc<T> = {
          id: key,
          updatedAt: new Date().toISOString(),
          items: items || [],
        };

        await setDoc(docRef, payload);
        resolve();
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.WRITE, path);
        } catch (wrappedErr) {
          reject(wrappedErr);
          return;
        }
        reject(error);
      }
    }, debounceMs);
  });
}

/**
 * Subscribes to real-time updates for a dataset in Firestore.
 * Automatically seeds the cloud database if empty on initial startup.
 */
export function subscribeToCloudCollection<T>(
  key: string,
  initialFallbackItems: T[],
  onUpdate: (items: T[]) => void,
  onStatusChange?: (status: SyncStatus) => void
): Unsubscribe {
  const path = `erp_state/${key}`;
  const docRef = doc(db, 'erp_state', key);
  let hasReceivedSnapshot = false;

  onStatusChange?.('connecting');

  const unsubscribe = onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as ErpCloudDoc<T>;
        if (Array.isArray(data?.items)) {
          hasReceivedSnapshot = true;
          onStatusChange?.('synced');
          onUpdate(data.items);
          try {
            localStorage.setItem(`erp_cloud_cache_${key}`, JSON.stringify(data.items));
          } catch {}
          return;
        }
      }

      // If document does not exist yet on cloud, seed it with the initial/current data
      if (!hasReceivedSnapshot) {
        hasReceivedSnapshot = true;
        try {
          let itemsToSeed = initialFallbackItems;
          const cached = localStorage.getItem(`erp_cloud_cache_${key}`);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) {
                itemsToSeed = parsed;
              }
            } catch {}
          }

          if (itemsToSeed && itemsToSeed.length > 0) {
            onStatusChange?.('syncing');
            await setDoc(docRef, {
              id: key,
              updatedAt: new Date().toISOString(),
              items: itemsToSeed,
            });
            onUpdate(itemsToSeed);
          }
          onStatusChange?.('synced');
        } catch (seedErr) {
          try {
            handleFirestoreError(seedErr, OperationType.WRITE, path);
          } catch {
            // Structured error logged; keep local state operational
          }
          onStatusChange?.('error');
        }
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch {
        // Structured FirestoreErrorInfo logged for diagnostics
      }
      onStatusChange?.('offline');
      const cached = localStorage.getItem(`erp_cloud_cache_${key}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            onUpdate(parsed);
          }
        } catch {}
      }
    }
  );

  return unsubscribe;
}
