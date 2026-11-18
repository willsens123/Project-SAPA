import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  Polygon,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
  Globe,
  Layers,
  Loader2,
  MapPin,
  Maximize2,
  Navigation,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Wifi,
  X,
} from 'lucide-react';
import { ProjectItem } from '../types';
import {
  CachedGeocodeEntry,
  DEFAULT_INDONESIA_CENTER,
  GMP_ATTRIBUTION_IDS,
  GMP_GEOCODE_CACHE_STORAGE_KEY,
  SAPA_COVERAGE_ZONES,
  SapaCoverageZone,
  SapaCoverageZoneId,
  checkPointInCoveragePolygon,
  getCoverageZoneById,
  isQuotaError,
  normalizeLocationKey,
  readGeocodeCache,
  writeGeocodeCache,
} from '../utils/gmpGeocodeCache';

interface ProjectLocationMapProps {
  projects: ProjectItem[];
  totalProjectsCount: number;
  isDark?: boolean;
  activeSearchQuery?: string;
  onSelectLocationFilter: (locationQuery: string) => void;
  onViewDetail: (project: ProjectItem) => void;
  onViewReport?: (project: ProjectItem) => void;
}

interface LocationGroup {
  key: string;
  label: string;
  queryText: string;
  projects: ProjectItem[];
  primaryStatus: 'Ongoing' | 'Waiting Acc' | 'Done';
  counts: {
    ongoing: number;
    waitingAcc: number;
    done: number;
  };
}

const CACHE_STORAGE_KEY = GMP_GEOCODE_CACHE_STORAGE_KEY;
const COLLAPSE_STORAGE_KEY = 'sapa_project_map_collapsed_v1';
const ATTRIBUTION_IDS = GMP_ATTRIBUTION_IDS;

function isVirtualLocation(project: ProjectItem): boolean {
  if (project.isOnline) return true;
  const raw = (project.lokasi || '').trim();
  if (!raw || raw === '-') return true;
  return /^(online|daring|virtual|zoom|youtube|live|hybrid\s*\(?online)/i.test(raw);
}

function getStatusBucket(status: string): 'ongoing' | 'waitingAcc' | 'done' {
  const s = (status || '').trim().toLowerCase();
  if (s === 'done' || s.includes('done')) return 'done';
  if (s.includes('waiting')) return 'waitingAcc';
  return 'ongoing';
}

function getPinStyle(status: LocationGroup['primaryStatus'], isSelected: boolean) {
  if (status === 'Ongoing') {
    return {
      background: isSelected ? '#0f766e' : '#05828e',
      borderColor: isSelected ? '#ccfbf1' : '#ffffff',
      glyphColor: '#ffffff',
    };
  }
  if (status === 'Waiting Acc') {
    return {
      background: isSelected ? '#b45309' : '#d97706',
      borderColor: isSelected ? '#fef3c7' : '#ffffff',
      glyphColor: '#ffffff',
    };
  }
  return {
    background: isSelected ? '#047857' : '#10b981',
    borderColor: isSelected ? '#d1fae5' : '#ffffff',
    glyphColor: '#ffffff',
  };
}

interface LocationMarkerItemProps {
  group: LocationGroup;
  coord: CachedGeocodeEntry;
  isSelected: boolean;
  isHovered: boolean;
  isOutsideOperationalArea: boolean;
  zIndex: number;
  onSelect: (group: LocationGroup, marker: google.maps.marker.AdvancedMarkerElement) => void;
  onHoverChange: (key: string | null) => void;
}

const LocationMarkerItem: React.FC<LocationMarkerItemProps> = ({
  group,
  coord,
  isSelected,
  isHovered,
  isOutsideOperationalArea,
  zIndex,
  onSelect,
  onHoverChange,
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const baseStyle = getPinStyle(group.primaryStatus, isSelected || isHovered);
  const pinStyle = isOutsideOperationalArea
    ? {
        background: isSelected || isHovered ? '#b91c1c' : '#dc2626',
        borderColor: '#fee2e2',
        glyphColor: '#ffffff',
      }
    : baseStyle;

  return (
    <AdvancedMarker
      ref={markerRef}
      position={{ lat: coord.lat, lng: coord.lng }}
      zIndex={zIndex}
      title={
        isOutsideOperationalArea
          ? `${group.label} — Lokasi di luar area operasional`
          : `${group.label} (${group.projects.length} proyek)`
      }
      onClick={() => {
        if (marker) {
          onSelect(group, marker);
        }
      }}
      onMouseEnter={() => onHoverChange(group.key)}
      onMouseLeave={() => onHoverChange(null)}
    >
      <Pin
        background={pinStyle.background}
        borderColor={pinStyle.borderColor}
        glyphColor={pinStyle.glyphColor}
        scale={isSelected ? 1.25 : isHovered ? 1.15 : 1}
        glyphText={group.projects.length > 1 ? String(group.projects.length) : undefined}
      />
    </AdvancedMarker>
  );
};

interface InnerMapCanvasProps {
  locationGroups: LocationGroup[];
  resolvedCoords: Record<string, CachedGeocodeEntry>;
  isDark: boolean;
  selectedKey: string | null;
  onSelectKey: (key: string | null) => void;
  onCoordsResolved: (nextEntries: Record<string, CachedGeocodeEntry>) => void;
  onResolutionStateChange: (state: { isResolving: boolean; failedKeys: string[] }) => void;
  onSelectLocationFilter: (locationQuery: string) => void;
  onViewDetail: (project: ProjectItem) => void;
  onViewReport?: (project: ProjectItem) => void;
  fitAllTrigger: number;
  activeZone: SapaCoverageZone;
  showOperationalPolygon: boolean;
  focusZoneTrigger: number;
  pickedCoord: { lat: number; lng: number } | null;
  onPickCoord: (coord: { lat: number; lng: number } | null) => void;
  onPickedInsideChange: (isInside: boolean | null) => void;
  onOutsideKeysChange: (outsideKeys: Record<string, boolean>) => void;
}

const InnerMapCanvas: React.FC<InnerMapCanvasProps> = ({
  locationGroups,
  resolvedCoords,
  isDark,
  selectedKey,
  onSelectKey,
  onCoordsResolved,
  onResolutionStateChange,
  onSelectLocationFilter,
  onViewDetail,
  onViewReport,
  fitAllTrigger,
  activeZone,
  showOperationalPolygon,
  focusZoneTrigger,
  pickedCoord,
  onPickCoord,
  onPickedInsideChange,
  onOutsideKeysChange,
}) => {
  const map = useMap();
  const loadingStatus = useApiLoadingStatus();
  const placesLib = useMapsLibrary('places');
  const geocodingLib = useMapsLibrary('geocoding');
  const coreLib = useMapsLibrary('core');
  const geometryLib = useMapsLibrary('geometry');

  const [polygonInstance, setPolygonInstance] = useState<google.maps.Polygon | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [anchoredState, setAnchoredState] = useState<{
    key: string;
    marker: google.maps.marker.AdvancedMarkerElement;
  } | null>(null);
  const inFlightKeysRef = useRef<Record<string, boolean>>({});
  const quotaStoppedRef = useRef(false);
  const hasAutoFittedRef = useRef(false);

  useEffect(() => {
    if (!showOperationalPolygon) {
      setPolygonInstance(null);
    }
  }, [showOperationalPolygon]);

  // Resolve missing physical locations using official Places API (New) SearchByText + Geocoder fallback
  useEffect(() => {
    if (
      loadingStatus === APILoadingStatus.AUTH_FAILURE ||
      loadingStatus === APILoadingStatus.FAILED
    ) {
      return;
    }
    if (!placesLib && !geocodingLib) return;
    if (quotaStoppedRef.current) return;

    const unresolved = locationGroups.filter(
      (g) => !resolvedCoords[g.key] && !inFlightKeysRef.current[g.key]
    );
    if (unresolved.length === 0) return;

    let cancelled = false;
    onResolutionStateChange({ isResolving: true, failedKeys: [] });

    const resolveLocations = async () => {
      const updates: Record<string, CachedGeocodeEntry> = {};
      const failed: string[] = [];
      const geocoder = geocodingLib ? new geocodingLib.Geocoder() : null;

      for (const group of unresolved) {
        if (cancelled || quotaStoppedRef.current) break;
        inFlightKeysRef.current[group.key] = true;

        try {
          let found: CachedGeocodeEntry | null = null;

          // 1. Primary: Places API (New) Text Search via official JS SDK (no CORS issues)
          if (placesLib?.Place?.searchByText) {
            const response = await placesLib.Place.searchByText({
              textQuery: group.queryText,
              fields: ['displayName', 'formattedAddress', 'location', 'id'],
              language: 'id',
              region: 'id',
              maxResultCount: 1,
              internalUsageAttributionIds: ATTRIBUTION_IDS,
            });
            const place = response?.places?.[0];
            if (place?.location) {
              found = {
                lat: place.location.lat(),
                lng: place.location.lng(),
                formattedAddress: place.formattedAddress || group.label,
                displayName: place.displayName || group.label,
                placeId: place.id,
                cachedAt: Date.now(),
              };
            }
          }

          // 2. Fallback: Geocoding JS SDK if Place search yielded nothing
          if (!found && geocoder) {
            const geoRes = await geocoder.geocode({
              address: group.queryText,
              region: 'ID',
            });
            const top = geoRes?.results?.[0];
            if (top?.geometry?.location) {
              found = {
                lat: top.geometry.location.lat(),
                lng: top.geometry.location.lng(),
                formattedAddress: top.formatted_address || group.label,
                placeId: top.place_id,
                cachedAt: Date.now(),
              };
            }
          }

          if (found) {
            updates[group.key] = found;
          } else {
            failed.push(group.key);
          }
        } catch (err) {
          if (isQuotaError(err)) {
            quotaStoppedRef.current = true;
            window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
            break;
          }
          // Try geocoder fallback if Place.searchByText threw non-quota error
          if (geocoder) {
            try {
              const geoRes = await geocoder.geocode({
                address: group.queryText,
                region: 'ID',
              });
              const top = geoRes?.results?.[0];
              if (top?.geometry?.location) {
                updates[group.key] = {
                  lat: top.geometry.location.lat(),
                  lng: top.geometry.location.lng(),
                  formattedAddress: top.formatted_address || group.label,
                  placeId: top.place_id,
                  cachedAt: Date.now(),
                };
              } else {
                failed.push(group.key);
              }
            } catch (geoErr) {
              if (isQuotaError(geoErr)) {
                quotaStoppedRef.current = true;
                window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
                break;
              }
              failed.push(group.key);
            }
          } else {
            failed.push(group.key);
          }
        }
      }

      if (!cancelled) {
        if (Object.keys(updates).length > 0) {
          onCoordsResolved(updates);
        }
        onResolutionStateChange({ isResolving: false, failedKeys: failed });
      }
    };

    void resolveLocations();

    return () => {
      cancelled = true;
    };
  }, [
    locationGroups,
    resolvedCoords,
    placesLib,
    geocodingLib,
    loadingStatus,
    onCoordsResolved,
    onResolutionStateChange,
  ]);

  const mappableGroups = useMemo(() => {
    return locationGroups
      .filter((g) => Boolean(resolvedCoords[g.key]))
      .sort((a, b) => resolvedCoords[b.key].lat - resolvedCoords[a.key].lat);
  }, [locationGroups, resolvedCoords]);

  const fitAllBounds = useCallback(() => {
    if (!map || !coreLib || mappableGroups.length === 0) return;

    if (mappableGroups.length === 1) {
      const c = resolvedCoords[mappableGroups[0].key];
      map.panTo({ lat: c.lat, lng: c.lng });
      map.setZoom(13);
      return;
    }

    const bounds = new coreLib.LatLngBounds();
    mappableGroups.forEach((g) => {
      const c = resolvedCoords[g.key];
      if (c) {
        bounds.extend({ lat: c.lat, lng: c.lng });
      }
    });
    map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 });
  }, [map, coreLib, mappableGroups, resolvedCoords]);

  // Fit bounds when initial batch finishes or when user clicks "Pas-kan Semua Titik"
  useEffect(() => {
    if (!map || !coreLib || mappableGroups.length === 0) return;
    if (!hasAutoFittedRef.current) {
      hasAutoFittedRef.current = true;
      fitAllBounds();
    }
  }, [map, coreLib, mappableGroups, fitAllBounds]);

  useEffect(() => {
    if (fitAllTrigger > 0) {
      fitAllBounds();
    }
  }, [fitAllTrigger, fitAllBounds]);

  // Pan to active operational coverage zone when requested or changed
  useEffect(() => {
    if (!map || focusZoneTrigger === 0) return;
    map.panTo(activeZone.center);
    map.setZoom(activeZone.defaultZoom);
  }, [map, focusZoneTrigger, activeZone]);

  // Pan smoothly to selected group when chosen from sidebar list
  useEffect(() => {
    if (!map || !selectedKey) return;
    const coord = resolvedCoords[selectedKey];
    if (coord) {
      map.panTo({ lat: coord.lat, lng: coord.lng });
      if ((map.getZoom() ?? 0) < 11) {
        map.setZoom(12);
      }
    }
  }, [map, selectedKey, resolvedCoords]);

  // Evaluate whether the user-selected map coordinate lies inside the operational polygon
  const isPickedInside = useMemo(() => {
    if (!pickedCoord) return null;
    return checkPointInCoveragePolygon(
      pickedCoord.lat,
      pickedCoord.lng,
      activeZone,
      polygonInstance,
      geometryLib
    );
  }, [pickedCoord, activeZone, polygonInstance, geometryLib]);

  useEffect(() => {
    onPickedInsideChange(isPickedInside);
  }, [isPickedInside, onPickedInsideChange]);

  // Evaluate all resolved project markers against the operational coverage polygon
  const outsideAreaMap = useMemo(() => {
    const result: Record<string, boolean> = {};
    mappableGroups.forEach((group) => {
      const coord = resolvedCoords[group.key];
      if (!coord) return;
      const inside = checkPointInCoveragePolygon(
        coord.lat,
        coord.lng,
        activeZone,
        polygonInstance,
        geometryLib
      );
      if (!inside) {
        result[group.key] = true;
      }
    });
    return result;
  }, [mappableGroups, resolvedCoords, activeZone, polygonInstance, geometryLib]);

  useEffect(() => {
    onOutsideKeysChange(outsideAreaMap);
  }, [outsideAreaMap, onOutsideKeysChange]);

  const selectedGroup = useMemo(
    () => locationGroups.find((g) => g.key === selectedKey) || null,
    [locationGroups, selectedKey]
  );

  const selectedCoord = selectedKey ? resolvedCoords[selectedKey] : undefined;
  const isSelectedOutside = selectedGroup ? Boolean(outsideAreaMap[selectedGroup.key]) : false;

  if (
    loadingStatus === APILoadingStatus.AUTH_FAILURE ||
    loadingStatus === APILoadingStatus.FAILED
  ) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300">
        <MapPin className="w-9 h-9 text-amber-500 mb-2.5" />
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
          Peta Google Maps tidak dapat dimuat saat ini
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
          Periksa konfigurasi API key Google Maps Platform atau kuota harian Anda. Daftar lokasi proyek tetap tersedia di panel sebelah kanan.
        </p>
      </div>
    );
  }

  const hasWarningState =
    (pickedCoord !== null && isPickedInside === false) || isSelectedOutside;

  return (
    <GoogleMap
      mapId="DEMO_MAP_ID"
      defaultCenter={DEFAULT_INDONESIA_CENTER}
      defaultZoom={6}
      colorScheme={isDark ? 'DARK' : 'LIGHT'}
      gestureHandling="cooperative"
      mapTypeControl={false}
      streetViewControl={false}
      fullscreenControl={true}
      internalUsageAttributionIds={ATTRIBUTION_IDS}
      onClick={(ev) => {
        onSelectKey(null);
        setAnchoredState(null);
        const latLng = ev.detail?.latLng;
        if (latLng) {
          if (ev.detail.placeId) {
            ev.stop();
          }
          onPickCoord({ lat: latLng.lat, lng: latLng.lng });
        }
      }}
      style={{ width: '100%', height: '100%' }}
    >
      {showOperationalPolygon && (
        <Polygon
          ref={setPolygonInstance}
          paths={activeZone.polygonPaths}
          clickable={false}
          strokeColor={hasWarningState ? '#dc2626' : '#05828e'}
          strokeOpacity={0.85}
          strokeWeight={2}
          fillColor={hasWarningState ? '#ef4444' : '#05828e'}
          fillOpacity={0.09}
        />
      )}

      {mappableGroups.map((group, idx) => {
        const coord = resolvedCoords[group.key];
        const isSelected = selectedKey === group.key;
        const isHovered = hoveredKey === group.key;
        const isOutside = Boolean(outsideAreaMap[group.key]);
        const zIndex = isSelected ? 1000 : isHovered ? 900 : idx + 1;

        return (
          <LocationMarkerItem
            key={group.key}
            group={group}
            coord={coord}
            isSelected={isSelected}
            isHovered={isHovered}
            isOutsideOperationalArea={isOutside}
            zIndex={zIndex}
            onHoverChange={setHoveredKey}
            onSelect={(g, marker) => {
              onPickCoord(null);
              onSelectKey(g.key);
              setAnchoredState({ key: g.key, marker });
            }}
          />
        );
      })}

      {pickedCoord && (
        <>
          <AdvancedMarker
            position={pickedCoord}
            zIndex={1100}
            title={
              isPickedInside
                ? 'Titik koordinat dalam area operasional SAPA'
                : 'Lokasi di luar area operasional'
            }
          >
            <Pin
              background={isPickedInside === false ? '#dc2626' : '#05828e'}
              borderColor="#ffffff"
              glyphColor="#ffffff"
              scale={1.2}
            />
          </AdvancedMarker>
          <InfoWindow
            position={pickedCoord}
            pixelOffset={[0, -28]}
            maxWidth={290}
            onCloseClick={() => onPickCoord(null)}
          >
            <div className="bg-white text-slate-800 p-1 min-w-[210px] font-['Plus_Jakarta_Sans',sans-serif]">
              {isPickedInside === false ? (
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-extrabold text-rose-700 leading-snug">
                      Lokasi di luar area operasional
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      Titik ini berada di luar poligon cakupan{' '}
                      <span className="font-semibold">{activeZone.shortLabel}</span>.
                    </p>
                    <p className="text-[10px] font-mono text-slate-500 mt-1 tabular-nums">
                      {pickedCoord.lat.toFixed(5)}, {pickedCoord.lng.toFixed(5)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-extrabold text-emerald-700 leading-snug">
                      Titik Dalam Area Operasional
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      Koordinat berada di dalam poligon cakupan{' '}
                      <span className="font-semibold">{activeZone.shortLabel}</span>.
                    </p>
                    <p className="text-[10px] font-mono text-slate-500 mt-1 tabular-nums">
                      {pickedCoord.lat.toFixed(5)}, {pickedCoord.lng.toFixed(5)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </InfoWindow>
        </>
      )}

      {selectedGroup && selectedCoord && (
        <InfoWindow
          anchor={
            anchoredState && anchoredState.key === selectedGroup.key
              ? anchoredState.marker
              : undefined
          }
          position={
            anchoredState && anchoredState.key === selectedGroup.key
              ? undefined
              : { lat: selectedCoord.lat, lng: selectedCoord.lng }
          }
          pixelOffset={[0, -6]}
          maxWidth={340}
          onCloseClick={() => {
            onSelectKey(null);
            setAnchoredState(null);
          }}
        >
          {/* Force crisp light surface inside Google Maps InfoWindow so dark-mode global classes never lower contrast */}
          <div className="bg-white text-slate-800 p-1 min-w-[240px] max-w-[310px] font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="border-b border-slate-100 pb-2 mb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                    {selectedGroup.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {selectedCoord.formattedAddress}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-[#05828e] bg-teal-50 px-1.5 py-0.5 rounded shrink-0 tabular-nums">
                  {selectedGroup.projects.length} proyek
                </span>
              </div>
              {isSelectedOutside && (
                <div className="mt-1.5 px-2 py-1 rounded-md bg-rose-50 border border-rose-200 flex items-center gap-1.5 text-[11px] font-bold text-rose-700">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Lokasi di luar area operasional</span>
                </div>
              )}
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
              {selectedGroup.projects.map((proj) => {
                const bucket = getStatusBucket(proj.status);
                const statusColor =
                  bucket === 'ongoing'
                    ? 'text-[#05828e]'
                    : bucket === 'waitingAcc'
                    ? 'text-amber-600'
                    : 'text-emerald-600';
                const dotColor =
                  bucket === 'ongoing'
                    ? 'bg-[#05828e]'
                    : bucket === 'waitingAcc'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500';

                return (
                  <div
                    key={proj.id}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {proj.namaKegiatan}
                      </p>
                      <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded shrink-0">
                        {proj.divisi}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                      <span className="truncate">{proj.tanggal}</span>
                      <span className={`inline-flex items-center gap-1 font-semibold shrink-0 ${statusColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        {proj.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => onViewDetail(proj)}
                        className="flex-1 text-[11px] font-semibold px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                      >
                        Detail
                      </button>
                      {onViewReport && (
                        <button
                          type="button"
                          onClick={() => onViewReport(proj)}
                          className="flex-1 text-[11px] font-semibold px-2 py-1 rounded bg-[#05828e] hover:bg-[#046d77] text-white transition-colors cursor-pointer inline-flex items-center justify-center gap-1"
                        >
                          <span>Report</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onSelectLocationFilter(selectedGroup.label)}
              className="mt-2.5 w-full py-1.5 px-2.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#05828e] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Filter className="w-3 h-3" />
              <span>Filter Tabel untuk Lokasi Ini</span>
            </button>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export const ProjectLocationMap: React.FC<ProjectLocationMapProps> = ({
  projects,
  totalProjectsCount,
  isDark = false,
  activeSearchQuery = '',
  onSelectLocationFilter,
  onViewDetail,
  onViewReport,
}) => {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim() || '';

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSE_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [fitAllTrigger, setFitAllTrigger] = useState(0);
  const [coverageZoneId, setCoverageZoneId] = useState<SapaCoverageZoneId>('nasional');
  const [showOperationalPolygon, setShowOperationalPolygon] = useState(true);
  const [focusZoneTrigger, setFocusZoneTrigger] = useState(0);
  const [pickedCoord, setPickedCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [pickedIsInside, setPickedIsInside] = useState<boolean | null>(null);
  const [outsideAreaKeys, setOutsideAreaKeys] = useState<Record<string, boolean>>({});
  const [resolvedCoords, setResolvedCoords] = useState<Record<string, CachedGeocodeEntry>>(() =>
    readGeocodeCache()
  );
  const [resolutionState, setResolutionState] = useState<{
    isResolving: boolean;
    failedKeys: string[];
  }>({ isResolving: false, failedKeys: [] });

  const activeZone = useMemo(
    () => getCoverageZoneById(coverageZoneId),
    [coverageZoneId]
  );

  const handleZoneChange = (nextZoneId: SapaCoverageZoneId) => {
    setCoverageZoneId(nextZoneId);
    setFocusZoneTrigger((c) => c + 1);
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const { physicalGroups, onlineProjects } = useMemo(() => {
    const groupMap: Record<string, LocationGroup> = {};
    const virtualList: ProjectItem[] = [];

    projects.forEach((proj) => {
      if (isVirtualLocation(proj)) {
        virtualList.push(proj);
        return;
      }

      const rawLabel = (proj.lokasi || proj.lokasiKegiatan || proj.kotaKabupaten || '').trim();
      const key = normalizeLocationKey(rawLabel);
      const bucket = getStatusBucket(proj.status);

      if (!groupMap[key]) {
        const hasIndonesiaHint = /indonesia/i.test(rawLabel);
        groupMap[key] = {
          key,
          label: rawLabel,
          queryText: hasIndonesiaHint ? rawLabel : `${rawLabel}, Indonesia`,
          projects: [],
          primaryStatus: bucket === 'ongoing' ? 'Ongoing' : bucket === 'waitingAcc' ? 'Waiting Acc' : 'Done',
          counts: { ongoing: 0, waitingAcc: 0, done: 0 },
        };
      }

      groupMap[key].projects.push(proj);
      groupMap[key].counts[bucket] += 1;

      if (groupMap[key].counts.ongoing > 0) {
        groupMap[key].primaryStatus = 'Ongoing';
      } else if (groupMap[key].counts.waitingAcc > 0) {
        groupMap[key].primaryStatus = 'Waiting Acc';
      } else {
        groupMap[key].primaryStatus = 'Done';
      }
    });

    const groups = Object.values(groupMap).sort(
      (a, b) => b.projects.length - a.projects.length || a.label.localeCompare(b.label)
    );

    return { physicalGroups: groups, onlineProjects: virtualList };
  }, [projects]);

  const handleCoordsResolved = useCallback((nextEntries: Record<string, CachedGeocodeEntry>) => {
    setResolvedCoords((prev) => {
      const merged = { ...prev, ...nextEntries };
      writeGeocodeCache(merged);
      return merged;
    });
  }, []);

  const handleRefreshCoordinates = () => {
    try {
      localStorage.removeItem(CACHE_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setResolvedCoords({});
    setSelectedKey(null);
  };

  const mappedPhysicalProjectsCount = useMemo(
    () => physicalGroups.reduce((acc, g) => acc + g.projects.length, 0),
    [physicalGroups]
  );

  const resolvedLocationCount = useMemo(
    () => physicalGroups.filter((g) => Boolean(resolvedCoords[g.key])).length,
    [physicalGroups, resolvedCoords]
  );

  const isOnlineFiltered = activeSearchQuery.trim().toLowerCase() === 'online';

  return (
    <section
      aria-label="Peta Persebaran Proyek SAPA"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors"
    >
      {/* Header Bar */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#05828e] dark:text-teal-400 flex items-center justify-center shrink-0">
            <MapPin className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Peta Persebaran Lokasi Proyek SAPA
              </h2>
              {resolutionState.isResolving && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#05828e] dark:text-teal-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Memetakan titik lokasi...
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
              {mappedPhysicalProjectsCount} proyek lokasi fisik ({physicalGroups.length} titik wilayah) ·{' '}
              {onlineProjects.length} proyek Online/Virtual
              {projects.length !== totalProjectsCount && (
                <span className="text-[#05828e] dark:text-teal-400 font-semibold">
                  {' '}
                  · Menampilkan {projects.length} dari {totalProjectsCount} proyek
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Map Controls & Legend */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Compact Status Legend */}
          <div className="hidden lg:flex items-center gap-3 mr-2 text-[11px] font-medium text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#05828e]" />
              Ongoing
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Waiting Acc
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Done
            </span>
          </div>

          {!isCollapsed && apiKey && resolvedLocationCount > 0 && (
            <>
              <button
                type="button"
                onClick={() => setFitAllTrigger((c) => c + 1)}
                title="Tampilkan seluruh titik proyek di peta"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#05828e] dark:text-teal-400" />
                <span className="hidden sm:inline">Pas-kan Titik</span>
              </button>
              <button
                type="button"
                onClick={handleRefreshCoordinates}
                title="Muat ulang koordinat lokasi dari Google Maps"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <button
            type="button"
            id="btn-toggle-project-map"
            onClick={toggleCollapse}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <span>{isCollapsed ? 'Tampilkan Peta' : 'Tutup Peta'}</span>
            {isCollapsed ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Body */}
      {!isCollapsed && (
        <div>
          {/* Operational Coverage Polygon Controls & Warning Banner */}
          <div className="px-4 sm:px-5 py-2.5 bg-slate-50/80 dark:bg-slate-900/70 border-b border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <label
                  htmlFor="project-map-coverage-zone"
                  className="inline-flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300"
                >
                  <Layers className="w-3.5 h-3.5 text-[#05828e] dark:text-teal-400" />
                  <span>Poligon Operasional:</span>
                </label>
                <select
                  id="project-map-coverage-zone"
                  value={coverageZoneId}
                  onChange={(e) => handleZoneChange(e.target.value as SapaCoverageZoneId)}
                  className="h-8 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#05828e] cursor-pointer"
                >
                  {SAPA_COVERAGE_ZONES.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.label}
                    </option>
                  ))}
                </select>
                <label className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 cursor-pointer select-none ml-1">
                  <input
                    id="toggle-operational-polygon"
                    type="checkbox"
                    checked={showOperationalPolygon}
                    onChange={(e) => setShowOperationalPolygon(e.target.checked)}
                    className="rounded border-slate-300 text-[#05828e] focus:ring-[#05828e] cursor-pointer"
                  />
                  <span>Tampilkan poligon</span>
                </label>
                {apiKey && (
                  <button
                    type="button"
                    onClick={() => setFocusZoneTrigger((c) => c + 1)}
                    className="text-[#05828e] dark:text-teal-400 hover:underline font-semibold cursor-pointer"
                  >
                    Fokus Area
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                {Object.keys(outsideAreaKeys).length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/70 text-rose-700 dark:text-rose-300 font-semibold tabular-nums">
                    <ShieldAlert className="w-3 h-3 shrink-0" />
                    {Object.keys(outsideAreaKeys).length} titik proyek di luar area
                  </span>
                )}
                <span>Klik peta untuk uji koordinat terhadap poligon operasional</span>
              </div>
            </div>

            {pickedCoord && pickedIsInside !== null && (
              <div
                id={pickedIsInside ? 'project-map-inside-status' : 'project-map-outside-warning'}
                role={pickedIsInside ? 'status' : 'alert'}
                className={`rounded-xl px-3.5 py-2 border flex flex-wrap items-center justify-between gap-2 text-xs ${
                  pickedIsInside
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/35 border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50/95 dark:bg-rose-950/45 border-rose-300 dark:border-rose-800/80 text-rose-800 dark:text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {pickedIsInside ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="font-bold">
                      {pickedIsInside
                        ? `Titik berada di dalam area operasional (${activeZone.shortLabel})`
                        : 'Lokasi di luar area operasional'}
                    </span>
                    <span className="ml-2 font-mono text-[11px] opacity-85 tabular-nums">
                      ({pickedCoord.lat.toFixed(5)}, {pickedCoord.lng.toFixed(5)})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!pickedIsInside && apiKey && (
                    <button
                      type="button"
                      onClick={() => setFocusZoneTrigger((c) => c + 1)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 text-[11px] font-semibold hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Pusatkan ke Area
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPickedCoord(null)}
                    className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Hapus titik uji koordinat"
                    title="Hapus titik"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Interactive Google Map Canvas */}
            <div className="lg:col-span-8 h-[360px] sm:h-[420px] relative bg-slate-100 dark:bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
              {!apiKey ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                  <Globe className="w-10 h-10 text-slate-400 mb-3" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Kunci API Google Maps belum tersedia
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                    Pastikan variabel <code className="font-mono">VITE_GOOGLE_MAPS_API_KEY</code> terkonfigurasi agar peta interaktif Google Maps Platform dapat ditampilkan.
                  </p>
                </div>
              ) : (
                <APIProvider
                  apiKey={apiKey}
                  language="id"
                  region="ID"
                  libraries={['places', 'marker', 'geocoding', 'core', 'geometry']}
                  internalUsageAttributionIds={ATTRIBUTION_IDS}
                >
                  <InnerMapCanvas
                    locationGroups={physicalGroups}
                    resolvedCoords={resolvedCoords}
                    isDark={isDark}
                    selectedKey={selectedKey}
                    onSelectKey={setSelectedKey}
                    onCoordsResolved={handleCoordsResolved}
                    onResolutionStateChange={setResolutionState}
                    onSelectLocationFilter={onSelectLocationFilter}
                    onViewDetail={onViewDetail}
                    onViewReport={onViewReport}
                    fitAllTrigger={fitAllTrigger}
                    activeZone={activeZone}
                    showOperationalPolygon={showOperationalPolygon}
                    focusZoneTrigger={focusZoneTrigger}
                    pickedCoord={pickedCoord}
                    onPickCoord={setPickedCoord}
                    onPickedInsideChange={setPickedIsInside}
                    onOutsideKeysChange={setOutsideAreaKeys}
                  />
                </APIProvider>
              )}
            </div>

            {/* Right Panel: Interactive Physical Location List + Online Summary */}
            <div className="lg:col-span-4 h-[360px] sm:h-[420px] flex flex-col bg-slate-50/50 dark:bg-slate-900/60">
              <div className="px-4 py-2.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Lokasi Fisik ({physicalGroups.length})
                </span>
                {activeSearchQuery && (
                  <button
                    type="button"
                    onClick={() => onSelectLocationFilter('')}
                    className="text-[11px] font-semibold text-[#05828e] dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {physicalGroups.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="w-6 h-6 text-slate-400 mb-2" />
                    <p>Tidak ada proyek lokasi fisik yang sesuai dengan filter saat ini.</p>
                  </div>
                ) : (
                  physicalGroups.map((group) => {
                    const coord = resolvedCoords[group.key];
                    const isSelected = selectedKey === group.key;
                    const isFailed = resolutionState.failedKeys.includes(group.key);
                    const isOutside = Boolean(outsideAreaKeys[group.key]);
                    const dotClass = isOutside
                      ? 'bg-rose-600'
                      : group.primaryStatus === 'Ongoing'
                      ? 'bg-[#05828e]'
                      : group.primaryStatus === 'Waiting Acc'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500';

                    return (
                      <div
                        key={group.key}
                        className={`rounded-xl border p-3 transition-colors ${
                          isSelected
                            ? isOutside
                              ? 'bg-rose-50/70 dark:bg-rose-950/35 border-rose-500'
                              : 'bg-teal-50/70 dark:bg-teal-950/40 border-[#05828e] dark:border-teal-500'
                            : isOutside
                            ? 'bg-white dark:bg-slate-800/80 border-rose-300/80 dark:border-rose-800/70 hover:border-rose-400'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200/90 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setPickedCoord(null);
                            setSelectedKey(group.key);
                          }}
                          className="w-full text-left cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0">
                              <span
                                className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${dotClass}`}
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                  {group.label}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                  {coord
                                    ? coord.formattedAddress
                                    : isFailed
                                    ? 'Alamat belum ditemukan di Maps'
                                    : 'Menunggu koordinat...'}
                                </p>
                                {isOutside && (
                                  <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-0.5 inline-flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3 shrink-0" />
                                    Lokasi di luar area operasional
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 tabular-nums shrink-0">
                              {group.projects.length} proyek
                            </span>
                          </div>

                        <div className="mt-2 pl-4 space-y-1">
                          {group.projects.slice(0, 2).map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-300"
                            >
                              <span className="truncate font-medium">• {p.namaKegiatan}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                                {p.divisi}
                              </span>
                            </div>
                          ))}
                          {group.projects.length > 2 && (
                            <p className="text-[10px] text-[#05828e] dark:text-teal-400 font-semibold">
                              +{group.projects.length - 2} proyek lainnya
                            </p>
                          )}
                        </div>
                      </button>

                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/70 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedKey(group.key)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-[#05828e] dark:hover:text-teal-400 cursor-pointer"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Fokus Peta</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectLocationFilter(group.label)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#05828e] dark:text-teal-400 hover:underline cursor-pointer"
                        >
                          <Filter className="w-3 h-3" />
                          <span>Filter Tabel</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Online / Virtual Projects Footer */}
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <Wifi className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate tabular-nums">
                    {onlineProjects.length} Proyek Online / Virtual
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    Zoom, YouTube Live, &amp; Kampanye Daring
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectLocationFilter(isOnlineFiltered ? '' : 'Online')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                  isOnlineFiltered
                    ? 'bg-[#05828e] text-white'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {isOnlineFiltered ? 'Reset' : 'Filter Online'}
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
    </section>
  );
};
