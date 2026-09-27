import React, { useState, useEffect, useRef, useMemo } from 'react';
import { COLOMBIA_DEPARTMENTS, searchColombiaLocations } from '../../data/colombiaData';

export type LocationPrivacyLevel = 'ciudad' | 'barrio' | 'aproximada';

export interface DetailedLocationState {
  country: string; // 'Colombia'
  department: string;
  municipality: string;
  localityOrComuna: string;
  neighborhoodOrVereda: string;
  exactAddress: string; // Private
  complement: string; // Private
  privacyLevel: LocationPrivacyLevel;
  publicLocation: string; // Displayed on public cards
  fullLocation: string; // Complete location string
}

interface ColombiaLocationSystemProps {
  initialLocation?: string;
  initialDepartment?: string;
  initialMunicipality?: string;
  initialPrivacyLevel?: LocationPrivacyLevel;
  onChange: (locationData: DetailedLocationState) => void;
  required?: boolean;
  className?: string;
}

// Common Subdivisions / Corregimientos / Comunas / Localidades for key Colombian cities
const KNOWN_SUBDIVISIONS: Record<string, string[]> = {
  'medellín': [
    'Comuna 1 - Popular',
    'Comuna 2 - Santa Cruz',
    'Comuna 3 - Manrique',
    'Comuna 4 - Aranjuez',
    'Comuna 5 - Castilla',
    'Comuna 6 - Doce de Octubre',
    'Comuna 7 - Robledo',
    'Comuna 8 - Villa Hermosa',
    'Comuna 9 - Buenos Aires',
    'Comuna 10 - La Candelaria (Centro)',
    'Comuna 11 - Laureles - Estadio',
    'Comuna 12 - La América',
    'Comuna 13 - San Javier',
    'Comuna 14 - El Poblado',
    'Comuna 15 - Guayabal',
    'Comuna 16 - Belén',
    'Corregimiento San Sebastián de Palmitas',
    'Corregimiento San Cristóbal',
    'Corregimiento Altavista',
    'Corregimiento San Antonio de Prado',
    'Corregimiento Santa Elena'
  ],
  'bogotá d.c.': [
    'Localidad 1 - Usaquén',
    'Localidad 2 - Chapinero',
    'Localidad 3 - Santa Fe',
    'Localidad 4 - San Cristóbal',
    'Localidad 5 - Usme',
    'Localidad 6 - Tunjuelito',
    'Localidad 7 - Bosa',
    'Localidad 8 - Kennedy',
    'Localidad 9 - Fontibón',
    'Localidad 10 - Engativá',
    'Localidad 11 - Suba',
    'Localidad 12 - Barrios Unidos',
    'Localidad 13 - Teusaquillo',
    'Localidad 14 - Los Mártires',
    'Localidad 15 - Antonio Nariño',
    'Localidad 16 - Puente Aranda',
    'Localidad 17 - La Candelaria',
    'Localidad 18 - Rafael Uribe Uribe',
    'Localidad 19 - Ciudad Bolívar',
    'Localidad 20 - Sumapaz (Rural)'
  ],
  'cali': [
    'Comuna 1 - Terrón Colorado',
    'Comuna 2 - Santa Mónica / Versalles',
    'Comuna 3 - San Antonio / Centro',
    'Comuna 17 - El Limonar / Capri',
    'Comuna 19 - San Fernando / Tequendama',
    'Comuna 22 - Ciudad Jardín / Pance',
    'Corregimiento La Buitrera',
    'Corregimiento Pance',
    'Corregimiento Pichindé',
    'Corregimiento Montebello',
    'Corregimiento Felidia'
  ],
  'barranquilla': [
    'Localidad Riomar',
    'Localidad Norte-Centro Histórico',
    'Localidad Suroccidente',
    'Localidad Metropolitana',
    'Localidad Suroriente'
  ],
  'bucaramanga': [
    'Comuna 1 - Norte',
    'Comuna 12 - Cabecera del Llano',
    'Comuna 13 - Oriental',
    'Comuna 15 - Centro',
    'Comuna 17 - Mutis',
    'Corregimiento 1 - El Vijagual',
    'Corregimiento 2 - Santa Bárbara'
  ]
};

export const ColombiaLocationSystem: React.FC<ColombiaLocationSystemProps> = ({
  initialLocation = '',
  initialDepartment = '',
  initialMunicipality = '',
  initialPrivacyLevel = 'barrio',
  onChange,
  required = false,
  className = ''
}) => {
  // Intelligent Search query
  const [searchQuery, setSearchQuery] = useState(initialLocation);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Progressive Hierarchical Fields
  const [country] = useState('Colombia');
  const [department, setDepartment] = useState(initialDepartment);
  const [municipality, setMunicipality] = useState(initialMunicipality);
  const [localityOrComuna, setLocalityOrComuna] = useState('');
  const [neighborhoodOrVereda, setNeighborhoodOrVereda] = useState('');
  const [exactAddress, setExactAddress] = useState('');
  const [complement, setComplement] = useState('');

  // Privacy Level ('ciudad' | 'barrio' | 'aproximada')
  const [privacyLevel, setPrivacyLevel] = useState<LocationPrivacyLevel>(initialPrivacyLevel);

  // UI state
  const [showProgressiveSteps, setShowProgressiveSteps] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState<{ lat?: number; lng?: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Available municipalities based on selected department
  const selectedDeptObj = useMemo(() => {
    return COLOMBIA_DEPARTMENTS.find(
      (d) => d.name.toLowerCase() === department.toLowerCase() || d.id === department.toLowerCase()
    );
  }, [department]);

  const availableMunicipalities = useMemo(() => {
    return selectedDeptObj?.municipalities || [];
  }, [selectedDeptObj]);

  // Available subdivisions based on selected municipality
  const availableSubdivisions = useMemo(() => {
    const key = (municipality || '').toLowerCase().trim();
    return KNOWN_SUBDIVISIONS[key] || [];
  }, [municipality]);

  // Compute public and full location strings based on privacy level
  const computeLocations = (
    lvl: LocationPrivacyLevel,
    deptVal: string,
    muniVal: string,
    subdivVal: string,
    neighVal: string,
    addrVal: string,
    compVal: string
  ) => {
    const muniDept = [muniVal, deptVal, 'Colombia'].filter(Boolean).join(', ');

    let pubLoc = muniDept;
    if (lvl === 'ciudad') {
      pubLoc = [muniVal || 'Colombia', deptVal].filter(Boolean).join(', ');
    } else if (lvl === 'barrio') {
      const area = neighVal || subdivVal;
      pubLoc = area
        ? `${area}, ${muniVal ? muniVal + ', ' : ''}${deptVal || 'Colombia'}`
        : muniDept;
    } else if (lvl === 'aproximada') {
      const area = neighVal || subdivVal;
      pubLoc = area
        ? `Sector ${area}, ${muniVal || deptVal || 'Colombia'}`
        : `Zona aproximada en ${muniDept || 'Colombia'}`;
    }

    const fullLocParts = [
      addrVal,
      compVal,
      neighVal,
      subdivVal,
      muniVal,
      deptVal,
      'Colombia'
    ].filter(Boolean);
    const fullLoc = fullLocParts.join(', ') || pubLoc;

    return { publicLocation: pubLoc, fullLocation: fullLoc };
  };

  // Sync state upward whenever fields or privacy changes
  const notifyChanges = (
    updated: Partial<{
      department: string;
      municipality: string;
      localityOrComuna: string;
      neighborhoodOrVereda: string;
      exactAddress: string;
      complement: string;
      privacyLevel: LocationPrivacyLevel;
    }>
  ) => {
    const deptVal = updated.department !== undefined ? updated.department : department;
    const muniVal = updated.municipality !== undefined ? updated.municipality : municipality;
    const subdivVal = updated.localityOrComuna !== undefined ? updated.localityOrComuna : localityOrComuna;
    const neighVal = updated.neighborhoodOrVereda !== undefined ? updated.neighborhoodOrVereda : neighborhoodOrVereda;
    const addrVal = updated.exactAddress !== undefined ? updated.exactAddress : exactAddress;
    const compVal = updated.complement !== undefined ? updated.complement : complement;
    const lvlVal = updated.privacyLevel !== undefined ? updated.privacyLevel : privacyLevel;

    const { publicLocation, fullLocation } = computeLocations(
      lvlVal,
      deptVal,
      muniVal,
      subdivVal,
      neighVal,
      addrVal,
      compVal
    );

    onChange({
      country: 'Colombia',
      department: deptVal,
      municipality: muniVal,
      localityOrComuna: subdivVal,
      neighborhoodOrVereda: neighVal,
      exactAddress: addrVal,
      complement: compVal,
      privacyLevel: lvlVal,
      publicLocation,
      fullLocation
    });
  };

  // Handle outside clicks to close search suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search suggestions from query
  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return [];
    return searchColombiaLocations(searchQuery);
  }, [searchQuery]);

  const handleSelectSuggestion = (loc: string) => {
    setSearchQuery(loc);
    setShowSearchDropdown(false);

    // Extract parts: "Medellín, Antioquia, Colombia" or "Chapinero, Bogotá D.C., Colombia"
    const parts = loc.split(',').map((p) => p.trim());
    const muni = parts[0] || '';
    const dept = parts[1] || '';

    // Match with Colombia departments
    const matchedDept = COLOMBIA_DEPARTMENTS.find(
      (d) => d.name.toLowerCase() === dept.toLowerCase() || d.id === dept.toLowerCase()
    );

    const newDept = matchedDept ? matchedDept.name : dept;
    setDepartment(newDept);
    setMunicipality(muni);

    notifyChanges({ department: newDept, municipality: muni });
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está disponible en este dispositivo.');
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCoordinates({ lat: latitude, lng: longitude });
        setIsDetectingGps(false);
      },
      (err) => {
        console.warn('GPS error:', err);
        setIsDetectingGps(false);
      },
      { timeout: 7000 }
    );
  };

  // Current map query
  const activeMapQuery = useMemo(() => {
    if (mapCoordinates) {
      return `${mapCoordinates.lat},${mapCoordinates.lng}`;
    }
    const parts = [
      neighborhoodOrVereda,
      localityOrComuna,
      municipality,
      department,
      'Colombia'
    ].filter(Boolean);
    return parts.join(', ') || searchQuery || 'Colombia';
  }, [mapCoordinates, neighborhoodOrVereda, localityOrComuna, municipality, department, searchQuery]);

  const embedMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(activeMapQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  const externalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeMapQuery)}`;

  const { publicLocation } = computeLocations(
    privacyLevel,
    department,
    municipality,
    localityOrComuna,
    neighborhoodOrVereda,
    exactAddress,
    complement
  );

  return (
    <div ref={containerRef} className={`space-y-4 ${className}`}>
      {/* Title & Privacy Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#efeee9] pb-3">
        <div>
          <label className="block text-xs font-bold text-[#012d1d] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-[#2b694d]">share_location</span>
            <span>Ubicación de la Prenda en Colombia *</span>
          </label>
          <p className="text-[11px] text-[#717973] mt-0.5">
            Compatible con ciudades principales, corregimientos, veredas y zonas rurales de Colombia.
          </p>
        </div>

        {/* GPS Button */}
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isDetectingGps}
          className="text-xs text-[#2b694d] hover:text-[#012d1d] font-semibold flex items-center gap-1.5 self-start sm:self-auto bg-[#faf9f4] px-3 py-1.5 rounded-full border border-[#c1c8c2]/50 hover:bg-[#efeee9] transition-all"
          title="Detectar ubicación actual por GPS"
        >
          <span className="material-symbols-outlined text-base">
            {isDetectingGps ? 'sync' : 'my_location'}
          </span>
          <span>{isDetectingGps ? 'Localizando...' : 'Mi GPS'}</span>
        </button>
      </div>

      {/* 1. BÚSQUEDA INTELIGENTE DE UBICACIÓN */}
      <div className="relative">
        <label className="block text-[11px] font-bold text-[#414844] mb-1">
          Búsqueda rápida (Dirección, barrio, vereda, municipio o ciudad)
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#2b694d] text-base">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            required={required}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            placeholder="Ej. Cra 50 # 45-20, Vereda San José, Marinilla, Medellín..."
            className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#c1c8c2] bg-white text-xs text-[#1b1c19] focus:border-[#012d1d] focus:ring-1 focus:ring-[#012d1d] outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setShowSearchDropdown(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717973] hover:text-[#012d1d]"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown Matches */}
        {showSearchDropdown && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#c1c8c2] rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto py-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#717973] border-b border-[#efeee9] flex items-center justify-between">
              <span>Coincidencias en Colombia</span>
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

      {/* Toggle Progressive Hierarchical Selection */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowProgressiveSteps(!showProgressiveSteps)}
          className="text-xs text-[#2b694d] hover:text-[#012d1d] font-bold flex items-center gap-1.5 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">
            {showProgressiveSteps ? 'expand_less' : 'tune'}
          </span>
          <span>
            {showProgressiveSteps
              ? 'Ocultar desglose progresivo de ubicación'
              : 'Desglose progresivo: Departamento → Municipio → Comuna/Vereda → Dirección'}
          </span>
        </button>
      </div>

      {/* 2. SISTEMA COMPLETO Y PROGRESIVO DE UBICACIÓN (COLOMBIA) */}
      {showProgressiveSteps && (
        <div className="p-4 bg-white rounded-2xl border border-[#c1c8c2]/60 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-[#efeee9]">
            <span className="text-[11px] font-bold text-[#012d1d] flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-[#2b694d]">alt_route</span>
              <span>Estructura Geográfica Progresiva</span>
            </span>
            <span className="text-[10px] text-[#717973] bg-[#faf9f4] px-2 py-0.5 rounded-full border border-[#c1c8c2]/40">
              Colombia
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* PAÍS */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#717973] mb-1">
                País
              </label>
              <input
                type="text"
                disabled
                value="Colombia"
                className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2]/50 bg-[#f5f4ef] text-xs font-semibold text-[#414844] cursor-not-allowed"
              />
            </div>

            {/* DEPARTAMENTO */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#012d1d] mb-1">
                Departamento *
              </label>
              <select
                value={department}
                onChange={(e) => {
                  const newDept = e.target.value;
                  setDepartment(newDept);
                  setMunicipality('');
                  setLocalityOrComuna('');
                  notifyChanges({ department: newDept, municipality: '', localityOrComuna: '' });
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] bg-white text-xs text-[#1b1c19] focus:border-[#012d1d] outline-none"
              >
                <option value="">Selecciona Departamento...</option>
                {COLOMBIA_DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* MUNICIPIO / CIUDAD */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#012d1d] mb-1">
                Municipio / Ciudad *
              </label>
              {availableMunicipalities.length > 0 ? (
                <select
                  value={municipality}
                  onChange={(e) => {
                    const newMuni = e.target.value;
                    setMunicipality(newMuni);
                    notifyChanges({ municipality: newMuni });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] bg-white text-xs text-[#1b1c19] focus:border-[#012d1d] outline-none"
                >
                  <option value="">Selecciona Municipio...</option>
                  {availableMunicipalities.map((muni) => (
                    <option key={muni} value={muni}>
                      {muni}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={municipality}
                  onChange={(e) => {
                    setMunicipality(e.target.value);
                    notifyChanges({ municipality: e.target.value });
                  }}
                  placeholder="Escribe municipio o poblado"
                  className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] bg-white text-xs text-[#1b1c19] focus:border-[#012d1d] outline-none"
                />
              )}
            </div>

            {/* LOCALIDAD / COMUNA / CORREGIMIENTO */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#414844] mb-1">
                Localidad / Comuna / Corregimiento (Opcional)
              </label>
              {availableSubdivisions.length > 0 ? (
                <select
                  value={localityOrComuna}
                  onChange={(e) => {
                    setLocalityOrComuna(e.target.value);
                    notifyChanges({ localityOrComuna: e.target.value });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] bg-white text-xs text-[#1b1c19] focus:border-[#012d1d] outline-none"
                >
                  <option value="">Selecciona Comuna o Corregimiento...</option>
                  {availableSubdivisions.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                  <option value="otro">Otro sector / corregimiento</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={localityOrComuna}
                  onChange={(e) => {
                    setLocalityOrComuna(e.target.value);
                    notifyChanges({ localityOrComuna: e.target.value });
                  }}
                  placeholder="Ej. Comuna 13, Corregimiento Santa Elena..."
                  className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] bg-white text-xs text-[#1b1c19] focus:border-[#012d1d] outline-none"
                />
              )}
            </div>

            {/* BARRIO / VEREDA */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#414844] mb-1">
                Barrio / Vereda (Opcional)
              </label>
              <input
                type="text"
                value={neighborhoodOrVereda}
                onChange={(e) => {
                  setNeighborhoodOrVereda(e.target.value);
                  notifyChanges({ neighborhoodOrVereda: e.target.value });
                }}
                placeholder="Ej. Vereda San José, Barrio Manila..."
                className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] bg-white text-xs text-[#1b1c19] focus:border-[#012d1d] outline-none"
              />
            </div>

            {/* DIRECCIÓN (Privada) */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#414844] mb-1 flex items-center justify-between">
                <span>Dirección exacta</span>
                <span className="text-[9px] text-[#2b694d] font-semibold">🔒 Privada</span>
              </label>
              <input
                type="text"
                value={exactAddress}
                onChange={(e) => {
                  setExactAddress(e.target.value);
                  notifyChanges({ exactAddress: e.target.value });
                }}
                placeholder="Ej. Cra 43A # 1-50, Calle 10 # 40-20"
                className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] bg-white text-xs text-[#1b1c19] focus:border-[#012d1d] outline-none"
              />
            </div>

            {/* COMPLEMENTO (Privado) */}
            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-[10px] font-bold uppercase text-[#414844] mb-1 flex items-center justify-between">
                <span>Complemento de dirección</span>
                <span className="text-[9px] text-[#2b694d] font-semibold">🔒 Privado</span>
              </label>
              <input
                type="text"
                value={complement}
                onChange={(e) => {
                  setComplement(e.target.value);
                  notifyChanges({ complement: e.target.value });
                }}
                placeholder="Ej. Apto 302, Edificio Los Robles, Casa 4, Torre B"
                className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] bg-white text-xs text-[#1b1c19] focus:border-[#012d1d] outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. PRIVACIDAD DE LA UBICACIÓN */}
      <div className="p-4 bg-[#faf9f4] rounded-2xl border border-[#c1c8c2]/50 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#012d1d] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-[#2b694d]">visibility_lock</span>
            <span>Nivel de Privacidad Pública de la Ubicación</span>
          </span>
          <span className="text-[10px] font-semibold text-[#2b694d] bg-[#b0f1cc]/40 px-2 py-0.5 rounded-full">
            🔒 Dirección privada garantizada
          </span>
        </div>
        <p className="text-[11px] text-[#717973]">
          Elige qué grado de ubicación será visible para otros usuarios en la publicación. Tu dirección exacta nunca se divulgará públicamente.
        </p>

        {/* 3 Privacy Radios */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            {
              id: 'ciudad' as const,
              label: 'Solo Ciudad / Municipio',
              desc: 'Ej. Medellín, Antioquia',
              icon: 'apartment'
            },
            {
              id: 'barrio' as const,
              label: 'Barrio / Zona',
              desc: 'Ej. El Poblado, Medellín',
              icon: 'holiday_village'
            },
            {
              id: 'aproximada' as const,
              label: 'Ubicación aproximada',
              desc: 'Ej. Sector cerca a Parque...',
              icon: 'radar'
            }
          ].map((opt) => {
            const isSelected = privacyLevel === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setPrivacyLevel(opt.id);
                  notifyChanges({ privacyLevel: opt.id });
                }}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-[#012d1d] text-white border-[#012d1d] shadow-sm'
                    : 'bg-white text-[#414844] border-[#c1c8c2]/40 hover:bg-[#efeee9]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-base ${isSelected ? 'text-[#b0f1cc]' : 'text-[#2b694d]'}`}>
                    {opt.icon}
                  </span>
                  <span className="text-xs font-bold">{opt.label}</span>
                </div>
                <span className={`text-[10px] ${isSelected ? 'text-[#e0ede5]' : 'text-[#717973]'}`}>
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Public Display Preview */}
        <div className="pt-2 border-t border-[#efeee9] flex items-center justify-between text-xs">
          <span className="text-[11px] text-[#717973]">Se mostrará en la ficha:</span>
          <span className="font-bold text-[#012d1d] truncate max-w-xs">
            📍 {publicLocation || 'Selecciona o escribe una ubicación'}
          </span>
        </div>
      </div>

      {/* 4. MAPA INTERACTIVO SINCRONIZADO */}
      {(department || municipality || searchQuery) && (
        <div className="rounded-2xl overflow-hidden border border-[#c1c8c2]/60 shadow-xs bg-[#f5f4ef]">
          <div className="bg-[#012d1d] text-white px-3.5 py-2 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#b0f1cc]">map</span>
              <span>Vista interactiva: {publicLocation || activeMapQuery}</span>
            </div>
            <a
              href={externalMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-[#b0f1cc] hover:underline flex items-center gap-0.5"
            >
              <span>Abrir en Maps</span>
              <span className="material-symbols-outlined text-xs">open_in_new</span>
            </a>
          </div>
          <div className="w-full h-44 relative">
            <iframe
              title={`Google Maps - ${activeMapQuery}`}
              src={embedMapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};
