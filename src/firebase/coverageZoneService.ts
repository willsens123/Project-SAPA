import { doc, onSnapshot, setDoc, Unsubscribe } from 'firebase/firestore';
import { db } from './config';
import { OperationType, handleFirestoreError } from './authAccountService';
import {
  SapaCoverageZoneId,
  SapaCoverageZoneOverride,
  computeZoneBoundsAndCenter,
  readCoverageZoneOverrides,
  sanitizePolygonPaths,
  writeCoverageZoneOverrides,
} from '../utils/gmpGeocodeCache';

const COLLECTION = 'erp_state';
const DOC_ID = 'sapa_coverage_zones';

interface CoverageZonesCloudDoc {
  id: string;
  updatedAt: string;
  items: SapaCoverageZoneOverride[];
}

function normalizeOverridesArray(
  items: unknown
): Partial<Record<SapaCoverageZoneId, SapaCoverageZoneOverride>> {
  const result: Partial<Record<SapaCoverageZoneId, SapaCoverageZoneOverride>> = {};
  if (!Array.isArray(items)) return result;

  items.forEach((entry) => {
    if (!entry || typeof entry !== 'object') return;
    const raw = entry as Partial<SapaCoverageZoneOverride>;
    if (!raw.id) return;
    const cleanPaths = sanitizePolygonPaths(raw.polygonPaths);
    if (cleanPaths.length < 3) return;
    const { bounds, center } = computeZoneBoundsAndCenter(cleanPaths);
    result[raw.id] = {
      id: raw.id,
      polygonPaths: cleanPaths,
      bounds,
      center,
      updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
      ...(typeof raw.updatedBy === 'string' && raw.updatedBy.trim()
        ? { updatedBy: raw.updatedBy.trim() }
        : {}),
    };
  });

  return result;
}

/**
 * Subscribe to real-time coverage zone geometry overrides in Firestore (`/erp_state/sapa_coverage_zones`).
 * Syncs seamlessly with localStorage cache so validation across modals and dashboard remains instant.
 */
export function subscribeToCoverageZoneOverrides(
  onUpdate: (overrides: Partial<Record<SapaCoverageZoneId, SapaCoverageZoneOverride>>) => void,
  onError?: (message: string) => void
): Unsubscribe {
  const path = `${COLLECTION}/${DOC_ID}`;
  const docRef = doc(db, COLLECTION, DOC_ID);

  // Immediately hydrate from local cache first for zero-latency initial paint
  const cached = readCoverageZoneOverrides();
  if (Object.keys(cached).length > 0) {
    onUpdate(cached);
  }

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<CoverageZonesCloudDoc>;
        if (Array.isArray(data?.items)) {
          const normalized = normalizeOverridesArray(data.items);
          writeCoverageZoneOverrides(normalized);
          onUpdate(normalized);
        }
      }
    },
    (error) => {
      onError?.(
        error instanceof Error
          ? error.message
          : 'Gagal menyinkronkan geometri area operasional dari Firestore.'
      );
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch {
        // Logged structured FirestoreErrorInfo; fallback to cached/default zones stays active
      }
    }
  );
}

/**
 * Save modified operational polygon geometry overrides to Firestore (`/erp_state/sapa_coverage_zones`)
 * and local cache simultaneously.
 */
export async function saveCoverageZoneOverridesToFirestore(
  overrides: Partial<Record<SapaCoverageZoneId, SapaCoverageZoneOverride>>
): Promise<{ cloudSaved: boolean }> {
  const sanitizedMap: Partial<Record<SapaCoverageZoneId, SapaCoverageZoneOverride>> = {};
  (Object.keys(overrides) as SapaCoverageZoneId[]).forEach((zoneId) => {
    const entry = overrides[zoneId];
    if (!entry) return;
    const cleanPaths = sanitizePolygonPaths(entry.polygonPaths);
    if (cleanPaths.length < 3) return;
    const { bounds, center } = computeZoneBoundsAndCenter(cleanPaths);
    sanitizedMap[zoneId] = {
      id: zoneId,
      polygonPaths: cleanPaths,
      bounds,
      center,
      updatedAt: entry.updatedAt || new Date().toISOString(),
      ...(entry.updatedBy ? { updatedBy: entry.updatedBy } : {}),
    };
  });

  // Always update local cache immediately for instant reactivity across pickers/validators
  writeCoverageZoneOverrides(sanitizedMap);

  const path = `${COLLECTION}/${DOC_ID}`;
  const docRef = doc(db, COLLECTION, DOC_ID);
  const payload: CoverageZonesCloudDoc = {
    id: DOC_ID,
    updatedAt: new Date().toISOString(),
    items: Object.values(sanitizedMap).filter((v): v is SapaCoverageZoneOverride => Boolean(v)),
  };

  try {
    await setDoc(docRef, payload);
    return { cloudSaved: true };
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      // Structured FirestoreErrorInfo logged; surface non-fatal fallback status
    }
    return { cloudSaved: false };
  }
}
