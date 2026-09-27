import React, { useState, useEffect, useRef, useMemo } from 'react';
import { searchColombiaLocations, COLOMBIA_DEPARTMENTS } from '../../data/colombiaData';

export interface LocationResult {
  exactAddress: string; // Saved internally (private)
  publicLocation: string; // Shown publicly on the card (city / approximate zone)
  department?: string;
  municipality?: string;
  coordinates?: { lat: number; lng: number };
}

interface SimpleLocationMapPickerProps {
  initialAddress?: string;
  initialPublicLocation?: string;
  onChange: (result: LocationResult) => void;
  required?: boolean;
  className?: string;
}

// Extract approximate public zone/city from an exact address for privacy
function extractPublicZone(fullAddress: string): { publicLocation: string; department?: string; municipality?: string } {
  if (!fullAddress || !fullAddress.trim()) {
    return { publicLocation: '' };
  }

  const clean = fullAddress.trim();

  // Try to find matching department and municipality
  let foundDept = '';
  let foundMuni = '';

  for (const dept of COLOMBIA_DEPARTMENTS) {
    if (clean.toLowerCase().includes(dept.name.toLowerCase())) {
      foundDept = dept.name;
    }
    for (const muni of dept.municipalities) {
      if (clean.toLowerCase().includes(muni.toLowerCase())) {
        foundMuni = muni;
        foundDept = dept.name;
        break;
      }
    }
    if (foundMuni) break;
  }

  // Remove exact street numbers like "Cra 50 # 45-20", "Calle 10 # 4-2", "Apto 302", etc.
  const streetPattern = /(?:carrera|cra|cr|calle|cl|cll|diagonal|diag|dg|transversal|trans|tv|avenida|av|circular)\s*\d+[^,]*,?/gi;
  let zoneOnly = clean.replace(streetPattern, '').replace(/\b(?:apto|apartamento|casa|torre|bloque|int|interior)\s*\d+[^,]*,?/gi, '').trim();

  // Clean trailing/leading commas or spaces
  zoneOnly = zoneOnly.replace(/^[,\s-]+|[,\s-]+$/g, '');

  if (foundMuni && foundDept) {
    const pub = zoneOnly && zoneOnly.length > 2 && !zoneOnly.toLowerCase().startsWith('colombia')
      ? `${zoneOnly}, ${foundMuni}`
      : `${foundMuni}, ${foundDept}`;
    return { publicLocation: pub, department: foundDept, municipality: foundMuni };
  }

  if (foundMuni) {
    return { publicLocation: `${foundMuni}, Colombia`, municipality: foundMuni };
  }

  if (foundDept) {
    return { publicLocation: `${foundDept}, Colombia`, department: foundDept };
  }

  // Fallback: if user wrote a general area or city
  return { publicLocation: zoneOnly || clean };
}

export const SimpleLocationMapPicker: React.FC<SimpleLocationMapPickerProps> = ({
  initialAddress = '',
  initialPublicLocation = '',
  onChange,
  required = false,
  className = ''
}) => {
  const [addressInput, setAddressInput] = useState(initialAddress);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [markerPos, setMarkerPos] = useState<{ xPercent: number; yPercent: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapOverlayRef = useRef<HTMLDivElement>(null);

  // Close autocomplete on outside clicks
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update parent when address changes
  const updateLocation = (newAddress: string, newCoords?: { lat: number; lng: number }) => {
    setAddressInput(newAddress);
    if (newCoords) setCoords(newCoords);

    const { publicLocation, department, municipality } = extractPublicZone(newAddress);
    onChange({
      exactAddress: newAddress,
      publicLocation: publicLocation || newAddress,
      department,
      municipality,
      coordinates: newCoords || coords || undefined
    });
  };

  // Suggestions matching query
  const suggestions = useMemo(() => {
    if (!addressInput || addressInput.trim().length < 2) return [];
    return searchColombiaLocations(addressInput);
  }, [addressInput]);

  const handleSelectSuggestion = (suggestion: string) => {
    setShowDropdown(false);
    updateLocation(suggestion);
    setMarkerPos({ xPercent: 50, yPercent: 50 }); // Center pin on map
  };

  // GPS geolocation
  const handleGPS = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está disponible en este navegador.');
      return;
    }
    setIsLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setCoords(newCoords);
        setMarkerPos({ xPercent: 50, yPercent: 50 });

        const gpsLabel = `Ubicación GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)}), Colombia`;
        updateLocation(gpsLabel, newCoords);
        setIsLocatingGPS(false);
      },
      (err) => {
        console.warn('GPS Error:', err);
        setIsLocatingGPS(false);
      },
      { timeout: 7000 }
    );
  };

  // Interactive click on map to reposition marker
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = mapOverlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = Math.max(5, Math.min(95, (x / rect.width) * 100));
    const yPercent = Math.max(5, Math.min(95, (y / rect.height) * 100));

    setMarkerPos({ xPercent, yPercent });

    // Approximate Colombian region based on relative click position
    // Center: ~Bogotá/Medellín, Top: Caribe, Right: Llanos, West: Pacífico
    let adjustedLabel = addressInput || 'Medellín, Colombia';
    if (!addressInput.trim()) {
      if (yPercent < 30) adjustedLabel = 'Barranquilla / Cartagena (Costa Caribe), Colombia';
      else if (xPercent < 45 && yPercent > 40 && yPercent < 70) adjustedLabel = 'Cali / Valle del Cauca, Colombia';
      else if (xPercent < 55 && yPercent < 50) adjustedLabel = 'Medellín / Antioquia, Colombia';
      else if (xPercent >= 50 && yPercent >= 45 && yPercent <= 65) adjustedLabel = 'Bogotá D.C., Colombia';
      else adjustedLabel = 'Colombia';
    } else if (!adjustedLabel.includes('Punto ajustado')) {
      adjustedLabel = `${adjustedLabel} (Punto en mapa)`;
    }

    updateLocation(adjustedLabel);
  };

  // Construct iframe embed query
  const mapQuery = useMemo(() => {
    if (coords) return `${coords.lat},${coords.lng}`;
    return addressInput.trim() || 'Colombia';
  }, [coords, addressInput]);

  const embedMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  const externalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  const currentPublicLocation = initialPublicLocation || extractPublicZone(addressInput).publicLocation;

  return (
    <div ref={containerRef} className={`space-y-4 ${className}`}>
      {/* 1. BARRA DE BÚSQUEDA DE DIRECCIÓN ÚNICA */}
      <div className="space-y-1.5 relative">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-[#012d1d] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-[#2b694d]">location_on</span>
            <span>Ubicación de la Prenda *</span>
          </label>
          <button
            type="button"
            onClick={handleGPS}
            disabled={isLocatingGPS}
            className="text-[11px] text-[#2b694d] hover:text-[#012d1d] font-semibold flex items-center gap-1 transition-colors bg-[#faf9f4] px-2.5 py-1 rounded-full border border-[#c1c8c2]/40"
            title="Ubicar por GPS del dispositivo"
          >
            <span className="material-symbols-outlined text-sm">
              {isLocatingGPS ? 'sync' : 'my_location'}
            </span>
            <span>{isLocatingGPS ? 'Localizando...' : 'Mi GPS'}</span>
          </button>
        </div>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2b694d] text-lg">
            search
          </span>
          <input
            type="text"
            required={required}
            value={addressInput}
            onChange={(e) => {
              setAddressInput(e.target.value);
              setShowDropdown(true);
              updateLocation(e.target.value);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Escribe tu dirección o ubicación (ej. Cra 50 # 45-20, Medellín, Chapinero, Bogotá...)"
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#c1c8c2] bg-white text-sm text-[#1b1c19] placeholder-[#717973] focus:border-[#012d1d] focus:ring-1 focus:ring-[#012d1d] outline-none shadow-2xs transition-all"
          />

          {addressInput && (
            <button
              type="button"
              onClick={() => {
                setAddressInput('');
                setCoords(null);
                setMarkerPos(null);
                updateLocation('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717973] hover:text-[#012d1d]"
              title="Borrar ubicación"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>

        {/* Autocomplete Suggestions Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#c1c8c2] rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto py-1 animate-in fade-in">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#717973] border-b border-[#efeee9] flex items-center justify-between">
              <span>Coincidencias de Ubicación</span>
              <span>{suggestions.length} resultados</span>
            </div>
            {suggestions.map((loc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(loc)}
                className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-[#b0f1cc]/20 text-[#1b1c19] flex items-center gap-2 border-b border-[#efeee9]/60 last:border-0 transition-colors"
              >
                <span className="material-symbols-outlined text-sm text-[#2b694d] shrink-0">
                  pin_drop
                </span>
                <span className="truncate">{loc}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. MAPA INTERACTIVO JUSTO DEBAJO */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#717973]">
          <span className="text-[11px] flex items-center gap-1 text-[#414844] font-medium">
            <span className="material-symbols-outlined text-sm text-[#2b694d]">touch_app</span>
            <span>Haz clic sobre el mapa para ajustar el marcador a la ubicación exacta</span>
          </span>
          <a
            href={externalMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-[#2b694d] hover:underline font-bold flex items-center gap-0.5"
          >
            <span>Google Maps</span>
            <span className="material-symbols-outlined text-xs">open_in_new</span>
          </a>
        </div>

        {/* Interactive Map Box with Click-to-Pin Overlay */}
        <div
          ref={mapOverlayRef}
          onClick={handleMapClick}
          className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-[#c1c8c2]/80 shadow-xs bg-[#e8ece9] cursor-pointer group"
        >
          {/* Real Google Map Embed */}
          <iframe
            title={`Mapa interactivo - ${mapQuery}`}
            src={embedMapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full pointer-events-none"
          />

          {/* Interactive Overlay Click Catcher */}
          <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors" />

          {/* Visual Draggable/Click Pin Marker */}
          {markerPos ? (
            <div
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-full transition-all duration-150 drop-shadow-lg"
              style={{
                left: `${markerPos.xPercent}%`,
                top: `${markerPos.yPercent}%`
              }}
            >
              <div className="flex flex-col items-center">
                <div className="px-2 py-0.5 rounded-full bg-[#012d1d] text-[#b0f1cc] text-[9px] font-bold shadow-xs whitespace-nowrap mb-0.5">
                  Prenda aquí
                </div>
                <span className="material-symbols-outlined text-3xl text-[#ba1a1a]">
                  location_on
                </span>
              </div>
            </div>
          ) : addressInput.trim() ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none drop-shadow-lg">
              <span className="material-symbols-outlined text-3xl text-[#ba1a1a] animate-bounce">
                location_on
              </span>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 backdrop-blur-xs px-4 py-2 rounded-2xl border border-[#c1c8c2]/60 shadow-md text-center">
                <span className="material-symbols-outlined text-2xl text-[#2b694d] block mx-auto mb-1">
                  share_location
                </span>
                <p className="text-xs font-bold text-[#012d1d]">Escribe tu dirección o haz clic en el mapa</p>
                <p className="text-[10px] text-[#717973]">El marcador se posicionará automáticamente</p>
              </div>
            </div>
          )}
        </div>

        {/* Privacy Feedback Strip */}
        <div className="p-3 bg-[#faf9f4] rounded-xl border border-[#c1c8c2]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-[#414844]">
            <span className="material-symbols-outlined text-base text-[#2b694d] shrink-0">
              lock
            </span>
            <span>
              <strong>Privacidad garantizada:</strong> Tu dirección exacta se guarda internamente.
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-[#012d1d] font-bold truncate">
            <span className="text-[#717973] font-normal">Visible en la ficha:</span>
            <span className="truncate max-w-[200px] bg-white px-2 py-0.5 rounded-md border border-[#c1c8c2]/50">
              📍 {currentPublicLocation || 'Zona / Ciudad aproximada'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
