import {
  INDONESIA_KOTA_KABUPATEN_LIST,
  INDONESIA_PROVINSI_LIST,
  getProvinsiByKota,
} from '../indonesiaRegionData';

export interface CachedGeocodeEntry {
  lat: number;
  lng: number;
  formattedAddress: string;
  displayName?: string;
  placeId?: string;
  cachedAt: number;
}

export const GMP_GEOCODE_CACHE_STORAGE_KEY = 'sapa_gmp_project_geocode_cache_v1';
export const GMP_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h TTL (under 30-day GMP ToS limit)
export const GMP_ATTRIBUTION_IDS = ['gmp_mcp_codeassist_v1_aistudio'];
export const DEFAULT_INDONESIA_CENTER = { lat: -6.9175, lng: 107.6191 };

export function normalizeLocationKey(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function isQuotaError(err: unknown): boolean {
  const msg = String(
    err instanceof Error ? `${err.name} ${err.message}` : err ?? ''
  ).toUpperCase();
  return (
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('OVER_QUERY_LIMIT') ||
    msg.includes('OVERQUOTAMAPERROR') ||
    msg.includes('QUOTAEXCEEDEDERROR') ||
    msg.includes('QUOTA')
  );
}

export function readGeocodeCache(): Record<string, CachedGeocodeEntry> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(GMP_GEOCODE_CACHE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, CachedGeocodeEntry>;
    const now = Date.now();
    const valid: Record<string, CachedGeocodeEntry> = {};
    Object.entries(parsed).forEach(([k, v]) => {
      if (
        v &&
        typeof v.lat === 'number' &&
        typeof v.lng === 'number' &&
        Number.isFinite(v.lat) &&
        Number.isFinite(v.lng) &&
        typeof v.cachedAt === 'number' &&
        now - v.cachedAt <= GMP_CACHE_TTL_MS
      ) {
        valid[k] = v;
      }
    });
    return valid;
  } catch {
    return {};
  }
}

export function writeGeocodeCache(cache: Record<string, CachedGeocodeEntry>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GMP_GEOCODE_CACHE_STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage quota errors
  }
}

export function upsertGeocodeCacheEntries(
  keys: string[],
  entry: Omit<CachedGeocodeEntry, 'cachedAt'>
): void {
  const cleanKeys = keys.map(normalizeLocationKey).filter(Boolean);
  if (cleanKeys.length === 0) return;

  const current = readGeocodeCache();
  const timestamped: CachedGeocodeEntry = {
    ...entry,
    cachedAt: Date.now(),
  };
  cleanKeys.forEach((k) => {
    current[k] = timestamped;
  });
  writeGeocodeCache(current);
}

export interface NormalizedAddressComponent {
  longText: string;
  shortText: string;
  types: string[];
}

export function fromGeocoderComponents(
  components?: google.maps.GeocoderAddressComponent[] | null
): NormalizedAddressComponent[] {
  if (!components || components.length === 0) return [];
  return components.map((c) => ({
    longText: c.long_name || '',
    shortText: c.short_name || '',
    types: c.types || [],
  }));
}

export function fromPlaceComponents(
  components?: google.maps.places.AddressComponent[] | null
): NormalizedAddressComponent[] {
  if (!components || components.length === 0) return [];
  return components.map((c) => ({
    longText: c.longText || '',
    shortText: c.shortText || '',
    types: c.types || [],
  }));
}

const PROVINCE_ALIASES: Record<string, string> = {
  'daerah khusus ibukota jakarta': 'DKI Jakarta',
  'jakarta': 'DKI Jakarta',
  'special capital region of jakarta': 'DKI Jakarta',
  'daerah istimewa yogyakarta': 'DI Yogyakarta',
  'special region of yogyakarta': 'DI Yogyakarta',
  'yogyakarta': 'DI Yogyakarta',
  'west java': 'Jawa Barat',
  'central java': 'Jawa Tengah',
  'east java': 'Jawa Timur',
  'north sumatra': 'Sumatera Utara',
  'west sumatra': 'Sumatera Barat',
  'south sumatra': 'Sumatera Selatan',
  'riau islands': 'Kepulauan Riau',
  'bangka belitung islands': 'Kepulauan Bangka Belitung',
  'west kalimantan': 'Kalimantan Barat',
  'central kalimantan': 'Kalimantan Tengah',
  'south kalimantan': 'Kalimantan Selatan',
  'east kalimantan': 'Kalimantan Timur',
  'north kalimantan': 'Kalimantan Utara',
  'north sulawesi': 'Sulawesi Utara',
  'central sulawesi': 'Sulawesi Tengah',
  'west sulawesi': 'Sulawesi Barat',
  'south sulawesi': 'Sulawesi Selatan',
  'southeast sulawesi': 'Sulawesi Tenggara',
  'west nusa tenggara': 'Nusa Tenggara Barat',
  'east nusa tenggara': 'Nusa Tenggara Timur',
  'north maluku': 'Maluku Utara',
  'west papua': 'Papua Barat',
  'south papua': 'Papua Selatan',
  'central papua': 'Papua Tengah',
  'highland papua': 'Papua Pegunungan',
  'southwest papua': 'Papua Barat Daya',
  'nanggroe aceh darussalam': 'Aceh',
};

function matchProvinceName(raw: string): string {
  const cleaned = raw.trim();
  if (!cleaned) return '';
  const lower = cleaned.toLowerCase();

  if (PROVINCE_ALIASES[lower]) {
    return PROVINCE_ALIASES[lower];
  }

  const exact = INDONESIA_PROVINSI_LIST.find((p) => p.toLowerCase() === lower);
  if (exact) return exact;

  const partial = INDONESIA_PROVINSI_LIST.find(
    (p) => lower.includes(p.toLowerCase()) || p.toLowerCase().includes(lower)
  );
  return partial || cleaned;
}

function matchKotaKabupatenName(rawCandidates: string[]): string {
  for (const raw of rawCandidates) {
    const cleaned = raw.trim();
    if (!cleaned) continue;

    // Normalize common English/Indonesian prefixes/suffixes from Google Maps
    const normalized = cleaned
      .replace(/\bKabupaten\b/gi, 'Kab.')
      .replace(/\bRegency\b/gi, '')
      .replace(/\bCity\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    const lowerClean = cleaned.toLowerCase();
    const lowerNorm = normalized.toLowerCase();

    // Handle Jakarta Barat/Selatan/etc. when Google omits "Kota"
    const exactMatch = INDONESIA_KOTA_KABUPATEN_LIST.find(
      (k) => k.toLowerCase() === lowerNorm || k.toLowerCase() === lowerClean
    );
    if (exactMatch) return exactMatch;

    // Handle "Bandung Regency" -> "Kab. Bandung" vs "Kota Bandung"
    const isRegency = /kabupaten|kab\.|regency/i.test(cleaned);
    const isCity = /\bkota\b|\bcity\b/i.test(cleaned);
    const bareName = lowerNorm
      .replace(/^(kota|kab\.?)\s+/i, '')
      .replace(/\s+(city|regency)$/i, '')
      .trim();

    if (bareName) {
      if (isRegency) {
        const kabMatch = INDONESIA_KOTA_KABUPATEN_LIST.find(
          (k) => k.toLowerCase() === `kab. ${bareName}`
        );
        if (kabMatch) return kabMatch;
      }
      if (isCity) {
        const kotaMatch = INDONESIA_KOTA_KABUPATEN_LIST.find(
          (k) => k.toLowerCase() === `kota ${bareName}`
        );
        if (kotaMatch) return kotaMatch;
      }
      // Fallback: match either "Kota <bareName>" or "Kab. <bareName>"
      const anyMatch = INDONESIA_KOTA_KABUPATEN_LIST.find((k) => {
        const kBare = k.toLowerCase().replace(/^(kota|kab\.?)\s+/i, '').trim();
        return kBare === bareName;
      });
      if (anyMatch) return anyMatch;
    }
  }

  return rawCandidates.find((r) => r.trim().length > 0)?.trim() || '';
}

export interface ExtractedIndonesianRegion {
  kotaKabupaten: string;
  provinsi: string;
  countryCode: string;
  countryName: string;
  hasLandAddressComponents: boolean;
  suggestedLocationName: string;
}

/**
 * Extracts Kota/Kabupaten, Provinsi, Country, and a concise human-readable location label
 * directly from structured `address_components` (never parsing `formatted_address` strings).
 */
export function extractRegionFromAddressComponents(
  components: NormalizedAddressComponent[],
  preferredPlaceName?: string
): ExtractedIndonesianRegion {
  const findByType = (type: string): string => {
    const match = components.find((c) => c.types.includes(type));
    return match?.longText || match?.shortText || '';
  };

  const countryComp = components.find((c) => c.types.includes('country'));
  const countryCode = (countryComp?.shortText || '').trim().toUpperCase();
  const countryName = (countryComp?.longText || '').trim();

  const level1 = findByType('administrative_area_level_1');
  const level2 = findByType('administrative_area_level_2');
  const locality = findByType('locality');
  const route = findByType('route');
  const premise =
    findByType('premise') || findByType('point_of_interest') || findByType('establishment');

  const hasLandAddressComponents = Boolean(
    countryCode && (level1 || level2 || locality || route || premise)
  );

  const kotaKabupaten = matchKotaKabupatenName([level2, locality]);
  let provinsi = level1 ? matchProvinceName(level1) : '';
  if (!provinsi && kotaKabupaten) {
    provinsi = getProvinsiByKota(kotaKabupaten) || '';
  }

  // Compose a concise place/venue/street label when no explicit POI displayName is provided
  let suggestedLocationName = (preferredPlaceName || '').trim();
  if (!suggestedLocationName) {
    const streetNumber = findByType('street_number');
    const sublocality1 = findByType('sublocality_level_1') || findByType('sublocality');
    const level3 = findByType('administrative_area_level_3');

    if (premise) {
      suggestedLocationName = premise;
    } else if (route) {
      suggestedLocationName = streetNumber ? `${route} No. ${streetNumber}` : route;
      if (sublocality1) {
        suggestedLocationName = `${suggestedLocationName}, ${sublocality1}`;
      }
    } else if (sublocality1 || level3) {
      suggestedLocationName = sublocality1 || level3;
    } else if (kotaKabupaten) {
      suggestedLocationName = kotaKabupaten;
    }
  }

  return {
    kotaKabupaten,
    provinsi,
    countryCode,
    countryName,
    hasLandAddressComponents,
    suggestedLocationName,
  };
}

export type SapaCoverageZoneId =
  | 'nasional'
  | 'jabodetabek_jabar'
  | 'jawa_bali'
  | 'sumatera'
  | 'kalimantan_timur_indonesia';

export interface SapaCoverageZone {
  id: SapaCoverageZoneId;
  label: string;
  shortLabel: string;
  description: string;
  bounds: google.maps.LatLngBoundsLiteral;
  polygonPaths: google.maps.LatLngLiteral[];
  center: google.maps.LatLngLiteral;
  defaultZoom: number;
  allowedProvinces: string[] | null; // null means all 38 provinces in Indonesia
}

export const SAPA_OPERATIONAL_INDONESIA_POLYGON: google.maps.LatLngLiteral[] = [
  { lat: 5.95, lng: 94.95 },
  { lat: 5.55, lng: 97.8 },
  { lat: 3.9, lng: 99.45 },
  { lat: 2.45, lng: 101.4 },
  { lat: 1.35, lng: 102.95 },
  { lat: 1.16, lng: 103.55 },
  { lat: 1.18, lng: 104.35 },
  { lat: 4.8, lng: 108.45 },
  { lat: 1.55, lng: 108.95 },
  { lat: 0.9, lng: 110.5 },
  { lat: 1.45, lng: 112.9 },
  { lat: 3.2, lng: 115.65 },
  { lat: 4.35, lng: 117.75 },
  { lat: 4.85, lng: 125.6 },
  { lat: 2.9, lng: 128.65 },
  { lat: 0.25, lng: 130.5 },
  { lat: -1.0, lng: 136.2 },
  { lat: -2.45, lng: 140.98 },
  { lat: -9.2, lng: 140.98 },
  { lat: -8.35, lng: 127.6 },
  { lat: -8.3, lng: 125.0 },
  { lat: -9.1, lng: 124.9 },
  { lat: -11.1, lng: 122.8 },
  { lat: -10.55, lng: 119.5 },
  { lat: -9.05, lng: 115.1 },
  { lat: -8.9, lng: 110.0 },
  { lat: -7.2, lng: 105.05 },
  { lat: -5.95, lng: 103.5 },
  { lat: -1.6, lng: 98.4 },
  { lat: 2.6, lng: 95.7 },
];

export const SAPA_COVERAGE_ZONES: SapaCoverageZone[] = [
  {
    id: 'nasional',
    label: 'Nasional (Seluruh Indonesia)',
    shortLabel: 'Nasional (Indonesia)',
    description: 'Mencakup seluruh 38 provinsi di wilayah daratan Republik Indonesia.',
    bounds: { south: -11.2, north: 6.2, west: 94.8, east: 141.1 },
    polygonPaths: SAPA_OPERATIONAL_INDONESIA_POLYGON,
    center: { lat: -2.5, lng: 118.0 },
    defaultZoom: 5,
    allowedProvinces: null,
  },
  {
    id: 'jabodetabek_jabar',
    label: 'Jabodetabek, Banten & Jawa Barat',
    shortLabel: 'Jabodetabek & Jabar',
    description: 'DKI Jakarta, Banten, dan Jawa Barat.',
    bounds: { south: -7.85, north: -5.85, west: 105.05, east: 108.85 },
    polygonPaths: [
      { lat: -5.85, lng: 105.05 },
      { lat: -5.85, lng: 108.55 },
      { lat: -6.85, lng: 108.85 },
      { lat: -7.85, lng: 108.55 },
      { lat: -7.65, lng: 106.25 },
      { lat: -6.95, lng: 105.1 },
    ],
    center: { lat: -6.58, lng: 106.95 },
    defaultZoom: 8,
    allowedProvinces: ['DKI Jakarta', 'Banten', 'Jawa Barat'],
  },
  {
    id: 'jawa_bali',
    label: 'Pulau Jawa & Bali',
    shortLabel: 'Jawa & Bali',
    description: 'DKI Jakarta, Banten, Jawa Barat, Jawa Tengah, DI Yogyakarta, Jawa Timur, dan Bali.',
    bounds: { south: -8.95, north: -5.7, west: 105.0, east: 115.8 },
    polygonPaths: [
      { lat: -5.7, lng: 105.05 },
      { lat: -5.7, lng: 114.6 },
      { lat: -7.9, lng: 115.8 },
      { lat: -8.95, lng: 115.2 },
      { lat: -8.9, lng: 110.0 },
      { lat: -7.25, lng: 105.05 },
    ],
    center: { lat: -7.35, lng: 110.2 },
    defaultZoom: 7,
    allowedProvinces: [
      'DKI Jakarta',
      'Banten',
      'Jawa Barat',
      'Jawa Tengah',
      'DI Yogyakarta',
      'Jawa Timur',
      'Bali',
    ],
  },
  {
    id: 'sumatera',
    label: 'Wilayah Sumatera',
    shortLabel: 'Sumatera',
    description: 'Seluruh provinsi di Pulau Sumatera, Kepulauan Riau, dan Bangka Belitung.',
    bounds: { south: -6.05, north: 6.0, west: 94.9, east: 108.5 },
    polygonPaths: [
      { lat: 5.95, lng: 94.95 },
      { lat: 5.55, lng: 97.8 },
      { lat: 3.9, lng: 99.45 },
      { lat: 2.45, lng: 101.4 },
      { lat: 1.35, lng: 102.95 },
      { lat: 1.16, lng: 103.55 },
      { lat: 1.18, lng: 104.35 },
      { lat: 4.8, lng: 108.45 },
      { lat: -3.6, lng: 108.45 },
      { lat: -6.05, lng: 105.85 },
      { lat: -5.95, lng: 103.5 },
      { lat: -1.6, lng: 98.4 },
      { lat: 2.6, lng: 95.7 },
    ],
    center: { lat: 0.2, lng: 101.4 },
    defaultZoom: 6,
    allowedProvinces: [
      'Aceh',
      'Sumatera Utara',
      'Sumatera Barat',
      'Riau',
      'Kepulauan Riau',
      'Jambi',
      'Sumatera Selatan',
      'Kepulauan Bangka Belitung',
      'Bengkulu',
      'Lampung',
    ],
  },
  {
    id: 'kalimantan_timur_indonesia',
    label: 'Kalimantan, Sulawesi & Indonesia Timur',
    shortLabel: 'Kalimantan & Ind. Timur',
    description: 'Kalimantan, Sulawesi, Nusa Tenggara, Maluku, dan Papua.',
    bounds: { south: -11.1, north: 4.85, west: 108.85, east: 141.1 },
    polygonPaths: [
      { lat: 1.55, lng: 108.85 },
      { lat: 0.9, lng: 110.5 },
      { lat: 1.45, lng: 112.9 },
      { lat: 3.2, lng: 115.65 },
      { lat: 4.35, lng: 117.75 },
      { lat: 4.85, lng: 125.6 },
      { lat: 2.9, lng: 128.65 },
      { lat: 0.25, lng: 130.5 },
      { lat: -1.0, lng: 136.2 },
      { lat: -2.45, lng: 140.98 },
      { lat: -9.2, lng: 140.98 },
      { lat: -8.35, lng: 127.6 },
      { lat: -8.3, lng: 125.0 },
      { lat: -9.1, lng: 124.9 },
      { lat: -11.1, lng: 122.8 },
      { lat: -10.55, lng: 119.5 },
      { lat: -8.9, lng: 115.8 },
      { lat: -3.9, lng: 108.85 },
    ],
    center: { lat: -2.0, lng: 123.5 },
    defaultZoom: 5,
    allowedProvinces: [
      'Kalimantan Barat',
      'Kalimantan Tengah',
      'Kalimantan Selatan',
      'Kalimantan Timur',
      'Kalimantan Utara',
      'Sulawesi Utara',
      'Gorontalo',
      'Sulawesi Tengah',
      'Sulawesi Barat',
      'Sulawesi Selatan',
      'Sulawesi Tenggara',
      'Nusa Tenggara Barat',
      'Nusa Tenggara Timur',
      'Maluku',
      'Maluku Utara',
      'Papua',
      'Papua Barat',
      'Papua Selatan',
      'Papua Tengah',
      'Papua Pegunungan',
      'Papua Barat Daya',
    ],
  },
];

export type CoordinateValidationReason =
  | 'VALID'
  | 'INVALID_COORDS'
  | 'OUTSIDE_INDONESIA'
  | 'UNADDRESSABLE_OR_WATER'
  | 'OUTSIDE_ACTIVE_ZONE';

export interface CoordinateValidationResult {
  isValid: boolean;
  reasonCode: CoordinateValidationReason;
  zone: SapaCoverageZone;
  message: string;
}

export function isLatLngWithinBounds(
  lat: number,
  lng: number,
  bounds: google.maps.LatLngBoundsLiteral
): boolean {
  return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
}

/**
 * Ray-casting point-in-polygon check for LatLngLiteral rings.
 */
export function isPointInPolygon(
  lat: number,
  lng: number,
  polygonPaths: google.maps.LatLngLiteral[]
): boolean {
  if (!polygonPaths || polygonPaths.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygonPaths.length - 1; i < polygonPaths.length; j = i++) {
    const xi = polygonPaths[i].lng;
    const yi = polygonPaths[i].lat;
    const xj = polygonPaths[j].lng;
    const yj = polygonPaths[j].lat;

    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi || 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Uses Google Maps Geometry Library (`containsLocation`) when a live Polygon instance is mounted,
 * falling back seamlessly to deterministic ray-casting on the zone's `polygonPaths`.
 */
export function checkPointInCoveragePolygon(
  lat: number,
  lng: number,
  zone: SapaCoverageZone,
  polygonInstance?: google.maps.Polygon | null,
  geometryLib?: google.maps.GeometryLibrary | null
): boolean {
  if (polygonInstance && geometryLib?.poly?.containsLocation) {
    try {
      return geometryLib.poly.containsLocation({ lat, lng }, polygonInstance);
    } catch {
      // Fallback to pure ray-casting if polygon isn't attached
    }
  }
  return isPointInPolygon(lat, lng, zone.polygonPaths);
}

export function getCoverageZoneById(zoneId: SapaCoverageZoneId): SapaCoverageZone {
  return SAPA_COVERAGE_ZONES.find((z) => z.id === zoneId) || SAPA_COVERAGE_ZONES[0];
}

export function validateSapaOperationalCoordinate(params: {
  lat: number;
  lng: number;
  zoneId: SapaCoverageZoneId;
  countryCode?: string;
  countryName?: string;
  provinsi?: string;
  hasLandAddressComponents?: boolean;
  polygonInstance?: google.maps.Polygon | null;
  geometryLib?: google.maps.GeometryLibrary | null;
}): CoordinateValidationResult {
  const {
    lat,
    lng,
    zoneId,
    countryCode,
    countryName,
    provinsi,
    hasLandAddressComponents,
    polygonInstance,
    geometryLib,
  } = params;

  const activeZone = getCoverageZoneById(zoneId);
  const nationalZone = SAPA_COVERAGE_ZONES[0];

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return {
      isValid: false,
      reasonCode: 'INVALID_COORDS',
      zone: activeZone,
      message: 'Koordinat lintang/bujur tidak valid.',
    };
  }

  const normalizedCountry = (countryCode || '').trim().toUpperCase();
  if (normalizedCountry && normalizedCountry !== 'ID') {
    const placeLabel = countryName ? `${countryName} (${normalizedCountry})` : normalizedCountry;
    return {
      isValid: false,
      reasonCode: 'OUTSIDE_INDONESIA',
      zone: activeZone,
      message: `Titik berada di luar wilayah operasional Indonesia (terdeteksi: ${placeLabel}). Pindahkan pin ke dalam wilayah Indonesia.`,
    };
  }

  if (hasLandAddressComponents === false) {
    return {
      isValid: false,
      reasonCode: 'UNADDRESSABLE_OR_WATER',
      zone: activeZone,
      message:
        'Titik yang dipilih berada di perairan atau area tanpa alamat daratan. Pilih titik daratan dalam cakupan operasional SAPA.',
    };
  }

  const insideNational = isPointInPolygon(lat, lng, nationalZone.polygonPaths);
  if (!insideNational) {
    return {
      isValid: false,
      reasonCode: 'OUTSIDE_INDONESIA',
      zone: activeZone,
      message: `Koordinat (${lat.toFixed(4)}, ${lng.toFixed(4)}) berada di luar poligon area operasional Indonesia.`,
    };
  }

  if (activeZone.id !== 'nasional') {
    const insideActivePolygon = checkPointInCoveragePolygon(
      lat,
      lng,
      activeZone,
      polygonInstance,
      geometryLib
    );
    const cleanProvinsi = (provinsi || '').trim();
    if (cleanProvinsi && activeZone.allowedProvinces) {
      const matchedProv = activeZone.allowedProvinces.some(
        (p) => p.toLowerCase() === cleanProvinsi.toLowerCase()
      );
      if (!matchedProv || !insideActivePolygon) {
        return {
          isValid: false,
          reasonCode: 'OUTSIDE_ACTIVE_ZONE',
          zone: activeZone,
          message: `Lokasi terdeteksi di ${cleanProvinsi}, di luar area cakupan "${activeZone.label}". Pilih lokasi di dalam poligon atau ubah ke Nasional.`,
        };
      }
    } else if (!insideActivePolygon) {
      return {
        isValid: false,
        reasonCode: 'OUTSIDE_ACTIVE_ZONE',
        zone: activeZone,
        message: `Koordinat (${lat.toFixed(4)}, ${lng.toFixed(4)}) berada di luar poligon area cakupan "${activeZone.label}".`,
      };
    }
  } else if (polygonInstance && geometryLib?.poly?.containsLocation) {
    const insidePoly = checkPointInCoveragePolygon(
      lat,
      lng,
      activeZone,
      polygonInstance,
      geometryLib
    );
    if (!insidePoly) {
      return {
        isValid: false,
        reasonCode: 'OUTSIDE_INDONESIA',
        zone: activeZone,
        message: `Koordinat (${lat.toFixed(4)}, ${lng.toFixed(4)}) berada di luar poligon area operasional "${activeZone.label}".`,
      };
    }
  }

  return {
    isValid: true,
    reasonCode: 'VALID',
    zone: activeZone,
    message: provinsi
      ? `Titik berada dalam area cakupan operasional ${activeZone.shortLabel} (${provinsi}).`
      : `Titik berada dalam area cakupan operasional ${activeZone.shortLabel}.`,
  };
}

