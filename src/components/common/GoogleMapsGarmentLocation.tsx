import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { ComprehensiveLocation } from './ColombianLocationSelector';
import { COLOMBIA_DEPARTMENTS } from '../../data/colombiaData';

const MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
  'AIzaSyDgflwcMCajctxcjQ706zyyFdXiP4zdEyA';

// Default center: Colombia (Medellín geographic hub)
const DEFAULT_CENTER = { lat: 6.2442, lng: -75.5812 };

interface GoogleMapsGarmentLocationProps {
  initialLocation?: Partial<ComprehensiveLocation>;
  onChange: (loc: ComprehensiveLocation) => void;
  required?: boolean;
}

// Inner component to handle map camera movements and marker interactions
const MapCameraUpdater: React.FC<{
  position: { lat: number; lng: number };
  zoom?: number;
}> = ({ position, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(position);
      if (zoom) {
        map.setZoom(zoom);
      }
    }
  }, [map, position, zoom]);
  return null;
};

export const GoogleMapsGarmentLocation: React.FC<GoogleMapsGarmentLocationProps> = ({
  initialLocation,
  onChange,
  required = true,
}) => {
  const [searchInput, setSearchInput] = useState(
    initialLocation?.displayLocation || ''
  );
  const [suggestions, setSuggestions] = useState<
    Array<{ placeId: string; description: string; mainText: string; secondaryText: string }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Marker & Map Coordinates (used internally only - never shown as numbers to user)
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number }>(
    DEFAULT_CENTER
  );
  const [mapZoom, setMapZoom] = useState<number>(14);

  // Address State
  const [confirmedAddress, setConfirmedAddress] = useState<string>(
    initialLocation?.displayLocation ||
      initialLocation?.exactAddress ||
      'Medellín, Antioquia, Colombia'
  );
  const [department, setDepartment] = useState<string>(
    initialLocation?.department || 'Antioquia'
  );
  const [municipality, setMunicipality] = useState<string>(
    initialLocation?.municipality || 'Medellín'
  );
  const [neighborhood, setNeighborhood] = useState<string>(
    initialLocation?.neighborhoodOrVereda || ''
  );
  const [exactAddress, setExactAddress] = useState<string>(
    initialLocation?.exactAddress || ''
  );

  // Available municipalities for selected department
  const availableMunicipalities = useMemo(() => {
    const found = COLOMBIA_DEPARTMENTS.find(
      (d) => d.name.toLowerCase() === department.toLowerCase() || d.id === department.toLowerCase()
    );
    return found ? found.municipalities : [];
  }, [department]);

  // Handle manual change in cascading dropdowns
  const handleDepartmentChange = (newDept: string) => {
    setDepartment(newDept);
    const found = COLOMBIA_DEPARTMENTS.find((d) => d.name === newDept);
    const newMuni = found && found.municipalities.length > 0 ? found.municipalities[0] : '';
    setMunicipality(newMuni);
    const displayStr = [neighborhood, newMuni, newDept].filter(Boolean).join(', ');
    setConfirmedAddress(displayStr);
    setSearchInput(displayStr);
    syncLocation(displayStr, newDept, newMuni, neighborhood, exactAddress);
  };

  const handleMunicipalityChange = (newMuni: string) => {
    setMunicipality(newMuni);
    const displayStr = [neighborhood, newMuni, department].filter(Boolean).join(', ');
    setConfirmedAddress(displayStr);
    setSearchInput(displayStr);
    syncLocation(displayStr, department, newMuni, neighborhood, exactAddress);
  };

  const handleNeighborhoodChange = (newHood: string) => {
    setNeighborhood(newHood);
    const displayStr = [newHood, municipality, department].filter(Boolean).join(', ');
    setConfirmedAddress(displayStr);
    syncLocation(displayStr, department, municipality, newHood, exactAddress);
  };

  // Status & Feedback States
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'info' | 'success' | 'error';
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<any>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Sync state to parent
  const syncLocation = useCallback(
    (
      newDisplayAddress: string,
      newDept: string,
      newMuni: string,
      newHood: string,
      newExact: string
    ) => {
      const publicZone = [newHood, newMuni, newDept]
        .filter(Boolean)
        .join(', ') || newMuni || 'Colombia';

      const payload: ComprehensiveLocation = {
        country: 'Colombia',
        department: newDept,
        municipality: newMuni,
        localityOrComuna: newHood,
        neighborhoodOrVereda: newHood,
        exactAddress: newExact,
        displayLocation: newDisplayAddress,
        publicLocation: publicZone,
      };

      onChange(payload);
    },
    [onChange]
  );

  // Reverse Geocoding helper with Colombian territorial parsing (urban barrios vs rural veredas/corregimientos)
  const performReverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    setStatusMessage({ text: 'Identificando territorio en Colombia...', type: 'info' });

    // 1. Try backend reverse geocoding proxy first (with Google Maps & Nominatim countrycodes=co fallback)
    try {
      const res = await fetch(`/api/maps/reverse-geocode?lat=${lat}&lng=${lng}`);
      const data = await res.json();

      if (data.success && (data.displayLocation || data.municipality)) {
        const city = data.municipality || 'Medellín';
        const dept = data.department || 'Antioquia';
        const sector = data.neighborhood || '';
        
        let readable = data.displayLocation;
        if (!readable || readable.includes('Unnamed') || !readable.includes(city)) {
          readable = sector ? `${sector}, ${city}, ${dept}` : `${city}, ${dept}`;
        }

        setConfirmedAddress(readable);
        setDepartment(dept);
        setMunicipality(city);
        setNeighborhood(sector);
        setExactAddress(data.exactAddress || '');

        syncLocation(
          readable,
          dept,
          city,
          sector,
          data.exactAddress || ''
        );

        setStatusMessage({
          text: `Ubicación detectada: ${readable}`,
          type: 'success',
        });
        return readable;
      }
    } catch (err) {
      console.warn('Backend reverse-geocode failed, trying direct OpenStreetMap Nominatim with countrycodes=co:', err);
    }

    // 2. Direct OpenStreetMap Nominatim Geocoding with countrycodes=co
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=es&countrycodes=co`;
      const nomRes = await fetch(nomUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (nomRes.ok) {
        const nomData = await nomRes.json();
        const addr = nomData.address || {};
        const city = addr.city || addr.town || addr.municipality || addr.county || 'Medellín';
        const dept = addr.state || addr.region || 'Antioquia';
        
        // Detección territorial de Colombia: Zona rural (Vereda / Corregimiento) vs Zona urbana (Barrio / Localidad)
        const ruralPlace = addr.hamlet || addr.isolated_dwelling || addr.farm || (addr.village && addr.village !== city ? addr.village : '');
        const urbanPlace = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || addr.residential || '';

        let sector = '';
        let readable = '';

        if (ruralPlace) {
          // Zona rural: "[Vereda / Corregimiento], [Municipio], [Departamento]" (Ej. "Vereda El Tablazo, Rionegro, Antioquia")
          const isPrefixed = ruralPlace.toLowerCase().includes('vereda') || ruralPlace.toLowerCase().includes('corregimiento');
          sector = isPrefixed ? ruralPlace : `Vereda ${ruralPlace}`;
          readable = `${sector}, ${city}, ${dept}`;
        } else if (urbanPlace) {
          // Zona urbana: "[Barrio / Localidad], [Municipio/Ciudad], [Departamento]" (Ej. "El Poblado, Medellín, Antioquia")
          sector = urbanPlace;
          readable = `${sector}, ${city}, ${dept}`;
        } else {
          readable = `${city}, ${dept}`;
        }

        const road = addr.road || '';
        const houseNum = addr.house_number ? `# ${addr.house_number}` : '';
        const exact = [road, houseNum].filter(Boolean).join(' ').trim();

        setConfirmedAddress(readable);
        setDepartment(dept);
        setMunicipality(city);
        setNeighborhood(sector);
        setExactAddress(exact);

        syncLocation(readable, dept, city, sector, exact);

        setStatusMessage({
          text: `Ubicación detectada: ${readable}`,
          type: 'success',
        });
        return readable;
      }
    } catch (nomErr) {
      console.warn('Client-side Nominatim reverse geocode error:', nomErr);
    }

    setStatusMessage({
      text: 'No pudimos obtener tu posición. Puedes escribir tu ubicación manualmente.',
      type: 'error',
    });
    return null;
  };

  // GPS Button: «📍 Usar mi ubicación actual»
  const handleUseCurrentLocation = () => {
    // 1. Verificar soporte de geolocalización en el navegador
    if (!navigator.geolocation) {
      setIsLocatingGps(false);
      setStatusMessage({
        text: 'No pudimos obtener tu posición. Puedes escribir tu ubicación manualmente.',
        type: 'error',
      });
      return;
    }

    // 2. Activar estado de carga (loader con "Obteniendo ubicación...")
    setIsLocatingGps(true);
    setStatusMessage(null);

    // 3. Llamar a navigator.geolocation.getCurrentPosition
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          setMarkerPosition({ lat: latitude, lng: longitude });
          setMapZoom(16);

          // Geocodificación inversa con niveles territoriales de Colombia (país: CO)
          const readableAddress = await performReverseGeocode(latitude, longitude);

          // Asignar automáticamente el texto detallado al campo de texto del formulario
          if (readableAddress) {
            setSearchInput(readableAddress);
          }
        } catch (err) {
          console.error('Error procesando ubicación detectada:', err);
          setStatusMessage({
            text: 'No pudimos obtener tu posición. Puedes escribir tu ubicación manualmente.',
            type: 'error',
          });
        } finally {
          setIsLocatingGps(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        // Si el usuario rechaza los permisos o falla la señal GPS:
        // Desactiva el loader y muestra advertencia amigable
        setIsLocatingGps(false);
        setStatusMessage({
          text: 'No pudimos obtener tu posición. Puedes escribir tu ubicación manualmente.',
          type: 'error',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Autocomplete / Manual input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    setConfirmedAddress(val || 'Colombia');

    // Permite escribir manualmente en el input sin bloquear el formulario
    syncLocation(val, department || 'Antioquia', municipality || 'Medellín', neighborhood, exactAddress);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/maps/places-autocomplete?input=${encodeURIComponent(val)}`
        );
        const data = await res.json();
        if (data.success && data.predictions) {
          setSuggestions(data.predictions);
          setShowDropdown(data.predictions.length > 0);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.warn('Autocomplete fetch failed, allowing manual input:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);
  };

  // Selecting a suggestion
  const handleSelectSuggestion = async (sug: {
    placeId: string;
    description: string;
    mainText: string;
  }) => {
    setSearchInput(sug.description);
    setShowDropdown(false);
    setStatusMessage({ text: 'Cargando detalles de la dirección...', type: 'info' });

    try {
      const res = await fetch(
        `/api/maps/place-details?place_id=${encodeURIComponent(sug.placeId)}`
      );
      const data = await res.json();

      if (data.success && data.location) {
        const newCoords = { lat: data.location.lat, lng: data.location.lng };
        setMarkerPosition(newCoords);
        setMapZoom(16);

        setConfirmedAddress(data.displayLocation || sug.description);
        setDepartment(data.department || 'Antioquia');
        setMunicipality(data.municipality || 'Medellín');
        setNeighborhood(data.neighborhood || '');
        setExactAddress(data.exactAddress || '');

        syncLocation(
          data.displayLocation || sug.description,
          data.department || 'Antioquia',
          data.municipality || 'Medellín',
          data.neighborhood || '',
          data.exactAddress || ''
        );

        setStatusMessage({
          text: `Dirección seleccionada: ${data.displayLocation || sug.description}`,
          type: 'success',
        });
      } else {
        setConfirmedAddress(sug.description);
        syncLocation(sug.description, department, municipality, neighborhood, exactAddress);
      }
    } catch (err) {
      console.error('Error fetching place details:', err);
      setConfirmedAddress(sug.description);
      syncLocation(sug.description, department, municipality, neighborhood, exactAddress);
    }
  };

  // Map Click or Marker Drag to adjust location
  const handleMapClick = (e: any) => {
    if (e.detail?.latLng) {
      const lat = e.detail.latLng.lat;
      const lng = e.detail.latLng.lng;
      setMarkerPosition({ lat, lng });
      performReverseGeocode(lat, lng);
    }
  };

  const handleMarkerDragEnd = (e: any) => {
    if (e.latLng) {
      const lat = typeof e.latLng.lat === 'function' ? e.latLng.lat() : e.latLng.lat;
      const lng = typeof e.latLng.lng === 'function' ? e.latLng.lng() : e.latLng.lng;
      setMarkerPosition({ lat, lng });
      performReverseGeocode(lat, lng);
    }
  };

  return (
    <div ref={containerRef} className="space-y-4">
      {/* 1. INTERFAZ CON COBERTURA NACIONAL (DEPARTAMENTOS, CIUDADES, BARRIOS, VEREDAS) */}
      <div className="space-y-1.5">
        {/* Label: «Ubicación de la prenda (Colombia)» */}
        <label
          htmlFor="input-ubicacion-prenda"
          className="block text-xs font-bold text-[#012d1d] dark:text-[#b0f1cc]"
        >
          Ubicación de la prenda (Colombia) {required && <span className="text-[#ba1a1a] dark:text-[#ffb4ab]">*</span>}
        </label>

        {/* Doble opción: Input inteligente + Botón de geolocalización [ 📍 Usar mi ubicación actual ] */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* CAMPO DE ENTRADA / AUTOCOMPLETADO (Input inteligente): type text, placeholder "Ej. Antioquia, Medellín, El Poblado / Vereda El Salado" */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2b694d] dark:text-[#b0f1cc] text-lg pointer-events-none">
              location_on
            </span>
            <input
              id="input-ubicacion-prenda"
              name="ubicacionPrenda"
              type="text"
              value={searchInput}
              onChange={handleInputChange}
              onFocus={() => {
                if (suggestions.length > 0) setShowDropdown(true);
              }}
              placeholder="Ej. Antioquia, Medellín, El Poblado / Vereda El Salado"
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#c1c8c2] dark:border-[#2b694d]/50 bg-white dark:bg-[#112920] text-xs text-[#1b1c19] dark:text-white placeholder-[#717973] dark:placeholder-[#a7b8ae]/60 focus:border-[#012d1d] dark:focus:border-[#b0f1cc] focus:ring-1 focus:ring-[#012d1d] outline-none transition-all shadow-2xs font-medium"
            />
            {isSearching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#717973] font-medium animate-pulse">
                Buscando...
              </span>
            )}
            {!isSearching && searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSuggestions([]);
                  setShowDropdown(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#717973] hover:text-[#1b1c19] dark:hover:text-white"
                title="Borrar texto"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Subtexto indicativo: "Válido para cualquier departamento, municipio, barrio o vereda de Colombia." */}
        <p className="text-[11px] text-[#717973] dark:text-[#a7b8ae] mt-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs text-[#2b694d] dark:text-[#b0f1cc]">info</span>
          <span>Válido para cualquier departamento, municipio, barrio o vereda de Colombia.</span>
        </p>

        {/* Selector Multinivel Jerárquico Inteligente (Cascading Dropdowns) */}
        <div className="p-3.5 rounded-2xl bg-[#faf9f4] dark:bg-[#112920] border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#012d1d] dark:text-[#b0f1cc]">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-[#2b694d]">account_tree</span>
              <span>Selector territorial estructurado (Colombia)</span>
            </span>
            <span className="text-[10px] text-[#717973] dark:text-[#a7b8ae] font-normal">
              Jerarquía en cascada
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 1. Departamento */}
            <div>
              <label className="block text-[11px] font-bold text-[#414844] dark:text-[#a7b8ae] mb-1">
                Departamento *
              </label>
              <select
                value={department}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-[#c1c8c2] dark:border-[#2b694d]/50 bg-white dark:bg-[#0e241c] text-xs text-[#1b1c19] dark:text-white font-medium outline-none cursor-pointer focus:border-[#012d1d]"
              >
                {COLOMBIA_DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Municipio / Ciudad */}
            <div>
              <label className="block text-[11px] font-bold text-[#414844] dark:text-[#a7b8ae] mb-1">
                Municipio / Ciudad *
              </label>
              {availableMunicipalities.length > 0 ? (
                <select
                  value={municipality}
                  onChange={(e) => handleMunicipalityChange(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-[#c1c8c2] dark:border-[#2b694d]/50 bg-white dark:bg-[#0e241c] text-xs text-[#1b1c19] dark:text-white font-medium outline-none cursor-pointer focus:border-[#012d1d]"
                >
                  {availableMunicipalities.map((muni, idx) => (
                    <option key={idx} value={muni}>
                      {muni}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={municipality}
                  onChange={(e) => handleMunicipalityChange(e.target.value)}
                  placeholder="Ciudad o municipio"
                  className="w-full px-2.5 py-2 rounded-xl border border-[#c1c8c2] dark:border-[#2b694d]/50 bg-white dark:bg-[#0e241c] text-xs text-[#1b1c19] dark:text-white font-medium outline-none focus:border-[#012d1d]"
                />
              )}
            </div>

            {/* 3. Barrio / Vereda / Dirección aproximada */}
            <div>
              <label className="block text-[11px] font-bold text-[#414844] dark:text-[#a7b8ae] mb-1">
                Barrio / Vereda / Zona
              </label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => handleNeighborhoodChange(e.target.value)}
                placeholder="Ej. El Poblado o Vereda El Salado"
                className="w-full px-2.5 py-2 rounded-xl border border-[#c1c8c2] dark:border-[#2b694d]/50 bg-white dark:bg-[#0e241c] text-xs text-[#1b1c19] dark:text-white font-medium outline-none focus:border-[#012d1d]"
              />
            </div>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="relative">
            <div className="absolute left-0 right-0 top-1 bg-white dark:bg-[#0e241c] border border-[#c1c8c2] dark:border-[#2b694d]/60 rounded-xl shadow-xl z-40 max-h-56 overflow-y-auto py-1">
              <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#717973] dark:text-[#a7b8ae] border-b border-[#efeee9] dark:border-[#2b694d]/30 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-[#2b694d] dark:text-[#b0f1cc]">
                    map
                  </span>
                  Sugerencias de direcciones
                </span>
                <span>{suggestions.length} resultados</span>
              </div>
              {suggestions.map((sug) => (
                <button
                  key={sug.placeId}
                  type="button"
                  onClick={() => handleSelectSuggestion(sug)}
                  className="w-full text-left px-3.5 py-2 text-xs hover:bg-[#b0f1cc]/20 dark:hover:bg-[#17382c] text-[#1b1c19] dark:text-white flex items-start gap-2.5 border-b border-[#efeee9]/60 dark:border-[#2b694d]/20 last:border-0 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base text-[#2b694d] dark:text-[#b0f1cc] mt-0.5 shrink-0">
                    location_on
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-[#012d1d] dark:text-white truncate">
                      {sug.mainText}
                    </div>
                    {sug.secondaryText && (
                      <div className="text-[11px] text-[#717973] dark:text-[#a7b8ae] truncate">
                        {sug.secondaryText}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status banner (friendly feedback, no coordinates) */}
      {statusMessage && (
        <div
          className={`p-2.5 rounded-xl text-xs flex items-center gap-2 transition-all ${
            statusMessage.type === 'success'
              ? 'bg-[#b0f1cc]/30 text-[#012d1d] dark:bg-[#17382c] dark:text-[#b0f1cc] border border-[#2b694d]/30'
              : statusMessage.type === 'error'
              ? 'bg-[#ffdad6]/40 text-[#ba1a1a] dark:bg-[#93000a]/20 dark:text-[#ffb4ab] border border-[#ba1a1a]/30'
              : 'bg-[#faf9f4] dark:bg-[#112920] text-[#414844] dark:text-[#a7b8ae] border border-[#c1c8c2]/40'
          }`}
        >
          <span className="material-symbols-outlined text-base shrink-0">
            {statusMessage.type === 'success'
              ? 'check_circle'
              : statusMessage.type === 'error'
              ? 'error'
              : 'info'}
          </span>
          <span className="flex-1">{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-[10px] opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Interactive Google Map Preview Box */}
      <div className="rounded-2xl overflow-hidden border border-[#c1c8c2] dark:border-[#2b694d]/50 shadow-sm bg-[#faf9f4] dark:bg-[#112920]">
        <div className="bg-[#012d1d] dark:bg-[#081a13] text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-[#b0f1cc]">explore</span>
            <span>Mapa interactivo de Google Maps</span>
          </div>
          <span className="text-[10px] text-[#b0f1cc] bg-[#002113]/50 px-2 py-0.5 rounded-full font-medium">
            Toca o arrastra para ajustar punto
          </span>
        </div>

        {/* Map Canvas Container */}
        <div className="w-full h-56 sm:h-64 relative bg-[#e5e3df]">
          <APIProvider apiKey={MAPS_API_KEY}>
            <Map
              mapId="reborn_style_map_id"
              defaultCenter={DEFAULT_CENTER}
              defaultZoom={14}
              gestureHandling="greedy"
              disableDefaultUI={false}
              fullscreenControl={false}
              streetViewControl={false}
              mapTypeControl={false}
              onClick={handleMapClick}
              style={{ width: '100%', height: '100%' }}
            >
              <MapCameraUpdater position={markerPosition} zoom={mapZoom} />
              <AdvancedMarker
                position={markerPosition}
                draggable={true}
                onDragEnd={handleMarkerDragEnd}
                title="Punto de la prenda"
              />
            </Map>
          </APIProvider>
        </div>

        {/* Instructions helper underneath map */}
        <div className="px-3.5 py-2 bg-[#f5f4ef] dark:bg-[#0e241c] text-[11px] text-[#414844] dark:text-[#a7b8ae] flex items-center justify-between border-t border-[#c1c8c2]/30 dark:border-[#2b694d]/30">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-xs text-[#2b694d] dark:text-[#b0f1cc]">
              touch_app
            </span>
            <span>Haz clic en el mapa o arrastra el marcador para ajustar la ubicación.</span>
          </div>
          <span className="text-[10px] font-bold text-[#2b694d] dark:text-[#b0f1cc] hidden sm:inline">
            Colombia
          </span>
        </div>
      </div>

      {/* Visualización de la dirección confirmada final */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#f2f8f4] to-[#e4f3ea] dark:from-[#112920] dark:to-[#0b1f17] border border-[#2b694d]/40 dark:border-[#b0f1cc]/30 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#012d1d] text-[#b0f1cc] dark:bg-[#b0f1cc] dark:text-[#002113] flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-xl">verified</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2b694d] dark:text-[#b0f1cc]">
                Dirección final confirmada para la prenda
              </span>
              <span className="text-[10px] font-semibold text-[#012d1d] dark:text-white bg-white/70 dark:bg-[#17382c] px-2 py-0.5 rounded-full">
                {department}
              </span>
            </div>
            <p className="font-headline text-sm font-bold text-[#012d1d] dark:text-white mt-1 break-words">
              {confirmedAddress}
            </p>

            {/* Quick breakdown tags */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              {municipality && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-[#1a382b] text-[#012d1d] dark:text-white font-medium border border-[#c1c8c2]/40 dark:border-[#2b694d]/40">
                  Municipio: <strong>{municipality}</strong>
                </span>
              )}
              {neighborhood && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-[#1a382b] text-[#012d1d] dark:text-white font-medium border border-[#c1c8c2]/40 dark:border-[#2b694d]/40">
                  Barrio / Sector: <strong>{neighborhood}</strong>
                </span>
              )}
              {exactAddress && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-[#1a382b] text-[#012d1d] dark:text-white font-medium border border-[#c1c8c2]/40 dark:border-[#2b694d]/40">
                  Vía: <strong>{exactAddress}</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
