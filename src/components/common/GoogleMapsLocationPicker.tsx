import React, { useState, useEffect, useRef } from 'react';
import { searchColombiaLocations } from '../../data/colombiaData';

interface GoogleMapsLocationPickerProps {
  value: string;
  onChange: (location: string, department?: string, municipality?: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  showMapPreview?: boolean;
}

export const GoogleMapsLocationPicker: React.FC<GoogleMapsLocationPickerProps> = ({
  value,
  onChange,
  label = 'Ubicación en Colombia',
  placeholder = 'Buscar dirección, barrio, ciudad o municipio (ej. Chapinero, Bogotá)',
  required = false,
  className = '',
  showMapPreview = true,
}) => {
  const [query, setQuery] = useState(value || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat?: number; lng?: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Handle clicking outside to close autocomplete
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = searchColombiaLocations(query);

  const handleSelectSuggestion = (loc: string) => {
    setQuery(loc);
    setShowDropdown(false);
    
    // Parse department and municipality if present (e.g., "Medellín, Antioquia, Colombia")
    const parts = loc.split(',').map((p) => p.trim());
    const municipality = parts[0] || '';
    const department = parts[1] || '';
    onChange(loc, department, municipality);
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setQuery(newVal);
    setShowDropdown(true);
    onChange(newVal);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está disponible en este navegador.');
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setSelectedCoords({ lat: latitude, lng: longitude });
        
        // Find nearest Colombian region or format coordinates
        const formatted = `Ubicación GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        setQuery(formatted);
        onChange(formatted);
        setIsDetectingGps(false);
        setIsMapExpanded(true);
      },
      (err) => {
        console.warn('GPS error:', err);
        // Fallback to primary Colombia city
        const fallback = 'Bogotá D.C., Colombia';
        setQuery(fallback);
        onChange(fallback);
        setIsDetectingGps(false);
      },
      { timeout: 8000 }
    );
  };

  const mapQueryParam = encodeURIComponent(
    selectedCoords
      ? `${selectedCoords.lat},${selectedCoords.lng}`
      : query || 'Colombia'
  );

  const embedMapUrl = `https://maps.google.com/maps?q=${mapQueryParam}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  const externalGoogleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQueryParam}`;

  return (
    <div ref={containerRef} className={`space-y-2 relative ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-[#012d1d]">
            {label} {required && <span className="text-[#ba1a1a]">*</span>}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingGps}
              className="text-[11px] text-[#2b694d] hover:text-[#012d1d] font-semibold flex items-center gap-1 transition-colors"
              title="Detectar por GPS"
            >
              <span className="material-symbols-outlined text-sm">
                {isDetectingGps ? 'sync' : 'my_location'}
              </span>
              <span>{isDetectingGps ? 'Localizando...' : 'Mi GPS'}</span>
            </button>
            {showMapPreview && (
              <button
                type="button"
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                className="text-[11px] text-[#2b694d] hover:text-[#012d1d] font-semibold flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  {isMapExpanded ? 'expand_less' : 'map'}
                </span>
                <span>{isMapExpanded ? 'Ocultar mapa' : 'Ver mapa'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Input Field with Google Maps Icon */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-[#2b694d]">
          location_on
        </span>
        <input
          type="text"
          value={query}
          required={required}
          onChange={handleManualInput}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-20 py-2.5 rounded-xl border border-[#c1c8c2] bg-white text-sm text-[#1b1c19] focus:border-[#012d1d] focus:ring-1 focus:ring-[#012d1d] outline-none transition-all"
        />
        <a
          href={externalGoogleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#f5f4ef] hover:bg-[#efeee9] text-[#012d1d] rounded-lg text-[10px] font-bold border border-[#c1c8c2]/50 flex items-center gap-1 transition-colors"
          title="Abrir en Google Maps"
        >
          <span className="material-symbols-outlined text-xs text-[#2b694d]">open_in_new</span>
          <span>Maps</span>
        </a>
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#c1c8c2] rounded-xl shadow-xl z-30 max-h-52 overflow-y-auto py-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#717973] border-b border-[#efeee9] flex items-center justify-between">
            <span>Sugerencias en Colombia (Google Maps)</span>
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

      {/* Popular Colombia Cities Quick Badges */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[10px] font-semibold text-[#717973]">Rápido:</span>
        {['Bogotá D.C.', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Cartagena'].map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => handleSelectSuggestion(`${city}, Colombia`)}
            className="text-[10px] px-2 py-0.5 rounded-full bg-[#f5f4ef] hover:bg-[#b0f1cc]/40 text-[#414844] hover:text-[#012d1d] font-medium border border-[#c1c8c2]/40 transition-colors"
          >
            {city}
          </button>
        ))}
      </div>

      {/* Interactive Google Map Preview Box */}
      {(showMapPreview && (isMapExpanded || query.length > 2)) && (
        <div className="mt-2 rounded-xl overflow-hidden border border-[#c1c8c2] shadow-xs bg-[#f5f4ef]">
          <div className="bg-[#012d1d] text-white px-3 py-1.5 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#b0f1cc]">map</span>
              <span>Vista de Google Maps: {query || 'Colombia'}</span>
            </div>
            <a
              href={externalGoogleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-[#b0f1cc] hover:underline flex items-center gap-0.5"
            >
              <span>Ver satélite</span>
              <span className="material-symbols-outlined text-xs">arrow_outward</span>
            </a>
          </div>
          <div className="w-full h-40 relative">
            <iframe
              title={`Google Map - ${query || 'Colombia'}`}
              src={embedMapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
          <div className="px-3 py-1.5 bg-white text-[11px] text-[#414844] flex items-center justify-between border-t border-[#efeee9]">
            <span className="truncate">📍 {query || 'Selecciona una ciudad o dirección'}</span>
            <span className="text-[10px] text-[#2b694d] font-semibold shrink-0 ml-2">Google Maps Activo</span>
          </div>
        </div>
      )}
    </div>
  );
};
