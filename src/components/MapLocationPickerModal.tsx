import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  Map as GoogleMap,
  Pin,
  Polygon,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  Check,
  Crosshair,
  Globe,
  Layers,
  Loader2,
  MapPin,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  DEFAULT_INDONESIA_CENTER,
  GMP_ATTRIBUTION_IDS,
  SAPA_COVERAGE_ZONES,
  SapaCoverageZoneId,
  extractRegionFromAddressComponents,
  fromGeocoderComponents,
  fromPlaceComponents,
  getCoverageZoneById,
  isQuotaError,
  normalizeLocationKey,
  readGeocodeCache,
  upsertGeocodeCacheEntries,
  validateSapaOperationalCoordinate,
} from '../utils/gmpGeocodeCache';

export interface MapPickedLocationResult {
  lokasiKegiatan: string;
  kotaKabupaten: string;
  provinsi: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  placeId?: string;
  coverageZoneId?: SapaCoverageZoneId;
  coverageZoneLabel?: string;
}

interface MapLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (result: MapPickedLocationResult) => void;
  initialLokasiKegiatan?: string;
  initialKotaKabupaten?: string;
  initialProvinsi?: string;
  isDark?: boolean;
}

interface PickerSelectionState {
  lat: number;
  lng: number;
  lokasiKegiatan: string;
  kotaKabupaten: string;
  provinsi: string;
  countryCode?: string;
  countryName?: string;
  hasLandAddressComponents?: boolean;
  formattedAddress: string;
  placeId?: string;
}

interface InnerPickerContentProps {
  onClose: () => void;
  onConfirm: (result: MapPickedLocationResult) => void;
  initialLokasiKegiatan: string;
  initialKotaKabupaten: string;
  initialProvinsi: string;
  isDark: boolean;
}

const InnerPickerContent: React.FC<InnerPickerContentProps> = ({
  onClose,
  onConfirm,
  initialLokasiKegiatan,
  initialKotaKabupaten,
  initialProvinsi,
  isDark,
}) => {
  const map = useMap();
  const loadingStatus = useApiLoadingStatus();
  const placesLib = useMapsLibrary('places');
  const geocodingLib = useMapsLibrary('geocoding');
  const geometryLib = useMapsLibrary('geometry');

  const [polygonInstance, setPolygonInstance] = useState<google.maps.Polygon | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isResolvingPoint, setIsResolvingPoint] = useState(false);
  const [isLocatingMe, setIsLocatingMe] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [coverageZoneId, setCoverageZoneId] = useState<SapaCoverageZoneId>('nasional');
  const [showCoverageBoundary, setShowCoverageBoundary] = useState(true);

  useEffect(() => {
    if (!showCoverageBoundary) {
      setPolygonInstance(null);
    }
  }, [showCoverageBoundary]);

  const [selection, setSelection] = useState<PickerSelectionState | null>(() => {
    // Seed immediately from localStorage cache if initial query is already cached
    const cache = readGeocodeCache();
    const candidateKeys = [
      initialLokasiKegiatan && initialKotaKabupaten
        ? `${initialLokasiKegiatan}, ${initialKotaKabupaten}`
        : '',
      initialLokasiKegiatan,
      initialKotaKabupaten,
    ]
      .map(normalizeLocationKey)
      .filter(Boolean);

    for (const k of candidateKeys) {
      const hit = cache[k];
      if (hit) {
        return {
          lat: hit.lat,
          lng: hit.lng,
          lokasiKegiatan: initialLokasiKegiatan || hit.displayName || hit.formattedAddress,
          kotaKabupaten: initialKotaKabupaten,
          provinsi: initialProvinsi,
          countryCode: 'ID',
          hasLandAddressComponents: true,
          formattedAddress: hit.formattedAddress,
          placeId: hit.placeId,
        };
      }
    }
    return null;
  });

  const activeZone = useMemo(
    () => getCoverageZoneById(coverageZoneId),
    [coverageZoneId]
  );

  const validation = useMemo(() => {
    if (!selection) return null;
    return validateSapaOperationalCoordinate({
      lat: selection.lat,
      lng: selection.lng,
      zoneId: coverageZoneId,
      countryCode: selection.countryCode,
      countryName: selection.countryName,
      provinsi: selection.provinsi,
      hasLandAddressComponents: selection.hasLandAddressComponents,
      polygonInstance,
      geometryLib,
    });
  }, [selection, coverageZoneId, polygonInstance, geometryLib]);

  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const quotaStoppedRef = useRef(false);
  const hasCenteredInitialRef = useRef(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const resetAutocompleteSession = useCallback(() => {
    sessionTokenRef.current = null;
    setSuggestions([]);
    setIsSuggestionsOpen(false);
  }, []);

  // Close autocomplete dropdown when clicking outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Center map on initial cached coordinate or resolve initial typed text once on open
  useEffect(() => {
    if (hasCenteredInitialRef.current) return;
    if (!map) return;

    if (selection) {
      hasCenteredInitialRef.current = true;
      map.panTo({ lat: selection.lat, lng: selection.lng });
      map.setZoom(15);
      return;
    }

    const initialQuery = [initialLokasiKegiatan, initialKotaKabupaten, initialProvinsi]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(', ');

    if (!initialQuery) {
      hasCenteredInitialRef.current = true;
      return;
    }

    if (!placesLib && !geocodingLib) return;
    if (quotaStoppedRef.current) {
      hasCenteredInitialRef.current = true;
      return;
    }

    hasCenteredInitialRef.current = true;
    let cancelled = false;

    const resolveInitial = async () => {
      setIsResolvingPoint(true);
      try {
        const textWithRegion = /indonesia/i.test(initialQuery)
          ? initialQuery
          : `${initialQuery}, Indonesia`;

        if (placesLib?.Place?.searchByText) {
          const res = await placesLib.Place.searchByText({
            textQuery: textWithRegion,
            fields: ['displayName', 'formattedAddress', 'location', 'addressComponents', 'id'],
            language: 'id',
            region: 'id',
            maxResultCount: 1,
            internalUsageAttributionIds: GMP_ATTRIBUTION_IDS,
          });
          const place = res?.places?.[0];
          if (!cancelled && place?.location) {
            const lat = place.location.lat();
            const lng = place.location.lng();
            const region = extractRegionFromAddressComponents(
              fromPlaceComponents(place.addressComponents),
              place.displayName || undefined
            );
            setSelection({
              lat,
              lng,
              lokasiKegiatan: initialLokasiKegiatan.trim() || region.suggestedLocationName || place.formattedAddress || '',
              kotaKabupaten: initialKotaKabupaten.trim() || region.kotaKabupaten,
              provinsi: initialProvinsi.trim() || region.provinsi,
              countryCode: region.countryCode,
              countryName: region.countryName,
              hasLandAddressComponents: region.hasLandAddressComponents,
              formattedAddress: place.formattedAddress || initialQuery,
              placeId: place.id,
            });
            map.panTo({ lat, lng });
            map.setZoom(14);
            return;
          }
        }

        if (geocodingLib) {
          const geocoder = new geocodingLib.Geocoder();
          const geoRes = await geocoder.geocode({
            address: textWithRegion,
            region: 'ID',
          });
          const top = geoRes?.results?.[0];
          if (!cancelled && top?.geometry?.location) {
            const lat = top.geometry.location.lat();
            const lng = top.geometry.location.lng();
            const region = extractRegionFromAddressComponents(
              fromGeocoderComponents(top.address_components)
            );
            setSelection({
              lat,
              lng,
              lokasiKegiatan: initialLokasiKegiatan.trim() || region.suggestedLocationName || top.formatted_address,
              kotaKabupaten: initialKotaKabupaten.trim() || region.kotaKabupaten,
              provinsi: initialProvinsi.trim() || region.provinsi,
              countryCode: region.countryCode,
              countryName: region.countryName,
              hasLandAddressComponents: region.hasLandAddressComponents,
              formattedAddress: top.formatted_address || initialQuery,
              placeId: top.place_id,
            });
            map.panTo({ lat, lng });
            map.setZoom(14);
          }
        }
      } catch (err) {
        if (isQuotaError(err)) {
          quotaStoppedRef.current = true;
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          setStatusMessage('Kuota Google Maps harian terlampaui. Coba lagi nanti.');
        }
      } finally {
        if (!cancelled) setIsResolvingPoint(false);
      }
    };

    void resolveInitial();
    return () => {
      cancelled = true;
    };
  }, [
    map,
    selection,
    initialLokasiKegiatan,
    initialKotaKabupaten,
    initialProvinsi,
    placesLib,
    geocodingLib,
  ]);

  // Debounced Places API (New) AutocompleteSuggestion lookup with session token management
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      setIsSearchingSuggestions(false);
      return;
    }

    if (!placesLib?.AutocompleteSuggestion || quotaStoppedRef.current) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setIsSearchingSuggestions(true);
      try {
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
        }
        const request: google.maps.places.AutocompleteRequest = {
          input: trimmed,
          sessionToken: sessionTokenRef.current,
          includedRegionCodes: ['id'],
          language: 'id',
          region: 'id',
          internalUsageAttributionIds: GMP_ATTRIBUTION_IDS,
        };
        const res = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
        if (!cancelled) {
          setSuggestions(res?.suggestions || []);
          setIsSuggestionsOpen((res?.suggestions || []).length > 0);
        }
      } catch (err) {
        if (!cancelled) {
          setSuggestions([]);
          if (isQuotaError(err)) {
            quotaStoppedRef.current = true;
            window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
            setStatusMessage('Kuota pencarian Google Maps terlampaui.');
          }
        }
      } finally {
        if (!cancelled) setIsSearchingSuggestions(false);
      }
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery, placesLib]);

  // Helper to apply a fetched Place object into selection + map pan
  const applyPlaceSelection = useCallback(
    (place: google.maps.places.Place, fallbackLabel?: string) => {
      if (!place.location) {
        setStatusMessage('Lokasi tidak memiliki koordinat valid.');
        return;
      }

      const lat = place.location.lat();
      const lng = place.location.lng();
      const region = extractRegionFromAddressComponents(
        fromPlaceComponents(place.addressComponents),
        place.displayName || fallbackLabel
      );

      const finalName =
        place.displayName?.trim() ||
        region.suggestedLocationName ||
        fallbackLabel ||
        place.formattedAddress ||
        `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

      setSelection({
        lat,
        lng,
        lokasiKegiatan: finalName,
        kotaKabupaten: region.kotaKabupaten,
        provinsi: region.provinsi,
        countryCode: region.countryCode,
        countryName: region.countryName,
        hasLandAddressComponents: region.hasLandAddressComponents,
        formattedAddress: place.formattedAddress || finalName,
        placeId: place.id,
      });
      setStatusMessage(null);

      if (map) {
        map.panTo({ lat, lng });
        map.setZoom(16);
      }
    },
    [map]
  );

  // Reverse geocode a coordinate clicked on map or dragged by pin
  const reverseGeocodeCoordinate = useCallback(
    async (lat: number, lng: number, clickedPlaceId?: string | null) => {
      if (quotaStoppedRef.current) return;

      setIsResolvingPoint(true);
      setStatusMessage(null);

      try {
        // 1. If user clicked directly on a POI on Google Maps, resolve official Place name & details
        if (clickedPlaceId && placesLib?.Place) {
          try {
            const poiPlace = new placesLib.Place({
              id: clickedPlaceId,
              requestedLanguage: 'id',
              requestedRegion: 'ID',
            });
            await poiPlace.fetchFields({
              fields: ['displayName', 'formattedAddress', 'location', 'addressComponents', 'id'],
            });
            if (poiPlace.location) {
              applyPlaceSelection(poiPlace);
              return;
            }
          } catch (poiErr) {
            if (isQuotaError(poiErr)) {
              quotaStoppedRef.current = true;
              window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
              setStatusMessage('Kuota Google Maps harian terlampaui.');
              return;
            }
            // Fall through to reverse geocoding at clicked coordinate
          }
        }

        // 2. Standard reverse geocoding via Geocoding JS SDK
        if (geocodingLib) {
          const geocoder = new geocodingLib.Geocoder();
          const response = await geocoder.geocode({
            location: { lat, lng },
            language: 'id',
            fulfillOnZeroResults: true,
          });
          const top = response?.results?.[0];
          if (top) {
            const region = extractRegionFromAddressComponents(
              fromGeocoderComponents(top.address_components)
            );
            setSelection({
              lat,
              lng,
              lokasiKegiatan:
                region.suggestedLocationName ||
                top.formatted_address ||
                `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
              kotaKabupaten: region.kotaKabupaten,
              provinsi: region.provinsi,
              countryCode: region.countryCode,
              countryName: region.countryName,
              hasLandAddressComponents: region.hasLandAddressComponents,
              formattedAddress: top.formatted_address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
              placeId: top.place_id,
            });
            return;
          }

          // ZERO_RESULTS (e.g., ocean / remote uninhabited coordinates)
          setSelection({
            lat,
            lng,
            lokasiKegiatan: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            kotaKabupaten: '',
            provinsi: '',
            countryCode: '',
            countryName: '',
            hasLandAddressComponents: false,
            formattedAddress: `Koordinat perairan / tanpa alamat (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
          });
          return;
        }

        // Fallback if Geocoding library is unavailable
        setSelection({
          lat,
          lng,
          lokasiKegiatan: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          kotaKabupaten: '',
          provinsi: '',
          hasLandAddressComponents: false,
          formattedAddress: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        });
      } catch (err) {
        if (isQuotaError(err)) {
          quotaStoppedRef.current = true;
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          setStatusMessage('Kuota Google Maps harian terlampaui.');
        } else {
          setSelection({
            lat,
            lng,
            lokasiKegiatan: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            kotaKabupaten: '',
            provinsi: '',
            countryCode: '',
            countryName: '',
            hasLandAddressComponents: false,
            formattedAddress: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          });
          setStatusMessage('Gagal memverifikasi alamat daratan pada titik ini.');
        }
      } finally {
        setIsResolvingPoint(false);
      }
    },
    [placesLib, geocodingLib, applyPlaceSelection]
  );

  // Select suggestion from Autocomplete dropdown
  const handleSelectSuggestion = async (
    suggestion: google.maps.places.AutocompleteSuggestion
  ) => {
    if (!placesLib || !suggestion.placePrediction || quotaStoppedRef.current) return;

    const mainText = suggestion.placePrediction.mainText?.text || suggestion.placePrediction.text?.text || '';
    setSearchQuery(suggestion.placePrediction.text?.text || mainText);
    setIsSuggestionsOpen(false);
    setIsResolvingPoint(true);
    setStatusMessage(null);

    try {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location', 'addressComponents', 'id'],
      });
      applyPlaceSelection(place, mainText);
      resetAutocompleteSession();
    } catch (err) {
      if (isQuotaError(err)) {
        quotaStoppedRef.current = true;
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        setStatusMessage('Kuota Google Maps harian terlampaui.');
      } else {
        setStatusMessage('Tidak dapat mengambil detail tempat tersebut.');
      }
    } finally {
      setIsResolvingPoint(false);
    }
  };

  // Manual search submit via Places API (New) searchByText when pressing Enter / Cari
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query || quotaStoppedRef.current) return;

    if (suggestions.length > 0 && isSuggestionsOpen) {
      await handleSelectSuggestion(suggestions[0]);
      return;
    }

    setIsSuggestionsOpen(false);
    setIsResolvingPoint(true);
    setStatusMessage(null);

    try {
      if (placesLib?.Place?.searchByText) {
        const res = await placesLib.Place.searchByText({
          textQuery: /indonesia/i.test(query) ? query : `${query}, Indonesia`,
          fields: ['displayName', 'formattedAddress', 'location', 'addressComponents', 'id'],
          language: 'id',
          region: 'id',
          maxResultCount: 1,
          internalUsageAttributionIds: GMP_ATTRIBUTION_IDS,
        });
        const place = res?.places?.[0];
        if (place?.location) {
          applyPlaceSelection(place, query);
          resetAutocompleteSession();
          return;
        }
      }

      if (geocodingLib) {
        const geocoder = new geocodingLib.Geocoder();
        const geoRes = await geocoder.geocode({
          address: /indonesia/i.test(query) ? query : `${query}, Indonesia`,
          region: 'ID',
        });
        const top = geoRes?.results?.[0];
        if (top?.geometry?.location) {
          const lat = top.geometry.location.lat();
          const lng = top.geometry.location.lng();
          const region = extractRegionFromAddressComponents(
            fromGeocoderComponents(top.address_components),
            query
          );
          setSelection({
            lat,
            lng,
            lokasiKegiatan: query,
            kotaKabupaten: region.kotaKabupaten,
            provinsi: region.provinsi,
            countryCode: region.countryCode,
            countryName: region.countryName,
            hasLandAddressComponents: region.hasLandAddressComponents,
            formattedAddress: top.formatted_address || query,
            placeId: top.place_id,
          });
          if (map) {
            map.panTo({ lat, lng });
            map.setZoom(15);
          }
          return;
        }
      }

      setStatusMessage(`Tempat "${query}" tidak ditemukan. Coba kata kunci lain atau klik langsung di peta.`);
    } catch (err) {
      if (isQuotaError(err)) {
        quotaStoppedRef.current = true;
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        setStatusMessage('Kuota Google Maps harian terlampaui.');
      } else {
        setStatusMessage('Terjadi gangguan saat mencari lokasi.');
      }
    } finally {
      setIsResolvingPoint(false);
    }
  };

  // Use browser current location
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setStatusMessage('Browser Anda tidak mendukung geolokasi.');
      return;
    }
    setIsLocatingMe(true);
    setStatusMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setIsLocatingMe(false);
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(16);
        }
        void reverseGeocodeCoordinate(lat, lng, null);
      },
      () => {
        setIsLocatingMe(false);
        setStatusMessage('Izin lokasi tidak aktif atau gagal membaca posisi GPS.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleZoneChange = (nextZoneId: SapaCoverageZoneId) => {
    setCoverageZoneId(nextZoneId);
    const nextZone = getCoverageZoneById(nextZoneId);
    if (map) {
      map.panTo(nextZone.center);
      map.setZoom(nextZone.defaultZoom);
    }
  };

  const handleFocusActiveCoverageZone = () => {
    if (!map) return;
    map.panTo(activeZone.center);
    map.setZoom(activeZone.defaultZoom);
  };

  const handleConfirmSelection = () => {
    if (!selection || !validation?.isValid) return;
    const finalLocationName = selection.lokasiKegiatan.trim() || selection.formattedAddress;
    const composedDisplay =
      finalLocationName && selection.kotaKabupaten
        ? `${finalLocationName}, ${selection.kotaKabupaten}`
        : finalLocationName;

    // Persist coordinates into shared geocode cache so dashboard map renders pin immediately without extra API call
    upsertGeocodeCacheEntries([finalLocationName, composedDisplay], {
      lat: selection.lat,
      lng: selection.lng,
      formattedAddress: selection.formattedAddress,
      displayName: finalLocationName,
      placeId: selection.placeId,
    });

    onConfirm({
      lokasiKegiatan: finalLocationName,
      kotaKabupaten: selection.kotaKabupaten,
      provinsi: selection.provinsi,
      formattedAddress: selection.formattedAddress,
      lat: selection.lat,
      lng: selection.lng,
      placeId: selection.placeId,
      coverageZoneId: activeZone.id,
      coverageZoneLabel: activeZone.shortLabel,
    });
  };

  const hasLoadError =
    loadingStatus === APILoadingStatus.AUTH_FAILURE ||
    loadingStatus === APILoadingStatus.FAILED;

  return (
    <div className="flex flex-col max-h-[92vh]">
      {/* Modal Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#05828e] dark:text-teal-400 flex items-center justify-center shrink-0">
            <MapPin className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
              Pilih Lokasi Kegiatan di Peta
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Cari nama tempat, klik titik di peta, atau geser pin untuk menentukan lokasi.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Tutup modal peta"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar & Controls */}
      <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div ref={searchBoxRef} className="relative flex-1">
            <form onSubmit={(e) => void handleSearchSubmit(e)} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="map-picker-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.trim().length >= 2) {
                      setIsSuggestionsOpen(true);
                    }
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) setIsSuggestionsOpen(true);
                  }}
                  placeholder="Cari gedung, vihara, sekolah, jalan, atau kota..."
                  className="w-full h-10 pl-10 pr-9 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#05828e] dark:focus:border-teal-500 transition-colors"
                />
                {(isSearchingSuggestions || searchQuery) && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    {isSearchingSuggestions ? (
                      <Loader2 className="w-4 h-4 text-[#05828e] animate-spin" />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSuggestions([]);
                          setIsSuggestionsOpen(false);
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        aria-label="Hapus pencarian"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={!searchQuery.trim() || isResolvingPoint}
                className="h-10 px-4 rounded-xl bg-[#05828e] hover:bg-[#046d77] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0"
              >
                Cari
              </button>
            </form>

            {/* Autocomplete Dropdown */}
            {isSuggestionsOpen && suggestions.length > 0 && (
              <div className="absolute z-40 left-0 right-0 sm:right-16 top-11.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                {suggestions.map((sug, idx) => {
                  const pred = sug.placePrediction;
                  if (!pred) return null;
                  const main = pred.mainText?.text || pred.text?.text || '';
                  const secondary = pred.secondaryText?.text || '';

                  return (
                    <button
                      key={pred.placeId || idx}
                      type="button"
                      onClick={() => void handleSelectSuggestion(sug)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-teal-50/70 dark:hover:bg-slate-800 border-b last:border-b-0 border-slate-100 dark:border-slate-800 flex items-start gap-2.5 transition-colors cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-[#05828e] dark:text-teal-400 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {main}
                        </p>
                        {secondary && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {secondary}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocatingMe || isResolvingPoint}
            className="h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-60"
            title="Gunakan lokasi GPS perangkat saat ini"
          >
            {isLocatingMe ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#05828e]" />
            ) : (
              <Crosshair className="w-3.5 h-3.5 text-[#05828e] dark:text-teal-400" />
            )}
            <span>Lokasi Saya</span>
          </button>
        </div>

        {statusMessage && (
          <p className="mt-2 text-xs text-amber-700 dark:text-amber-300 font-medium">
            {statusMessage}
          </p>
        )}

        {/* Operational Coverage Zone Bar */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor="select-sapa-coverage-zone"
              className="inline-flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300"
            >
              <Layers className="w-3.5 h-3.5 text-[#05828e] dark:text-teal-400" />
              <span>Area Cakupan SAPA:</span>
            </label>
            <select
              id="select-sapa-coverage-zone"
              value={coverageZoneId}
              onChange={(e) => handleZoneChange(e.target.value as SapaCoverageZoneId)}
              className="h-8 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#05828e] cursor-pointer"
            >
              {SAPA_COVERAGE_ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showCoverageBoundary}
                onChange={(e) => setShowCoverageBoundary(e.target.checked)}
                className="rounded border-slate-300 text-[#05828e] focus:ring-[#05828e] cursor-pointer"
              />
              <span>Tampilkan batas area</span>
            </label>
            <button
              type="button"
              onClick={handleFocusActiveCoverageZone}
              className="text-[#05828e] dark:text-teal-400 hover:underline font-semibold cursor-pointer"
            >
              Fokus Area
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Map Canvas */}
      <div className="relative w-full h-[310px] sm:h-[360px] bg-slate-100 dark:bg-slate-950 shrink-0">
        {hasLoadError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-600 dark:text-slate-300">
            <MapPin className="w-9 h-9 text-amber-500 mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Peta Google Maps tidak dapat dimuat
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              Periksa kunci API Google Maps Platform atau kuota harian Anda.
            </p>
          </div>
        ) : (
          <GoogleMap
            mapId="DEMO_MAP_ID"
            defaultCenter={selection ? { lat: selection.lat, lng: selection.lng } : DEFAULT_INDONESIA_CENTER}
            defaultZoom={selection ? 15 : 5}
            colorScheme={isDark ? 'DARK' : 'LIGHT'}
            gestureHandling="greedy"
            mapTypeControl={false}
            streetViewControl={false}
            fullscreenControl={false}
            internalUsageAttributionIds={GMP_ATTRIBUTION_IDS}
            onClick={(ev) => {
              const latLng = ev.detail?.latLng;
              if (!latLng) return;
              if (ev.detail.placeId) {
                ev.stop();
              }
              void reverseGeocodeCoordinate(latLng.lat, latLng.lng, ev.detail.placeId);
            }}
            style={{ width: '100%', height: '100%' }}
          >
            {showCoverageBoundary && (
              <Polygon
                ref={setPolygonInstance}
                paths={activeZone.polygonPaths}
                clickable={false}
                strokeColor={validation && !validation.isValid ? '#dc2626' : '#05828e'}
                strokeOpacity={0.85}
                strokeWeight={2}
                fillColor={validation && !validation.isValid ? '#ef4444' : '#05828e'}
                fillOpacity={0.07}
              />
            )}

            {selection && (
              <AdvancedMarker
                position={{ lat: selection.lat, lng: selection.lng }}
                draggable={true}
                title={selection.lokasiKegiatan || 'Lokasi terpilih (geser untuk menyesuaikan)'}
                onDragEnd={(e) => {
                  if (e.latLng) {
                    void reverseGeocodeCoordinate(e.latLng.lat(), e.latLng.lng(), null);
                  }
                }}
              >
                <Pin
                  background={validation && !validation.isValid ? '#dc2626' : '#05828e'}
                  borderColor="#ffffff"
                  glyphColor="#ffffff"
                  scale={1.2}
                />
              </AdvancedMarker>
            )}
          </GoogleMap>
        )}

        {/* Loading indicator overlay when resolving click/drag */}
        {isResolvingPoint && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-md flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 pointer-events-none">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#05828e]" />
            <span>Memvalidasi koordinat &amp; alamat...</span>
          </div>
        )}
      </div>

      {/* Confirmation & Editable Details Footer */}
      <div className="px-5 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-3 overflow-y-auto">
        {selection && validation ? (
          <div className="space-y-3">
            {/* Coordinate Operational Coverage Validation Banner */}
            <div
              id="map-coordinate-validation-banner"
              className={`rounded-xl px-3.5 py-2.5 border flex flex-wrap items-center justify-between gap-2 text-xs ${
                validation.isValid
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/35 border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/70 text-rose-800 dark:text-rose-200'
              }`}
            >
              <div className="flex items-start gap-2 min-w-0 flex-1">
                {validation.isValid ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <p className="font-bold">
                    {validation.isValid
                      ? 'Koordinat Valid — Dalam Area Cakupan Operasional'
                      : 'Lokasi di luar area operasional'}
                  </p>
                  <p className="text-[11px] opacity-90 mt-0.5 leading-snug">
                    {validation.message}
                  </p>
                </div>
              </div>

              {!validation.isValid && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleFocusActiveCoverageZone}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 text-[11px] font-semibold hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Fokus ke Area
                  </button>
                  {validation.reasonCode === 'OUTSIDE_ACTIVE_ZONE' && (
                    <button
                      type="button"
                      onClick={() => handleZoneChange('nasional')}
                      className="px-2.5 py-1 rounded-lg bg-[#05828e] hover:bg-[#046d77] text-white text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Gunakan Nasional
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
              <div className="sm:col-span-7">
                <label
                  htmlFor="map-picker-editable-name"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
                >
                  Nama Lokasi Kegiatan (Dapat Disesuaikan)
                </label>
                <input
                  id="map-picker-editable-name"
                  type="text"
                  value={selection.lokasiKegiatan}
                  onChange={(e) =>
                    setSelection((prev) =>
                      prev ? { ...prev, lokasiKegiatan: e.target.value } : prev
                    )
                  }
                  placeholder="Contoh: Gedung Serbaguna / Nama Vihara..."
                  className="w-full h-9.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#05828e] dark:focus:border-teal-500"
                />
              </div>

              <div className="sm:col-span-5 space-y-1">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Wilayah Terdeteksi
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/60 text-[#05828e] dark:text-teal-300 font-semibold border border-teal-200/70 dark:border-teal-800/60">
                    {selection.kotaKabupaten || 'Kota belum terdeteksi'}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700">
                    {selection.provinsi || 'Provinsi belum terdeteksi'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-200/80 dark:border-slate-800">
              <span className="truncate flex-1 min-w-[200px]" title={selection.formattedAddress}>
                <strong className="text-slate-700 dark:text-slate-200">Alamat:</strong>{' '}
                {selection.formattedAddress}
              </span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 shrink-0 tabular-nums">
                {selection.lat.toFixed(5)}, {selection.lng.toFixed(5)}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#05828e] shrink-0" />
            <span>
              Belum ada titik dipilih. Cari tempat di atas atau klik langsung daratan dalam area cakupan peta untuk meletakkan pin.
            </span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            id="btn-confirm-map-location"
            type="button"
            disabled={!selection || isResolvingPoint || !validation?.isValid}
            onClick={handleConfirmSelection}
            title={
              selection && validation && !validation.isValid
                ? 'Titik harus berada dalam area cakupan operasional SAPA'
                : undefined
            }
            className="px-5 py-2 rounded-xl bg-[#05828e] hover:bg-[#046d77] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Check className="w-4 h-4" />
            <span>Gunakan Lokasi Ini</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const MapLocationPickerModal: React.FC<MapLocationPickerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialLokasiKegiatan = '',
  initialKotaKabupaten = '',
  initialProvinsi = '',
  isDark = false,
}) => {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim() || '';

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-[2px] animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Pilih Lokasi di Peta Google Maps"
    >
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {!apiKey ? (
          <div className="p-6 text-center space-y-3">
            <Globe className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Kunci API Google Maps belum dikonfigurasi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Variabel <code className="font-mono">VITE_GOOGLE_MAPS_API_KEY</code> belum tersedia, sehingga pemilih lokasi peta belum dapat dibuka.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        ) : (
          <APIProvider
            apiKey={apiKey}
            language="id"
            region="ID"
            libraries={['places', 'marker', 'geocoding', 'core', 'geometry']}
            internalUsageAttributionIds={GMP_ATTRIBUTION_IDS}
          >
            <InnerPickerContent
              onClose={onClose}
              onConfirm={onConfirm}
              initialLokasiKegiatan={initialLokasiKegiatan}
              initialKotaKabupaten={initialKotaKabupaten}
              initialProvinsi={initialProvinsi}
              isDark={isDark}
            />
          </APIProvider>
        )}
      </div>
    </div>
  );
};
